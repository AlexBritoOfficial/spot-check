Phase 7 — The Read Path (Swap Mock Data for Real Data)

Context

Part B (phases 0–5, mock-data UI) is done. Phase 6 (schema + migration + seed) is done on branch AC-1008. This plan covers Phase 7: making the map show spots from Postgres instead of mockSpots.ts, per docs/PROJECT_ROADMAP.md.

Along the way, a naming mismatch surfaced: the mock Spot type (src/types/spot.ts) is snake_case (spot_type, is_skateable, lat_lng, created_at) — a holdover from writing a lot of Python — while the Prisma schema is camelCase. Alex wants to modernize the frontend to camelCase now, before wiring up the real API, so there's no snake_case/camelCase translation layer to maintain.

Division of labor for this phase — revised: Alex is handling this entirely himself, including the one step originally assigned to Claude (installing @tanstack/react-query). Claude's role going forward is passive: available to answer questions, explain concepts, or review finished code if and when Alex asks — Claude takes no action on any item below without being asked.

Note: npm install @tanstack/react-query was already run (by Claude, before this revision) and the package is already in package.json/package-lock.json. Nothing else has been built yet.

Actionable Items

1. Modernize Spot to camelCase (prerequisite cleanup — Alex writes) — done

Rename across the codebase: spot_type→spotType, is_skateable→isSkateable, lat_lng→latLng, created_at→createdAt. These new names already match the Prisma schema's field names exactly, so no further translation is needed once Phase 7's endpoint is built.

Files that reference the old names (confirmed by search):

- src/types/spot.ts — the type definition itself
- src/app/data/mockSpots.ts — all 4 mock spots
- src/app/components/card/SpotDetailCard.tsx — spot.spot_type, spot.is_skateable
- src/app/components/card/NewSpotCard.tsx — builds a new Spot from form data (spot_type, is_skateable, lat_lng, created_at)
- src/app/components/indicator/Indicator.tsx — is_skateable prop
- src/app/components/leaflet/leaflet.tsx — spot.lat_lng.lat / .lng
- src/app/components/filter-bar/FilterBar.tsx — spot.spot_type
- prisma/seed.ts — reads mockSpot.spot_type / .is_skateable / .created_at / .lat_lng.{lat,lng}

Done when: app still runs fully against mock data (sanity-check before swapping the source) and npx prisma db seed still works against the renamed mock fields.

2. Install TanStack Query — already done

npm install @tanstack/react-query has already been run; the package is in package.json. No further action needed here.

3. QueryClientProvider setup (Alex writes) — done

Built as src/app/components/providers/Provider.tsx: a client component creating a QueryClient via useState (so it isn't recreated every render), wrapping it in QueryClientProvider, wired into src/app/layout.tsx around {children}. layout.tsx stays a server component (keeps its metadata export).

4. Prisma client singleton for runtime queries (Alex writes)

A new module (e.g. src/app/lib/prisma.ts, next to the existing src/app/lib/fonts.ts) — distinct from the one-off PrismaClient instantiated in prisma/seed.ts. Needs the same PrismaPg adapter pattern seed.ts uses, plus a dev-hot-reload-safe singleton (cache the instance on globalThis) so next dev --webpack doesn't open a new connection pool on every reload. Worth researching why this pattern matters in Next.js dev mode specifically (module re-evaluation per reload vs. one long-lived process in production).

5. GET /api/spots route handler (Alex writes)

src/app/api/spots/route.ts — the directory (src/app/api/spots) already exists but is empty.

Known wrinkle to watch for: Spot.latLng is Unsupported("geography(Point, 4326)") in prisma/schema.prisma, so Prisma Client excludes it entirely from findMany() and friends. Getting coordinates back out requires raw SQL (ST_X/ST_Y) via $queryRaw — mirroring the $executeRaw already used in prisma/seed.ts to write them in. Alex is researching the exact query himself.

Response should return all spots as JSON shaped like the now-camelCase Spot type (confirmed against node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md: GET route handlers aren't cached by default in this Next.js version, which is fine here — no caching needed).

6. Repository + hook layer, then wire into the map component (Alex writes)

Revised 2026-10-17: rather than leaflet.tsx calling useQuery directly, add a repository layer in between so leaflet.tsx never sees fetch/useQuery details. Decided: flat in src/app/lib/ (matches the existing fonts.ts convention, no repositories/ or hooks/ subfolders), plain exported functions (not a class or namespace object, matching the rest of the codebase's functional style).

6a. src/app/lib/spotRepository.ts — the only module that knows /api/spots exists.

- getSpots(): Promise<Spot[]> — fetch("/api/spots"), throw a plain Error on !res.ok (don't return a sentinel — TanStack Query only flips isError/populates error when the queryFn throws), otherwise return res.json(). Do the JSON-to-Spot[] step as a visible, named step rather than an inline cast — that's the "layer for when we get a response back" the repository exists for, even though right now it's a pass-through (the route will already return camelCase JSON matching src/types/spot.ts).
- No validation (no Zod) at this stage — trust the API response shape. Zod is Phase 8's job.
- Also stub the write side now, per your call: createSpot(spot: Omit<Spot, "id">): Promise<Spot> — mirrors NewSpotCard's existing onSave payload exactly so Phase 8 only has to change what handleSaveSpot calls, not redesign types. Body is just a throw (e.g. throw new Error("createSpot is not implemented yet")) — real signature, intentionally unwired. Don't build a real fetch(..., { method: "POST" }) yet; Phase 8 owns the actual POST contract (Zod body, status codes) and writing one now risks drifting from what Phase 8 actually needs. One-line comment above it noting Phase 8 wires this into NewSpotCard's onSave via useMutation.

6b. src/app/lib/useSpots.ts — the only module that knows TanStack Query exists for spots.

- One function: useSpots(), wrapping useQuery with queryKey: ["spots"] (flat array — v5 requires array form) and queryFn: getSpots (imported from ./spotRepository).
- Return the raw TanStack result unreshaped — just `return useQuery(...)`. Don't destructure/rename into a custom shape: the roadmap's "Learn" objective is isLoading/isError/data landing in leaflet.tsx itself, and useSpots exists only to centralize the queryKey/queryFn pairing, not to hide TanStack's result shape. Callers destructure what they need, e.g. `const { data: spots, isLoading, isError, error } = useSpots();`.
- No options beyond queryKey/queryFn — leave staleTime at the TanStack default. No real caching requirement yet, and seeing the default behavior (refetch on mount/focus) is itself part of learning the library.
- Import path convention already established in this codebase: @/* → ./src/* (confirmed in tsconfig.json). Use @/app/lib/useSpots and @/app/lib/spotRepository the same way leaflet.tsx already imports Spot from @/types/spot.

6c. leaflet.tsx changes:

- Drop the spots prop and LeafLetProps entirely — component takes no props.
- Call useSpots() in the body.
- Change allSpots/spotsFiltered's useState<Spot[]>(spots) initializers to useState<Spot[]>([]). Add one new effect: when the query's data changes, setAllSpots(data) (guarded for data being defined). spotsFiltered needs no new effect — FilterBar's existing useEffect (keyed on spots, which is allSpots passed down) already recomputes spotsFiltered whenever allSpots changes; this is the same mechanism that already makes handleSaveSpot's local append show up today, so no change needed in FilterBar.tsx.
- Loading/error UI: early-return before the main MapContainer render — render a loading state while isLoading, an error state (using error.message) while isError. LeafletMap.tsx already guarantees client-only rendering via ssr: false, so this introduces no SSR/hydration concerns.
- handleSaveSpot stays exactly as-is (local-only append) — not wired to createSpot yet, that's Phase 8.
- Known rough edge, not worth fixing now: with no mutation/invalidation yet, if useSpots's default refetch-on-window-focus fires after a local-only handleSaveSpot append, the new effect will overwrite allSpots with refetched server data and silently drop the locally-added spot. Acceptable for Phase 7 — Phase 8's real POST + invalidation replaces the local-append mechanism entirely and resolves this naturally. Don't preempt it with refetchOnWindowFocus: false unless it's actually annoying during testing.

6d. src/app/page.tsx changes: remove the mockSpots import and `const spots = mockSpots`; change `<LeafLet spots={spots} />` to `<LeafLet />`.

6e. No changes needed: src/app/data/mockSpots.ts (prisma/seed.ts still imports it — stays load-bearing, just no longer consumed by page.tsx) or src/app/components/leaflet/LeafletMap.tsx (content-free next/dynamic wrapper; once leaflet.tsx's default export takes no props, `<LeafLet />` call sites just work).

Recommended build order: 6a → 6b → 6c → 6d, then manually verify the loading/error branches against the still-empty /api/spots route (free, real test of the error-path requirement in item 7) before starting item 4 (Prisma singleton) and item 5 (route handler). Building the route first (4 → 5 → 6) is equally valid — it just means the error-path check has to be manufactured deliberately afterward instead of happening for free.

7. Verify (roadmap's "Done when")

- Spots render on the map sourced from Postgres, not src/app/data/mockSpots.ts
- Network tab: a request to /api/spots fires from getSpots on mount; once the route exists, confirm 200 + a JSON array shaped field-for-field like Spot (id, name, city, spotType, description, features, difficulty, isSkateable, isPublic, rating, latLng: {lat, lng}, photo, status, createdAt)
- A loading state is visible briefly on page load (optionally throttle network in DevTools to see it clearly)
- Error state sanity-checked twice: naturally before the route exists (per the 6a→6d-first build order above), and deliberately afterward (temporarily break the route or point getSpots at a bad URL, confirm isError renders, then revert)
- Existing Part B interactions are unchanged: filter chips still narrow spotsFiltered, marker click → SpotDetailCard, map click → NewSpotCard, submitting NewSpotCard still appends locally via handleSaveSpot and shows up on the map (still not persisted — createSpot isn't wired up)
- tsc --noEmit (or next build) comes back clean — confirms removing the spots prop left no dangling type errors in LeafletMap.tsx/page.tsx
- Run via next dev --webpack (Turbopack is broken on this machine)
