"""Rules engine: deterministic scope checks.

Everything that can be computed from the data is computed here, so the LLM receives facts instead of
guessing them. These checks are fast, free and explainable.
"""

from __future__ import annotations

import re
from collections import Counter
from difflib import SequenceMatcher
from itertools import combinations

from . import config
from .models import ReleaseContext, Finding, ScopeMetrics, Ticket

_AC_PATTERNS = re.compile(
    r"acceptance criteria|\bAC\s*[:\-]|\bgiven\b.*\bwhen\b.*\bthen\b|definition of done|"
    r"критерии приемки|критерии приёмки|критерії прийняття",
    re.IGNORECASE | re.DOTALL,
)
_STORY_TYPES = {"story", "user story", "feature", "improvement", "new feature"}
_WORD = re.compile(r"[a-zа-яёіїєґ0-9]+", re.IGNORECASE)
_TAG = re.compile(r"\[[^\]]*\]")  # component tags in titles: [FE], [BE], [Admin] ...


def _norm_summary(s: str) -> str:
    return " ".join(_WORD.findall(_TAG.sub(" ", s).lower()))


def in_release(tickets: list[Ticket], release: str | None) -> list[Ticket]:
    if not release:
        return tickets
    return [t for t in tickets if release in t.fix_versions]


def has_acceptance_criteria(t: Ticket) -> bool:
    return bool(_AC_PATTERNS.search(t.description or ""))


def check_ticket(t: Ticket) -> list[Finding]:
    out: list[Finding] = []
    if t.is_done or not t.is_work_item:  # epics and sub-tasks are checked through their stories
        return out
    is_story = t.issue_type.strip().lower() in _STORY_TYPES
    if is_story and not has_acceptance_criteria(t):
        out.append(Finding(
            ticket_key=t.key, type="missing_acceptance_criteria", severity="high",
            explanation="No acceptance criteria found in the description.",
            suggestion="Add testable Given/When/Then criteria before the story enters a sprint.",
        ))
    if len((t.description or "").strip()) < config.SHORT_DESCRIPTION_CHARS:
        out.append(Finding(
            ticket_key=t.key, type="thin_description", severity="medium",
            explanation=f"Description is empty or shorter than {config.SHORT_DESCRIPTION_CHARS} characters.",
            suggestion="Describe the user need, context and expected behaviour.",
        ))
    if t.story_points is None and not t.is_bug:
        out.append(Finding(
            ticket_key=t.key, type="not_estimated", severity="medium",
            explanation="No story-point estimate, so the release load cannot be checked against capacity.",
            suggestion="Estimate in the next refinement session.",
        ))
    if t.story_points is not None and t.story_points > config.TOO_BIG_POINTS:
        out.append(Finding(
            ticket_key=t.key, type="too_big", severity="medium",
            explanation=f"Estimated at {t.story_points:g} points (> {config.TOO_BIG_POINTS}); unlikely to fit one sprint.",
            suggestion="Split into smaller stories that each deliver value.",
        ))
    return out


_STOPWORDS = {"a", "an", "the", "to", "of", "for", "in", "on", "and", "or", "with", "from", "by", "is", "as", "at", "new"}


def _stem(word: str) -> str:
    return word[:-1] if len(word) > 3 and word.endswith("s") else word  # bookings -> booking


def _content_words(s: str) -> set[str]:
    return {_stem(w) for w in _WORD.findall(_TAG.sub(" ", s).lower()) if w not in _STOPWORDS and len(w) > 1}


def find_duplicates(tickets: list[Ticket]) -> list[Finding]:
    """A newer ticket is a possible duplicate when its title is almost the same as an older one (typos),
    or when every word of it already appears in the older title (a vague copy of existing work).
    A newer ticket that adds its own words ("Booking form: upload a photo...", "Send 'adoption-new' e-mail")
    is new work, even when the title follows the same pattern."""
    out: list[Finding] = []
    open_t = [t for t in tickets if not t.is_done and t.is_work_item]
    for a, b in combinations(open_t, 2):
        if a.created and b.created and a.created > b.created:
            a, b = b, a  # a = older, b = newer
        ratio = SequenceMatcher(None, _norm_summary(a.summary), _norm_summary(b.summary)).ratio()
        old_words, new_words = _content_words(a.summary), _content_words(b.summary)
        covered = len(new_words & old_words) / len(new_words) if len(new_words) >= 2 else 0.0
        if ratio >= config.DUPLICATE_SIMILARITY or covered == 1.0:
            why = f"{ratio:.0%} similar" if ratio >= config.DUPLICATE_SIMILARITY else "all its key words are already in the older task"
            out.append(Finding(
                ticket_key=b.key, type="possible_duplicate", severity="medium",
                explanation=f"Summary looks like {a.key} (\"{a.summary}\"): {why}.",
                suggestion=f"Check with {a.key}; merge or link them.",
            ))
    return out


def similar_tickets(text: str, tickets: list[Ticket], top: int = 8) -> list[tuple[Ticket, float]]:
    """Tickets whose summary/description is closest to a free-text request (used by triage)."""
    q = set(_WORD.findall(text.lower()))
    scored = []
    for t in tickets:
        words = set(_WORD.findall(f"{t.summary} {t.description}".lower()))
        if not words or not q:
            continue
        overlap = len(q & words) / len(q | words)
        seq = SequenceMatcher(None, _norm_summary(text)[:200], _norm_summary(t.summary)).ratio()
        scored.append((t, round(0.6 * overlap + 0.4 * seq, 3)))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [s for s in scored[:top] if s[1] > 0.05]


def compute_metrics(release_tickets: list[Ticket], ctx: ReleaseContext, all_tickets: list[Ticket] | None = None) -> ScopeMetrics:
    # Count stories, tasks and bugs. Epics only group work; sub-tasks are already inside their story's points.
    work = [t for t in release_tickets if t.is_work_item]
    open_t = [t for t in work if not t.is_done]
    open_points = sum(t.story_points or 0 for t in open_t)
    load = (open_points / ctx.capacity_points) if ctx.capacity_points else None

    added: list[str] = []
    if ctx.baseline_keys:
        base = set(ctx.baseline_keys)
        added = [t.key for t in work if t.key not in base]
    elif ctx.baseline_date:
        added = [t.key for t in work if t.created and t.created > ctx.baseline_date]
    baseline_size = len(work) - len(added)
    growth = (len(added) / baseline_size * 100) if baseline_size > 0 and added else (0.0 if baseline_size > 0 else None)

    bugs = [t for t in work if t.is_bug]
    by_key = {t.key: t for t in (all_tickets or release_tickets)}
    blockers: list[str] = []
    for t in open_t:
        for b in t.blocked_by:
            bt = by_key.get(b)
            if bt is None or not bt.is_done:
                state = "unknown status" if bt is None else bt.status
                outside = "" if (bt and ctx.release in bt.fix_versions) else " (outside this release)"
                blockers.append(f"{t.key} is blocked by {b} [{state}]{outside}")

    return ScopeMetrics(
        total_tickets=len(work),
        open_tickets=len(open_t),
        open_points=open_points,
        unestimated_open=sum(1 for t in open_t if t.story_points is None and not t.is_bug),
        capacity_points=ctx.capacity_points,
        load_ratio=round(load, 2) if load is not None else None,
        added_after_baseline=added,
        scope_growth_pct=round(growth, 1) if growth is not None else None,
        bugs_open=sum(1 for t in bugs if not t.is_done),
        bugs_closed=sum(1 for t in bugs if t.is_done),
        type_mix=dict(Counter(t.issue_type for t in work)),
        open_blockers=blockers,
    )


def run_rules(release_tickets: list[Ticket], ctx: ReleaseContext, all_tickets: list[Ticket] | None = None) -> tuple[ScopeMetrics, list[Finding]]:
    findings: list[Finding] = []
    for t in release_tickets:
        findings.extend(check_ticket(t))
    findings.extend(find_duplicates(release_tickets))
    metrics = compute_metrics(release_tickets, ctx, all_tickets)
    for key in metrics.added_after_baseline:
        findings.append(Finding(
            ticket_key=key, type="added_after_baseline", severity="low",
            explanation="Added to the release after the scope baseline.",
            suggestion="Confirm it went through change control and that something was traded off.",
        ))
    return metrics, findings


def health_score(metrics: ScopeMetrics, findings: list) -> int:
    """0-100. Transparent formula so the PM can see why the score is what it is."""
    score = 100.0
    open_n = max(metrics.open_tickets, 1)
    high = sum(1 for f in findings if f.severity == "high")
    medium = sum(1 for f in findings if f.severity == "medium")
    score -= min(30, 30 * high / open_n)          # quality of requirements
    score -= min(15, 15 * medium / open_n)
    if metrics.load_ratio is not None and metrics.load_ratio > 1:
        score -= min(30, (metrics.load_ratio - 1) * 60)   # overload vs capacity
    if metrics.scope_growth_pct:
        score -= min(15, metrics.scope_growth_pct / 2)    # scope creep
    score -= min(10, 3 * len(metrics.open_blockers))      # dependency risk
    return max(0, round(score))
