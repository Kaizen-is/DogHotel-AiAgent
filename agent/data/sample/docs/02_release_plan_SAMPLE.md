# Release plan R2026.4 "Booking & Adoption" (SAMPLE)

This page is synthetic sample content for developing the agent. Replace it with the real KB export.

## Goal
Pet owners can send a hotel-stay booking request online; visitors can apply to adopt a dog from "Want a friend"; the owners handle both in the admin panel.

## In scope (baseline, agreed 2026-10-01)
- Online booking request form and backend (DHS-101, DHS-102)
- Admin list of booking requests with confirm/decline (DHS-104)
- E-mail notification to the owners about new requests (DHS-105)
- Adoption application form and admin list (DHS-107, DHS-108)
- Mark dog as adopted (DHS-109)
- Separate price table for additional services (DHS-120)
- Framework upgrade, because security updates stopped (DHS-122)

## Explicitly out of scope for this release
- Online payment for stays
- Customer accounts / login for pet owners
- Visitor-submitted reviews (planned for R2027.1)
- Blog improvements (R2027.1)

## Constraints
- Volunteer team of about 4 part-time contributors; capacity about 40 story points per release
- Milestone: 2026-11-27 (before the New Year holiday season, when demand for the hotel peaks)
- E-mail sending depends on a mail provider that isn't configured yet (infrastructure task in R2027.1)

## Change control
New requests after the baseline go to the PM. The PM decides together with the owners whether to accept (and what to drop), defer, or reject.
