# Study Sheet 06 — Handling Map Events in react-leaflet (v5)

Reference for wiring an `onClick`-style handler onto the Leaflet map itself (`src/app/components/leaflet/leaflet.tsx`), confirmed against the actual installed version's types (`node_modules/react-leaflet@5.0.0/lib/hooks.d.ts`), not assumed from memory.

Format for each item: **What** (the problem) · **Why** (the underlying concept) · **Solution** (the fix) · **How to study** (drill it into memory).

Legend: 🧠 = a concept, not just a fix · ⚠️ = a gotcha you'll hit again.

---

## 1. There is no `onClick` prop on `MapContainer`

**What.** Reaching for `<MapContainer onClick={...}>` the way you would on a `<div>` doesn't work.

**Why.** 🧠 Map interactions (click, zoom, drag, move) are native Leaflet events, fired by the underlying `L.Map` instance — not React synthetic DOM events. `react-leaflet` doesn't proxy every Leaflet event onto a matching JSX prop; instead it exposes them through hooks that subscribe directly to the map instance.

**Solution.** Use `useMapEvent` (single event type) or `useMapEvents` (multiple at once), from `react-leaflet`:
```ts
export declare function useMapEvent<T extends keyof LeafletEventHandlerFnMap>(
  type: T,
  handler: LeafletEventHandlerFnMap[T]
): LeafletMap;
```

**How to study.** Whenever something feels like it should be a plain React prop but touches the *map itself* (not a `Marker`, not a `Popup` — the map), suspect a hook is the actual mechanism. `Marker` and `Popup` do accept `eventHandlers` as a prop directly; the map does not.

---

## 2. ⚠️ The hook only works *inside* `MapContainer`'s children

**What.** Calling `useMapEvent(...)` in the same component that renders `<MapContainer>` throws / fails silently — the map instance isn't available there.

**Why.** 🧠 `useMapEvent` internally calls `useMap()`, which reads the current `L.Map` instance off React context. That context provider is `MapContainer` itself — so the context only exists for components rendered *between* `<MapContainer>` and `</MapContainer>`, not for the component holding `<MapContainer>` in its own return statement.

**Solution.** Pull the event-handling logic into its own small child component, and render *that* as a child of `MapContainer`:
```tsx
function MapClickHandler() {
  useMapEvent("click", (e) => {
    // e.latlng.lat, e.latlng.lng
  });
  return null; // registers a listener only — nothing to render
}
```
```tsx
<MapContainer center={...} zoom={13}>
  <TileLayer ... />
  <MapClickHandler />
</MapContainer>
```

**How to study.** This is the same "context only reaches descendants" rule you'll see everywhere in React — a provider's value is invisible to the component that renders the provider, only visible below it. `useMap`/`useMapEvent` are just `react-leaflet`'s version of "read a value from context," so the usual context mental model applies directly.

---

## 3. Returning `null` is a real, intentional pattern

**What.** `MapClickHandler` renders nothing (`return null`) — it exists purely to run a hook.

**Why.** Not every component needs to produce visible markup. Some components' only job is a side effect (subscribing to an event, running an effect) that needs to live at a specific point in the component tree to access the right context.

**Solution / how to study.** Recognize `return null` after a hook call as a legitimate shape, not a bug — you'll see the same pattern again for things like analytics-tracking components or other "invisible" context consumers.

---

## Where this fits

This is Phase 5 territory on the roadmap ("clicking the map opens the add form") — you're currently on Phase 3 (the map itself). Recording the mechanism now, to actually wire up once Phase 5 starts.

## Quick self-test (cover the answers)

1. Why doesn't `<MapContainer onClick={...}>` work the way it would on a `<div>`?
2. Why does `useMapEvent` have to be called from a component rendered *inside* `MapContainer`, not the component that renders `MapContainer` itself?
3. What's `e.latlng` in a Leaflet click handler, and where would that value need to go once you're wiring this into the add-spot flow?
4. Why is a component that only calls a hook and returns `null` a legitimate pattern rather than a mistake?
