Phase 11 — Search Elsewhere (Geocoding)

Context

Phases 9 and 10 (Update/Delete, Geolocation) are merged to main (PR #17, commit 72c418d). This covers Phase 11 per docs/PROJECT_ROADMAP.md: the nav bar's search box geocodes a place name through our own backend (keeping the external call server-side) and the map flies there, rerunning the existing nearby-spots query at the new coordinates. Built entirely by Claude on branch AC-1013, following the current "Claude writes, Alex reviews at the end" division of labor.

What Was Built

- src/app/lib/geocodeQuerySchema.ts — Zod schema validating the q query param (non-empty string).
- src/app/api/geocode/route.ts — GET /api/geocode?q=..., proxies Nominatim (same OpenStreetMap ecosystem the map tiles already use, no API key needed). Sends a required identifying User-Agent header (Nominatim's usage policy rejects requests without one). Returns { lat, lng, displayName } on success; 400 on a missing/empty query, 404 when Nominatim finds nothing, 502 if the upstream call itself fails or errors.
- src/app/lib/geocodeRepository.ts — geocodeLocation(query), reusing the extractErrorMessage helper already shared by spotRepository.ts (exported it rather than duplicating the same "stringify non-string Zod error body" logic a third time).
- src/app/lib/useGeocode.ts — useMutation wrapper, same shape as useCreateSpot/useUpdateSpot/useDeleteSpot.
- src/app/components/searchbox/SearchBox.component.tsx — now a real <form>: owns its own input state and the useGeocode mutation internally, and calls a single onLocationFound({lat, lng}) prop on success. The nav bar doesn't need to know how search works, just what it found. Submitting an empty/whitespace-only query is a client-side no-op (no request fired). Input is disabled while a search is pending; a failed search shows an inline error without touching the map. Placeholder/aria-label updated from "spot" to "city" wording, since this searches locations, not spot names.
- src/app/components/spot-check-nav-bar/SpotCheckNav.component.tsx — forwards onLocationFound through to SearchBox.
- src/app/page.tsx — converted to a client component to hold the lifted searchedLocation state (SpotCheckNav and the map are siblings, so this is the nearest common ancestor); passes setSearchedLocation down to the nav and searchedLocation down to the map.
- src/app/components/leaflet/leaflet.tsx — effectiveLocation now prefers searchedLocation over geolocation coords over the DEFAULT_CITY fallback, so an active search drives both the map center and the nearby-spots query (which already refetches on location change from Phase 10 — no changes needed there). New FlyToLocation component (map.flyTo, matching the roadmap's own "flies the map there" language) renders only when a search is active. The existing geolocation "you are here" marker/recenter block is now also gated on !searchedLocation, so a late-resolving real geolocation fix can't silently snap the map back and undo an active search.

Verification Performed

tsc --noEmit and eslint clean project-wide. curl against the real dev server: valid city → 200 with coordinates, empty q → 400, a nonsense query → 404 "No results found". Live-verified in-browser (claude-in-chrome): searching "Tokyo" flies the map there and triggers GET /api/spots?lat=...&lng=... at the new coordinates (confirmed via network tab); searching a nonsense string shows the inline error without moving the map or crashing; submitting an empty query fires no request.

Not Done / Deferred

- No debouncing or request cancellation on rapid repeated searches — out of scope for a single-user learning app; TanStack Query's mutation state naturally resets per new mutate() call, so a slow stale response can't visibly override a newer one's error/success state, but nothing explicitly aborts the in-flight fetch.
- FilterBar.tsx's long-flagged zero-features bug was already fixed back in Phase 9 — nothing new to carry forward from that one.
