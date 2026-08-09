import json
import asyncio
import traceback
from fastapi import WebSocket, WebSocketDisconnect
from services.sarvam_tts import text_to_speech_full
from services.sarvam_stt import speech_to_text
from services.interview_engine import InterviewEngine, is_disruption, get_guardrail_response
from db.redis_client import get_session_state, set_session_state


async def interview_websocket_handler(
    websocket: WebSocket,
    session_id: str,
    user_id: str
):
    await websocket.accept()
    engine = InterviewEngine(session_id, user_id)

    try:
        # Load session configuration
        session_config = await get_session_state(session_id)
        if not session_config:
            await websocket.send_json({"type": "error", "message": "Session not found"})
            await websocket.close(1008)
            return

        await engine.initialize(session_config)

        # ── CRITICAL: Fire the intro FIRST (Prompt Engineering Bible §Stage 1)
        print(f"[WS] Starting session {session_id} — calling start_session()")
        try:
            intro_data = await engine.start_session()
            print(f"[WS] start_session() OK — intro text len: {len(intro_data.get('text', ''))}")
        except Exception as intro_err:
            print(f"[WS] CRASH in start_session(): {intro_err}")
            traceback.print_exc()
            try:
                await websocket.send_json({"type": "error", "message": f"Session start failed: {intro_err}"})
            except Exception:
                pass
            await websocket.close()
            return

        await send_question_data(websocket, intro_data, session_id)

        # Main message loop
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            msg_type = message.get("type")

            if msg_type == "submit_answer":
                await handle_submit_answer(websocket, engine, message, session_id)

            elif msg_type == "barge_in":
                print(f"[WS] Barge-in detected for session {session_id}")
                engine.transcript.append({"role": "system", "content": "The candidate interrupted you mid-sentence here."})

            else:
                print(f"[WS] Unknown message type: {msg_type}")

    except WebSocketDisconnect:
        print(f"[WS] Session {session_id} disconnected normally")
        await engine.save_partial_session()

    except Exception as e:
        print(f"[WS] FATAL ERROR in session {session_id}:")
        traceback.print_exc()
        # Save whatever data we collected so the scorecard isn't empty
        try:
            await engine.save_partial_session()
        except Exception as save_err:
            print(f"[WS] Could not save partial session after fatal error: {save_err}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": "An unexpected error occurred. Please refresh and try again."
            })
        except Exception:
            pass


async def send_question_data(websocket: WebSocket, question_data: dict, session_id: str):
    """Generate TTS for question_data dict and stream audio chunks to the frontend."""

    if question_data is None:
        # Session complete — generate scorecard
        scorecard = await _get_engine_from_context(websocket, session_id)
        await websocket.send_json({
            "type": "session_end",
            "session_id": session_id,
            "scorecard": scorecard
        })
        return

    question_text = question_data["text"]
    question_number = question_data["number"]
    persona = question_data["persona"]
    voice_pace = question_data.get("voice_pace", 0.85)
    stage = question_data.get("stage", "")

    # Generate TTS audio — pass stage-specific pace override
    audio_buffers = await text_to_speech_full(question_text, persona, pace_override=voice_pace)

    if not audio_buffers:
        # TTS failed — send text only
        await websocket.send_json({
            "type": "question",
            "text": question_text,
            "question_number": question_number,
            "stage": stage,
            "audio_base64": None,
        })
        return

    # Send each sentence audio chunk separately
    for i, audio_base64 in enumerate(audio_buffers):
        await websocket.send_json({
            "type": "question" if i == 0 else "question_audio_continuation",
            "text": question_text if i == 0 else None,
            "question_number": question_number if i == 0 else None,
            "stage": stage if i == 0 else None,
            "audio_base64": audio_base64,
            "is_last": i == len(audio_buffers) - 1,
        })
        await asyncio.sleep(0.05)


# Keep old send_question as alias for backward compat
async def send_question(websocket: WebSocket, engine: InterviewEngine, session_id: str):
    """Get next question from engine and send to frontend."""
    question_data = await engine.get_next_question()

    if question_data is None:
        scorecard = await engine.generate_scorecard()
        await websocket.send_json({
            "type": "session_end",
            "session_id": session_id,
            "scorecard": scorecard
        })
        return

    await send_question_data(websocket, question_data, session_id)


async def handle_submit_answer(
    websocket: WebSocket,
    engine: InterviewEngine,
    message: dict,
    session_id: str
):
    """Process user's submitted audio answer."""

    await websocket.send_json({"type": "processing"})

    audio_base64 = message.get("audio_base64")
    audio_format = message.get("audio_format", "audio/webm;codecs=opus")

    if not audio_base64:
        await websocket.send_json({
            "type": "error",
            "message": "No audio received. Make sure your microphone is working and try again."
        })
        await websocket.send_json({"type": "user_turn"})
        return

    # ── Pre-check: reject suspiciously small blobs before hitting Sarvam
    import base64 as _b64
    raw_size = len(_b64.b64decode(audio_base64))
    print(f"[WS] Audio blob size before STT: {raw_size} bytes")
    if raw_size < 1000:
        await websocket.send_json({
            "type": "error",
            "message": "Your answer was too short. Please speak for at least 3 seconds and click Done Answering."
        })
        await websocket.send_json({"type": "user_turn"})
        return

    # ── Transcribe (sarvam_stt already retries 2x internally)
    stt_result = await speech_to_text(audio_base64, audio_format)

    if stt_result is None:
        await websocket.send_json({
            "type": "error",
            "message": "Speech recognition failed. Check your microphone volume and speak clearly, then try again."
        })
        await websocket.send_json({"type": "user_turn"})
        return

    if not stt_result.transcript.strip():
        await websocket.send_json({
            "type": "error",
            "message": "We couldn't understand your answer. Speak clearly and a bit louder, then click Done Answering."
        })
        await websocket.send_json({"type": "user_turn"})
        return

    # Send transcript back so user sees what was heard
    await websocket.send_json({
        "type": "transcript_update",
        "text": stt_result.transcript,
        "wpm": stt_result.wpm,
        "filler_words": stt_result.filler_words,
        "confidence": stt_result.confidence,
    })

    transcript = stt_result.transcript
    
    # Check for disruption BEFORE sending to GPT
    if is_disruption(transcript):
        engine.disruption_count = getattr(engine, 'disruption_count', 0) + 1
        
        # We need the current question text. It should be the last question stored in answers
        current_question = engine.transcript[-1]["content"] if engine.transcript else "the previous question"
        
        guardrail_response = get_guardrail_response(
            current_question=current_question,
            persona_name=engine.persona,  # engine.persona is a string returned by get_persona_for_round
            disruption_count=engine.disruption_count
        )
        
        # Convert guardrail response to speech
        audio_buffers = await text_to_speech_full(guardrail_response, engine.persona)
        
        # Send back as a question (AI speaking)
        for i, audio_b64 in enumerate(audio_buffers):
            await websocket.send_json({
                "type": "question" if i == 0 else "question_audio_continuation",
                "text": guardrail_response if i == 0 else None,
                "question_number": getattr(engine, 'question_number', 0),
                "audio_base64": audio_b64,
                "is_last": i == len(audio_buffers) - 1,
            })
        
        # If too many disruptions, end session
        if engine.disruption_count >= 2:
            await websocket.send_json({
                "type": "session_end",
                "session_id": session_id,
                "reason": "repeated_disruption"
            })
        
        return  # Don't process this as a real answer
    
    # Check for conduct violations
    conduct_res = await engine.check_conduct(stt_result.transcript)
    if conduct_res:
        audio_buffers = await text_to_speech_full(conduct_res["text"], engine.persona)
        for i, audio_b64 in enumerate(audio_buffers or []):
            await websocket.send_json({
                "type": "question" if i == 0 else "question_audio_continuation",
                "text": conduct_res["text"] if i == 0 else None,
                "question_number": getattr(engine, 'question_number', 0),
                "audio_base64": audio_b64,
                "is_last": i == len(audio_buffers) - 1,
            })
        if conduct_res.get("end_session"):
            await websocket.send_json({
                "type": "session_end",
                "session_id": session_id,
                "reason": conduct_res.get("reason", "conduct_ended")
            })
        return  # Don't process this answer

    # Reset disruption count on valid answer
    engine.disruption_count = 0

    # Process answer: STAR scoring, store in session, update state machine
    await engine.process_answer(
        transcript=stt_result.transcript,
        wpm=stt_result.wpm,
        filler_words=stt_result.filler_words,
        word_timestamps=stt_result.word_timestamps,
        confidence=stt_result.confidence,
    )

    # Check rate limit / pack minutes
    pack_ok = await engine.check_and_increment_pack()
    if not pack_ok:
        await websocket.send_json({
            "type": "session_end",
            "session_id": session_id,
            "reason": "pack_exhausted"
        })
        return

    # Send next question
    await send_question(websocket, engine, session_id)


async def _get_engine_from_context(websocket, session_id):
    """Placeholder — scorecard is generated inside send_question when data=None."""
    return {}
