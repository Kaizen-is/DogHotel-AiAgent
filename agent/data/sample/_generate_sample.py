"""Builds jira_export_sample.csv: SAMPLE data that looks like the Jira of a real volunteer dev team.

Not real Dog Hotel data. Keys use the prefix DHS- ("Dog Hotel Sample") so they can't be mixed up with
real EPMPEDH tickets. The product facts come from the public site doghotel.com.ua (services and prices,
"Want a friend" adoption list, blog, newsletter).

Every issue is written the way developers write their own work in Jira: a component tag in the title
([FE], [BE], [Admin], [DevOps]), what to implement (routes, endpoints, components, tables, events),
and acceptance criteria or a definition of done. No customer wishes, no "As a ..., I want ...".

Some typical scope problems are planted on purpose (see README.md), so the agent has something to find.

Run:  python data/sample/_generate_sample.py
"""

import csv
from datetime import datetime
from pathlib import Path

REL = "R2026.4 Booking & Adoption"
NEXT = "R2027.1"

# A made-up volunteer team
BA, PM = "Kateryna Melnyk", "Iryna Bondar"
FE, FE_NEW, BE, OPS, QA = "Andrii Koval", "Sofiia Lysenko", "Dmytro Shevchuk", "Maksym Tkachenko", "Oleh Savchuk"
S14, S15, S16 = "DH Sprint 14", "DH Sprint 15", "DH Sprint 16"


def t(key, kind, summary, *, status="To Do", prio="Medium", who="", by=BA, created, sprint=(), rel=REL,
      comp=(), labels=(), points=None, epic="", parent="", desc="", blocks=(), blocked_by=()):
    return dict(key=key, kind=kind, summary=summary, status=status, prio=prio, who=who, by=by, created=created,
                sprint=list(sprint), rel=rel, comp=list(comp), labels=list(labels), points=points, epic=epic,
                parent=parent, desc=desc.strip(), blocks=list(blocks), blocked_by=list(blocked_by))


tickets = [
    # ---------------------------------------------------------------- epics
    t("DHS-90", "Epic", "Online booking", status="In Progress", prio="High", by=PM, created="2026-09-01 09:30",
      comp=["Frontend", "Backend", "Admin"], labels=["booking"], desc="""
Scope: booking form on /prices (FE), bookings API and DB (BE), bookings page in admin, notification e-mails.
Today bookings are taken by phone only."""),
    t("DHS-91", "Epic", "Adoption applications", status="In Progress", prio="High", by=PM, created="2026-09-01 09:40",
      comp=["Frontend", "Admin"], labels=["adoption"],
      desc="Scope: application form on the dog profile (FE), applications API (BE), applications tab in admin."),
    t("DHS-92", "Epic", "Maintenance and tech debt", by=PM, created="2026-09-01 09:50", comp=["Frontend", "Backend", "DevOps"],
      labels=["tech-debt"], desc="Production bugs, framework upgrade and infrastructure tasks for R2026.4."),

    # ---------------------------------------------------------------- booking
    t("DHS-101", "Story", "[FE] Booking form: UI, validation, submit to /api/bookings", status="In Progress", prio="High",
      who=FE, created="2026-09-10 10:15", sprint=[S15, S16], comp=["Frontend"], labels=["booking"], points=5, epic="DHS-90",
      blocked_by=["DHS-102"], desc="""
Implement BookingRequestFormComponent, opened from the "Book a stay" button on /prices.
Design: Figma > Booking > Request form v2.
Fields: dateFrom, dateTo, dogName, breed, size (S/M/L), ownerName, phone, email, comment.

h3. Acceptance criteria
* Given /prices is open, when "Book a stay" is clicked, then the form opens in a modal
* Given a required field is empty, when Submit is clicked, then the field shows a validation message and no request is sent
* Given the form is valid, when Submit is clicked, then POST /api/bookings is called and the success screen is shown
* Works on 375 px width

Tech notes: reuse FormField and DateRange from shared/ui; validators from shared/validation."""),
    t("DHS-102", "Story", "[BE] POST /api/bookings: DTO validation and booking_request table", status="In Progress",
      prio="High", who=BE, created="2026-09-10 10:40", sprint=[S15, S16], comp=["Backend"], labels=["booking", "api"],
      points=3, epic="DHS-90", blocks=["DHS-101", "DHS-104"], desc="""
New endpoint POST /api/bookings + table booking_request (EF migration). Publish BookingCreated event after save.

h3. Acceptance criteria
* Valid payload: 201, record saved with status NEW, BookingCreated published
* dateTo before dateFrom: 400 with errors.dateTo
* Invalid phone format: 400 with errors.phone
* Unit tests for BookingValidator, coverage >= 80%"""),
    t("DHS-103", "Story", "[FE] Booking form", who=FE_NEW, by=FE_NEW, created="2026-10-05 18:20", comp=["Frontend"],
      labels=["booking"], epic="DHS-90", desc="Booking form on prices page."),
    t("DHS-104", "Story", "[Admin] /admin/bookings: list, Confirm / Decline, pagination", prio="High", who=FE,
      created="2026-09-12 11:00", sprint=[S16], comp=["Admin"], labels=["booking"], points=5, epic="DHS-90",
      blocked_by=["DHS-102"], desc="""
New admin route /admin/bookings. Table columns: arrival date, nights, dog, size, client phone, status.
Actions call PATCH /api/admin/bookings/{id}/status.

h3. Acceptance criteria
* Given NEW requests exist, when /admin/bookings opens, then rows are sorted by arrival date
* Given a row, when Confirm or Decline is clicked, then the status is updated and changed_at is saved
* Given more than 20 rows, then the table is paginated (20 per page)"""),
    t("DHS-105", "Story", "[BE] Send 'booking-new' e-mail to the hotel mailbox on BookingCreated", who=BE,
      created="2026-09-12 11:30", comp=["Backend"], labels=["booking", "notifications"], points=2, epic="DHS-90",
      blocked_by=["DHS-118"], desc="""
Handle BookingCreated and call MailService.SendTemplate("booking-new").
Template data: dates, dog name and size, client contacts, link to /admin/bookings/{id}.
Blocked: no SMTP on prod yet (DHS-118)."""),
    t("DHS-106", "Story", "[BE] Enclosure capacity model and GET /api/availability", who=BE, created="2026-09-15 12:00",
      comp=["Backend", "Admin"], labels=["booking"], points=8, epic="DHS-90", desc="""
Store capacity per enclosure type (summer, winter, single large dog). GET /api/availability?from=&to= returns
free places per date. Data model still open, see call notes from 14 Sep."""),
    t("DHS-117", "Story", "[BE] Send 'booking-confirmed' e-mail when status changes to CONFIRMED", who=BE,
      created="2026-10-06 15:05", comp=["Backend"], labels=["booking", "notifications"], points=2, epic="DHS-90",
      blocked_by=["DHS-118"], desc="""
Handle BookingStatusChanged(CONFIRMED) and send template "booking-confirmed" to the client
(dates, address, what to bring: vaccination passport, food). Blocked by DHS-118 (SMTP)."""),
    t("DHS-121", "Story", "[FE][BE] Booking form: vaccination passport upload (jpg/png, 5 MB)", who=FE_NEW,
      created="2026-10-07 10:45", comp=["Frontend", "Backend"], labels=["booking"], points=5, epic="DHS-90",
      blocked_by=["DHS-101"], desc="""
File input in the booking form, upload via POST /api/files to blob storage, save file_id on booking_request,
show the link in admin request details. Added to the release on 7 Oct."""),
    t("DHS-124", "Story", "[Admin] Export bookings to .xlsx", prio="Low", who=FE_NEW, created="2026-10-10 09:15",
      comp=["Admin"], labels=["booking"], points=3, epic="DHS-90", blocked_by=["DHS-104"],
      desc="Button on /admin/bookings that downloads the current filter as .xlsx (ClosedXML). Columns not agreed yet."),

    # ---------------------------------------------------------------- adoption
    t("DHS-107", "Story", "[FE] Adopt button and AdoptionApplicationForm on /want-a-friend/dog/{id}", prio="High", who=FE,
      created="2026-09-15 13:00", sprint=[S16], comp=["Frontend"], labels=["adoption"], points=3, epic="DHS-91",
      blocks=["DHS-108"], desc="""
Add the "Adopt" button to the dog profile and a modal form: name, phone, experience with dogs, housing.
Submit to POST /api/adoption-applications (dogId in the body).

h3. Acceptance criteria
* Given a dog profile, when "Adopt" is clicked, then the form opens
* Given a valid form, when Submit is clicked, then the application is saved with the dogId
* Given the dog has status ADOPTED, then the button is not rendered"""),
    t("DHS-108", "Story", "[Admin] Applications tab on the dog page", who=FE, created="2026-09-15 13:20", comp=["Admin"],
      labels=["adoption"], points=3, epic="DHS-91", blocked_by=["DHS-107"],
      desc="Show the dog's adoption applications in admin as a list."),
    t("DHS-109", "Story", "[Admin] Status ADOPTED hides the dog from /want-a-friend", status="Done", who=FE,
      created="2026-09-08 10:00", sprint=[S14], comp=["Admin"], labels=["adoption"], points=2, epic="DHS-91", desc="""
Add status ADOPTED to the dog edit form; the public list filters it out.

h3. Acceptance criteria
* Given a dog is set to ADOPTED in admin, then it is not returned by GET /api/dogs/public within 1 minute (cache)"""),

    # ---------------------------------------------------------------- other stories
    t("DHS-110", "Story", "[Admin] New admin layout, navigation and dashboard charts", prio="Low", who=FE, by=FE,
      created="2026-09-20 17:30", comp=["Admin", "Design"], labels=["admin"], points=13, desc="""
Rework the admin shell (sidebar, header) and add a dashboard with charts (bookings per month, adoptions).
Proposed by the FE team. No design and no breakdown yet."""),
    t("DHS-111", "Story", "[FE] Instagram feed widget on /home (Basic Display API)", prio="Low", who=FE_NEW,
      created="2026-10-08 11:10", comp=["Frontend"], labels=["home"], points=3, desc="""
Fetch the last 6 posts with the Instagram Basic Display API and render a grid on /home.
Needs a long-lived token and a refresh job. Added to the release on 8 Oct."""),
    t("DHS-112", "Story", "[FE] Dark theme: CSS variables and toggle in the header", prio="Low", who=FE_NEW, by=FE_NEW,
      created="2026-10-09 20:40", comp=["Frontend"], labels=["ui"], points=5,
      desc="Move colours to CSS variables, add a dark palette and a toggle in the header; save the choice in localStorage."),
    t("DHS-116", "Story", "[BE] Honeypot check for the contact form", status="Done", who=BE, created="2026-09-03 10:00",
      sprint=[S14], comp=["Frontend", "Backend"], labels=["security"], points=2, epic="DHS-92", desc="""
Hidden field "website" in the contact form; the API drops the message when it is filled.

h3. Acceptance criteria
* Given the hidden field is filled, then the message is dropped and logged as spam
* Given the hidden field is empty, then the message is delivered as before"""),
    t("DHS-120", "Story", "[FE] /prices: separate table for additional services", who=FE, created="2026-09-16 14:00",
      sprint=[S16], comp=["Frontend"], labels=["prices"], points=2, desc="""
Split the price list: grooming, vet help and transport go into a second table "Additional services".

h3. Acceptance criteria
* Given /prices is open, then "Additional services" is a separate table with one price per service
* Given a 375 px screen, then the table scrolls horizontally inside its card"""),
    t("DHS-119", "Story", "[FE] Blog: category filter chips", prio="Low", who=FE, created="2026-09-18 16:00", rel=NEXT,
      comp=["Frontend"], labels=["blog"], points=3,
      desc="Chips above the article list, filter by category from the CMS (already in the API)."),
    t("DHS-123", "Story", "[BE] Reviews API: submit and moderation", prio="Low", who=BE, created="2026-09-22 10:30",
      rel=NEXT, comp=["Backend", "Admin"], labels=["reviews"], points=5,
      desc="POST /api/reviews (status PENDING) and PATCH /api/admin/reviews/{id} to approve or reject."),

    # ---------------------------------------------------------------- tasks
    t("DHS-118", "Task", "[DevOps] Configure SMTP relay on prod (provider, SPF/DKIM, secrets)", prio="High", who=OPS,
      by=OPS, created="2026-09-12 12:00", rel=NEXT, comp=["DevOps"], labels=["infra"], points=2, epic="DHS-92",
      blocks=["DHS-105", "DHS-117"], desc="""
No mail provider on prod. Choose a provider (free tier), add SPF/DKIM DNS records, put SMTP credentials into the
prod secrets, smoke-test MailService. Planned for R2027.1 because of DevOps capacity."""),
    t("DHS-122", "Task", "[FE] Upgrade Angular 12 to 17", who=FE, by=FE, created="2026-09-11 18:00",
      comp=["Frontend"], labels=["tech-debt"], points=5, epic="DHS-92", desc="""
Angular 12 is out of support. Upgrade 12 > 14 > 16 > 17 with ng update, fix breaking changes,
update RxJS and the UI kit.

h3. Definition of done
* Build and unit tests are green
* Full regression passed on staging (DHS-137)"""),

    # ---------------------------------------------------------------- bugs
    t("DHS-113", "Bug", "[FE] /want-a-friend: filters reset on pagination", prio="High", who=FE, by=QA,
      created="2026-09-25 11:20", sprint=[S16], comp=["Frontend"], labels=["adoption"], epic="DHS-92", desc="""
Steps to reproduce:
1. Open /want-a-friend
2. Set Size = Large
3. Go to page 2
Expected: the filter stays Large. Actual: the filter resets to All.
Env: prod, Chrome 129, Windows 11. Probably the filter is not kept in the query string."""),
    t("DHS-114", "Bug", "[FE] /prices: table overflows below 400 px", status="Done", prio="Medium", who=FE, by=QA,
      created="2026-09-05 15:00", sprint=[S14], comp=["Frontend"], labels=["mobile"], epic="DHS-92",
      desc="Steps: open /prices on iPhone SE (375 px). Actual: the table goes outside the screen."),
    t("DHS-115", "Bug", "[BE] POST /api/newsletter returns 500 on prod", status="In Progress", prio="High", who=BE, by=QA,
      created="2026-09-28 09:40", sprint=[S16], comp=["Backend"], labels=["prod"], epic="DHS-92", desc="""
POST /api/newsletter returns 500 for any e-mail.
Log: NullReferenceException in SubscriptionService.Save, setting MailingListId is missing in prod config.
Regression since release R2026.3."""),

    # ---------------------------------------------------------------- sub-tasks
    t("DHS-130", "Sub-task", "FE: form layout and field components", status="Done", who=FE, by=FE, created="2026-09-11 10:00",
      sprint=[S15], comp=["Frontend"], parent="DHS-101", desc="Layout from Figma, responsive down to 375 px."),
    t("DHS-131", "Sub-task", "FE: client-side validation", status="In Progress", who=FE, by=FE, created="2026-09-11 10:05",
      sprint=[S16], comp=["Frontend"], parent="DHS-101", desc="Required fields, date range, phone format."),
    t("DHS-132", "Sub-task", "BE: EF migration for booking_request", status="Done", who=BE, by=BE, created="2026-09-11 11:00",
      sprint=[S15], comp=["Backend"], parent="DHS-102", desc="Columns, indexes on status and date_from."),
    t("DHS-135", "Sub-task", "BE: unit tests for BookingValidator", status="In Progress", who=BE, by=BE,
      created="2026-09-11 11:10", sprint=[S16], comp=["Backend"], parent="DHS-102", desc="Date range, phone, required fields."),
    t("DHS-133", "Sub-task", "QA: test cases for the booking form", who=QA, by=QA, created="2026-09-14 09:30",
      sprint=[S16], comp=["QA"], parent="DHS-101", desc="Positive, negative and mobile cases in the test plan."),
    t("DHS-134", "Sub-task", "QA: test cases for the adoption form", who=QA, by=QA, created="2026-09-16 09:30",
      comp=["QA"], parent="DHS-107", desc="Form, validation, hidden button for adopted dogs."),
    t("DHS-136", "Sub-task", "FE: hide Adopt button for ADOPTED dogs", who=FE, by=FE, created="2026-09-16 10:00",
      comp=["Frontend"], parent="DHS-107", desc="Read dog.status from GET /api/dogs/{id}."),
    t("DHS-137", "Sub-task", "QA: full regression after the Angular upgrade", who=QA, by=QA, created="2026-09-12 09:00",
      comp=["QA"], parent="DHS-122", desc="Public site and admin, Chrome / Safari / mobile."),
]

# ---------------------------------------------------------------- write the CSV like a Jira export
HEADER = ["Summary", "Issue key", "Issue id", "Issue Type", "Status", "Priority", "Assignee", "Reporter", "Created",
          "Updated", "Sprint", "Sprint", "Fix Version/s", "Component/s", "Component/s", "Component/s", "Labels", "Labels",
          "Custom field (Story Points)", "Custom field (Epic Link)", "Parent", "Description",
          "Outward issue link (Blocks)", "Outward issue link (Blocks)", "Inward issue link (Blocks)"]


def jira_date(text: str) -> str:
    return datetime.strptime(text, "%Y-%m-%d %H:%M").strftime("%d/%b/%y %I:%M %p")


def pad(values: list, n: int) -> list:
    return (values + [""] * n)[:n]


out = Path(__file__).with_name("jira_export_sample.csv")
with out.open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(HEADER)
    for n, x in enumerate(tickets):
        writer.writerow([
            x["summary"], x["key"], 52000 + n, x["kind"], x["status"], x["prio"], x["who"], x["by"],
            jira_date(x["created"]), "15/Oct/26 06:10 PM", *pad(x["sprint"], 2), x["rel"], *pad(x["comp"], 3),
            *pad(x["labels"], 2), "" if x["points"] is None else x["points"], x["epic"], x["parent"], x["desc"],
            *pad(x["blocks"], 2), ", ".join(x["blocked_by"]),
        ])

print(f"Saved {len(tickets)} issues to {out}")
