---
title: Stream Bunny · Paper Design Brief
owner: Jay Nadeau / Stōkt
last-updated: 2026-05-08
typefaces:
  - Geist Sans
  - Geist Mono
---

This brief is the visual direction for designing the Stream Bunny landing page in Paper.
Design system foundation: shadcn component patterns, customized to Stōkt’s orange-on-black attitude.
Copy source of truth: `marketing/landing-copy.md` (no lorem ipsum).

---

## 1) Brand foundation

### Voice (non-negotiable)
Use `marketing/voice-guidelines.md` as the baseline. Summary rules:
- Short sentences.
- Confident, slightly cocky. Not cringe.
- Specific beats vague. Name the parts: **Player + Controls**, HLS, inserts, templates.
- Say “drop.” Never “leverage” / “supercharge” / “next level.”
- Say “iframe ceiling.”
- Price is a line item: **$49 once · lifetime updates**.
- Open source stays visible (GitHub link belongs on the page).

### Visual mood
- Orange on black. Bold. Raw. Editorial.
- “Poster energy” meets “product UI.” Think: a studio site that happens to convert.
- References (tone only):
  - A24 poster energy (type-led, confident negative space)
  - Linear editorial blocks (clean structure, strong hierarchy)
  - Vercel confidence (product-forward, crisp UI)
  - Resend directness (copy-first, no fluff)
- Hard no:
  - Stock 3D blobs
  - Gradient mesh heroes
  - Generic SaaS hero illustrations
  - Stock photography

---

## 2) Color tokens

Use these tokens as Paper styles. Default background is true black.

### Required tokens (exact)
- **`bg/canvas`**: `#000000`
  - **Usage**: Page background, full-bleed bands.
  - **Contrast**: Pair with `text/primary` for maximum contrast.

- **`bg/surface`**: `#0A0A0A`
  - **Usage**: Cards, panels, nav background when sticky.
  - **Contrast**: Body text should be `text/primary` or `text/secondary`.

- **`bg/elevated`**: `#141414`
  - **Usage**: Hovered cards, active surfaces, subtle lift.
  - **Contrast**: Keep borders subtle; avoid bright outlines everywhere.

- **`border/subtle`**: `#1F1F1F`
  - **Usage**: Hairline separators, dividers, table-ish rows.
  - **Contrast**: Must remain subtle on `bg/surface`.

- **`border/default`**: `#2A2A2A`
  - **Usage**: Card borders, input borders, inactive outlines.
  - **Contrast**: Should be visible but not screaming.

- **`text/primary`**: `#FFFFFF`
  - **Usage**: Headlines, key UI labels, buttons on orange.

- **`text/secondary`**: `#A3A3A3`
  - **Usage**: Body copy, subheads, supporting labels.

- **`text/tertiary`**: `#6B6B6B`
  - **Usage**: Microcopy, muted metadata, captions.

- **`accent/orange`**: `#FF4A1F`
  - **Usage**: Primary CTA, active states, Pro highlights, key underlines.
  - **Rule**: Orange is a scalpel, not paint. Aim for ≤ 3 focal points per section.

- **`accent/orange-soft`**: `rgba(255,74,31,0.12)`
  - **Usage**: Pro card background wash, subtle callouts behind small elements.
  - **Contrast**: Keep text white; don’t put secondary text on orange-soft without checking legibility.

- **`accent/orange-border`**: `rgba(255,74,31,0.32)`
  - **Usage**: Pro card border glow, active tab underline glow.
  - **Contrast**: Use sparingly; avoid neon outlines on every card.

### Semantic tokens (pick these once; keep consistent)
- **`success`**: `#22C55E`
  - Usage: “systems operational,” “Pro active,” positive status.
- **`warning`**: `#F59E0B`
  - Usage: “limited inserts,” “coming soon,” cautious notices.
- **`danger`**: `#EF4444`
  - Usage: error states, destructive actions.

### Contrast notes
- Minimum target: **WCAG AA** for body text (4.5:1).
- Orange on black is high contrast; orange on near-black is also strong. The risk is muted grays—keep `text/secondary` large enough (≥ 16px) and line-height generous.

---

## 3) Typography (Geist)

### Fonts
- **Display**: Geist Sans (600 / 700), tracking `-0.02em` on big headlines
- **Body**: Geist Sans (400 / 500)
- **Mono**: Geist Mono (400 / 500) for code, prices, version pills

### Type scale (desktop baseline)
Define these as Paper text styles:
- **display-1**: 64px / 72px · Geist Sans 700 · tracking -0.02em
- **display-2**: 48px / 56px · Geist Sans 700 · tracking -0.02em
- **h1**: 40px / 48px · Geist Sans 700 · tracking -0.02em
- **h2**: 32px / 40px · Geist Sans 650 · tracking -0.01em
- **h3**: 24px / 32px · Geist Sans 600
- **body-lg**: 18px / 28px · Geist Sans 450
- **body**: 16px / 26px · Geist Sans 400
- **small**: 14px / 22px · Geist Sans 400
- **caption**: 12px / 18px · Geist Sans 400 · text/tertiary
- **mono**: 13px / 18px · Geist Mono 450

### Headline pattern rules
- Short. Punchy. Lowercase is allowed.
- Em dash is allowed—use it for punch, not rambling.
- Mid-dot separator `·` is the Stōkt tic.

### Price treatment (required)
- Prices in **Geist Mono**.
- “$49” big and bold.
- “once · lifetime updates” smaller + muted (`text/secondary`).

---

## 4) Spacing + grid

### Spacing scale
Use this scale for padding, gaps, and section rhythm:
`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128`

### Section rhythm
- Desktop vertical padding: **96–128px**
- Mobile vertical padding: **64–96px**

### Containers
- Outer max-width: **1280px**
- Content max-width: **1120px**
- Text-only max-width: **800px**

### Grid
- Desktop: **12 columns**
- Tablet: **8 columns**
- Mobile: **4 columns**

### Radii
- Cards: **12px**
- Inputs/buttons: **8px**
- Optional hero “glass shell” container: **24px** (only if it’s subtle; no glassmorphism circus)

---

## 5) Component patterns (shadcn → custom)

Name the shadcn primitive, then apply these customizations in Paper.

### Button (shadcn `Button`)
- **Primary**: orange filled (`accent/orange`), white text
  - Hover: subtle outer glow (`accent/orange-border`) + lift (1–2px)
  - Focus: visible ring (orange border + 2px offset on black)
  - Press: scale 0.98, 100ms
- **Secondary**: outline (white or `border/default`) + transparent fill
  - Hover: `bg/elevated`
- **Ghost**: text only + arrow
  - Hover: underline or subtle orange tint
- **Link**: orange underline, no box

### Nav (shadcn `NavigationMenu`)
- Flat horizontal links. No dropdown depth.
- Primary CTA is the only filled orange pill.
- Sticky state: `bg/surface` + subtle bottom border (`border/subtle`).

### Card (shadcn `Card`)
- `bg/surface` + `border/default`
- Hover: `bg/elevated` + slight lift + border becomes a hair brighter
- Optional highlight: thin orange top-edge accent (use for Pro / featured only)

### Pricing card (custom)
- **Free**: neutral accents (white/grey)
- **Pro**: orange accents + pill (“Best value” or “Most popular”)
- Pro card has orange-soft wash + orange-border glow on hover

### Accordion (FAQ) (shadcn `Accordion`)
- Minimal, no heavy dividers
- Large hit areas (at least 48px)
- Titles in Geist Sans 500; body in `body`
- Optional: a small mono “+”/“–” indicator

### Badge / pill
- Pill shape, tight padding
- Variants:
  - Neutral: `bg/elevated` + `border/subtle`
  - Pro: orange text + orange border or orange-soft background
  - “Coming soon”: muted warning tint, not loud

### Tabs / Filter bar (shadcn `Tabs`)
- Underline style
- Active indicator: orange line (2px) + subtle glow
- Inactive: `text/secondary`

### Code block / version pill
- Geist Mono
- `bg/elevated`
- Version number in orange; rest in `text/secondary`

---

## 6) Page-level layouts (per sitemap section)

For each section, this locks layout, orange usage, anchors, and mobile behavior.

### Nav
- **Layout**: 1 row, left wordmark, center links, right CTA
- **Orange**: primary CTA only
- **Anchor**: wordmark + glyph
- **Mobile**: hamburger or condensed row with CTA; keep CTA visible if possible

### 01 Hero
- **Layout**: 2-col asymmetric (left copy, right hero media). Optional social proof strip below.
- **Orange**: primary CTA + one accent (underline or small rule)
- **Anchor**: hero media (plugin window + Framer canvas playing video)
- **Mobile**: stack copy then media; keep CTAs above the fold

### 02 What & why
- **Layout**: 3 blocks (plain terms / pain / relief) in a 2-col editorial grid
- **Orange**: one accent label (“iframe ceiling” pill) + small rule
- **Anchor**: type + simple iconography; no complex diagrams
- **Mobile**: stack blocks with clear separators

### 03 Layout showcase
- **Layout**: filter tabs + grid of 2–3 columns cards
- **Orange**: active tab underline + Pro badge + one hover accent
- **Anchor**: card imagery (video still inside player shell)
- **Mobile**: single column cards; tabs scroll horizontally

### 04 Features
- **Layout**: 2 columns (Live / Coming soon)
- **Orange**: small “Live” marker + Pro-only callout (Quality Picker)
- **Anchor**: feature list with icons
- **Mobile**: Live first, Coming soon second

### 05 How it works
- **Layout**: 4-step strip (horizontal cards or timeline)
- **Orange**: step numbers or a thin connecting rule
- **Anchor**: big numerals
- **Mobile**: vertical step stack, keep numbers large

### 06 Pricing
- **Layout**: 2 pricing cards side-by-side (override sitemap’s 3-col hint)
  - Rationale: This product is genuinely **Free vs Pro**. “Freemium” is not a third thing; it’s the Free gate (5 inserts).
- **Orange**: Pro card border + CTA + “Best value” pill
- **Anchor**: the mono price line
- **Mobile**: stack Free then Pro, or Pro then Free (choose Pro second if you want the scroll to “build”)

### 07 Open source
- **Layout**: 1-col editorial block with a single CTA
- **Orange**: GitHub CTA underline or button (secondary)
- **Anchor**: bold headline + tight body
- **Mobile**: unchanged

### 08 Docs / Getting started
- **Layout**: 3 cards in a row
- **Orange**: card hover underline + one small icon accent
- **Anchor**: card titles + mono terms (“Library ID”, “Video ID”)
- **Mobile**: stack cards

### 09 Use cases
- **Layout**: 2x2 grid tiles with strong imagery
- **Orange**: small corner accent or label per tile (not all four)
- **Anchor**: imagery
- **Mobile**: single column tiles

### 10 Mid-page CTA band
- **Layout**: full-bleed band with one sentence + one button
- **Orange**: button + thin top border
- **Anchor**: the sentence
- **Mobile**: stack sentence then button, center aligned

### 11 Changelog / Roadmap
- **Layout**: left changelog list + right roadmap teaser
- **Orange**: version number (mono) + subtle active marker on latest
- **Anchor**: version pills
- **Mobile**: stack changelog then roadmap

### 12 FAQ
- **Layout**: accordion in an 800px text container
- **Orange**: subtle active indicator on open item (small, not a whole background)
- **Anchor**: questions (large hit area)
- **Mobile**: same; ensure tap targets

### 13 Final CTA
- **Layout**: two balanced cards (plugin path + open source path)
- **Orange**: plugin card CTA + price line emphasis
- **Anchor**: Pro CTA + GitHub link
- **Mobile**: stack plugin first, open source second

### Footer
- **Layout**: 2–4 columns + credit row
- **Orange**: none, or one tiny link underline (optional)
- **Anchor**: wordmark + “Made by Stōkt · Powered by bunny.net”
- **Mobile**: stack groups, keep legal last

---

## 7) Imagery + media direction

- **Hero media**: stylized plugin window mock + Framer canvas with a real video frame visible
  - Not stock people. Not 3D mascots.
  - Should feel like: “this exists.”
- **Layout cards**: real video stills inside the player UI, with controls visible
  - Use consistent framing so the grid looks intentional.
- **Icons**: solid line icons, 1.5px stroke
  - Monochrome on dark, occasional orange
- No emojis. No stock photography. No gradient blobs.

---

## 8) Motion + interaction (notes for eventual coded build)

- Section reveals: subtle fade-up on scroll
  - 150–250ms, ease-out
  - No parallax
- Buttons:
  - 100ms color shift on hover
  - Press: scale 0.98
- Hero:
  - Optional muted autoplay loop of the plugin in action
- Respect `prefers-reduced-motion`

---

## 9) Paper build sequence (minimize backtracking)

Build in this exact order:
1. Tokens (colors, type, spacing) — create Paper styles first
2. Buttons + form elements (atoms)
3. Nav + Footer (repeating chrome)
4. Hero (sets the tone)
5. Pricing (highest conversion section — make it sing)
6. Final CTA + Mid-page CTA band (match Hero CTA)
7. Layout showcase + Use cases (visual sections)
8. Features + How it works (info-dense)
9. What & why + Open source + Docs (text-led)
10. FAQ + Changelog (utility)
11. Mobile pass on all sections (focus: hero, pricing, FAQ, footer)

---

## 10) Reference list (tone, not templates)

- **Linear**: structure and hierarchy without feeling “salesy.”
- **Vercel**: confident product framing and clean UI primitives.
- **Resend**: blunt copy-first sections that read fast.
- **Mux**: video product credibility, technical clarity without jargon.
- **A24**: poster-like type confidence and negative space discipline.

---

## 11) Definition of done (Paper checklist)

- [ ] All 13 sections + nav + footer designed at desktop width
- [ ] Mobile pass for hero, pricing, FAQ, footer (others can stack naturally)
- [ ] Token sheet artboard exists
- [ ] Component library artboard exists (buttons, cards, badges, tabs)
- [ ] No lorem ipsum — every block uses approved copy from `marketing/landing-copy.md`
- [ ] No stock imagery
- [ ] Orange used sparingly (count: ≤ 30 orange instances on the desktop full-page export)

