"""Checks the agent on example requests with known right answers. It uses the AI, so each run costs a little.

    python eval/run_eval.py                 # 10 example requests + a release health check
    python eval/run_eval.py --only triage

The results go to eval/results/eval_<date_time>.md (and .json): numbers for the internship report.
"""

from __future__ import annotations

import argparse
import json
import statistics
import sys
from datetime import datetime
from pathlib import Path

AGENT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(AGENT))

from scope_agent import config  # noqa: E402
from scope_agent.ingest.jira_csv import load_jira_csv  # noqa: E402
from scope_agent.llm import AIClient, AIError  # noqa: E402
from scope_agent.models import ReleaseContext  # noqa: E402
from scope_agent.services.health import check_release  # noqa: E402
from scope_agent.services.triage import check_request  # noqa: E402

CASES = AGENT / "eval" / "cases" / "triage_cases.jsonl"
RESULTS = AGENT / "eval" / "results"

# What we planted in the sample release (see data/sample/README.md)
OFF_GOAL = {"DHS-110", "DHS-111", "DHS-112"}
MUST_HAVE = {"DHS-101", "DHS-102", "DHS-104", "DHS-107"}


def sample_data():
    tickets = load_jira_csv(config.SAMPLE_DIR / "jira_export_sample.csv")
    ctx = ReleaseContext(**json.loads((config.SAMPLE_DIR / "release_context.json").read_text(encoding="utf-8")))
    return tickets, ctx


def run_triage_cases(ai, tickets, ctx):
    rows = []
    for line in CASES.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        case = json.loads(line)
        try:
            result = check_request(case["request"], case["requester"], ctx, tickets, ai)
        except AIError as e:
            rows.append({"id": case["id"], "error": str(e)})
            continue
        a = result.advice
        rows.append({
            "id": case["id"],
            "classification": a.classification,
            "class_ok": a.classification in case["expected_classification"],
            "recommendation": a.recommendation,
            "rec_ok": a.recommendation in case["expected_recommendation"],
            "related": a.related_tickets,
            "related_ok": all(k in a.related_tickets for k in case["must_relate"]),
            "criteria_in_story": len(a.draft_story.acceptance_criteria),
            "unknown_keys": result.unknown_keys,
            "seconds": round(result.seconds, 1),
        })
        print(f"{case['id']}: {a.classification} / {a.recommendation} ({result.seconds:.0f}s)")
    return rows


def run_health_check(ai, tickets, ctx):
    report, seconds = check_release(ctx, tickets, ai)
    review = report.review
    off_goal = {f.ticket_key for f in review.findings if f.type == "off_goal"}
    low = {p.ticket_key for p in review.moscow if p.moscow in ("could", "wont")}
    must = {p.ticket_key for p in review.moscow if p.moscow == "must"}
    return {
        "score": report.score,
        "findings": len(report.findings),
        "findings_by_ai": sum(f.source == "ai" for f in report.findings),
        "off_goal_found": len((off_goal | low) & OFF_GOAL) / len(OFF_GOAL),
        "must_have_found": len(must & MUST_HAVE) / len(MUST_HAVE),
        "seconds": round(seconds, 1),
        "top_actions": review.top_actions,
    }


def mark(flag: bool) -> str:
    return "✓" if flag else "✗"


def write_markdown(when, triage_rows, health) -> str:
    lines = [f"# Evaluation {when}", "", "Data: SAMPLE release (synthetic tickets DHS-*).", ""]
    if triage_rows:
        ok = [r for r in triage_rows if "error" not in r]
        n = len(ok) or 1

        def count(key):
            return sum(r[key] for r in ok)

        lines += [
            "## Tool 1: request check",
            f"- Requests: {len(triage_rows)} (errors: {len(triage_rows) - len(ok)})",
            f"- Right class: {count('class_ok')}/{len(ok)} ({count('class_ok') / n:.0%})",
            f"- Right advice: {count('rec_ok')}/{len(ok)} ({count('rec_ok') / n:.0%})",
            f"- Found the related tasks: {count('related_ok')}/{len(ok)}",
            f"- Invented task numbers: {sum(len(r['unknown_keys']) for r in ok)}",
            f"- Median time per request: {round(statistics.median([r['seconds'] for r in ok]), 1) if ok else 0}s",
            "",
            "| Request | Class | ok | Advice | ok | Related tasks | ok | Criteria in story | Seconds |",
            "|---|---|---|---|---|---|---|---|---|",
        ]
        for r in triage_rows:
            if "error" in r:
                lines.append(f"| {r['id']} | error: {r['error']} | | | | | | | |")
            else:
                lines.append(f"| {r['id']} | {r['classification']} | {mark(r['class_ok'])} | {r['recommendation']} | "
                             f"{mark(r['rec_ok'])} | {', '.join(r['related']) or '-'} | {mark(r['related_ok'])} | "
                             f"{r['criteria_in_story']} | {r['seconds']} |")
    if health:
        lines += [
            "", "## Tool 2: release health check",
            f"- Health score: {health['score']}/100; problems found: {health['findings']} ({health['findings_by_ai']} by the AI review)",
            f"- Tasks that don't serve the goal, recognised: {health['off_goal_found']:.0%}",
            f"- Core tasks marked as Must: {health['must_have_found']:.0%}",
            f"- Time: {health['seconds']}s",
            "", "Top actions:", *[f"{i}. {a}" for i, a in enumerate(health["top_actions"], 1)],
        ]
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=["triage", "health"])
    args = parser.parse_args()

    ai = AIClient()
    tickets, ctx = sample_data()
    triage_rows = run_triage_cases(ai, tickets, ctx) if args.only in (None, "triage") else []
    health = run_health_check(ai, tickets, ctx) if args.only in (None, "health") else None

    when = datetime.now().strftime("%Y%m%d_%H%M%S")
    RESULTS.mkdir(parents=True, exist_ok=True)
    (RESULTS / f"eval_{when}.json").write_text(
        json.dumps({"triage": triage_rows, "health": health}, indent=2, ensure_ascii=False), encoding="utf-8")
    md = write_markdown(when, triage_rows, health)
    (RESULTS / f"eval_{when}.md").write_text(md, encoding="utf-8")
    print(md)


if __name__ == "__main__":
    main()
