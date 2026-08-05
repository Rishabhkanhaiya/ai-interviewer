import json
import asyncio
import traceback
from fastapi import WebSocket, WebSocketDisconnect
from services.sarvam_tts import text_to_speech_full
from services.sarvam_stt import speech_to_text
from services.interview_engine import InterviewEngine
# Adjust redis import to match the actual db structure if needed. Assuming db.redis exists or similar.
# Wait, let's look at the old ws handler to see where get_session_state comes from.
# Actually, the user prompt provided exactly this:
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
        
        # Send first question immediately
        await send_question(websocket, engine, session_id)
        
        # Main message loop
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            msg_type = message.get("type")
            
            if msg_type == "submit_answer":
                await handle_submit_answer(websocket, engine, message, session_id)
                
            elif msg_type == "barge_in":
                # Frontend already stopped audio — backend just logs it
                print(f"[WS] Barge-in detected for session {session_id}")
                
            else:
                print(f"[WS] Unknown message type: {msg_type}")
                
    except WebSocketDisconnect:
        print(f"[WS] Session {session_id} disconnected normally")
        await engine.save_partial_session()
        
    except Exception as e:
        print(f"[WS] FATAL ERROR in session {session_id}:")
        traceback.print_exc()
        try:
            await websocket.send_json({
                "type": "error",
                "message": "An unexpected error occurred. Please refresh and try again."
            })
        except Exception:
            pass


async def send_question(websocket: WebSocket, engine: InterviewEngine, session_id: str):
    """Generate next question, convert to speech, send to frontend."""
    
    # Get next question from state machine
    question_data = await engine.get_next_question()
    
    if question_data is None:
        # Session complete
        scorecard = await engine.generate_scorecard()
        await websocket.send_json({
            "type": "session_end",
            "session_id": session_id,
            "scorecard": scorecard
        })
        return
    
    question_text = question_data["text"]
    question_number = question_data["number"]
    persona = question_data["persona"]  # e.g., "raj_technical"
    
    # Generate TTS audio (all sentences in parallel)
    audio_buffers = await text_to_speech_full(question_text, persona)
    
    if not audio_buffers:
        # TTS failed — send text only, frontend shows it
        await websocket.send_json({
            "type": "question",
            "text": question_text,
            "question_number": question_number,
            "audio_base64": None,   # Frontend will display text, no audio
        })
        return
    
    # Send each sentence's audio separately
    # Frontend AudioQueueManager plays them sequentially
    for i, audio_base64 in enumerate(audio_buffers):
        await websocket.send_json({
            "type": "question" if i == 0 else "question_audio_continuation",
            "text": question_text if i == 0 else None,
            "question_number": question_number if i == 0 else None,
            "audio_base64": audio_base64,
            "is_last": i == len(audio_buffers) - 1,
        })
        # Small delay between sends to avoid overwhelming the client
        await asyncio.sleep(0.05)


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
            "message": "No audio received. Please try again."
        })
        return
    
    # Transcribe via Sarvam REST STT
    stt_result = await speech_to_text(audio_base64, audio_format)
    
    if stt_result is None or not stt_result.transcript.strip():
        await websocket.send_json({
            "type": "error",
            "message": "Couldn't hear your answer clearly. Please speak louder and try again."
        })
        # Re-enable user input
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
