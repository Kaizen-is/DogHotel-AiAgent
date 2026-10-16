"""Load a Jira CSV export into Ticket objects.

Jira (Server and Cloud) exports repeat a column once per value ("Labels", "Labels", "Fix Version/s", ...);
pandas renames repeats to "Labels.1", "Labels.2". Columns are matched by name without that suffix,
case-insensitively, with several known aliases per field. Personal fields (assignee, reporter) are
not loaded at all.
"""

from __future__ import annotations

import io
import re
from datetime import date, datetime
from pathlib import Path
from typing import IO, Iterable

import pandas as pd

from ..models import Ticket

ALIASES: dict[str, list[str]] = {
    "key": ["issue key", "key"],
    "summary": ["summary", "title"],
    "issue_type": ["issue type", "issuetype", "type"],
    "status": ["status"],
    "priority": ["priority"],
    "description": ["description"],
    "fix_versions": ["fix version/s", "fix versions", "fixversion", "fix version", "release"],
    "story_points": [
        "custom field (story points)",
        "custom field (story point estimate)",
        "story points",
        "story point estimate",
        "points",
    ],
    "created": ["created", "created date"],
    "labels": ["labels", "label"],
    "components": ["component/s", "components", "component"],
    "parent": ["custom field (epic link)", "epic link", "parent key", "parent"],
    "blocks": ["outward issue link (blocks)", "blocks"],
    "blocked_by": ["inward issue link (blocks)", "blocked by", "is blocked by"],
    "relates_to": ["outward issue link (relates)", "inward issue link (relates)", "relates to"],
}

_SUFFIX = re.compile(r"\.\d+$")
_DATE_FORMATS = ["%d/%b/%y %I:%M %p", "%d/%b/%y %H:%M", "%d/%b/%Y %I:%M %p", "%Y-%m-%d %H:%M", "%Y-%m-%d", "%d.%m.%Y %H:%M", "%d.%m.%Y", "%m/%d/%Y %H:%M", "%m/%d/%Y"]


def _norm(col: str) -> str:
    return _SUFFIX.sub("", str(col)).strip().lower()


def _columns_for(df: pd.DataFrame, field: str) -> list[str]:
    wanted = ALIASES[field]
    return [c for c in df.columns if _norm(c) in wanted]


def _values(row: pd.Series, cols: Iterable[str]) -> list[str]:
    out: list[str] = []
    for c in cols:
        v = row.get(c)
        if v is None or (isinstance(v, float) and pd.isna(v)):
            continue
        s = str(v).strip()
        if s and s.lower() != "nan":
            # some exports put several values in one cell separated by commas/semicolons
            out.extend(p.strip() for p in re.split(r"[;,]", s) if p.strip())
    return out


def _first(row: pd.Series, cols: list[str]) -> str:
    if not cols:
        return ""
    v = row.get(cols[0])
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return ""
    return str(v).strip()


def _parse_date(s: str) -> date | None:
    s = s.strip()
    if not s:
        return None
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    try:
        return pd.to_datetime(s, dayfirst=True).date()
    except (ValueError, TypeError):
        return None


def _parse_points(s: str) -> float | None:
    s = s.strip().replace(",", ".")
    try:
        return float(s) if s else None
    except ValueError:
        return None


def load_jira_csv(source: str | Path | IO[bytes] | bytes) -> list[Ticket]:
    if isinstance(source, bytes):
        source = io.BytesIO(source)
    df = pd.read_csv(source, dtype=str, keep_default_na=False, encoding_errors="replace")
    cols = {field: _columns_for(df, field) for field in ALIASES}
    if not cols["key"] or not cols["summary"]:
        raise ValueError(
            "The CSV must contain at least 'Issue key' and 'Summary' columns (Jira export: Filters -> Export -> CSV)."
        )

    tickets: list[Ticket] = []
    for _, row in df.iterrows():
        key = _first(row, cols["key"])
        if not key:
            continue
        tickets.append(
            Ticket(
                key=key,
                summary=_first(row, cols["summary"]),
                issue_type=_first(row, cols["issue_type"]) or "Story",
                status=_first(row, cols["status"]) or "To Do",
                priority=_first(row, cols["priority"]),
                description=_first(row, cols["description"]),
                fix_versions=_values(row, cols["fix_versions"]),
                story_points=_parse_points(_first(row, cols["story_points"])),
                created=_parse_date(_first(row, cols["created"])),
                labels=_values(row, cols["labels"]),
                components=_values(row, cols["components"]),
                parent=next((p for p in _values(row, cols["parent"]) if not p.isdigit()), ""),
                blocks=_values(row, cols["blocks"]),
                blocked_by=_values(row, cols["blocked_by"]),
                relates_to=_values(row, cols["relates_to"]),
            )
        )
    return tickets


def releases_in(tickets: list[Ticket]) -> list[str]:
    seen: dict[str, None] = {}
    for t in tickets:
        for v in t.fix_versions:
            seen.setdefault(v, None)
    return list(seen)
