"""Tests for reading Jira exports and for the rules (no LLM calls)."""

import json
import sys
from pathlib import Path

AGENT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(AGENT))

from scope_agent import rules  # noqa: E402
from scope_agent.ingest.docs_loader import load_docs  # noqa: E402
from scope_agent.ingest.jira_csv import load_jira_csv, releases_in  # noqa: E402
from scope_agent.llm import hide_personal_data  # noqa: E402
from scope_agent.models import ReleaseContext  # noqa: E402

SAMPLE = AGENT / "data" / "sample"
UPLOAD_TEST = AGENT / "data" / "upload_test" / "jira_export_upload_test.csv"


def load():
    tickets = load_jira_csv(SAMPLE / "jira_export_sample.csv")
    ctx = ReleaseContext(**json.loads((SAMPLE / "release_context.json").read_text(encoding="utf-8")))
    return tickets, ctx


def findings_by_type(findings):
    grouped = {}
    for f in findings:
        grouped.setdefault(f.type, set()).add(f.ticket_key)
    return grouped


def test_reads_a_jira_export():
    tickets, _ = load()
    assert len(tickets) == 35
    t = {x.key: x for x in tickets}
    assert t["DHS-101"].components == ["Frontend"]
    assert t["DHS-101"].parent == "DHS-90"  # epic link
    assert t["DHS-101"].labels == ["booking"]
    assert t["DHS-102"].blocks == ["DHS-101", "DHS-104"]
    assert t["DHS-104"].blocked_by == ["DHS-102"]
    assert t["DHS-110"].story_points == 13
    assert t["DHS-113"].story_points is None
    assert str(t["DHS-111"].created) == "2026-10-08"  # Jira date format 08/Oct/26 11:10 AM
    assert t["DHS-90"].is_epic and t["DHS-131"].is_subtask and t["DHS-131"].parent == "DHS-101"
    assert "R2027.1" in releases_in(tickets)


def test_rules_find_the_planted_problems():
    tickets, ctx = load()
    rel = rules.in_release(tickets, ctx.release)
    metrics, findings = rules.run_rules(rel, ctx, tickets)
    found = findings_by_type(findings)

    assert found["missing_acceptance_criteria"] == {
        "DHS-103", "DHS-105", "DHS-106", "DHS-108", "DHS-110", "DHS-111", "DHS-112", "DHS-117", "DHS-121", "DHS-124"}
    assert found["possible_duplicate"] == {"DHS-103"}
    assert found["too_big"] == {"DHS-110"}
    assert set(metrics.added_after_baseline) == {"DHS-103", "DHS-111", "DHS-112", "DHS-117", "DHS-121", "DHS-124"}
    assert metrics.total_tickets == 21  # epics and sub-tasks are not counted as work items
    assert metrics.open_points == 67 and metrics.load_ratio > 1
    assert any("DHS-118" in b and "outside this release" in b for b in metrics.open_blockers)
    assert metrics.bugs_open == 2 and metrics.bugs_closed == 1
    assert 0 <= rules.health_score(metrics, findings) < 70


def test_epics_and_subtasks_are_not_flagged():
    tickets, ctx = load()
    rel = rules.in_release(tickets, ctx.release)
    _, findings = rules.run_rules(rel, ctx, tickets)
    flagged = {f.ticket_key for f in findings}
    epics_and_subtasks = {t.key for t in tickets if t.is_epic or t.is_subtask}
    assert len(epics_and_subtasks) == 11
    assert not flagged & epics_and_subtasks


def test_titles_with_the_same_pattern_are_not_duplicates():
    # "[BE] Send 'booking-new' e-mail..." and "[BE] Send 'adoption-new' e-mail..." are two different tasks
    tickets = load_jira_csv(UPLOAD_TEST)
    ctx = ReleaseContext(release="R2026.5 Admin & Notifications")
    _, findings = rules.run_rules(rules.in_release(tickets, ctx.release), ctx, tickets)
    assert "DHU-218" not in {f.ticket_key for f in findings if f.type == "possible_duplicate"}


def test_upload_test_file():
    tickets = load_jira_csv(UPLOAD_TEST)
    ctx = ReleaseContext(release="R2026.5 Admin & Notifications", capacity_points=30,
                         baseline_date="2026-09-20")
    metrics, findings = rules.run_rules(rules.in_release(tickets, ctx.release), ctx, tickets)
    found = findings_by_type(findings)
    assert len(tickets) == 24
    assert found["possible_duplicate"] == {"DHU-202"}
    assert found["too_big"] == {"DHU-205"}
    assert metrics.load_ratio > 1
    assert sum("DHU-209" in b for b in metrics.open_blockers) == 3


def test_similar_tickets_finds_overlap():
    tickets, _ = load()
    top = rules.similar_tickets("Customers want to upload the dog's vaccination passport when booking a stay", tickets)
    assert top and top[0][0].key == "DHS-121"


def test_docs_loader_splits_sections():
    docs = load_docs(SAMPLE / "docs")
    headings = {d.heading for d in docs}
    assert "Explicitly out of scope for this release" in headings
    assert "Additional services" in headings


def test_personal_data_is_hidden_but_keys_and_dates_stay():
    text = "Call +380 67 000-00-00 or mail a.b@example.com about DHS-101 created 2026-10-08, 5 points"
    out = hide_personal_data(text)
    assert "[phone]" in out and "[email]" in out
    assert "DHS-101" in out and "2026-10-08" in out and "5 points" in out
