Task: triage a new change request for release "{release}".

New request (source: {requester}):
"""
{request}
"""

Facts from the rules engine:
- Open scope of the release: {open_points} story points in {open_tickets} open tickets. Capacity: {capacity}. Load: {load}.
- Scope added after the baseline so far: {added_after_baseline}.
- Existing tickets most similar to the request (possible overlap or duplicates):
{similar}

Open tickets of the release:
{backlog}

Decide and fill in the structured answer:
1. classification
   - in_scope: serves the release goal and is already covered by, or naturally part of, the baseline scope
   - scope_creep: new work that would expand the release beyond its goal or baseline
   - out_of_scope: not part of this product or release at all
   - needs_clarification: you cannot judge it without answers from the requester
2. Impact and schedule risk, given the remaining capacity.
3. recommendation. If you recommend accepting it into the current release while the release is at or over capacity, use trade_off to name concrete open tickets to move out, with roughly enough points to make room.
4. related_tickets: only keys that appear above.
5. draft_story: a user story in the team template with testable acceptance criteria. Write it even when you recommend deferring, so the BA can put it into the backlog.
