"""
Wraps OpenAI Whisper for speech-to-text.

NOTE: the whisper model weights are downloaded from openaipublic's CDN on
first use and cached locally (~/.cache/whisper). That download requires
outbound internet access on whatever machine actually runs this - if it's
deployed somewhere network-restricted, pre-download the weights and set
WHISPER_MODEL_SIZE accordingly, or bake them into the deploy image.
"""

from __future__ import annotations

import tempfile
from pathlib import Path

import whisper

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

_model = None


def _get_model():
    global _model
    if _model is None:
        logger.info("Loading Whisper model: %s", settings.whisper_model_size)
        _model = whisper.load_model(settings.whisper_model_size)
    return _model


def transcribe_audio_bytes(audio_bytes: bytes, suffix: str = ".wav") -> str:
    """
    Transcribes raw audio bytes (wav/mp3/webm/etc - anything ffmpeg can read)
    to text. Writes to a temp file because whisper's API takes a file path.
    """
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = Path(tmp.name)

    try:
        model = _get_model()
        result = model.transcribe(str(tmp_path), fp16=False)
        text = result.get("text", "").strip()
        logger.info("Transcribed %d bytes -> %r", len(audio_bytes), text)
        return text
    finally:
        tmp_path.unlink(missing_ok=True)