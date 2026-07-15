"""
Turns a raw stream of recognized sign glosses (e.g. ["HELLO", "HELLO", "MY",
"NAME", "JOHN"]) into a clean natural-language sentence.
"""

from __future__ import annotations

import re

_ARTICLE_INSERTIONS = {
    "NAME": "is",
}

_PUNCTUATION_WORDS = {
    "QUESTION": "?",
    "HELP": "!",
}


class SentenceBuilder:
    def __init__(self) -> None:
        self._words: list[str] = []

    def add_word(self, word: str) -> None:
        word = word.strip().upper()
        if not word:
            return
        if self._words and self._words[-1] == word:
            return  # repeated-word suppression
        self._words.append(word)

    def reset(self) -> None:
        self._words = []

    def build(self) -> str:
        if not self._words:
            return ""

        tokens = list(self._words)
        out: list[str] = []
        for i, tok in enumerate(tokens):
            lower = tok.lower()
            if tok in _ARTICLE_INSERTIONS and i + 1 < len(tokens):
                out.append(lower)
                out.append(_ARTICLE_INSERTIONS[tok])
            else:
                out.append(lower)

        sentence = " ".join(out)
        sentence = re.sub(r"\s+", " ", sentence).strip()
        sentence = sentence[0].upper() + sentence[1:] if sentence else sentence

        end_punct = "."
        for tok in tokens:
            if tok in _PUNCTUATION_WORDS:
                end_punct = _PUNCTUATION_WORDS[tok]
                break

        if not sentence.endswith((".", "!", "?")):
            sentence += end_punct

        return sentence

    def snapshot_and_reset(self) -> str:
        sentence = self.build()
        self.reset()
        return sentence