# Dog Hotel Scope Control Agent

A helper for the project manager (PM) and business analyst of the Dog Hotel project (EPM-PEDH). It keeps the scope of each release under control:

1. **Check a request**: does a new idea fit the release, or is it scope creep? What is the impact, and what should be removed to make room? You also get a ready Jira task with acceptance criteria.
2. **Release health**: simple rules check the facts (acceptance criteria, estimates, duplicates, tasks added after the plan, work vs capacity, blocked tasks), then the LLM reviews what rules cannot see (unclear tasks, tasks that don't serve the goal, priorities, risks, next steps).
3. **Ask a question**: answers come only from the project documents and tasks, with sources. If the sources don't say, the answer is "not found".

The agent **gives advice; the PM decides**. Every decision is saved in **History** (`audit/audit.jsonl`).

Problem, solution and architecture: [`../docs/Scope_Control_Agent_Problem_Solution_Architecture.md`](../docs/Scope_Control_Agent_Problem_Solution_Architecture.md)

## First-time setup (Windows)

```powershell
cd agent
py -3.13 -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` and put the LLM API key after `OPENAIKEY=`. The `.env` file stays on your computer and is never uploaded.

## Start

Double-click **`run.bat`**. It starts the app and opens **http://localhost:8765** in the browser.
(Or by hand: `.venv\Scripts\python -m uvicorn server:app --port 8765`.)

## Data

On the **Overview** page:

- **Use sample data**: an invented Jira backlog of a small volunteer dev team, written as developer work items (35 issues `DHS-…`: epics, stories, tasks, bugs, sub-tasks) with typical scope problems. Loaded by default.
- **Upload a Jira export**: in Jira, *Filters → your filter → Export → CSV (all fields)*. You can also add project documents (`.md` / `.txt`).
  To try it, use `data/upload_test/jira_export_upload_test.csv` (see `data/upload_test/README.md` for the settings to type in).
- **Real data**: put the Jira CSV, `release_context.json` and `docs/*.md` into `data/real/`. They load automatically when the app starts.

Then fill in **Release settings** (goal, deadline, plan date, team capacity) and click **Save settings**.

## Tests (free, no LLM calls)

```powershell
.venv\Scripts\python -m pytest -q tests
```

## Evaluation (uses the LLM, costs a little)

```powershell
.venv\Scripts\python eval/run_eval.py
```

Results go to `eval/results/` (numbers for the internship report).

## How the code is organised

| Path | What it does |
|---|---|
| `server.py` | Web server: loads the data and connects the page to the three tools |
| `web/` | The web page (`index.html`, `styles.css`, `app.js`) |
| `scope_agent/rules.py` | Rules that check the facts (no LLM) |
| `scope_agent/services/` | The three tools: `triage.py`, `health.py`, `qa.py` |
| `scope_agent/prompts/` | The written instructions for the LLM |
| `scope_agent/llm.py` | The only place that talks to the LLM; hides e-mails and phone numbers first |
| `scope_agent/ingest/` | Reads the Jira CSV and the documents |
| `scope_agent/models.py` | The shapes of tasks, settings and answers |
| `scope_agent/audit.py` | Saves the history of decisions |

Every LLM answer comes back in a fixed structure and is checked: for example, every task number in an answer must exist in the data. Responses are not stored by the provider.
