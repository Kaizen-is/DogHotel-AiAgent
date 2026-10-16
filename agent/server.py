"""Web server for the Scope Control Agent.

Start it with run.bat (or: .venv\\Scripts\\python -m uvicorn server:app --port 8765)
and open http://localhost:8765.

It is a small single-user app: the loaded project data lives in memory, and the
decisions are written to audit/audit.jsonl.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from scope_agent import audit, config, rules
from scope_agent.ingest.docs_loader import load_docs, load_uploaded
from scope_agent.ingest.jira_csv import load_jira_csv, releases_in
from scope_agent.llm import AIClient, AIError
from scope_agent.models import DocSection, HealthReport, ReleaseContext, Ticket
from scope_agent.services.health import check_release, report_markdown
from scope_agent.services.qa import ask_question
from scope_agent.services.triage import check_request

WEB = Path(__file__).resolve().parent / "web"

app = FastAPI(title="Dog Hotel Scope Control Agent")
app.mount("/static", StaticFiles(directory=WEB), name="static")


@app.middleware("http")
async def always_fresh(request, call_next):
    # The page is small; never let the browser keep an old copy after an update.
    response = await call_next(request)
    if request.url.path == "/" or request.url.path.startswith("/static"):
        response.headers["Cache-Control"] = "no-store"
    return response


class Workspace:
    """What is loaded right now."""

    def __init__(self):
        self.tickets: list[Ticket] = []
        self.docs: list[DocSection] = []
        self.ctx = ReleaseContext(release="")
        self.source = ""
        self.file_name = ""
        self.last_report: Optional[HealthReport] = None

    def load(self, tickets, docs, ctx_values: dict, source: str, file_name: str):
        self.tickets, self.docs, self.source, self.file_name = tickets, docs, source, file_name
        releases = releases_in(tickets)
        release = ctx_values.get("release") if ctx_values.get("release") in releases else (releases[0] if releases else "")
        self.ctx = ReleaseContext(**{**ctx_values, "release": release})
        self.last_report = None


ws = Workspace()


def read_context_file(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def load_sample():
    sample = config.SAMPLE_DIR
    ws.load(load_jira_csv(sample / "jira_export_sample.csv"), load_docs(sample / "docs"),
            read_context_file(sample / "release_context.json"), "sample", "Sample data")


def load_real_if_present() -> bool:
    csvs = sorted(config.REAL_DIR.glob("*.csv")) if config.REAL_DIR.exists() else []
    if not csvs:
        return False
    ws.load(load_jira_csv(csvs[0]), load_docs(config.REAL_DIR / "docs"),
            read_context_file(config.REAL_DIR / "release_context.json"), "real", csvs[0].name)
    return True


if not load_real_if_present():
    load_sample()


def ai_client() -> AIClient:
    try:
        return AIClient()
    except AIError as e:
        raise HTTPException(503, str(e))


def require_data():
    if not ws.tickets:
        raise HTTPException(400, "Please load project data first.")
    if not ws.ctx.release:
        raise HTTPException(400, "Please choose a release first.")


def state() -> dict:
    in_release = rules.in_release(ws.tickets, ws.ctx.release)
    facts = rules.compute_metrics(in_release, ws.ctx, ws.tickets) if ws.tickets else None
    return {
        "source": ws.source,
        "file_name": ws.file_name,
        "tickets": len(ws.tickets),
        "docs": len(ws.docs),
        "releases": releases_in(ws.tickets),
        "context": ws.ctx.model_dump(mode="json"),
        "release_tickets": len(in_release),
        "facts": facts.model_dump(mode="json") if facts else None,
        "ai_ready": bool(config.api_key()),
    }


# ---------------------------------------------------------------- pages and data


@app.get("/")
def index():
    return FileResponse(WEB / "index.html")


@app.get("/api/state")
def get_state():
    return state()


@app.post("/api/data/sample")
def use_sample():
    load_sample()
    return state()


@app.post("/api/data/upload")
async def upload(jira: UploadFile = File(...), docs: list[UploadFile] = File(default=[])):
    if not jira.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Please choose a .csv file exported from Jira.")
    try:
        tickets = load_jira_csv(await jira.read())
    except ValueError as e:
        raise HTTPException(400, str(e))
    if not tickets:
        raise HTTPException(400, "No tasks were found in this file.")
    sections = []
    for d in docs:
        if d.filename and d.filename.lower().endswith((".md", ".txt")):
            sections.extend(load_uploaded(d.filename, await d.read()))
    ws.load(tickets, sections, {}, "upload", jira.filename)
    return state()


class ContextIn(BaseModel):
    release: str
    goal: str = ""
    milestone_date: Optional[date] = None
    baseline_date: Optional[date] = None
    capacity_points: Optional[float] = None


@app.post("/api/context")
def save_context(body: ContextIn):
    ws.ctx = ws.ctx.model_copy(update=body.model_dump())
    ws.last_report = None
    return state()


# ---------------------------------------------------------------- the three tools


class RequestIn(BaseModel):
    request: str
    requester: str = "PM / BA"


@app.post("/api/triage")
def triage(body: RequestIn):
    require_data()
    if not body.request.strip():
        raise HTTPException(400, "Please write the request first.")
    try:
        result = check_request(body.request, body.requester, ws.ctx, ws.tickets, ai_client())
    except AIError as e:
        raise HTTPException(503, str(e))
    titles = {t.key: t.summary for t in ws.tickets}
    return {
        "advice": result.advice.model_dump(mode="json"),
        "story_text": result.advice.draft_story.as_text(),
        "facts": result.facts.model_dump(mode="json"),
        "titles": {k: titles[k] for k in result.advice.related_tickets if k in titles},
        "unknown_keys": result.unknown_keys,
        "seconds": round(result.seconds, 1),
    }


class HealthIn(BaseModel):
    with_ai: bool = True


@app.post("/api/health")
def health(body: HealthIn):
    require_data()
    try:
        report, seconds = check_release(ws.ctx, ws.tickets, ai_client() if body.with_ai else None)
    except AIError as e:
        raise HTTPException(503, str(e))
    ws.last_report = report
    titles = {t.key: t.summary for t in ws.tickets}
    return {"report": report.model_dump(mode="json"), "titles": titles, "seconds": round(seconds, 1)}


@app.get("/api/health/report")
def download_report():
    if ws.last_report is None:
        raise HTTPException(404, "Run the release check first.")
    name = f"scope_report_{ws.last_report.release}".replace(" ", "_").replace("&", "and")
    return PlainTextResponse(report_markdown(ws.last_report), media_type="text/markdown",
                             headers={"Content-Disposition": f'attachment; filename="{name}.md"'})


class QuestionIn(BaseModel):
    question: str


@app.post("/api/ask")
def ask(body: QuestionIn):
    require_data()
    if not body.question.strip():
        raise HTTPException(400, "Please write a question first.")
    try:
        result = ask_question(body.question, ws.ctx, ws.tickets, ws.docs, ai_client())
    except AIError as e:
        raise HTTPException(503, str(e))
    audit.save("question", "asked", {"question": body.question, "answer": result.answer.answer})
    return {"answer": result.answer.model_dump(mode="json"), "seconds": round(result.seconds, 1)}


# ---------------------------------------------------------------- decisions and history


class DecisionIn(BaseModel):
    tool: str
    decision: str
    details: dict = {}
    note: str = ""


@app.post("/api/decision")
def decision(body: DecisionIn):
    audit.save(body.tool, body.decision, {**body.details, "release": ws.ctx.release}, body.note)
    return {"saved": True}


@app.get("/api/history")
def history():
    return list(reversed(audit.load()))
