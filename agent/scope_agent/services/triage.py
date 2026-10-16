"""Tool 1: check one new request against the release."""

from __future__ import annotations

from dataclasses import dataclass

from .. import rules
from ..llm import AIClient
from ..models import ReleaseContext, ScopeMetrics, Ticket, TriageAdvice
from ..prompting import fill, instructions


@dataclass
class TriageResult:
    advice: TriageAdvice
    facts: ScopeMetrics
    similar: list[tuple[Ticket, float]]
    unknown_keys: list[str]  # ticket keys the AI mentioned that don't exist (should stay empty)
    seconds: float


def check_request(request: str, requester: str, ctx: ReleaseContext, tickets: list[Ticket], ai: AIClient) -> TriageResult:
    in_release = rules.in_release(tickets, ctx.release)
    facts = rules.compute_metrics(in_release, ctx, tickets)
    similar = rules.similar_tickets(request, tickets)
    open_tickets = [t for t in in_release if not t.is_done]

    capacity = f"{ctx.capacity_points:g} points" if ctx.capacity_points else "not set"
    load = f"{facts.load_ratio:.0%} of capacity" if facts.load_ratio is not None else "unknown"
    similar_text = "\n".join(f"- ({score:.2f}) {t.key}: {t.summary} [{t.status}]" for t, score in similar) or "- none found"
    backlog_text = "\n\n".join(t.brief(max_desc=300) for t in open_tickets) or "(no open tickets)"

    question = fill(
        "triage",
        release=ctx.release,
        requester=requester or "not specified",
        request=request.strip(),
        open_points=f"{facts.open_points:g}",
        open_tickets=facts.open_tickets,
        capacity=capacity,
        load=load,
        added_after_baseline=", ".join(facts.added_after_baseline) or "none",
        similar=similar_text,
        backlog=backlog_text,
    )
    answer = ai.ask(instructions(ctx), question, TriageAdvice)

    known = {t.key for t in tickets}
    unknown = sorted(k for k in set(answer.content.related_tickets) if k not in known)
    return TriageResult(answer.content, facts, similar, unknown, answer.seconds)
