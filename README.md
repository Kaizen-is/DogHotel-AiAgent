# Dog Hotel Scope Control Agent

An AI assistant for the project manager of the Dog Hotel project (an EPAM volunteer project). It helps keep the scope of each release under control:

- **Check a request**: does a new idea fit the release, or is it scope creep? It shows the impact, what to remove to make room, and gives a ready Jira task with acceptance criteria.
- **Release health**: rules check the Jira data (missing acceptance criteria, duplicates, too-big tasks, work added after the plan, work vs capacity, blocked tasks). Then an LLM reviews what rules cannot see and suggests priorities and next steps.
- **Ask a question**: answers about the scope from project documents and tasks, with sources.

The agent gives advice; the project manager decides. Every decision is saved.

## Repository

| Folder | What is inside |
|---|---|
| [`agent/`](agent/) | The application: web page, server, rules, LLM gateway, prompts, sample data, tests, evaluation. See [`agent/README.md`](agent/README.md) to install and run it. |
| [`docs/`](docs/) | [Problem, solution and architecture](docs/Scope_Control_Agent_Problem_Solution_Architecture.md), the [full project explanation](docs/Dog_Hotel_Scope_Control_Agent_Project_Explanation.docx) (Word), and the diagrams. |

## Quick start (Windows)

```powershell
cd agent
py -3.13 -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
copy .env.example .env      # then put the LLM API key into .env
run.bat                     # opens http://localhost:8765
```

The sample data in `agent/data/` is invented for testing. It is not real Dog Hotel Jira data.
