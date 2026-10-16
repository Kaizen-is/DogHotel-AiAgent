"""Load project documents (KB pages / release notes exported as .md or .txt) and split them by heading."""

from __future__ import annotations

import re
from pathlib import Path

from ..models import DocSection

_HEADING = re.compile(r"^(#{1,4})\s+(.*)$")


def split_markdown(text: str, source: str) -> list[DocSection]:
    sections: list[DocSection] = []
    heading = ""
    buf: list[str] = []

    def flush() -> None:
        body = "\n".join(buf).strip()
        if body:
            sections.append(DocSection(source=source, heading=heading, text=body))

    for line in text.splitlines():
        m = _HEADING.match(line)
        if m:
            flush()
            heading = m.group(2).strip()
            buf = []
        else:
            buf.append(line)
    flush()
    return sections


def load_docs(folder: Path) -> list[DocSection]:
    sections: list[DocSection] = []
    if not folder.exists():
        return sections
    for path in sorted(folder.glob("*")):
        if path.suffix.lower() in {".md", ".txt"}:
            sections.extend(split_markdown(path.read_text(encoding="utf-8", errors="replace"), path.stem))
    return sections


def load_uploaded(name: str, data: bytes) -> list[DocSection]:
    return split_markdown(data.decode("utf-8", errors="replace"), Path(name).stem)
