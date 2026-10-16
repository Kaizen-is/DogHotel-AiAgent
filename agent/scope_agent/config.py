"""Settings. The API key is read from agent/.env (OPENAIKEY=...), never written in the code."""

import os
from pathlib import Path

from dotenv import load_dotenv

AGENT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(AGENT_DIR / ".env", override=True)

# The AI behind the agent is fixed on purpose: users don't choose models or settings.
AI_MODEL = "gpt-5.5"
AI_EFFORT = "medium"

PROMPTS_DIR = Path(__file__).resolve().parent / "prompts"
DATA_DIR = AGENT_DIR / "data"
SAMPLE_DIR = DATA_DIR / "sample"
REAL_DIR = DATA_DIR / "real"
HISTORY_FILE = AGENT_DIR / "audit" / "audit.jsonl"

# Rules engine thresholds
DUPLICATE_SIMILARITY = 0.92
TOO_BIG_POINTS = 8
SHORT_DESCRIPTION_CHARS = 40


def api_key() -> str:
    return (os.getenv("OPENAIKEY") or "").strip()
