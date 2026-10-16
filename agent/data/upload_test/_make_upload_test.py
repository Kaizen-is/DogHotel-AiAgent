"""Builds jira_export_upload_test.csv, a test file for the "Upload a Jira export" button.

It looks like a Jira export from a small volunteer dev team. Every issue is written by developers for
developers: a component tag in the title, what to implement, acceptance criteria or a definition of done,
bugs with steps to reproduce. Jira date format (12/Sep/26 10:15 AM) and repeated columns, like a real export.
The issues are invented (keys DHU-...), they are not real Dog Hotel tickets.

Run:  python data/upload_test/_make_upload_test.py
"""

import csv
from datetime import datetime
from pathlib import Path

REL = "R2026.5 Admin & Notifications"
NEXT = "R2027.1"

BA, PM = "Kateryna Melnyk", "Iryna Bondar"
FE, FE_NEW, BE, OPS, QA = "Andrii Koval", "Sofiia Lysenko", "Dmytro Shevchuk", "Maksym Tkachenko", "Oleh Savchuk"
S17, S18 = "DH Sprint 17", "DH Sprint 18"


def t(key, kind, summary, *, status="To Do", prio="Medium", who="", by=BA, created, sprint=(), rel=REL,
      comp=(), labels=(), points=None, epic="", parent="", desc="", blocks=(), blocked_by=()):
    return dict(key=key, kind=kind, summary=summary, status=status, prio=prio, who=who, by=by, created=created,
                sprint=list(sprint), rel=rel, comp=list(comp), labels=list(labels), points=points, epic=epic,
                parent=parent, desc=desc.strip(), blocks=list(blocks), blocked_by=list(blocked_by))


issues = [
    t("DHU-190", "Epic", "Admin tools", status="In Progress", prio="High", by=PM, created="2026-09-05 09:00",
      comp=["Admin"], labels=["admin"], desc="Scope: bookings calendar, price editor, search in admin."),
    t("DHU-191", "Epic", "E-mail notifications", prio="High", by=PM, created="2026-09-05 09:10",
      comp=["Backend"], labels=["notifications"], desc="Scope: transactional e-mails for bookings and adoption via MailService."),

    t("DHU-201", "Story", "[Admin] /admin/calendar: month view of confirmed bookings", status="In Progress", prio="High",
      who=FE, created="2026-09-08 10:15", sprint=[S17, S18], comp=["Admin"], labels=["calendar"], points=5,
      epic="DHU-190", desc="""
Month grid with confirmed stays as bars; data from GET /api/admin/calendar?month=YYYY-MM (DHU-231).

h3. Acceptance criteria
* Given confirmed bookings exist, when /admin/calendar opens, then each stay is shown on its dates
* Given a day has no free places, then the day cell is red
* Given a stay bar is clicked, then the booking details panel opens"""),
    t("DHU-202", "Story", "[Admin] Bookings calendar", who=FE_NEW, by=FE_NEW, created="2026-10-02 16:40", comp=["Admin"],
      labels=["calendar"], points=3, epic="DHU-190", desc="Calendar with bookings in admin."),
    t("DHU-203", "Story", "[BE] Send 'booking-new' e-mail to the hotel mailbox", prio="High", who=BE,
      created="2026-09-08 11:00", sprint=[S18], comp=["Backend"], labels=["notifications"], points=2, epic="DHU-191",
      blocked_by=["DHU-209"], desc="""
Handle BookingCreated, send template "booking-new" with MailService.

h3. Acceptance criteria
* Given a booking is created, then the e-mail is sent within 5 minutes
* The e-mail contains dates, dog name, size and a link to /admin/bookings/{id}"""),
    t("DHU-204", "Story", "[BE][Admin] Price editor: PUT /api/admin/prices and /admin/prices page", prio="High", who=BE,
      created="2026-09-09 09:30", sprint=[S18], comp=["Admin", "Backend"], labels=["prices"], points=5, epic="DHU-190", desc="""
Admin page to edit the price list; PUT /api/admin/prices saves it and clears the /prices cache.

h3. Acceptance criteria
* Given a price is changed and saved, then GET /api/prices returns the new value
* Given a non-numeric price, then the API returns 400 and the field shows an error
* Every change is written to price_audit (user, time, old value, new value)"""),
    t("DHU-205", "Story", "[Admin] Dashboard with charts", prio="Low", who=FE, by=FE, created="2026-09-10 14:00",
      comp=["Admin", "Design"], labels=["dashboard"], points=13, epic="DHU-190",
      desc="Charts for bookings per month, popular services, adoptions and site visits. Chart library not chosen yet."),
    t("DHU-206", "Story", "[BE] Reminder e-mail job one day before arrival", who=BE, created="2026-10-06 12:20",
      comp=["Backend"], labels=["notifications"], points=3, epic="DHU-191", blocked_by=["DHU-209"],
      desc="Hangfire job at 10:00 daily, template 'booking-reminder' with what to bring. Needs SMTP (DHU-209)."),
    t("DHU-207", "Story", "[FE] Christmas theme for /home", prio="Low", who=FE_NEW, by=FE_NEW, created="2026-10-09 18:05",
      comp=["Frontend"], labels=["ui"], points=3, desc="Snow animation and seasonal header image, switched on by a date flag."),
    t("DHU-208", "Story", "[FE][BE] Chat bot widget on the public site", prio="Low", who=FE_NEW, created="2026-10-12 10:00",
      comp=["Frontend", "Backend"], labels=["ai"], points=8,
      desc="Floating widget that answers questions about prices and rules. Provider and hosting not chosen."),
    t("DHU-214", "Story", "[Admin] Search bookings by phone or dog name", who=FE, created="2026-09-16 11:40",
      comp=["Admin"], labels=["search"], points=3, epic="DHU-190",
      desc="Search field above /admin/bookings; GET /api/admin/bookings?q= with LIKE on phone and dog name."),
    t("DHU-216", "Story", "[BE][Admin] Notification settings for the hotel account", prio="Low", who=BE,
      created="2026-10-14 09:00", comp=["Backend", "Admin"], labels=["notifications"], points=3, epic="DHU-191",
      desc="Settings table + /admin/settings/notifications: on/off for booking-new, booking-cancelled, adoption-new."),
    t("DHU-218", "Story", "[BE] Send 'adoption-new' e-mail to the hotel mailbox", who=BE, created="2026-09-18 10:10",
      comp=["Backend"], labels=["notifications", "adoption"], points=2, epic="DHU-191", blocked_by=["DHU-209"], desc="""
Handle AdoptionApplicationCreated, send template "adoption-new".

h3. Acceptance criteria
* Given an application is created, then the e-mail with the dog's name and the applicant's contacts is sent"""),
    t("DHU-210", "Story", "[Admin] 'Paid' flag on a booking", status="Done", who=FE, created="2026-09-05 15:15",
      sprint=[S17], comp=["Admin"], labels=["payments"], points=2, epic="DHU-190", desc="""
h3. Acceptance criteria
* Given a booking, when the Paid checkbox is ticked, then is_paid is saved and the list shows a "Paid" label"""),
    t("DHU-217", "Story", "[Admin] Export monthly bookings to .xlsx", prio="Low", who=FE, created="2026-09-17 14:30", rel=NEXT,
      comp=["Admin"], labels=["export"], points=3, desc="ClosedXML export of one month of bookings."),

    t("DHU-209", "Task", "[DevOps] SMTP relay on prod: provider, SPF/DKIM, secrets", prio="High", who=OPS, by=OPS,
      created="2026-09-08 11:30", rel=NEXT, comp=["DevOps"], labels=["infra"], points=2, blocks=["DHU-203", "DHU-206"],
      desc="No mail service on prod. Planned for R2027.1 because of DevOps capacity."),
    t("DHU-215", "Task", "[Admin] Migrate admin forms and tables to the new UI kit", who=FE, by=FE, created="2026-09-11 16:00",
      comp=["Admin"], labels=["tech-debt"], points=5,
      desc="Old admin components are not supported. Replace forms and tables, then a visual regression check."),

    t("DHU-211", "Bug", "[BE] Admin session expires after about 5 minutes", status="In Progress", prio="High", who=BE, by=QA,
      created="2026-09-22 09:10", sprint=[S18], comp=["Backend"], labels=["auth"], desc="""
Steps: 1. Log in to admin. 2. Wait 5 minutes. 3. Open /admin/bookings.
Expected: still logged in. Actual: redirect to /login.
Probably the refresh-token cookie is dropped (SameSite=Strict on a cross-site redirect)."""),
    t("DHU-212", "Bug", "[BE] /prices shows old prices after saving", who=BE, by=QA, created="2026-09-30 17:45",
      comp=["Backend"], labels=["prices", "cache"], blocked_by=["DHU-204"], desc="""
Steps: change a price in admin, open /prices.
Expected: the new price. Actual: the old price until the output cache expires (about 1 hour)."""),
    t("DHU-213", "Bug", "[FE] Adoption profile shows another dog's photo", status="Done", prio="Low", who=FE, by=QA,
      created="2026-09-15 13:00", sprint=[S17], comp=["Frontend"], labels=["adoption"],
      desc="Profile of Mika shows the photo of Julia. Cause: image cache key by name, not by id."),

    t("DHU-230", "Sub-task", "FE: month grid component", status="Done", who=FE, by=FE, created="2026-09-09 10:00",
      sprint=[S17], comp=["Admin"], parent="DHU-201", desc="Month grid with stays as bars."),
    t("DHU-231", "Sub-task", "BE: GET /api/admin/calendar?month=", status="In Progress", who=BE, by=BE,
      created="2026-09-09 10:30", sprint=[S18], comp=["Backend"], parent="DHU-201", desc="Stays per day for one month."),
    t("DHU-232", "Sub-task", "BE: price_audit table and writes", who=BE, by=BE, created="2026-09-10 09:00",
      sprint=[S18], comp=["Backend"], parent="DHU-204", desc="EF migration + insert on every save."),
    t("DHU-233", "Sub-task", "QA: regression for admin after the session fix", who=QA, by=QA, created="2026-09-23 09:30",
      comp=["QA"], parent="DHU-211", desc="Login, token refresh, long idle session."),
]

HEADER = ["Summary", "Issue key", "Issue id", "Issue Type", "Status", "Priority", "Assignee", "Reporter", "Created",
          "Updated", "Sprint", "Sprint", "Fix Version/s", "Component/s", "Component/s", "Labels", "Labels",
          "Custom field (Story Points)", "Custom field (Epic Link)", "Parent", "Description",
          "Outward issue link (Blocks)", "Outward issue link (Blocks)", "Inward issue link (Blocks)"]


def jira_date(text: str) -> str:
    return datetime.strptime(text, "%Y-%m-%d %H:%M").strftime("%d/%b/%y %I:%M %p")


def pad(values: list, n: int) -> list:
    return (values + [""] * n)[:n]


out = Path(__file__).with_name("jira_export_upload_test.csv")
with out.open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(HEADER)
    for n, x in enumerate(issues):
        writer.writerow([
            x["summary"], x["key"], 61000 + n, x["kind"], x["status"], x["prio"], x["who"], x["by"],
            jira_date(x["created"]), "16/Oct/26 09:00 AM", *pad(x["sprint"], 2), x["rel"], *pad(x["comp"], 2),
            *pad(x["labels"], 2), "" if x["points"] is None else x["points"], x["epic"], x["parent"], x["desc"],
            *pad(x["blocks"], 2), ", ".join(x["blocked_by"]),
        ])

print(f"Saved {len(issues)} issues to {out}")
