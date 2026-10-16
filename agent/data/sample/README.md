# SAMPLE data: invented, not real Dog Hotel Jira data

Used to develop, test and demo the agent while access to the real Jira and KB is being arranged.

| File | What it is |
|---|---|
| `jira_export_sample.csv` | 35 invented Jira issues in the format of a real Jira CSV export. Keys use `DHS-` so they can't be confused with real `EPMPEDH` tickets. Made by `_generate_sample.py` |
| `release_context.json` | Release settings: goal, deadline, plan date, team capacity |
| `docs/01_product_overview_public_site.md` | **Real** facts from the public website doghotel.com.ua (read on 2026-10-16) |
| `docs/02_release_plan_SAMPLE.md` | Invented release plan page |

## What the backlog looks like

It is written the way a small volunteer dev team (front-end, back-end, DevOps, QA, with a BA and a PM) writes its own work in Jira. There are no customer wishes and no "As a …, I want …". Every issue says what to build:

- Titles with a component tag and technical words, for example "[BE] POST /api/bookings: DTO validation and booking_request table" or "[BE] Send 'booking-new' e-mail to the hotel mailbox on BookingCreated"
- Descriptions with routes, endpoints, components, tables and events, plus acceptance criteria or a definition of done
- **3 epics**: Online booking (DHS-90), Adoption applications (DHS-91), Maintenance and tech debt (DHS-92)
- **19 stories** (feature work), **2 technical tasks** (SMTP relay on prod, Angular upgrade)
- **3 bugs** with steps to reproduce, expected and actual result, environment, likely cause
- **8 sub-tasks** (FE / BE / QA) under their stories
- Jira fields: assignee, reporter, sprint, fix version, components, labels, story points, epic link, parent, "blocks" links

The agent counts stories, tasks and bugs as work items. Epics and sub-tasks are only context.

## Scope problems planted on purpose

- Stories without acceptance criteria: DHS-103, 105, 106, 108, 110, 111, 112, 117, 121, 124
- Duplicate: DHS-103 "[FE] Booking form" (added by a new volunteer) repeats DHS-101
- Added after the plan was agreed (1 Oct): DHS-103, 111, 112, 117, 121, 124
- Don't serve the release goal: DHS-110 (admin redesign), DHS-111 (Instagram feed), DHS-112 (dark theme)
- Too big for one sprint: DHS-110 (13 points)
- Blocked from outside the release: DHS-105 and DHS-117 wait for DHS-118 (SMTP), which is planned for R2027.1
- Too much work: 67 open points against a capacity of 40

Real data goes into `data/real/` (Jira CSV export + KB pages as .md) and stays on this computer.
