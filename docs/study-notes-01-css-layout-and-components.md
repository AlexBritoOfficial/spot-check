# Study Sheet 01 — CSS Modules, Fonts, Color Tokens, Layout & React Props

Reference for the problems solved while building the **SpotCheck nav bar** (Hamburger + title + search pill + Add Spot button).
Format for each item: **What** (the problem) · **Why** (the underlying concept) · **Solution** (the fix) · **How to study** (drill it into memory).

Legend: 🔴 = a bug that cost real time · 🧠 = a concept, not just a fix · ⚠️ = a gotcha you'll hit again.

---

## 1. CSS Modules: how class names map to the `styles` object

**What.** 🔴 Wrote `styles.title.white` and got `undefined`. The CSS had `.title_white` and a compound `.title.gold`, and none of it applied the way I expected.

**Why.** 🧠 A CSS Module import (`import styles from "./X.module.css"`) is a **flat object of strings** — one key per class name, each value a uniquely-hashed class name. So:
- `styles.title` is a *string*, therefore `styles.title.white` is reading a `.white` property off a string → `undefined`.
- A class named `title_white` becomes the key `styles.title_white` (the underscore is part of the identifier).
- A **compound selector** `.title.gold` targets an element that has *both* classes at once. CSS Modules generates two separate keys — `styles.title` **and** `styles.gold` — and the rule only matches if the element carries both.

**Solution.** Prefer **single-purpose classes** over compound selectors:
```css
.white { color: white; }
.gold  { color: var(--color-accent); }
```
```tsx
<span className={styles.white}>SPOT</span>
<span className={styles.gold}>CHECK</span>
```

**How to study.** In a scratch component, `console.log(styles)` and read the actual object. Then try: (a) a hyphenated class name and see what key it becomes, (b) a compound selector and prove to yourself it needs both class strings in `className`.

---

## 2. `next/font` variable fonts: define once, reference everywhere

**What.** Needed the Archivo Black font in multiple components without repeating `archivo_black.variable` on every element.

**Why.** 🧠 The font is configured with `variable: "--font-archivo-black"`. That means `next/font` gives you a **CSS custom property**, not a ready-made font. Two moving parts:
1. `archivo_black.variable` is a *class* that **defines** the CSS variable on whatever element it's placed on (and its descendants).
2. You **consume** it in CSS with `font-family: var(--font-archivo-black)`.

`variable` vs `.className`: `.className` applies the font-family directly to one element; `variable` just exposes the CSS variable so you control application from CSS.

**Solution.** Apply the variable class **once** at the root, then use `var()` anywhere:
```tsx
// layout.tsx
<body className={archivo_black.variable}>{children}</body>
```
```css
.white { font-family: var(--font-archivo-black); }
```

**How to study.** Temporarily remove the variable class from `<body>` and watch every `var(--font-archivo-black)` fall back to the default font. That proves where the variable actually gets defined.

---

## 3. The OKLCH color model

**What.** Needed to read/tweak colors like `oklch(0.32 0.02 260)` and produce a "light grey."

**Why / mental model.** 🧠 `oklch(L C H)`:
- **L** = Lightness, 0–1. Higher = lighter.
- **C** = Chroma (saturation). `0` = grey, higher = more vivid.
- **H** = Hue angle, 0–360°. Rough guide: 0/360 red · 90 yellow · 140 green · 260 blue · 320 magenta.

So `oklch(0.32 0.02 260)` = dark, nearly-grey, faint blue = "dark blue-grey." A light grey = high L, tiny C: `oklch(0.7 0.02 260)`.

**How to study.** Take one token and sweep each channel independently: change only L, then only C, then only H, and name what moved. That isolates what each letter does.

---

## 4. Design tokens (CSS custom properties)

**What.** 🔴 The same gold `oklch(0.78 0.19 85)` was hand-typed across four CSS files. Changing the brand color would mean hunting every file.

**Why.** 🧠 A **token** is a named value defined once and referenced everywhere. `:root` is the top of the document, so variables declared there are available to every component's CSS. Change the definition once → everything updates.

**Solution.**
```css
/* globals.css */
:root {
  --color-accent: oklch(0.78 0.19 85);      /* gold — brand accent */
  --color-bg-nav: oklch(0.21 0.014 260);
  --color-border: oklch(0.32 0.02 260);
  --color-text-muted: oklch(0.7 0.02 260);
  --color-text: white;
}
```
```css
.gold { color: var(--color-accent); }
```
**Naming rule:** name by *role* (`--color-accent`), not appearance (`--color-gold`) — so the name still makes sense if the color changes.

**How to study.** The **verify trick**: flip `--color-accent` to an obvious red, save, and confirm every element using it moves together. If one doesn't, it's still hardcoded. Revert.

---

## 5. `border-radius`: percentage vs px, and the "pill"

**What.** Making a fully-rounded pill (search box + Add Spot button).

**Why.** 🧠 A **percentage** border-radius is relative to the element's own size, so on a wide/short box it becomes a stretched ellipse and shifts as the box resizes. A large **fixed px** value (`9999px`) just clamps to a perfect half-circle on each end at any height.

**Solution.**
```css
.pill { border-radius: 9999px; padding: 10px 20px; }
```
A pill needs **height + horizontal padding** — the curve needs room, and content must stay off the rounded ends.

**How to study.** Build one box, try `border-radius: 50%` then `9999px` at a few widths, and watch when it becomes an ellipse vs a clean pill.

---

## 6. Which element carries the background / focus / text

**What.** 🔴🔴 Several input problems that all traced to *one* root cause plus a few native-input defaults.

**a) The input "turns blue when clicked."**
- **Why.** The `<input>` had **no `className`**, so none of the `.input` CSS reached it — what showed was the browser's **default input** with its native focus ring.
- **Solution.** `<input className={styles.input} />`. Nothing else worked until this was connected.
- ⚠️ **Debugging lesson:** if styles "aren't applying," first confirm the class is actually on the element (inspect the DOM), before touching the CSS.

**b) Removing the focus outline.**
- **Why.** 🧠 The ring is the input's default **focus outline**, targeted by the `:focus` pseudo-class.
- **Solution.**
  ```css
  .input:focus { outline: none; }
  ```
- ⚠️ **Accessibility:** never remove it with nothing in its place — keyboard users rely on it. Prefer **`:focus-visible`** (shows a ring for keyboard focus, not mouse clicks) plus a custom style:
  ```css
  .input:focus-visible { outline: 2px solid var(--color-accent); }
  ```

**c) The caret was invisible.**
- **Why.** The text caret defaults to the element's **text color**. With no `color` set, it was near-black on a dark background.
- **Solution.** Set the text color (caret inherits it) or `caret-color: var(--color-text);` directly.

**d) The caret sat inside the rounded corner.**
- **Why.** Content started at the pill's left edge, inside the `9999px` curve.
- **Solution.** Horizontal **padding** on the wrapper (`padding: 0 16px`) keeps content in the flat middle. Left padding should be ≳ the corner radius (≈ half the height).

**e) The input didn't fill the pill.**
- **Why.** A native `<input>` has a fixed default width and won't grow.
- **Solution.** `flex: 1` on the input (its parent is a flex row).

**How to study.** Rebuild a bare `<input>` with no styles, then add each rule one at a time (class → background → outline → caret → padding → flex) and name what each fixed. Change one thing at a time.

---

## 7. Padding needs units (and the "last property" trap)

**What.** 🔴 `padding: 10 16px;` silently didn't apply top/bottom spacing.

**Why.** 🧠 Any non-zero CSS length **requires a unit**. `10` (unitless) is invalid, so the browser throws out the **entire** `padding` declaration. Related: a missing semicolon on the *last* property in a block "works" until you add a line after it, which then gets swallowed.

**Solution.** `padding: 10px 16px;` and always end declarations with `;`.

**How to study.** Open DevTools → the invalid declaration shows struck-through/ignored. Get used to scanning for that.

---

## 8. `padding` vs `gap` (space at edges vs space between)

**What.** Icon and input text were too close.

**Why.** 🧠 **`padding`** = space *inside* an element's edges. **`gap`** = space *between* flex/grid children. Different jobs.

**Solution.** `gap: 8px;` on the flex wrapper spaces the icon from the input; `padding` keeps both off the pill's rounded ends.

**How to study.** In one flex container with two children, toggle `gap` vs `padding` and watch which spacing each controls.

---

## 9. Icons: `<img>` vs inline SVG vs icon library

**What.** Adding the search icon.

**Why / options.** 🧠
- `<img src=".svg">` — works, but **can't recolor with CSS** and adds a request. Bad for UI icons.
- Inline `<svg>` — recolors via `currentColor`, no request, but verbose markup.
- **Icon library** (chose `lucide-react`) — clean component, tree-shakeable, easy sizing/color.

**Solution.**
```tsx
import { Search } from "lucide-react";
<Search className={styles.icon} />
```

**How to study.** Note *why* the library won over `<img>`: recoloring + no extra request. That trade-off recurs for every icon decision.

---

## 10. ⚠️ `var()` does NOT work in SVG presentation attributes

**What.** 🔴 `<Search color="var(--color-text-muted)" />` didn't apply the color.

**Why.** 🧠 lucide's `color` prop becomes an SVG **attribute** (`stroke="var(...)"`). CSS custom properties (`var()`) only resolve inside **CSS property values**, never inside raw XML/SVG presentation attributes. So the attribute stays a literal, unresolved string.

**Solution.** Let the icon use its default `currentColor` and drive it from CSS:
```tsx
<Search className={styles.icon} />
```
```css
.icon { color: var(--color-text-muted); }
```
lucide's stroke defaults to `currentColor`, so it inherits the CSS `color`.

**How to study.** Remember the rule as a one-liner: **"`var()` lives in CSS, not in attributes."** This bites with any SVG library.

---

## 11. React props: passing, receiving, rendering, typing

**What.** 🔴 `<button>name</button>` rendered the literal text "name".

**Why.** 🧠 Bare text in JSX is a string. To evaluate JavaScript (a variable, a prop), wrap it in **braces**: `{name}`. The full loop:
- **Pass** (parent): `<Button name="Add Spot" />` — like an HTML attribute.
- **Receive** (child): `function Button({ name }: ButtonProps)` — destructure from the props object.
- **Render**: `{name}`.

**Typing (because it's `.tsx`).** Untyped props are implicitly `any`. Describe the shape:
```tsx
type ButtonProps = { name: string };
function Button({ name }: ButtonProps) { ... }
```
A required prop makes TypeScript warn if a caller forgets it.

**How to study.** Build a tiny component that takes two props and renders both. Deliberately (a) forget the braces, (b) forget the type, and read each error.

---

## 12. Layout: shrink-to-fit and "push to the far right"

**a) A `<div>` stretches full width.**
- **Why.** 🧠 `<div>` is **block-level** — fills 100% of its parent regardless of content.
- **Solution.** `width: fit-content;` or `display: inline-block;` to hug content. (Also: ask whether the wrapper is even needed — a `<button>` is already content-sized.)

**b) Push the Add Spot button to the far right.**
- **Why.** 🧠 Horizontal position is decided by the **parent's** layout, not the element itself.
- **Solutions (flex):**
  - `margin-left: auto` on the last item — it eats the leftover space to its left.
  - `justify-content: flex-end` on the parent — pushes everything right.
  - `justify-content: space-between` — splits children to both ends.
- **Chosen pattern — grouping:** wrap the left items in a `.leftGroup`, so the nav has two children (group + button) and `space-between` splits them. Keeps the reusable `<Button>` free of nav-specific positioning; move `gap` onto `.leftGroup`.
  ```tsx
  <div className={styles.div}>            {/* justify-content: space-between */}
    <div className={styles.leftGroup}>    {/* display:flex; gap:16px */}
      <HamburgerButton /> <Title/> <SearchBox/>
    </div>
    <Button name="Add Spot" />
  </div>
  ```

**How to study.** Recreate a nav with three left items + one right item, and solve it three ways (auto-margin, flex-end, grouping+space-between). Note why grouping keeps the reusable component clean.

---

## Cross-cutting debugging principles (the meta-lessons)

1. **"Styles not applying?" → check the class is on the element first**, before editing CSS. (Item 6a)
2. **Change one thing at a time** so you know what fixed it.
3. **Invalid CSS is dropped silently** — DevTools shows the struck-through rule. (Item 7)
4. **Know which element owns a property** — background, text color, caret, focus all live on specific elements. (Item 6)
5. **`var()` is CSS-only** — never in SVG/HTML attributes. (Item 10)
6. **Name things by role, not appearance** — tokens, and ideally class names too. (Item 4)

---

## Quick self-test (cover the answers)

1. Why is `styles.title.white` always `undefined`?
2. What does the `variable` font option give you, and where must its class be applied?
3. In `oklch(0.7 0.02 260)`, which number makes it lighter? Which makes it greyer?
4. Why did the input show a blue ring even though `.input:focus { outline: none }` existed?
5. Why did `padding: 10 16px` do nothing?
6. Difference between `padding` and `gap`?
7. Why didn't `color="var(--color-text-muted)"` work on the lucide icon?
8. Three ways to push one flex item to the far right — and why is grouping the cleanest here?
9. Why name a token `--color-accent` instead of `--color-gold`?
