"""The shapes of our data.

Project data comes from the Jira export and documents. The "advice" classes describe what we
ask the AI to send back, so every answer has the same fields. The report classes are what the
web page shows.
"""

from __future__ import annotations

from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field

# ---------------------------------------------------------------- project data


class Ticket(BaseModel):
    key: str
    summary: str
    issue_type: str = "Story"
    status: str = "To Do"
    priority: str = ""
    description: str = ""
    fix_versions: list[str] = Field(default_factory=list)
    story_points: Optional[float] = None
    created: Optional[date] = None
    labels: list[str] = Field(default_factory=list)
    components: list[str] = Field(default_factory=list)
    parent: str = ""  # epic link for stories, parent story for sub-tasks
    blocks: list[str] = Field(default_factory=list)
    blocked_by: list[str] = Field(default_factory=list)
    relates_to: list[str] = Field(default_factory=list)

    @property
    def is_done(self) -> bool:
        return self.status.strip().lower() in {"done", "closed", "resolved", "released", "won't do", "wont do", "cancelled"}

    @property
    def is_bug(self) -> bool:
        return self.issue_type.strip().lower() in {"bug", "defect"}

    @property
    def is_epic(self) -> bool:
        return self.issue_type.strip().lower() == "epic"

    @property
    def is_subtask(self) -> bool:
        return self.issue_type.strip().lower().replace("-", "") in {"subtask", "sub task"}

    @property
    def is_work_item(self) -> bool:
        """Stories, tasks and bugs. Epics only group work, and sub-tasks are part of their story."""
        return not (self.is_epic or self.is_subtask)

    def brief(self, max_desc: int = 600) -> str:
        """A short text version of the ticket for the AI."""
        desc = " ".join(self.description.split())
        if len(desc) > max_desc:
            desc = desc[:max_desc] + " ..."
        points = self.story_points if self.story_points is not None else "-"
        lines = [
            f"[{self.key}] {self.summary}",
            f"type={self.issue_type}; status={self.status}; priority={self.priority or '-'}; points={points}; "
            f"created={self.created or '-'}; release={', '.join(self.fix_versions) or '-'}; "
            f"components={', '.join(self.components) or '-'}; parent={self.parent or '-'}",
        ]
        if self.blocked_by or self.blocks:
            lines.append(f"blocked_by={', '.join(self.blocked_by) or '-'}; blocks={', '.join(self.blocks) or '-'}")
        lines.append(f"description: {desc or '(empty)'}")
        return "\n".join(lines)


class ReleaseContext(BaseModel):
    project: str = "Dog Hotel (EPM-PEDH)"
    release: str
    goal: str = ""
    milestone_date: Optional[date] = None
    baseline_date: Optional[date] = None
    baseline_keys: list[str] = Field(default_factory=list)
    capacity_points: Optional[float] = None
    story_template: str = (
        "As a <role>, I want <capability>, so that <benefit>.\n"
        "Acceptance criteria (Given / When / Then):\n- ..."
    )
    definition_of_ready: list[str] = Field(
        default_factory=lambda: [
            "Clear user value (As a / I want / So that)",
            "Testable acceptance criteria",
            "Estimated in story points",
            "Dependencies identified",
            "Fits in one sprint (<= 8 points)",
        ]
    )
    notes: str = ""

    def as_text(self) -> str:
        dor = "\n".join(f"- {item}" for item in self.definition_of_ready)
        capacity = self.capacity_points if self.capacity_points is not None else "not set"
        return (
            f"Project: {self.project}\n"
            f"Release: {self.release}\n"
            f"Release goal: {self.goal or 'not set'}\n"
            f"Milestone date: {self.milestone_date or 'not set'}\n"
            f"Scope baseline date: {self.baseline_date or 'not set'}\n"
            f"Baseline tickets: {', '.join(self.baseline_keys) or 'not set'}\n"
            f"Team capacity for the release (story points): {capacity}\n"
            f"Story template used by the team:\n{self.story_template}\n"
            f"Definition of Ready:\n{dor}\n"
            f"PM notes: {self.notes or '-'}"
        )


class DocSection(BaseModel):
    source: str
    heading: str
    text: str

    @property
    def ref(self) -> str:
        return f"{self.source} > {self.heading}" if self.heading else self.source


# ---------------------------------------------------------------- what the AI sends back


class UserStoryDraft(BaseModel):
    title: str
    as_a: str
    i_want: str
    so_that: str
    acceptance_criteria: list[str] = Field(description="Testable criteria, Given/When/Then style")
    estimate_hint: str = Field(description="T-shirt size S/M/L/XL with a one-line reason")
    notes: str = Field(description="Assumptions or open points for the BA; empty string if none")

    def as_text(self) -> str:
        criteria = "\n".join(f"- {c}" for c in self.acceptance_criteria)
        text = (
            f"{self.title}\n\n"
            f"As a {self.as_a}, I want {self.i_want}, so that {self.so_that}.\n\n"
            f"Acceptance criteria:\n{criteria}\n\n"
            f"Estimate: {self.estimate_hint}"
        )
        return text + (f"\n\nNotes: {self.notes}" if self.notes else "")


class Impact(BaseModel):
    effort: Literal["S", "M", "L", "XL"]
    affected_areas: list[str] = Field(description="Parts of the site/admin affected, e.g. booking form, admin bookings list")
    schedule_risk: Literal["low", "medium", "high"]
    risks: list[str]


class TriageAdvice(BaseModel):
    """Advice for one new request (tool 1)."""

    restated_request: str = Field(description="The request in one clear sentence")
    classification: Literal["in_scope", "scope_creep", "out_of_scope", "needs_clarification"]
    goal_alignment: Literal["high", "medium", "low", "none"]
    rationale: str
    impact: Impact
    recommendation: Literal["accept_current_release", "defer_to_backlog", "raise_change_request", "reject"]
    recommendation_reason: str
    trade_off: str = Field(description="If accepted into the current release: what should be cut or moved, with ticket keys from the backlog; otherwise empty")
    related_tickets: list[str] = Field(description="Keys of EXISTING tickets (only from the provided backlog) that overlap or depend on this request")
    clarifying_questions: list[str]
    draft_story: UserStoryDraft


class ReviewFinding(BaseModel):
    ticket_key: str
    type: Literal["ambiguous", "missing_acceptance_criteria", "off_goal", "too_big", "unclear_value", "hidden_dependency", "duplicate", "other"]
    severity: Literal["high", "medium", "low"]
    explanation: str
    suggestion: str


class Priority(BaseModel):
    ticket_key: str
    moscow: Literal["must", "should", "could", "wont"]
    reason: str


class HealthReview(BaseModel):
    """The AI's review of a whole release (tool 2)."""

    summary: str = Field(description="3-5 sentences for the PM: is the release scope healthy and achievable?")
    goal_coverage: str = Field(description="Does the scope cover the release goal? Name gaps and items that do not serve the goal")
    findings: list[ReviewFinding]
    moscow: list[Priority] = Field(description="MoSCoW classification of the open tickets of the release")
    dependency_risks: list[str]
    top_actions: list[str] = Field(description="3-6 concrete next actions for the PM, most important first")


class ScopeAnswer(BaseModel):
    """An answer to a scope question (tool 3)."""

    answer: str
    sources: list[str] = Field(description="Ticket keys and document references actually used; empty if none")
    confidence: Literal["high", "medium", "low"]
    not_found: bool = Field(description="True when the provided sources do not answer the question")
    follow_up: str = Field(description="Whom to ask or what to check next, if needed")


# ---------------------------------------------------------------- what the page shows


class Finding(BaseModel):
    ticket_key: str
    type: str
    severity: Literal["high", "medium", "low"]
    explanation: str
    suggestion: str
    source: Literal["rule", "ai"] = "rule"


class ScopeMetrics(BaseModel):
    total_tickets: int
    open_tickets: int
    open_points: float
    unestimated_open: int
    capacity_points: Optional[float]
    load_ratio: Optional[float]
    added_after_baseline: list[str]
    scope_growth_pct: Optional[float]
    bugs_open: int
    bugs_closed: int
    type_mix: dict[str, int]
    open_blockers: list[str]


class HealthReport(BaseModel):
    release: str
    score: int
    metrics: ScopeMetrics
    findings: list[Finding]
    review: Optional[HealthReview] = None
