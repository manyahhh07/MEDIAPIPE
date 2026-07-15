"""
Loads the sign recognition model. Falls back to a freshly initialized
(untrained) model if no checkpoint exists yet, so the pipeline always
runs end-to-end even before models/sign_recognition/train.py has been run.
"""

from __future__ import annotations

import os

import torch
import torch.nn as nn

from app.core.config import settings
from app.core.logger import get_logger
from app.ml.landmark_extractor import FRAME_VECTOR_SIZE

logger = get_logger(__name__)

DEFAULT_VOCAB = [
    "HELLO", "THANK_YOU", "PLEASE", "YES", "NO", "HELP",
    "MY", "NAME", "NICE", "MEET", "YOU", "HOW", "ARE",
]


class SignLSTM(nn.Module):
    def __init__(self, input_size: int, hidden_size: int, num_classes: int, num_layers: int = 2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=0.3 if num_layers > 1 else 0.0,
        )
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size * 2, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_size, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out, _ = self.lstm(x)
        last_step = out[:, -1, :]
        return self.classifier(last_step)


def load_model(
    checkpoint_path: str | None = None,
    vocab: list[str] | None = None,
    hidden_size: int = 128,
) -> tuple[SignLSTM, list[str]]:
    checkpoint_path = checkpoint_path or settings.model_checkpoint_path
    vocab = vocab or DEFAULT_VOCAB

    model = SignLSTM(
        input_size=FRAME_VECTOR_SIZE,
        hidden_size=hidden_size,
        num_classes=len(vocab),
    )

    if checkpoint_path and os.path.isfile(checkpoint_path):
        checkpoint = torch.load(checkpoint_path, map_location="cpu")
        model.load_state_dict(checkpoint["model_state_dict"])
        vocab = checkpoint.get("vocab", vocab)
        logger.info("Loaded trained checkpoint from %s", checkpoint_path)
    else:
        logger.warning(
            "No checkpoint found at %s - using an UNTRAINED model. "
            "Predictions will be meaningless until models/sign_recognition/train.py "
            "has been run and produces a checkpoint.",
            checkpoint_path,
        )

    model.eval()
    return model, vocab