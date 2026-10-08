# SkateSpot Map

A map-based app for discovering, adding, and saving skateboarding spots.

## Language

**Spot**:
A physical skateboarding location (park, street spot, or DIY build) that can be browsed on the map, optionally owned by the User who added it (see **Owner**, nullable — signed-out contributions are allowed and stay ownerless), with its own `isPublic` visibility (defaults `true`; an Owner may mark their own Spot private — still rendered as a map pin, in a distinct color, but visible only to them), and bookmarked by other Users (see **Bookmark**).
_Avoid_: Location, place

**User**:
A person with an account in the app — signs in, adds Spots, and saves Spots. The canonical term for the account holder.
_Avoid_: Rider (appears only as flavor text in mock display names, e.g. "Rider Nguyen" — not a modeled concept), Account (emphasizes credentials over the person)

**Sign In**:
The flow by which an existing User authenticates. Federated sign-in (e.g. OAuth) is anticipated but the provider is not yet chosen — treat any specific provider shown in the UI as provisional.

**Create Account**:
The flow by which a new User is registered.

**Owner**:
The User who created a Spot, recorded on the Spot itself via `ownerId`. Set only when the creating User was signed in — a Spot created while signed out has no owner. Distinct from **Bookmark**: owning a Spot and bookmarking one are different relationships, and a User's own Spots are never implicitly bookmarked — they end up on the User's Bookmarks page by a separate rule (see **Bookmark**).

**Bookmark**:
A Spot a User has saved for their own reference that they do *not* own — a join-entity, `{ spotId, savedAt }`, rather than a copy of the Spot or a bare ID. `isPublic` lives on `Spot` itself, not here (a Bookmark is never about the Spot's own visibility). Creating a Bookmark requires the User to be signed in — unlike a Spot, which may be created while signed out (see **Owner**); there is no anonymous Bookmark.
The User-facing "Bookmarks" page shows this stored list *combined* with a live filter of the User's own private Spots (`ownerId` = them, `isPublic = false`) — the private Spots are never written into the stored Bookmark list itself, just displayed alongside it, so there's nothing to keep in sync when a Spot's visibility changes later.
_Avoid_: "Saved Spot" (earlier name for this term — renamed because it collided with the "Save Spot" button, which creates a Spot and has nothing to do with bookmarking); using Bookmark to mean "a Spot I created" — that's Owner.
