"""
End-to-end test of the full TTS pipeline as the backend will use it.
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_pipeline():
    """Test the full TTS pipeline."""
    from services.sarvam_tts import stream_tts_audio, stream_tts_sentence_pipeline, VOICE_PERSONAS
    
    print("Testing TTS personas...")
    for name, persona in VOICE_PERSONAS.items():
        print(f"  {name}: speaker={persona['speaker']}, rate={persona['rate']}")
    
    print("\nTesting stream_tts_audio for 'raj' persona...")
    total_bytes = 0
    chunk_count = 0
    async for chunk in stream_tts_audio("Hello! Welcome to the interview. Please introduce yourself.", "raj"):
        total_bytes += len(chunk)
        chunk_count += 1
        if chunk_count == 1:
            print(f"  First chunk: {len(chunk)} bytes (MP3 magic: {chunk[:3].hex()})")
    
    print(f"  Total: {chunk_count} chunks, {total_bytes} bytes")
    
    if total_bytes > 0:
        print("  ✅ TTS pipeline working!")
    else:
        print("  ❌ No audio received!")
    
    print("\nTesting sentence pipeline...")
    
    async def mock_token_gen():
        text = "Great! So tell me about yourself. What's your background?"
        for char in text:
            yield char
            await asyncio.sleep(0)
    
    total_bytes2 = 0
    chunk_count2 = 0
    async for chunk in stream_tts_sentence_pipeline(mock_token_gen(), "priya"):
        total_bytes2 += len(chunk)
        chunk_count2 += 1
    
    print(f"  Total: {chunk_count2} chunks, {total_bytes2} bytes")
    if total_bytes2 > 0:
        print("  ✅ Sentence pipeline working!")
    else:
        print("  ❌ No audio from sentence pipeline!")

asyncio.run(test_pipeline())
