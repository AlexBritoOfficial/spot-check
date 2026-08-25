# SkateSpot Map — Project Roadmap

A phase-by-phase plan for building a full-stack skate-spot map application. Each phase describes the **goal**, the **concepts to learn**, **what to build**, and how you'll know it's **done**.

---

## Stack

- **Frontend:** Next.js + TypeScript, Tailwind CSS, TanStack Query, Leaflet
- **Backend:** Next.js API routes
- **Database:** PostgreSQL with PostGIS extension, Prisma ORM
- **External APIs:** Geolocation API, Nominatim/Mapbox for geocoding
- **Deployment:** Vercel

---

## Approach

Build the **entire UI first** against fake data (working from the design), then add the backend and real interactivity underneath.

**Key principle:** Design your mock data to match exactly what your API will eventually return. That way, in Part C, "getting real data" is just "replace the mock source with a real fetch" — the UI barely changes.

---

# Part A — Setup & Design

## Phase 0 — Foundations & Environment

**Goal:** A running, empty Next.js app in a git repo with the toolchain installed.

**Learn:**
- What each piece of the stack is *for* — write yourself a one-sentence answer for each: Next.js, TypeScript, Tailwind, Prisma, Postgres, PostGIS, TanStack Query, Leaflet.
- Basic TypeScript — typing variables, function parameters/returns, `interface` vs `type`.
- Basic git hygiene — meaningful commits, `.gitignore`, branches.

**Build:**
- Scaffold a Next.js app with TypeScript and Tailwind enabled.
- Get it running locally; confirm Tailwind works by styling something trivial.
- Initialize the repo and push to GitHub.

**Done when:** The dev server runs, a Tailwind-styled element renders, and the empty project is committed and pushed.

---

## Phase 1 — Work from the Design

**Goal:** Turn the finished design into *your own* build plan — a component breakdown you derive yourself, a set of design tokens, and a data shape.

**Learn:**
- **Component decomposition** — Read React's "Thinking in React" guide to learn the *method*, then apply it to your own design.
- **Design tokens in Tailwind** — Pull colors, spacing, and fonts from the design into your Tailwind theme config.
- **Designing to a data shape** — Decide what a `Spot` object looks like as data, derived from what the design displays.

**Build:**
- Your own component breakdown of the design (document however you like).
- Your Tailwind theme configured with the design's palette, spacing, and typography.
- A `mockSpots` file: an array of 6–10 fake `Spot` objects in the shape you defined.

**Done when:** You've derived your own breakdown, your tokens are set, and your mock data is ready to import.

---

# Part B — Build the UI (Mock Data, No Backend)

Everything in this part runs on your `mockSpots` file. No database, no fetching, no API. The goal is a UI that matches the design and feels navigable.

## Phase 2 — Static Chrome

**Goal:** The static, non-map parts of the interface, built and styled to match the design.

**Learn:**
- Writing components and passing **props**.
- Tailwind layout — flexbox and grid, spacing, responsive basics.
- Composition — how small pieces nest into a page.

**Build:**
- The static regions of the design that frame and control the map, styled with your tokens, wired to nothing yet.

**Done when:** The non-map frame of the app matches the design with nothing interactive yet.

---

## Phase 3 — The Map

**Goal:** A Leaflet map renders inside your layout with markers placed from your mock data.

**Learn:**
- **Leaflet basics:** map, tile layer (OpenStreetMap tiles), markers, popups. Read the Leaflet quick-start.
- **Next.js client-side rendering:** Leaflet touches `window`, so it can't render on the server. Learn **server vs client components** in the App Router and how to load something **client-side only** (search: "Next.js dynamic import ssr false" and "use client directive").

**Build:**
- The map filling its area, centered on a default location, rendering a marker for each spot in `mockSpots`.

**Done when:** The map loads without SSR errors and your mock spots appear as markers.

**Expected challenge:** You'll likely hit a "window is not defined" error. Good — that's the SSR lesson landing. Work out *why* before you search the fix.

---

## Phase 4 — The Remaining UI

**Goal:** The parts of the design that display a spot's details and capture a new spot, built as static pieces.

**Learn:**
- **Conditional rendering** — show a spot's details only when something is selected.
- **Controlled form inputs** — build the add-spot form as a real form, even though it won't save yet.
- Keep these pieces presentational — they receive data and render it; they don't fetch or own app state.

**Build:**
- The part of the design that shows a selected spot's details, rendered from mock data.
- The form for adding a spot (it won't save yet).

**Done when:** Every part of the design renders correctly when handed mock data.

---

## Phase 5 — Local Interactivity (Still Mock Data)

**Goal:** The app *feels* real — you can select, filter, and open forms — all driven by client-side state over your mock data.

**Learn:**
- **`useState`** — the foundational React hook.
- **Lifting state up** — where "which spot is selected" and "which filters are active" should live.
- **Event handlers** — click a pin, click a filter, click the map.
- **Derived state** — computing the filtered list from the full list plus filters.

**Build:**
- Clicking a map pin selects that spot and reveals its details.
- Toggling filters narrows the visible mock spots by type.
- Clicking the map opens the add form (can hold values in local state — no saving yet).

**Done when:** The app is fully navigable on mock data — select, filter, open the form — with no backend anywhere. **This is the boundary.** Everything past here needs a server.

---

# Part C — Data & Functionality (Backend + Real Interactivity)

## Phase 6 — Database & Data Model

**Goal:** A Postgres database with PostGIS enabled and a `Spot` table matching the mock shape.

**Learn:**
- Relational modeling basics — tables, columns, primary keys, types.
- **Prisma** — the schema file, `migrate`, and `prisma studio`.
- **PostGIS** — what a `geography`/`geometry` column is and why storing real coordinates beats two float columns.
- Running Postgres locally (Docker) or on a free hosted instance.

**Build:**
- A `Spot` model mirroring your mock data: id, name, description, spot type (enum: park/street/ledge/rail/stairs/bowl/DIY), location, status, photo URL, created-at, and an owner placeholder.
- Enable PostGIS and add the geographic column.
- Seed it with the same spots from your mock file.

**Done when:** You can open Prisma Studio and see your seeded spots with real coordinates — and the table shape matches your mock `Spot`.

---

## Phase 7 — The Read Path (Swap Mock Data for Real Data)

**Goal:** The app shows spots from the database instead of the mock file. This is where UI-first pays off.

**Learn:**
- **Next.js route handlers** (API routes) — expose a `GET` endpoint.
- **TanStack Query** — `useQuery`, query keys, and the `isLoading` / `isError` / `data` states so you can render loading and error UI. Read their "Queries" docs.

**Build:**
- A `GET /api/spots` endpoint returning all spots as JSON in the same shape as your mock data.
- Replace the `mockSpots` import with a `useQuery` call to that endpoint.
- Real loading and error states.

**Done when:** Your spots load live from the database, and the only meaningful change from Part B was the data source.

---

## Phase 8 — The Create Path (POST)

**Goal:** The add-spot form from Phase 4 actually saves.

**Learn:**
- Capturing coordinates from a Leaflet map click.
- **Zod** for validation — on the client (UX) and on the server (security).
- **TanStack Query mutations** — `useMutation` and **query invalidation** so the map refetches after a successful create.
- HTTP status codes — 201 on create, 400 on bad input.

**Build:**
- A `POST /api/spots` endpoint that validates with Zod and writes to the DB.
- Wire the form's submit to a `useMutation` that invalidates the spots query on success.

**Done when:** You can add a spot through the UI and it appears without a manual refresh — and garbage input is rejected cleanly.

---

## Phase 9 — Update & Delete

**Goal:** Complete the CRUD cycle.

**Learn:**
- `PATCH`/`PUT` and `DELETE` route handlers, addressing a single resource (`/api/spots/[id]`).
- Dynamic route segments in the App Router.
- Optional — optimistic updates in TanStack Query.

**Build:**
- Edit an existing spot (open the form pre-filled, submit changes).
- Delete a spot with a confirmation step.

**Done when:** All four CRUD operations work end to end through the UI.

---

## Phase 10 — Geolocation & "Spots Near Me" (The PostGIS Centerpiece)

**Goal:** The map centers on the user and shows nearby spots sorted by distance. **Give this phase the time it deserves** — it's what makes the project stand out.

**Learn:**
- **Browser Geolocation API** (`navigator.geolocation`) via MDN, including permission prompts and the denied case.
- **PostGIS radius queries** — `ST_DWithin` (within a distance) and `ST_Distance` (for sorting). Understand why this beats fetching everything and filtering in JS.
- Passing lat/lng/radius as query params and reading them server-side.
- You'll likely write this as **raw SQL through Prisma** (`$queryRaw`) because of PostGIS gaps. Do it safely — parameterized, never string-concatenated.

**Build:**
- Extend `GET /api/spots` to accept lat/lng/radius and return nearby spots ordered by distance.
- On load, ask for location, center the map there, show nearby spots. Handle "permission denied" gracefully (default to a city).

**Done when:** Allowing location shows spots around you sorted by distance; denying it degrades gracefully.

---

## Phase 11 — Search Elsewhere (External API Integration)

**Goal:** The search control works — "spots in Barcelona" flies the map there.

**Learn:**
- **Geocoding** — place name → coordinates. OpenStreetMap's **Nominatim** is free; **Mapbox Geocoding** is an alternative.
- Best practice — proxy the external call through *your* backend, not the browser, to control it and keep keys server-side.
- Handling external call failures and rate limits.

**Build:**
- Wire the search → your backend geocodes the query → the map recenters and runs your existing nearby-spots query at the new coordinates.

**Done when:** Typing a city recenters the map and shows that area's spots.

---

# Part D — Ship & Extend

## Phase 12 — Deploy It Live

**Goal:** A real, public URL. A working deployment beats any screenshot.

**Learn:**
- Deploying a Next.js app to **Vercel** (connect the GitHub repo).
- Provisioning a hosted Postgres with PostGIS and running migrations against it.
- **Environment variables** and secrets — nothing sensitive in the repo.

**Build:**
- Deploy and point the app at the hosted DB. Confirm the full flow works in production.

**Done when:** A stranger can open your URL, see spots, and add one — and it persists.

**🎯 This is your MVP.** Everything below is optional polish — do it as discrete, well-committed increments, not all at once.

---

## Phase 13+ — Stretch Goals (Optional)

Pick what interests you and add them as separate, committed features:

- **Authentication** — Auth.js (NextAuth) or Clerk. Spots get real owners; edit/delete restricted to the owner.
- **Photos** — Upload to Cloudinary or S3-compatible storage; save the URL. Learn signed uploads.
- **Reviews / Status flags** — Ratings, comments, or a "confirmed skateable / gets you kicked out" flag.
- **Testing** — Vitest or Jest for unit tests; at least one test around your PostGIS query.
- **CI/CD** — GitHub Actions workflow that runs tests on every push and deploys on merge.
- **Docker** — Containerize the app; a `docker-compose` bringing up app + Postgres/PostGIS locally.

---

## Working Principles (For the Whole Project)

- **Understand before you paste.** If you use a snippet from anywhere, be able to explain every line. The goal is learning the stack, not shipping fast.
- **The design is a spec, not a source.** Build the UI yourself from the design; don't copy generated code.
- **The component breakdown is yours.** Decide how you split the UI into components — I'll help with concepts and debugging, not the structure.
- **Read the error message fully before searching.** The stack trace usually names the file, line, and cause.
- **Search the specific error, not the vague symptom.** "Leaflet window is not defined Next.js app router" beats "map not working."
- **Prefer official docs** — Next.js, Prisma, TanStack Query, Leaflet, and PostGIS all have strong ones.
- **Change one thing at a time when debugging.** Then you know what fixed it.
- **Commit at every "Done when."** The history tells the story of how you built it.
