# Study Sheet 04 — The Configurable Component Pattern (Props Over Duplication)

Reference for the architectural pattern used while building `Button` and `Badge` — collapsing what was on track to become several near-identical one-off components into a small number of reusable ones, driven by typed props.

Format for each item: **What** (the problem) · **Why** (the underlying concept) · **Solution** (the fix) · **How to study** (drill it into memory).

Legend: 🧠 = a concept, not just a fix · ⚠️ = a gotcha you'll hit again.

---

## 1. The core problem: component sprawl

**What.** Before this pattern, `AddNewSpotButton` existed as its own component, and Save / Cancel / Directions / Edit / Reviews were all on track to become more of the same — a new file per button, each one a near-copy of the last.

**Why.** 🧠 Every one-off component like that duplicates markup and CSS that's ~95% identical (same box, same cursor, same font) for a difference that's actually tiny (the label, the fill color, how much space it takes up). That's the same "hand-typed value repeated everywhere" problem as un-tokenized colors (Sheet 01, Item 4) — just one level up, at the *component* scale instead of the *CSS value* scale. A design tweak ("make outline buttons' border thinner") would mean hunting down every button file instead of editing one place.

**Solution.** Collapse the whole family into one component plus a small, typed prop that selects between the few things that actually differ.

**How to study.** List every button/badge you know you'll need (Add Spot, Save, Cancel, Directions, Edit, Reviews / type badge, 4 difficulty badges) and write two columns: what's identical across all of them (box shape, radius, font, cursor) and what's different (color, label, proportion). The identical column is what the shared component owns. The different column is what becomes a prop.

---

## 2. Identity props vs. layout props

**What.** `Button` ended up with two props that look similar but do very different jobs: `variant` (`"primary" | "outline"`) and `grow` (a number).

**Why.** 🧠 `variant` answers *"what kind of thing is this, visually"* — that's part of the button's own identity, so it lives as a CSS Module class (`.primary`, `.outline`). `grow` answers *"how much space should this instance take up in this particular row"* — that's not identity, it's a relationship between siblings, decided by whoever is placing the button (`actionRow` gives Save more room than Cancel). Baking `grow` into a CSS class would mean inventing a new "variant" for every possible width ratio, which isn't a kind of button at all.

**Solution.** `variant` selects a class from the module CSS. `grow` is applied as an inline `style={{ flex: grow }}`, set per call site: `grow={1.3}` for Save, `grow={1}` for Cancel.

**How to study.** For any new prop on a shared component, ask: *"if I pulled this component out of its current parent and dropped it somewhere else, would this prop still make sense?"* `variant` survives that move — a primary button is still primary anywhere. `grow` doesn't — flex-grow means nothing outside a flex parent. That's the tell for identity vs. layout.

---

## 3. Deriving instead of duplicating (Badge's dictionary)

**What.** `Badge`'s difficulty color went through several shapes — first a raw `color: string` prop, then a typed `color: ColorVariant` prop passed *alongside* `level`, before landing on computing `color` internally from `level`.

**Why.** 🧠 Passing both `level` and `color` as separate props creates two sources of truth that have to agree with each other. Nothing stops a caller from passing `level="beginner"` with `color="red"` — TypeScript checks each prop's type independently, not whether they're consistent with one another.

**Solution.** One `Record<Difficulty, ColorVariant>` lookup, defined once, keyed by the actual domain value:
```ts
const difficultyColor: Record<Difficulty, ColorVariant> = {
  beginner: "green",
  intermediate: "gold",
  advanced: "orange",
  pro: "red",
};
```
`color` is computed inside the component (`difficultyColor[level]`) — never accepted as a prop from outside. Bonus: `Record<Difficulty, X>` forces every `Difficulty` value to have an entry, so adding a new difficulty later without updating the map is a **compile error**, not a silently-missing color at runtime.

**How to study.** Whenever a component has two props that always have to move together (one implies the other), that's the signal one of them shouldn't be a prop at all — it should be computed from the other via a lookup table, defined in exactly one place.

---

## 4. Reusing domain types instead of bare strings

**What.** `Badge`'s `level` prop uses `Difficulty` (from `src/types/spot.ts`), not `string`.

**Why.** 🧠 A bare `string` prop accepts anything — including a typo like `"Beginner"` vs `"beginner"` — that TypeScript can't catch and that would silently fail to match the `difficultyColor` dictionary at runtime (`difficultyColor["Beginner"]` → `undefined`, no error, just a broken badge). Reusing the domain type gets autocomplete at every call site and a compile error the moment an unsupported value is passed.

**Solution.** `level?: Difficulty` instead of `level?: string`.

**How to study.** Before typing a new prop as `string`, check whether a matching union type already exists in `src/types/`. If the value is meant to be one of a known, closed set, it should almost never be a bare `string`.

---

## 5. Optional props as the "one component, multiple roles" switch

**What.** `Badge` needed to serve two different jobs — a plain type badge and a color-coded difficulty badge — without becoming two components.

**Why.** 🧠 The two only differ in one respect: does the text get a level-driven color, or the plain default color. The box CSS itself (padding, radius, border, background) is identical between them. Forcing two separate components would duplicate that shared box styling for no real reason.

**Solution.** Make `level` **optional** (`level?: Difficulty`). Its *presence* decides which role the badge is playing — passed → colored via the dictionary; omitted → falls through to the shared class's own neutral default text color (`color: var(--color-text-form-fields)`).

**How to study.** When two "variants" of a UI piece differ in only one small, optional piece of information — not structure — reach for an optional prop before reaching for a second component or a pair of booleans.

---

## 6. ⚠️ When *not* to do this — the honest limit

**What.** This pattern only worked because, in both `Button` and `Badge`, the *only* things that ever differed between instances were small: a class selection, a number, a color.

**Why.** If two "variants" actually need different DOM structure, different children, or meaningfully different behavior, cramming them into one component via props usually produces a tangle of conditionals — a "prop soup" component that's harder to read than two small, separate components would have been.

**Solution / how to study.** Ask: *"does this only change how it looks, or does it change what it structurally is?"* `Button` and `Badge` both stayed in the first category the entire time — same tag, same children shape, only classes/text/a number varying. The moment you'd need something like `if (variant === "x") return <CompletelyDifferentMarkup />` inside one of these, that's the signal to split it back into two components instead of adding another branch.

---

## Quick self-test (cover the answers)

1. Why does `grow` live as an inline style instead of becoming another `Button` variant?
2. What's wrong with a component that accepts both `level` and `color` as separate, individually well-typed, required props?
3. Why does `Record<Difficulty, ColorVariant>` catch a missing-case bug at compile time that a `switch` with no `default` wouldn't?
4. What made `level` a good candidate for an *optional* prop, rather than splitting `Badge` into two components?
5. What's the actual tell that a component should be split into two instead of gaining another `variant` option?
