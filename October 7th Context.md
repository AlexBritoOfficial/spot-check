# October 7th Context

**Branch:** `AC-1004` · **Session span:** 2026-10-07, 13:39–16:22 UTC (~2h43m)

Summary of this session, for picking back up. Nothing in this file has been
implemented in code yet — this was entirely a design/status conversation.

---

## 1. Project status recap (as of this session)

- **UI progress is ahead of the last stale memory snapshot** (which had
  Leaflet as "not started"). Since then: Leaflet map added, `NewSpotCard`
  attached to the map, `NewSpotCard`/`SpotDetailCard`/`FilterBar` all
  finished.
- **Uncommitted at session start:** cleanup in `page.tsx` and
  `LeafletMap.tsx` removing unused `FilterBar`/`useState` imports — this
  looked like the resolution of a previously-flagged dead-code issue
  (a broken module-scope `useState` call).
- **Persistence (Phase 6 — Database & Data Model):** a full implementation
  plan already exists at `~/.claude/plans/cozy-puzzling-treasure.md`
  (local Postgres via Postgres.app + PostGIS, Prisma v7, division of labor
  with Alex writing `schema.prisma`/`seed.ts`). **Nothing has been executed
  yet** — no `prisma/` directory, no Prisma deps installed, no Postgres.app.
  Ready to start whenever.

## 2. Grill-with-docs session — Sign-in/Account domain

Resumed the paused `/grill-with-docs` session (state file:
`docs/grill-sign-in-account.md`, glossary: `CONTEXT.md`). Alex reopened
**Round 1's "Saved Spot" concept** with a concrete proposal, which triggered
a fresh round of grilling. Round 2's original open questions (home_city
fallback, exact `isPublic` semantics, name vs. username) were **not**
revisited this session — still open from before.

### Facts confirmed in the existing codebase before grilling
- `src/types/user.ts` already existed: `{ username, email, password,
  homecity, savedSpots: Spot[] }` — no `id` field.
- `src/types/spot.ts` had no `owner`/`ownerId` field yet.
- "Save Spot" is the submit button on `NewSpotCard`; its handler
  (`handleSaveSpot` in `leaflet.tsx`) only appended to map state — never
  touched `User`/`savedSpots`.
- The signed-in side menu already has a separate "Saved spots" nav
  destination, implying a bookmarks-style list distinct from authorship.

### Decisions reached this session

1. **"Save Spot" sets ownership, not just map placement.**
   - Signed-in: the new `Spot` gets `ownerId = <signed-in User's id>`.
   - Signed-out: the new `Spot` is created as public, no author, no
     `ownerId` — and is still persisted to the backend regardless.
   - Every spot gets an `id`; only signed-in creation also gets an
     `ownerId`.

2. **`User` needs an `id` field.** `ownerId` has to reference something
   stable — `username`/`email` could change later, so a numeric/string
   `id` mirroring `Spot.id` was agreed on.

3. **`savedSpots` and ownership are split, not merged.** Initially proposed
   as "creating a spot while signed in also adds it to your own
   `savedSpots`," but refined to: `ownerId` is the single source of truth
   for authorship ("my spots" = filter `Spot` by `ownerId`), and
   `savedSpots` is reserved exclusively for **bookmarking spots you don't
   own** — matching Round 1's original `CONTEXT.md` definition ("distinct
   from the Spot's existence on the map"). Avoids duplicating data that
   would go stale once editing exists.

4. **Shape of a `savedSpots` entry:** a join-entity —
   `{ spotId, isPublic, savedAt }` — not a raw ID array, and not full
   `Spot` copies (today's code). Mirrors what becomes a real join table
   once Phase 6's DB lands; carries the per-bookmark metadata (visibility,
   timestamp) that a bare ID array can't.

5. **Marker coloring:** two colors only — default (public / not owned by
   the current viewer) vs. a distinct color for "owned by the signed-in
   viewer." A third color for "owned by a *different* specific user" is
   explicitly deferred until there's real multi-user visibility.

6. **Where signed-in identity lives:** currently only a `signedIn: boolean`
   exists, local to `SpotCheckNav.component.tsx`, and never reaches
   `LeafletMap`/`NewSpotCard`. Decision: lift the actual `User` (or at
   least their `id`) up to `page.tsx` — the common parent of
   `SpotCheckNav` and `LeafletMap` — and pass it down as props. Mirrors the
   existing single-top-level-owner state pattern already used for the side
   menu.

### Explicitly deferred (not blocking, just named)

- **No bookmark UI exists yet.** `SpotDetailCard` only has
  Directions/Edit/Reviews — there's no action that would actually populate
  `savedSpots`. Building that affordance is a separate, later session.
- Round 2's original open items were not revisited: `home_city` as the
  signed-in map-centering fallback, the precise real-world meaning of
  `isPublic` (carried forward implicitly by adopting the join-entity shape,
  but never re-confirmed in words), and name-vs-username.

## 3. Code vs. decisions — not yet implemented

None of the above has been written yet. To catch this file up to the
decisions:

- `src/types/user.ts` — add `id`; change `savedSpots: Spot[]` to
  `savedSpots: { spotId: number; isPublic: boolean; savedAt: string }[]`.
- `src/types/spot.ts` — add `ownerId?: string` (nullable, no relation yet).
- `leaflet.tsx`'s `handleSaveSpot` — set `ownerId` from the signed-in user
  when present.
- Marker rendering — color by `ownerId === currentUser.id`.
- `page.tsx` — lift signed-in `User` state, pass to `SpotCheckNav` and
  `LeafletMap`.
- A bookmark action on `SpotDetailCard` (deferred, see above).

## Resuming

Say "continue the sign-in/account grilling" or paste this file back in.
`docs/grill-sign-in-account.md` and `CONTEXT.md` still reflect the
*pre-this-session* state — they haven't been updated with the decisions
above yet.
