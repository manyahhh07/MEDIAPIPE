"""
Text-to-speech.

Uses espeak-ng via subprocess as the default engine because it's fully
offline (no model download), which keeps local dev/testing frictionless.
For production-quality voice output, swap in Piper or Coqui TTS - both
slot in behind the same synthesize_to_wav() signature. TTS_ENGINE in
settings is the switch point; only "espeak" is implemented here.
"""

from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)


class TTSEngineNotAvailable(RuntimeError):
    pass


def _espeak_binary() -> str:
    binary = shutil.which("espeak-ng") or shutil.which("espeak")
    if binary is None:
        raise TTSEngineNotAvailable(
            "Neither espeak-ng nor espeak is installed. "
            "Install with: apt-get install espeak-ng"
        )
    return binary


def synthesize_to_wav(text: str, voice: str = "en") -> bytes:
    """Synthesizes `text` to speech and returns raw WAV bytes."""
    if not text.strip():
        raise ValueError("Cannot synthesize empty text.")

    if settings.tts_engine != "espeak":
        logger.warning(
            "TTS_ENGINE=%s is not implemented, falling back to espeak.",
            settings.tts_engine,
        )

    binary = _espeak_binary()

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    try:
        subprocess.run(
            [binary, "-v", voice, "-w", str(tmp_path), text],
            check=True,
            capture_output=True,
            timeout=30,
        )
        audio_bytes = tmp_path.read_bytes()
        logger.info("Synthesized %d chars -> %d bytes of audio", len(text), len(audio_bytes))
        return audio_bytes
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"espeak failed: {exc.stderr.decode(errors='replace')}") from exc
    finally:
        tmp_path.unlink(missing_ok=True)