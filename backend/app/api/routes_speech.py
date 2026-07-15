"""
HTTP routes for speech <-> text.
"""

from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import Response

from app.core.logger import get_logger
from app.speech.stt import transcribe_audio_bytes
from app.speech.tts import TTSEngineNotAvailable, synthesize_to_wav

router = APIRouter(prefix="/api/v1/speech", tags=["speech"])
logger = get_logger(__name__)


@router.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)) -> dict:
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty audio file.")

    suffix = "." + audio.filename.rsplit(".", 1)[-1] if audio.filename and "." in audio.filename else ".wav"

    try:
        text = transcribe_audio_bytes(audio_bytes, suffix=suffix)
    except Exception as exc:
        logger.exception("Transcription failed")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(exc)) from exc

    return {"text": text}


@router.post("/text-to-speech")
async def text_to_speech(payload: dict) -> Response:
    text = payload.get("text", "").strip()
    if not text:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "text is required.")

    try:
        audio_bytes = synthesize_to_wav(text)
    except TTSEngineNotAvailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    except Exception as exc:
        logger.exception("Synthesis failed")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(exc)) from exc

    return Response(content=audio_bytes, media_type="audio/wav")