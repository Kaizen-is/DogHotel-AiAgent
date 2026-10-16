# Test file for "Upload a Jira export"

`jira_export_upload_test.csv` looks like a Jira export from a small volunteer dev team: 24 issues (2 epics, 13 stories, 2 technical tasks, 3 bugs, 4 sub-tasks) written by developers for developers (component tags, endpoints, tables, acceptance criteria or definition of done, bugs with steps), with assignees, sprints, components, epic links, Jira date format (12/Sep/26 10:15 AM) and repeated columns. The issues are invented (keys `DHU-…`), not real Dog Hotel tickets. Made by `_make_upload_test.py`.

## How to test the upload

1. Open the app → **Overview** → **Upload a Jira export** → choose this file.
2. The release **R2026.5 Admin & Notifications** is selected.
3. Fill in the release settings (copy from below) and click **Save settings**:

| Field | Value |
|---|---|
| Release goal | Help the owners run the hotel from the admin panel: see bookings in a calendar, get e-mail notifications about new requests, and change prices without a developer. |
| Deadline | 2026-12-18 |
| Plan agreed on | 2026-09-20 |
| Team capacity | 30 story points |

## What the agent should find

- Stories without acceptance criteria: DHU-202, 205, 206, 207, 208, 214, 216
- Duplicate: DHU-202 "[Admin] Bookings calendar" repeats DHU-201 "[Admin] /admin/calendar: month view of confirmed bookings"
- Not a duplicate: DHU-218 "[BE] Send 'adoption-new' e-mail…" only follows the same title pattern as DHU-203 "[BE] Send 'booking-new' e-mail…"
- Too big: DHU-205 (13 points)
- Added after the plan was agreed (20 Sep): DHU-202, 206, 207, 208, 211, 212, 216
- Don't serve the goal: DHU-207 (Christmas theme), DHU-208 (chat bot for visitors), probably DHU-205 (dashboard)
- Blocked: DHU-203, 206 and 218 wait for DHU-209 (SMTP), which is in the next release; DHU-212 waits for DHU-204
- Too much work: 55 open points against a capacity of 30
