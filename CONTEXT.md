# SkateSpot Map

A map-based app for discovering, adding, and saving skateboarding spots.

## Language

**Spot**:
A physical skateboarding location (park, street spot, or DIY build) that can be browsed on the map, added by a User, and saved by other Users.
_Avoid_: Location, place

**User**:
A person with an account in the app — signs in, adds Spots, and saves Spots. The canonical term for the account holder.
_Avoid_: Rider (appears only as flavor text in mock display names, e.g. "Rider Nguyen" — not a modeled concept), Account (emphasizes credentials over the person)

**Sign In**:
The flow by which an existing User authenticates. Federated sign-in (e.g. OAuth) is anticipated but the provider is not yet chosen — treat any specific provider shown in the UI as provisional.

**Create Account**:
The flow by which a new User is registered.

**Saved Spot**:
A Spot a User has bookmarked for their own reference, distinct from the Spot's existence on the map. Shape and visibility rules still being defined.
