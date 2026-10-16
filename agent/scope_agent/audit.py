"""History: every piece of advice and what the PM decided (one JSON line per event)."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from . import config


def save(tool: str, decision: str, details: dict[str, Any], note: str = "", path: Path | None = None) -> None:
    path = path or config.HISTORY_FILE
    path.parent.mkdir(parents=True, exist_ok=True)
    event = {
        "time": datetime.now().isoformat(timespec="seconds"),
        "tool": tool,
        "decision": decision,
        "note": note,
        "details": details,
    }
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False, default=str) + "\n")


def load(path: Path | None = None) -> list[dict[str, Any]]:
    path = path or config.HISTORY_FILE
    if not path.exists():
        return []
    events = []
    for line in path.read_text(encoding="utf-8").splitlines():
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return events
