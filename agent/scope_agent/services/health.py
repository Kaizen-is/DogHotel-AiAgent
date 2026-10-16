"""Tool 2: check the health of a whole release (rules first, then the AI review)."""

from __future__ import annotations

from .. import rules
from ..llm import AIClient
from ..models import Finding, HealthReport, HealthReview, ReleaseContext, ScopeMetrics, Ticket
from ..prompting import fill, instructions

SEVERITY_ORDER = {"high": 0, "medium": 1, "low": 2}


def facts_as_text(m: ScopeMetrics) -> str:
    capacity = m.capacity_points if m.capacity_points is not None else "not set"
    load = m.load_ratio if m.load_ratio is not None else "unknown"
    growth = m.scope_growth_pct if m.scope_growth_pct is not None else "n/a"
    return "\n".join([
        f"- Tickets in release: {m.total_tickets} (open: {m.open_tickets})",
        f"- Open story points: {m.open_points:g}; capacity: {capacity}; load ratio: {load}",
        f"- Open items without estimate: {m.unestimated_open}",
        f"- Added after baseline: {', '.join(m.added_after_baseline) or 'none'} (growth {growth}%)",
        f"- Bugs open/closed: {m.bugs_open}/{m.bugs_closed}",
        f"- Issue type mix: {m.type_mix}",
        f"- Open blockers: {'; '.join(m.open_blockers) or 'none'}",
    ])


def check_release(ctx: ReleaseContext, tickets: list[Ticket], ai: AIClient | None) -> tuple[HealthReport, float]:
    """Returns the report and how many seconds the AI took (0 when the AI is not used)."""
    in_release = rules.in_release(tickets, ctx.release)
    facts, findings = rules.run_rules(in_release, ctx, tickets)
    review, seconds = None, 0.0

    if ai is not None and in_release:
        question = fill(
            "health_check",
            release=ctx.release,
            metrics=facts_as_text(facts),
            rule_findings="\n".join(f"- {f.ticket_key}: {f.type} ({f.severity})" for f in findings) or "- none",
            tickets="\n\n".join(t.brief() for t in in_release),
        )
        answer = ai.ask(instructions(ctx), question, HealthReview)
        review, seconds = answer.content, answer.seconds

        # Keep only AI findings about real tickets that the rules did not already report.
        known = {t.key for t in in_release}
        already = {(f.ticket_key, f.type) for f in findings}
        for f in review.findings:
            if f.ticket_key in known and (f.ticket_key, f.type) not in already:
                findings.append(Finding(ticket_key=f.ticket_key, type=f.type, severity=f.severity,
                                        explanation=f.explanation, suggestion=f.suggestion, source="ai"))
        review.moscow = [p for p in review.moscow if p.ticket_key in known]

    findings.sort(key=lambda f: (SEVERITY_ORDER[f.severity], f.ticket_key))
    report = HealthReport(release=ctx.release, score=rules.health_score(facts, findings),
                          metrics=facts, findings=findings, review=review)
    return report, seconds


def report_markdown(report: HealthReport) -> str:
    lines = [f"# Scope health report: {report.release}", "", f"**Health score:** {report.score}/100", "",
             "## Numbers", facts_as_text(report.metrics)]
    r = report.review
    if r:
        lines += ["", "## Summary", r.summary, "", "## Does the scope cover the goal?", r.goal_coverage,
                  "", "## Top actions", *[f"{i}. {a}" for i, a in enumerate(r.top_actions, 1)]]
    lines += ["", "## Problems", "| Task | Problem | Severity | Found by | Explanation | Suggestion |", "|---|---|---|---|---|---|"]
    lines += [f"| {f.ticket_key} | {f.type.replace('_', ' ')} | {f.severity} | {f.source} | {f.explanation} | {f.suggestion} |"
              for f in report.findings]
    if r:
        lines += ["", "## Priorities (MoSCoW)", "| Task | Priority | Reason |", "|---|---|---|"]
        lines += [f"| {p.ticket_key} | {p.moscow} | {p.reason} |" for p in r.moscow]
        lines += ["", "## Dependency risks", *[f"- {d}" for d in (r.dependency_risks or ["none"])]]
    lines += ["", "_Advice only. The project manager makes the decisions._"]
    return "\n".join(lines)
