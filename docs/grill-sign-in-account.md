# Grilling session: Sign-in / Account domain (paused)

Started via `/grill-with-docs` on branch `AC-1004`. Resolved terms are already
written into `CONTEXT.md` — this file holds everything *not* fit for the
glossary (scope decisions, open questions) so the session can pick back up
without re-deriving it.

To resume: paste this file's contents back, or just say "continue the
sign-in/account grilling session" — the design tree below is the state.

## Resolved this session (round 1)

- **Scope**: the sign-in/sign-up UI is intentionally ahead of the roadmap's
  Phase 13+ auth stretch goal. It's still mock UI (Phase 4/5 spirit) — no
  database, no API — so this doesn't violate the roadmap's real boundary.
- **Mock fidelity**: sign-in/create-account forms stay a no-op gate. Submitting
  (even blank) "succeeds" unconditionally; inputs aren't read, nothing is
  persisted. Matches the established visual-first pattern.
- **"Continue with Google"**: stays in the UI as a placeholder, but the
  provider is explicitly undecided (see `CONTEXT.md`'s Sign In entry) —
  not a commitment to Google specifically.
- **Canonical term**: `User`, not `Rider`/`Account`. "Rider" is mock-data
  flavor text only (`CONTEXT.md` updated).
- **Saved Spot**: confirmed as a real domain concept, not just UI copy
  (`CONTEXT.md` stub added, shape still open — see Q2/Q3 below).

## Open — round 2 questions (not yet answered)

**Q1 — Home city vs. Phase 10's "default to a city" fallback.**
Roadmap Phase 10 done-criteria wants a hardcoded/default-city fallback when
geolocation is denied. `User.home_city` looks like the natural source for
that, but the round-1 answer to "what is home city for" said it's unrelated
to map-centering. Flagged as a possible contradiction with the roadmap's own
stated requirement.
Recommendation: **(b)** — let `home_city` serve as the signed-in fallback;
keep a hardcoded default only for signed-out/anonymous users.

**Q2 — What does Saved Spot's "publicly displayed" boolean gate?**
Two readings:
(a) *Bookmark visibility* — whether other Users can see that this User saved
this Spot (a public/private favorites list). `Spot`'s own visibility is
untouched.
(b) *Spot visibility* — whether the Spot itself stays hidden from the map for
other Users (skate-culture "don't blow up my secret spot" pattern; echoes
Phase 13's "gets you kicked out" status-flag idea).
Recommendation: **(a)** — more literal reading of the original phrasing, and
avoids two different fields on two different entities both claiming to
control map visibility (Spot already has a `status` field for that).

**Q3 — Data shape for Saved Spot.**
(a) A relationship/join entity: `{ user_id, spot_id, is_public, saved_at }`,
mirroring what becomes a join table once Phase 6's real DB lands.
(b) A raw array of Spot IDs on `User`, with the boolean living elsewhere.
Recommendation: **(a)** — the boolean and a timestamp are per-save metadata
that a raw ID array can't hold cleanly.

**Q4 — Write the actual TypeScript shapes now, or just keep concepts in
`CONTEXT.md`?**
`spot.ts` already exists as a full type ahead of any database (Phase 1's
"design to a data shape" principle).
Recommendation: write `User` and `SavedSpot` types in `src/types/` now,
mirroring `spot.ts`, so `CONTEXT.md` entries are verifiable against real code.

**Q5 — Does `User` need both a display name and a handle, or does username
serve both roles?**
Sign-up form only collects **Username**; the mock profile shows a full
**name** ("Rider Nguyen") *and* a separate **handle** ("@rider.nguyen").
(a) Two fields: `name` (not collected at signup yet — a gap) + `username`.
(b) One field: `username` does double duty; "Rider Nguyen" is just mock
flavor, not a real field.
Recommendation: **(b)** — don't design a field (`name`) the signup form
doesn't even collect yet.

**Q6 — Does `Spot`'s eventual Phase 6 `owner` field reference `User`?**
Confirming the obvious reading so `spot.ts` and the new `user.ts` are
explicitly linked in `CONTEXT.md`'s relationships rather than looking like
two unconnected files.
Recommendation: yes.

## Not yet touched (later rounds, once above resolves)

- Whether `Review` (mentioned in `CONTEXT.md` as an anticipated term) needs
  its own shape decisions now or stays a named-only placeholder.
- Any ADR-worthy write-up once the Saved Spot visibility model (Q2/Q3) is
  locked in — it's a real trade-off, but not clearly "hard to reverse" yet
  given nothing is persisted. Revisit once Phase 6 makes it real.
