# Framer Plugin UI — Design & Development Spec
> Drop this file at the project root as `CURSOR.md` or `CLAUDE.md`.
> This is the single source of truth for all UI decisions. Do not deviate.

---

## 1. Context

This is a **Framer Plugin** — a sandboxed React app running inside an iframe panel within the Framer editor.

- The iframe is injected into Framer's native dark UI chrome
- The panel must feel like a native Framer tool, not a foreign app
- Framer's own requirement: *"Follow Framer's design language whenever possible"*
- Plugins that feel visually inconsistent with the host environment are rejected at review

The goal is **invisible integration**: a user should open this plugin and feel like it was built by Framer.

---

## 2. Environment Constraints

| Constraint | Value |
|---|---|
| Panel width | 240–300px (fixed) |
| Panel height | Variable, scrollable |
| Color scheme | Dark only (primary). Light mode support is required for marketplace submission. |
| Host font | Inter (Framer injects it — use it) |
| Iframe sandbox | No access to the Framer canvas DOM. All canvas interaction via `framer` SDK only. |
| External npm | No new packages without explicit approval. See §9. |

---

## 3. Allowed Tech Stack

```
React + TypeScript        — UI layer
CSS Modules               — Styling (scoped per component, no global leakage)
framer-plugin SDK         — All canvas/editor interaction
Radix UI primitives       — Accessible headless components only (no styling layer)
SVG icons inline          — No icon fonts, no Lucide, no Heroicons
```

**Explicitly forbidden:**
- Tailwind CSS
- shadcn/ui
- Any pre-styled component library (Chakra, MUI, Ant Design, etc.)
- Bootstrap
- Inline `style` objects for anything other than dynamic values
- `!important` anywhere

---

## 4. Color System

### Dark Mode (default)

Define all colors as CSS custom properties in `global.css`. Never hardcode hex values in components.

```css
:root {
  /* Backgrounds */
  --bg-base:        #1a1a1a;   /* Panel root background */
  --bg-elevated:    #232323;   /* Cards, sections, grouped inputs */
  --bg-hover:       #2a2a2a;   /* Interactive element hover state */
  --bg-active:      #313131;   /* Pressed / active state */
  --bg-input:       #141414;   /* Text inputs, selects, textareas */

  /* Borders */
  --border-subtle:  rgba(255, 255, 255, 0.06);  /* Dividers, card edges */
  --border-default: rgba(255, 255, 255, 0.10);  /* Input borders, panel sections */
  --border-focus:   rgba(255, 255, 255, 0.25);  /* Focused inputs */

  /* Text */
  --text-primary:   #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.55);  /* Labels, descriptions */
  --text-tertiary:  rgba(255, 255, 255, 0.30);  /* Placeholders, disabled */
  --text-link:      #0099ff;                     /* Framer Blue — actions, links */

  /* Accents */
  --accent-blue:    #0099ff;   /* Framer's primary blue — primary CTA only */
  --accent-blue-hover: #1aa3ff;
  --accent-blue-bg: rgba(0, 153, 255, 0.12); /* Blue tint backgrounds */

  /* States */
  --state-error:    #ff4d4d;
  --state-success:  #2dca72;
  --state-warning:  #ffaa00;

  /* Misc */
  --scrollbar-thumb: rgba(255, 255, 255, 0.12);
}
```

### Light Mode

```css
@media (prefers-color-scheme: light) {
  :root {
    --bg-base:        #f5f5f5;
    --bg-elevated:    #ffffff;
    --bg-hover:       #ebebeb;
    --bg-active:      #e0e0e0;
    --bg-input:       #ffffff;

    --border-subtle:  rgba(0, 0, 0, 0.06);
    --border-default: rgba(0, 0, 0, 0.12);
    --border-focus:   rgba(0, 0, 0, 0.30);

    --text-primary:   #111111;
    --text-secondary: rgba(0, 0, 0, 0.55);
    --text-tertiary:  rgba(0, 0, 0, 0.30);
    --text-link:      #0055ff;

    --accent-blue:    #0055ff;
    --accent-blue-hover: #1166ff;
    --accent-blue-bg: rgba(0, 85, 255, 0.08);

    --scrollbar-thumb: rgba(0, 0, 0, 0.12);
  }
}
```

> Always build dark mode first. Light mode is a requirement for marketplace submission but secondary in visual priority.

---

## 5. Typography

```css
:root {
  --font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;

  /* Scale */
  --text-xs:    11px;  /* Captions, badges */
  --text-sm:    12px;  /* Labels, descriptions, secondary content */
  --text-base:  13px;  /* Body, input values, default text */
  --text-md:    14px;  /* Section headers, emphasized labels */

  /* Weight */
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-semibold: 600;

  /* Line height */
  --leading-tight:  1.2;
  --leading-normal: 1.4;
  --leading-loose:  1.6;
}
```

**Rules:**
- Default body text: `var(--text-base)` / `var(--weight-regular)` / `var(--text-primary)`
- Section labels: `var(--text-sm)` / `var(--weight-medium)` / `var(--text-secondary)` / uppercase with `letter-spacing: 0.04em`
- Input values: `var(--text-base)` / `var(--weight-regular)`
- Buttons (primary): `var(--text-sm)` / `var(--weight-medium)`
- Never exceed `var(--text-md)` inside the plugin panel
- Never use font-weight above 600 inside the panel

---

## 6. Spacing & Layout

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
}
```

**Panel structure:**

```
[Panel root — padding: 12px]
  [Section — padding: 0 0 16px 0]
    [Section label — margin-bottom: 8px]
    [Control row — height: 28px, margin-bottom: 4px]
    [Control row]
  [Divider]
  [Section]
  [Footer / CTA — padding-top: 12px]
```

- All interactive controls (inputs, selects, buttons, toggles): height `28px`
- Row gaps between controls: `4px`
- Section gaps: `16px`
- Panel horizontal padding: `12px` on each side
- No control should ever be full-width with more than 12px padding — it will feel bloated

---

## 7. Component Anatomy

### Input / Text Field
```css
.input {
  height: 28px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  padding: 0 8px;
  font-size: var(--text-base);
  color: var(--text-primary);
  width: 100%;
  outline: none;
  transition: border-color 120ms ease;
}

.input:focus {
  border-color: var(--border-focus);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

### Button — Primary
```css
.button-primary {
  height: 28px;
  background: var(--accent-blue);
  border: none;
  border-radius: 6px;
  padding: 0 12px;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: #ffffff;
  cursor: pointer;
  transition: background 120ms ease, opacity 120ms ease;
  white-space: nowrap;
}

.button-primary:hover {
  background: var(--accent-blue-hover);
}

.button-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

### Button — Secondary / Ghost
```css
.button-secondary {
  height: 28px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  padding: 0 10px;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  cursor: pointer;
  transition: background 120ms ease;
}

.button-secondary:hover {
  background: var(--bg-hover);
}
```

### Select / Dropdown
```css
.select {
  height: 28px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  padding: 0 8px;
  font-size: var(--text-base);
  color: var(--text-primary);
  appearance: none;
  cursor: pointer;
}
```
Use Radix `Select` primitive with custom trigger styled as above.

### Label Row (label + control inline)
```
[Row — display: flex, align-items: center, height: 28px, gap: 8px]
  [Label — flex: 1, font-size: 12px, color: secondary, truncate]
  [Control — flex: 0 0 auto, or flex: 1 with max-width]
```

### Section Header
```css
.section-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}
```

### Divider
```css
.divider {
  height: 1px;
  background: var(--border-subtle);
  margin: var(--space-4) 0;
}
```

### Toggle / Checkbox
- Use Radix `Switch` or `Checkbox` primitives
- Checked state: `var(--accent-blue)` fill
- Size: 28px height row, toggle itself ~14x8px (pill) or 14x14px (checkbox)

### Badge / Tag
```css
.badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}
```

---

## 8. Motion & Interaction

Framer's own UI uses tight, fast micro-interactions. Match that pace.

```css
:root {
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
}
```

- Hover state transitions: `var(--transition-fast)` on `background`, `border-color`, `color`
- No `transform` or `scale` on hover for controls — Framer's UI doesn't do this
- Panel-level transitions (view changes, panels sliding in): `var(--transition-base)`
- Never use `transition: all` — always target specific properties
- No bounce easings, no spring effects inside the plugin UI

---

## 9. Icons

- Use SVG icons only — inline, not as a font or sprite sheet
- Preferred size: `16x16` at `1x`, paths at `24x24` viewBox reduced with `width="16" height="16"`
- Stroke weight: `1.5px` for outline icons (matches Framer's inspector icons)
- Color: inherit via `currentColor` — never hardcode fill/stroke hex in the SVG
- No icon libraries unless they output clean inline SVG with `currentColor`

---

## 10. Scrolling

```css
.scrollable {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

.scrollable::-webkit-scrollbar {
  width: 4px;
}

.scrollable::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}

.scrollable::-webkit-scrollbar-track {
  background: transparent;
}
```

---

## 11. SDK & Canvas Access Rules

```
All canvas interaction → framer SDK only
No direct DOM manipulation of the host canvas
No window.parent access
No postMessage to the host except through the SDK

Async reads:
  const selection = await framer.getSelection()
  // Always await. Never assume selection state.

Writing to canvas:
  await framer.addFrameToCanvas({ ... })
  // Always handle errors. Canvas writes can fail silently.
```

**State management:** `useState` + `useEffect` only. No Zustand, Jotai, or Redux unless the plugin complexity explicitly warrants it — ask before adding.

---

## 12. File Structure

```
src/
  components/
    Button/
      Button.tsx
      Button.module.css
    Input/
      Input.tsx
      Input.module.css
    [Component]/
  screens/
    Main.tsx       ← default view
    [SubView].tsx
  styles/
    global.css     ← CSS custom properties (§4, §5, §6)
    reset.css      ← Minimal box-model reset only
  hooks/
    useSelection.ts
    useFramerMode.ts
  main.tsx
  App.tsx
```

---

## 13. Anti-patterns — Never Do These

| Anti-pattern | Why |
|---|---|
| `border-radius > 8px` on controls | Looks out of place in Framer's tight inspector UI |
| Box shadows on inputs or panels | Framer's UI is flat — shadows feel alien |
| Gradients on UI chrome | Reserve for data visualization only |
| Font sizes above 14px | The panel is small; large text breaks hierarchy |
| Full-width primary button spanning 100% | Looks like a generic web app, not an IDE tool |
| Animations on mount (slide in, fade in) | Framer panels appear instantly — animate sparingly |
| Colored backgrounds other than accent-blue | Keep the palette minimal and dark |
| Heroicons, Lucide, or any icon font | Use inline SVG with currentColor only |
| `console.log` left in production code | Clean the code before committing |
| Hardcoded hex values in components | Always use CSS custom properties from §4 |

---

## 14. Accessibility

- All interactive elements must be keyboard navigable
- Focus rings: `outline: 2px solid var(--border-focus); outline-offset: 2px` — never `outline: none` without a custom focus style
- Minimum contrast ratio: 4.5:1 for body text against background (WCAG AA)
- All icons that carry meaning must have `aria-label` or accompany visible text
- Use semantic HTML: `<button>` for actions, `<label>` paired with inputs, `<section>` for grouped content

---

## 15. Framer Marketplace Requirements (Shipping Checklist)

Pulled directly from [framer.com/plugin-requirements](https://www.framer.com/plugin-requirements):

- [ ] Plugin UI is in English
- [ ] Supports both light and dark mode
- [ ] Uses Framer's design language (this document)
- [ ] Loads fast — no blocking renders, no heavy initial bundle
- [ ] No ads or unrelated promotions anywhere in the UI
- [ ] Plugin icon is 30x30px SVG
- [ ] All features described in the listing actually work
- [ ] Authentication flows include a logout option via Menu API
- [ ] No direct DOM manipulation of the host
- [ ] Code is clean, modular, and documented

---

## Sources

- Framer Plugin Requirements: https://www.framer.com/plugin-requirements
- Framer Brand Guidelines: https://www.framer.com/brand
- Framer Developer Docs: https://www.framer.com/developers/plugins-introduction
- Framer Official Plugin Examples: https://github.com/framer/plugins
