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

## Resolved this session (round 3, 2026-10-07)

Alex reopened the Saved Spot concept with a concrete proposal (via the
"Save Spot" button on `NewSpotCard`), which resolved several round-2
questions and surfaced new ones:

- **Round 2 Q3 (data shape) — resolved as (a).** `SavedSpot` is a
  join-entity: `{ spotId, isPublic, savedAt }`. Not a raw ID array, and
  not the full `Spot[]` copies `user.ts` had been storing — those go
  stale the moment the original Spot is edited.
- **Round 2 Q6 (does `Spot.owner` reference `User`) — resolved: yes.**
  `Spot` gets `ownerId`, set to the creating User's id when they're signed
  in at creation time, left unset (anonymous/public) when signed out.
  Every Spot still persists either way.
- **Round 2 Q2 (what the visibility boolean gates) — carried forward,
  not re-litigated in words.** Adopting the join-entity shape wholesale
  (including `isPublic`) keeps the original recommendation (a) —
  *bookmark* visibility, not Spot visibility — but this wasn't explicitly
  re-confirmed this session, just inherited by adopting the shape.
- **New: ownership and bookmarking are explicitly split, not merged.**
  Initial proposal was "signed-in creation also adds the new Spot to the
  creator's own `savedSpots`." Refined instead to: `ownerId` is the sole
  source of truth for authorship ("my spots" = filter `Spot` by
  `ownerId`); `savedSpots` is reserved exclusively for bookmarking Spots
  the User does *not* own. Matches round 1's original definition of Saved
  Spot as "distinct from the Spot's existence on the map."
- **New: `User` needs an `id` field.** `user.ts` had none — `ownerId`
  needs something stable to reference (not `username`/`email`, which can
  change).
- **New: marker coloring is two-color, not three.** Default (public / not
  owned by the current viewer) vs. a distinct color for "owned by the
  signed-in viewer." A third color for "owned by a *different* specific
  user" is explicitly deferred — needs real multi-user visibility that
  doesn't exist until Phase 6+.
- **New: where signed-in identity lives.** Only a `signedIn: boolean`
  exists today, local to `SpotCheckNav.component.tsx`, never reaching
  `LeafletMap`/`NewSpotCard`. Decision: lift the actual `User` (or at
  least their `id`) to `page.tsx` — the common parent — and pass down as
  props, mirroring the side menu's existing single-top-level-owner
  pattern.

None of the above is implemented in code yet — `user.ts`/`spot.ts` still
need the `id`/`ownerId` fields and the `savedSpots` shape change;
`leaflet.tsx` and `page.tsx` still need the wiring. See
`October 7th Context.md` at the repo root for the full session writeup.

## Resolved this session (round 4, 2026-10-07)

Closed out round 2's remaining open items, plus new branches that came up
reviewing round 3's decisions against the actual code:

- **Q1 (home_city vs. Phase 10 fallback) — resolved (a).** Phase 10's
  literal done-criteria ("denying it degrades gracefully — default to a
  city") doesn't distinguish signed-in from signed-out, so this was a free
  choice, not spec-mandated. Signed-in: center on `home_city`. Signed-out:
  one fixed, hardcoded default coordinate (picked once, not re-randomized
  per visit). `home_city` → lat/lng conversion stays mocked for now (see
  Q7) — this is about *which* fallback applies, not how it's computed.
- **Q2 (what `isPublic` gates) — resolved (b), reversing the round-3
  carry-forward.** `isPublic` is **not** a bookmark-visibility flag; it's
  Spot-level visibility, set by the owner at creation (defaults `true`;
  signed-in Owners may set it `false` to keep a Spot visible only to
  themselves). Moves `isPublic` off the bookmark join-entity entirely —
  see Q9.
- **Q5 (name vs. username) — resolved (a), reversing the round-2
  recommendation.** `User` does need real name fields — but they already
  exist as `Profile.firstName`/`lastName` (not a new flat `name` field).
  The gap is that `CreateAccountModal` doesn't collect them yet; it should.
- **Q5b (`handle`) — resolved (a).** Derived at render time as
  `@${username}`, not a stored field.
- **Q5c (mock avatar source) — resolved (a).** No upload flow yet;
  `profileImage` stays unset and the avatar falls back to an initial
  letter (from `firstName`) until a real upload step exists.
- **Q6 (naming collision between "Save Spot" and the bookmark concept) —
  resolved: rename the bookmark side, not the button.** `handleSaveSpot`
  and the "Save Spot" button keep their names — they only ever create a
  `Spot` (with or without `ownerId`) and never touch the bookmark list.
  The bookmark concept itself is renamed instead: `SavedSpot` → `Bookmark`,
  `User.savedSpots` → `User.bookmarkedSpots`, and the `SideMenu` nav item
  "Saved spots" → "Bookmarks".
- **Q7 (home_city geocoding) — resolved (a).** Stays mocked — no real
  geocoding call in `CreateAccountModal` yet. Revisit once Phase 6
  (persistence) or Phase 10 (geolocation) actually lands; real geocoding
  is explicitly a "when it's the right time" item, not deferred
  indefinitely.
- **Q8 (do private owned Spots render on the map) — resolved (a).** Yes —
  same pin, "owned by me" marker color, just invisible to everyone else's
  map. They're not map-hidden just because they're private.
- **Q9 (is `bookmarkedSpots` one array, or two sources combined) —
  resolved (b).** `bookmarkedSpots` stays exactly what round 3 defined:
  stored entries for Spots the User doesn't own, `{ spotId, savedAt }`,
  added only by a (not-yet-built) manual bookmark action. The "Bookmarks"
  page a signed-in User sees is `[...bookmarkedSpots, ...myPrivateSpots]`
  — `myPrivateSpots` is a live filter (`ownerId === me && isPublic ===
  false`), never written into the stored list. Chosen over auto-appending
  on creation specifically to avoid the staleness problem round 3 already
  rejected once (an entry going stale if the Spot's visibility changes
  later).

Implemented this round: `src/types/user.ts` (`Bookmark` type,
`bookmarkedSpots` field, stale `Spot` import removed) and the `SideMenu`
nav label. **Still not implemented:** `spot.ts` needs `ownerId` made
optional and an `isPublic` field added; `CreateAccountModal` needs
firstName/lastName inputs; `leaflet.tsx`/`page.tsx` still need the
signed-in-identity wiring from round 3; marker coloring and the
"Bookmarks" page's combined view don't exist yet. All of that is
functionality, not just types — deliberately left for an explicit ask
rather than bundled into this round's doc sync.

## Not yet touched

- Whether `Review` (mentioned in `CONTEXT.md` as an anticipated term) needs
  its own shape decisions now or stays a named-only placeholder.
- No bookmark UI exists yet — `SpotDetailCard` only has
  Directions/Edit/Reviews, no action that would actually populate
  `bookmarkedSpots`. Fully specified as of round 4, just not built.
- Any ADR-worthy write-up of the Spot-visibility model (Q2/Q8/Q9) — a real
  trade-off, but not clearly "hard to reverse" yet given nothing is
  persisted. Revisit once Phase 6 makes it real.
