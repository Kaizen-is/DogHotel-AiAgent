Task: review the scope health of release "{release}".

Rules-engine metrics (computed from the data, correct):
{metrics}

Rules-engine findings, already shown to the PM. Do not repeat them; add only what rules cannot see:
{rule_findings}

Tickets of the release:
{tickets}

Assess and fill in the structured answer:
- findings: requirement problems that need judgement, such as ambiguous wording, unclear user value, hidden dependencies, stories that should be split, and items that do not serve the release goal (off_goal). Report only real problems, at most one finding per ticket and type.
- goal_coverage: does the scope cover the release goal? Name the gaps and the items that do not belong.
- moscow: classify every OPEN story, task and bug as must/should/could/wont against the goal. Epics and sub-tasks are context only, so don't classify them. If the load is above capacity, the could/wont items should free at least the overload.
- dependency_risks: risks to the milestone that come from blockers and dependencies.
- top_actions: 3–6 concrete next steps for the PM, most important first.
Use only ticket keys from the list above.
