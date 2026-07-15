"""
Runs the loaded model on a buffered landmark window and returns a
recognized gloss + confidence, gated by settings.confidence_threshold.
"""

from __future__ import annotations

import numpy as np
import torch
import torch.nn.functional as F

from app.core.config import settings
from app.core.logger import get_logger
from app.ml.model_loader import load_model

logger = get_logger(__name__)


class SignRecognizer:
    def __init__(self) -> None:
        self.model, self.vocab = load_model()
        self.confidence_threshold = settings.confidence_threshold

    def predict(self, window: np.ndarray) -> tuple[str | None, float]:
        """
        window: (sequence_length, FRAME_VECTOR_SIZE) numpy array.
        Returns (gloss, confidence). gloss is None if below threshold.
        """
        tensor = torch.from_numpy(window).float().unsqueeze(0)  # (1, T, D)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = F.softmax(logits, dim=-1).squeeze(0)
            confidence, idx = torch.max(probs, dim=0)

        confidence = float(confidence.item())
        gloss = self.vocab[int(idx.item())]

        if confidence < self.confidence_threshold:
            return None, confidence
        return gloss, confidence