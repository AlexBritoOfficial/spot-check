# Architecture & Wiring Scan — 2026-11-18

Read-only full-stack wiring scan (routes → API → Prisma/PostGIS → UI), run on branch `AC-1020` before continuing into the remaining Phase 13+ sub-phases. Not a visual/design-fidelity pass. CI/CD-specific findings from this same scan were fixed directly in `AC-1020` (see PR) and aren't repeated here.

## Newly found gaps (not yet tracked anywhere)

1. **Dead photo upload** — `src/app/components/card/NewSpotCard.tsx`'s file input has no `name` attribute, and `handleSubmit` never reads `formData.get("photo")`; it hardcodes `photo: initialSpot?.photo ?? ""`. Any file a user picks is silently discarded, even though `Spot.photo` is fully supported end-to-end (type, Zod schema, DB column). Belongs to **Phase 13d Photos** — fix once a storage provider is chosen, since the real fix is "upload the file somewhere and store its URL," not just wiring the input.

2. **`city` is silently dropped** — no form field in `NewSpotCard` collects it; `handleSubmit` sends `city: initialSpot?.city ?? ""`. `spotSchema.city` is `z.string()` with no `.min(1)`, so the empty string passes validation and lands in a required, non-nullable DB column. Every created spot today has `city: ""`. Not urgent (nothing currently reads `city`), but will bite the first feature that filters/displays by city.

3. **Dead desktop "+ Add Spot" nav button** — `SpotCheckNav.component.tsx` renders this button with no `onClick`. The working add-spot entry points are the map-click handler and the phone FAB (a comment in `MapView.tsx` says the FAB "replaces" the desktop button, implying the nav button should still do *something* on desktop, or should be removed). Low-risk cleanup — either wire it to open the add-spot flow or delete it.

4. **Type/schema drift between `src/types/spot.ts` and the Prisma schema** —
   - `description`, `photo`, `ownerId` are typed as optional (`string | undefined`) in `src/types/spot.ts`, but Prisma's generated scalar types and the DB columns are nullable (`string | null`). `prisma.spot.create`/`update` return `null` for unset fields, not `undefined`.
   - `createdAt` is typed `string` in `src/types/spot.ts`, but the Prisma scalar is `Date`. It only serializes correctly today because `NextResponse.json` → `JSON.stringify` auto-converts `Date` → ISO string; the type is accidentally right on the wire but wrong internally.
   - A second, independent copy of this same drift exists inside `src/app/api/spots/route.ts`'s own `RawSpotRow`/`RawNearbySpotRow` types, which declare these same fields non-nullable.
   - Worth a dedicated small cleanup: derive one canonical shape (ideally from the Prisma-generated types) instead of maintaining three independently-drifting copies.

5. **`createdAt` is client-supplied, not DB-generated** — `schema.prisma` has no `@default(now())` on `createdAt`; both the Zod schema and `NewSpotCard` must supply it from `new Date().toISOString()`. Works today, but a buggy or malicious client could submit an arbitrary value with no server-side override. Consider moving to a DB default when touching this area next.

6. **`src/types/user.ts` is unused and already stale** — not imported by any component or API route. Its `Bookmark` type (`spotId: number`) and `Profile` type (`age: string`) don't match the current Prisma models (`Bookmark.spotId` is a `String` UUID; `Profile.age` is `Int`). Safe to delete or rewrite from the Prisma types whenever `User`/`Profile`/`Bookmark` wiring actually starts (Phase 13c/13e).

7. **The entire sign-in/sign-up UI is a client-only mock with zero API wiring** — `SpotCheckNav`, `SideMenu`, and `CreateAccountModal` all manage state locally and never call `fetch`. There is no `/api/users` (or any auth) route at all. The `User`/`Profile`/`Bookmark` Prisma models and their migration are fully provisioned in the DB with nothing in the app connected to them yet. Expected to be picked up by **Phase 13c Authentication**.

## Known gaps re-confirmed accurate (deferred to Phase 13c, not new)

These were already flagged in a prior project note as deferred to Phase 13c. Re-verified against current code on 2026-11-18 — all three still hold exactly as described:

1. **No ownership check exists anywhere, client or server.** `PATCH`/`DELETE /api/spots/[id]` act on any `spotId` with no owner/session comparison at all. `SpotDetailCard` renders Edit/Delete buttons unconditionally for every spot.
2. **`isPublic` is never enforced in `GET /api/spots`.** Both the PostGIS nearby-query branch and the all-spots fallback branch select `isPublic` as display data only; neither filters by it. Every spot — public or private — is returned to any caller.
3. **`signedIn` is local `useState` in `SpotCheckNav`, reaches nothing else.** It's prop-drilled exactly one level, into `SideMenu`, to toggle that panel's own sign-in-form vs. profile view. `MapView`, `NewSpotCard`, and `SpotDetailCard` have no auth-related prop and there's no auth context anywhere in `src`.

## How to use this doc

Treat each item above as a checklist entry for whichever phase it belongs to (noted inline). When starting Phase 13c/13d/13e or a future cleanup pass, check this doc first rather than re-discovering the same gaps from scratch.
