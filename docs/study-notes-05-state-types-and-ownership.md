# Study Sheet 05 — Today's Concepts (What / How / Why)

Everything hit while wrapping up `NewSpotCard`, building `SpotDetailCard` (`Badge`, `Indicator`, `StarRating`), and building the filter bar (`ChipGroup`, `FilterBar`). Sheet 03 and Sheet 04 go deeper on two of these (custom `<select>` styling, and the configurable-component pattern generally) — this sheet is the compact, whole-day version of everything, in one format.

---

### 1. Custom `<select>` styling

**The What.** Making a native `<select>` dropdown match a dark custom design instead of the browser's default box-and-arrow.

**The How.** `appearance: none` strips all native chrome, including the arrow. A `background-image` (a small SVG chevron, embedded as a data URI) draws a replacement arrow back in, positioned with `background-position`/`background-repeat`. Extra `padding-right` keeps the option text clear of it.

**The Why.** A `<select>` is a "replaced element" — you can't put a `<span>` or `::after` inside it to fake an arrow, because the browser renders its whole box as one opaque widget. `background-image` is the one styling channel still open once the native chrome is gone, so it's the standard trick. *(Full writeup: Sheet 03.)*

---

### 2. `Record<K, V>` as an exhaustive lookup table

**The What.** A TypeScript utility type that describes an object required to have exactly one value for every key in a given type — e.g. `Record<Difficulty, ColorVariant>` used in `Badge` to map each difficulty level to its color.

**The How.** `const difficultyColor: Record<Difficulty, ColorVariant> = { beginner: "green", intermediate: "gold", advanced: "orange", pro: "red" };` — then look up a value with bracket notation: `difficultyColor[level]`.

**The Why.** Type safety on *both* sides at once: TypeScript forces every key of `Difficulty` to have an entry (miss one and it's a compile error, not a silently-missing color at runtime), and `difficultyColor[level]` is guaranteed to return a valid `ColorVariant`, not `undefined`. A plain object or a `switch` with no `default` gives you neither guarantee.

---

### 3. Optional props for "one component, multiple roles"

**The What.** Making a prop optional (`level?: Difficulty`) so a single component can serve two different jobs, distinguished by whether that prop is present.

**The How.** `Badge`'s `level` prop being optional is what let it render both the plain type badge (`<Badge label="PARK" />`, no `level`) and the color-coded difficulty badge (`<Badge label="BEGINNER" level="beginner" />`) — presence/absence of `level` is the switch.

**The Why.** The two badges are identical in every way except one small, sometimes-absent piece of data (does this get a level-driven color, or the default color). Splitting that into two separate components would duplicate the box styling for no reason; a pair of required booleans would be clunkier than one prop whose presence already carries the meaning.

---

### 4. Deriving a value instead of accepting it as a separate prop

**The What.** Computing a value *inside* a component from another prop, instead of accepting both as independent props that the caller has to keep in sync.

**The How.** `Badge` went through a `color: string` prop, then a typed `color: ColorVariant` prop passed *alongside* `level`, before landing on `const color = difficultyColor[level];` — computed internally, never accepted from outside.

**The Why.** Two props that always have to agree (`level="beginner"` should always imply `color="green"`) are two sources of truth. TypeScript checks each prop's type independently, not whether they're consistent with each other — so a mismatched pair (`level="beginner"`, `color="red"`) would type-check fine and just be wrong. Deriving one from the other removes the possibility entirely.

---

### 5. Computed CSS Modules class lookup (`styles[variable]`)

**The What.** Picking a CSS Modules class at runtime using a variable, instead of a hardcoded `styles.someName`.

**The How.** `styles.color` is a hardcoded lookup (always the same key). `styles[color]` is a *computed* lookup — `color` holds a string value (`"green"`, `"gold"`...) at runtime, and `styles[color]` reads whichever class that string names. Requires the variable's possible values to exactly match real class names in the CSS module (`.green`, `.gold`, `.orange`, `.red`).

**The Why.** This is what makes the `Record` dictionary from Item 2 actually reach the screen — `difficultyColor[level]` picks the *name*, `styles[thatName]` turns the name into an actual class. Break the naming match (e.g. classes named by level instead of by color, while the variable holds a color) and the lookup silently returns `undefined` — this was the exact bug hit partway through building `Badge`.

---

### 6. Descendant selectors for state-driven styling

**The What.** Putting a state class (`.confirmed` / `.unconfirmed`) on a *parent* element, and styling its children through descendant selectors (`.confirmed .circle`, `.confirmed .label`), rather than putting the state class directly on each child.

**The How.** `Indicator`'s root `<div>` gets `className={`${styles.root} ${indicator.className}`}` (`.confirmed` or `.unconfirmed`); the CSS then reads `.confirmed .circle { background: ...; }` and `.confirmed .label { color: ...; }` — one state class, two children styled differently from it.

**The Why.** The circle and the label need *different* CSS properties for the same state (the circle needs `background`/`border`, the label needs `color`) — applying one raw class directly to both would leak properties across (a `background` meant for the circle would paint an unwanted box behind the label's text). Attaching the state to the shared parent and reaching down via descendant selectors keeps each state defined in exactly one place while still styling multiple children correctly.

---

### 7. Identity props vs. layout props

**The What.** Two categories of prop that look similar but serve different jobs: props that describe what a component *is* (identity), and props that describe how it behaves *in its current parent* (layout).

**The How.** `Button`'s `variant` (`"primary" | "outline"`) is identity — it selects a CSS Modules class, because "primary" means the same thing everywhere. `Button`'s `grow` (a number) is layout — it's applied as an inline `style={{ flex: grow }}`, because flex-grow only means something relative to sibling elements in a specific flex row.

**The Why.** The test: *"if I moved this component to a different parent, would this prop still make sense?"* Identity survives the move (a primary button is still primary anywhere); layout doesn't (flex-grow is meaningless outside a flex container). Identity belongs in the component's own CSS; layout belongs to whoever is placing it. *(Full writeup: Sheet 04, Item 2.)*

---

### 8. Generic components (`<T extends string>`)

**The What.** A component whose prop types aren't fixed — they're parameterized, so the same component works with different specific types while TypeScript still checks each usage correctly.

**The How.** `function ChipGroup<T extends string>({ name, options }: ChipGroupProps<T>)` — `T` is a placeholder type, constrained to "must be some kind of string." Calling `<ChipGroup options={spotTypes} />` (a `SpotType[]`) or `<ChipGroup options={features} />` (a `Feature[]`) both type-check, with TypeScript inferring `T` as `SpotType` or `Feature` respectively at each call site.

**The Why.** Without generics, `ChipGroup` would need `options: string[]` (loses the domain typing entirely — no autocomplete, typos allowed) or two near-identical components, one typed for `SpotType[]` and one for `Feature[]` (duplication again). Generics let one component stay strictly typed against *whatever* specific union it's handed, without knowing in advance which one that'll be.

---

### 9. Native checkbox + `:has()` for interactivity with zero JS state

**The What.** Getting a visually-toggleable UI element (a filter chip that turns "on"/gold when clicked) without writing any `useState`, `onClick`, or event handler.

**The How.** Each chip is a `<label>` wrapping a visually-hidden `<input type="checkbox">`. The browser handles checked/unchecked natively on click — no JS involved. CSS reads that native state via the `:has()` pseudo-class: `.pill:has(input:checked) { background: var(--color-accent); ... }`.

**The Why.** This project's build order is deliberately "static markup first, real interactivity later" — but a filter chip that visually does nothing when clicked would be a worse placeholder than one that toggles for free. `:has()` lets the *browser's own* input state drive the visual change, so the chip genuinely responds to clicks while the component still has zero React state — consistent with the project's stage, without looking broken.

---

### 10. Choosing the right HTML element for plain text

**The What.** Deciding what tag to wrap non-interactive display text in — a name, a distance readout, a badge label.

**The How.** Default to `<span>` for short inline text with no other semantic role (e.g. the `0.4 mi` distance next to a spot's name). Avoid `<label>` for anything that isn't paired with a form control — `SpotDetailCard`'s name field currently uses `<label>`, which is a lingering mismatch (a card heading isn't a form label). `<h3>` would fit that role better. There's also a stricter option, `<data value="0.4">0.4 mi</data>`, for when the value needs to be machine-readable, not just displayed — generally overkill unless something is actually going to read that value.

**The Why.** Semantic HTML isn't just style — `<label>` carries real behavior (clicking it focuses/activates an associated form control), which is wrong to imply on something that isn't one. `<span>` carries no implied behavior at all, which is exactly right for "this is just text."
