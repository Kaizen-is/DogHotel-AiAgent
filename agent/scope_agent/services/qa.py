"""Tool 3: answer a scope question from the project documents and tickets."""

from __future__ import annotations

from dataclasses import dataclass

from .. import rules
from ..llm import AIClient
from ..models import DocSection, ReleaseContext, ScopeAnswer, Ticket
from ..prompting import fill, instructions

MAX_SOURCE_CHARS = 120_000  # the whole Dog Hotel material fits; above this we keep the most relevant tickets


@dataclass
class QAResult:
    answer: ScopeAnswer
    unknown_sources: list[str]
    seconds: float


def ask_question(question: str, ctx: ReleaseContext, tickets: list[Ticket], docs: list[DocSection], ai: AIClient) -> QAResult:
    docs_text = "\n\n".join(f"[DOC: {d.ref}]\n{d.text}" for d in docs) or "(no documents loaded)"
    tickets_text = "\n\n".join(t.brief(max_desc=400) for t in tickets)
    if len(docs_text) + len(tickets_text) > MAX_SOURCE_CHARS:
        closest = [t for t, _ in rules.similar_tickets(question, tickets, top=40)]
        tickets_text = "\n\n".join(t.brief(max_desc=400) for t in closest)
        docs_text = docs_text[: MAX_SOURCE_CHARS - len(tickets_text)]

    answer = ai.ask(instructions(ctx), fill("qa", question=question.strip(), docs=docs_text, tickets=tickets_text), ScopeAnswer)

    known = {t.key for t in tickets} | {d.ref for d in docs} | {d.source for d in docs}

    def is_known(source: str) -> bool:
        source = source.strip().removeprefix("[").removeprefix("DOC:").strip().rstrip("]")
        return source in known or any(source.startswith(k) for k in known)

    unknown = [s for s in answer.content.sources if not is_known(s)]
    return QAResult(answer.content, unknown, answer.seconds)
