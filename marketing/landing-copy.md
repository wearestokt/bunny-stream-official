---
title: Stream Bunny Landing Page Copy
owner: Jay Nadeau / Stōkt
last-updated: 2026-05-08
placeholders:
  - "{POLAR_CHECKOUT_URL}"
  - "{COUNT}"
  - "{DEMO_VIDEO_URL}"
---

This file is the full landing page copy pack for Stream Bunny.
Tone rules: see `marketing/voice-guidelines.md`.

---

## Nav — Logo + wordmark · Features · Layouts · Pricing · Docs · GitHub · Get plugin (CTA)

**Goal**: Get the right people to scroll (or click “Get plugin”) without thinking.

### Content
- **Logo/wordmark**: Stream Bunny (wordmark) + tiny mascot/glyph cue (small bunny head or “SB” glyph)
- **Nav items (exact)**:
  - Features
  - Layouts
  - Pricing
  - Docs
  - GitHub
  - Get plugin (primary CTA)

### CTA label variants (primary)
- Get plugin
- Get Stream Bunny
- Open in Framer

### Notes for the designer
- Keep it flat. No mega menus. No “solutions” dropdowns.
- “Get plugin” is the only filled button in the nav.
- GitHub is a text link with a subtle external arrow.

---

## 01 — Hero

**Goal**: Make them feel the iframe ceiling in 2 seconds, then click “Get plugin.”

### Content
- **Eyebrow**:
  - Framer plugin · bunny.net Stream

- **Headline (pick one)**
  1) Kill the iframe ceiling.
  2) Bunny Stream. Built like UI.
  3) What you’d build if Bunny Stream wasn’t an iframe.

- **Subhead (1–2 sentences)**
  - Bunny’s default embed is an iframe. You can’t compose it, restyle it, or steal just the controls.
    Stream Bunny drops a real Bunny.net Stream HLS **Player + Controls** on your Framer canvas — separate pieces, shared state, fully skinnable.

- **Primary CTA**
  - Get plugin

- **Secondary CTA (choose one behavior)**
  - Watch 30s demo
  - See layouts

- **Secondary CTA URL placeholder**
  - `{DEMO_VIDEO_URL}`

- **Social proof strip (no fake logos)**
  - Open source on GitHub · ★ {COUNT}
  - Built on bunny.net Stream
  - Made by Stōkt

- **Microcopy under primary CTA**
  - Free: 5 canvas inserts per workspace · Pro: **$49 once · lifetime updates**

- **Hero media direction (alt text suggestions)**
  - “Stream Bunny plugin window beside a Framer canvas with a video playing and custom controls on the layout.”
  - “Player and Controls components on canvas, skinned orange on black, with HLS quality picker visible.”

### Variant alternates
- **Headline alternates**
  - Build real video UI.
  - Player + Controls · shared state.
  - Drop HLS on the canvas.
- **Primary CTA alternates**
  - Get Stream Bunny
  - Open in Framer
  - Get plugin · Free

### Notes for the designer
- The subhead must say **iframe ceiling** and **Player + Controls**. Don’t soften it.
- Hero media should look like product, not a “brand illustration.”
- Avoid a huge gradient hero. This is black + orange + UI.

---

## 02 — What & why

**Goal**: Make the “why” feel obvious (and a little embarrassing) if they’re still using the iframe.

### Content

#### Bunny Stream, in plain terms (1 paragraph)
Bunny.net Stream is solid: adaptive HLS, buffering, quality switching. The problem is the embed. It shows up as an iframe — a sealed box. Stream Bunny gives you the same streaming power, but as Framer components you can actually design with.

#### The iframe ceiling (pain — 4 specific things)
- You can’t restyle the UI to match your site. You get the iframe’s skin, not yours.
- You can’t compose the player into a layout grid like a real component. It’s always “the box.”
- You can’t split the controls. Want only a play button in a hero? Too bad.
- You can’t share state across your own UI. You can’t wire your own progress bar, time, or volume to the player.

#### What Stream Bunny does (relief)
- Drops a **BunnyVideoPlayer** on the canvas. Real HLS playback — not a compressed export.
- Drops **Controls** as separate components that share state with the player.
- Lets you skin everything in Framer: spacing, radius, color, typography, hover states.
- Pro adds the **BunnyQualityPickerButton** for HLS renditions.

### Variant alternates
- **Section headline options**
  - The embed is the problem.
  - Bunny Stream is great. The iframe isn’t.
  - Real streaming. Real layout control.

### Notes for the designer
- Use a 3-part layout: Plain terms (short), Pain (bulleted, sharp), Relief (bulleted, clean).
- Don’t use diagrams with arrows everywhere. Keep it editorial.

---

## 03 — Layout showcase

**Goal**: Make them want to click Remix / Add to site. Show “templates” as proof, not fluff.

### Content

#### Filter bar (categories)
- All
- Hero
- Reel
- Tile
- Stack
- Tutorial
- Showcase

#### Layout card template (UI fields)
- **Card title**
- **One-line description**
- **Badge**: Free / Pro
- **Links**
  - Remix
  - Add to site

#### 6 layout cards (one per template)

1) **Cinema Hero** (Free)
   - **Description**: Full-bleed hero player with a clean control row. Big type. No excuses.
   - **Remix link copy**: Remix this layout →
   - **Add to site CTA**: Add Cinema Hero

2) **Press Reel** (Pro)
   - **Description**: A reel that reads like a studio site. Chapters later. Vibes now.
   - **Remix link copy**: Remix Press Reel →
   - **Add to site CTA**: Add Press Reel

3) **Story Tile** (Pro)
   - **Description**: Poster tile with hover controls. Click → watch. Clean grid energy.
   - **Remix link copy**: Remix Story Tile →
   - **Add to site CTA**: Add Story Tile

4) **Wall Stack** (Pro)
   - **Description**: A stacked wall of clips with one player state. Scroll it like a feed.
   - **Remix link copy**: Remix Wall Stack →
   - **Add to site CTA**: Add Wall Stack

5) **Tutorial Row** (Pro)
   - **Description**: Row layout for lessons, walkthroughs, product demos. Progress stays honest.
   - **Remix link copy**: Remix Tutorial Row →
   - **Add to site CTA**: Add Tutorial Row

6) **Showcase Strip** (Pro)
   - **Description**: Horizontal strip of videos with a main player. Perfect for case studies.
   - **Remix link copy**: Remix Showcase Strip →
   - **Add to site CTA**: Add Showcase Strip

#### Locked-state microcopy (Pro cards)
- Pro layout · unlock to use

### Variant alternates
- **Section headline options**
  - Layouts you can actually ship.
  - Templates, but not cheesy.
  - Drop a layout. Skin it. Done.

### Notes for the designer
- Tabs should feel like a filter bar, not an “app dashboard.”
- Pro cards must show an orange Pro badge. Free stays neutral.
- Each card needs a video still inside a player shell (controls visible).

---

## 04 — Features

**Goal**: Make the feature set feel real. Not “feature marketing.” Just what ships.

### Content

#### Live (ships today)
- **Real Bunny.net Stream HLS playback** (adaptive quality, buffering, streaming behavior)
- **Player + Controls as separate components** (shared state)
- **Free components**
  - BunnyVideoPlayer
  - BunnyPlayPauseButton
  - BunnyProgressBar
  - BunnyTimeDisplay
  - BunnyVolumeSlider
  - BunnyFullscreenButton
- **Pro-only component**
  - BunnyQualityPickerButton (HLS rendition switch)
- **Templates**
  - Cinema Hero (Free)
  - Press Reel (Pro)
  - Story Tile (Pro)
  - Wall Stack (Pro)
  - Tutorial Row (Pro)
  - Showcase Strip (Pro)
- **Quick Start guide** (in-plugin, fast setup)
- **Pro license activation flow** (buy → paste license key)
- **Dark/light mode support** (page + UI patterns)

#### Coming soon (no dates)
- Captions
- Chapter markers
- More templates

### Variant alternates
- **Section headline options**
  - No “video solution.” Just components.
  - The parts you actually need.
  - Ship streaming like UI.

### Notes for the designer
- Two columns: Live (left, heavier), Coming soon (right, quieter).
- “Coming soon” needs a subdued pill. No big promises.

---

## 05 — How it works (4-step strip)

**Goal**: Make setup feel simple and inevitable. No mystery.

### Content
1) **Install Stream Bunny in Framer**
   - Add the plugin. Open it. You’re in.

2) **Sign in to bunny.net Stream**
   - Create an account (free to start). Stream Bunny plays Bunny Stream. That’s the deal.  
     Affiliate: `https://bunny.net?ref=f9ztcmeo63`

3) **Drop a Player on your canvas**
   - Paste your Library ID + Video ID. Hit play. Real HLS.

4) **Compose your controls / pick a template**
   - Use the template or build your own control row. Same state. Your layout.

### Variant alternates
- **Section headline options**
  - Setup in 4 moves.
  - It’s not a workflow. It’s four steps.
  - Drop. Paste. Play. Skin.

### Notes for the designer
- This should read in 8 seconds. Keep it tight. Big numbers.
- Step 2 gets the only outbound link styling in the strip.

---

## 06 — Pricing

**Goal**: Make the upgrade feel fair and simple. Two choices. No games.

### Content

#### Column A — Free
- **Name**: Free
- **Eyebrow**: for trying it out
- **Price**: $0
- **Bullets (5–7)**
  - **5 free canvas inserts per workspace**
  - BunnyVideoPlayer
  - BunnyPlayPauseButton
  - BunnyProgressBar
  - BunnyTimeDisplay
  - BunnyVolumeSlider
  - BunnyFullscreenButton
  - Cinema Hero template
- **CTA**
  - Get plugin (Free)
- **Microcopy**
  - You can ship on Free. You just can’t spam inserts.

#### Column B — Stream Bunny Pro
- **Name**: Stream Bunny Pro
- **Eyebrow**: for shipping it
- **Price**: **$49 once · lifetime updates**
- **Bullets (5–7)**
  - Unlimited inserts on every workspace
  - Every template (Press Reel, Story Tile, Wall Stack, Tutorial Row, Showcase Strip)
  - BunnyQualityPickerButton (HLS renditions)
  - Lifetime updates (no subscription)
  - Priority email support
- **CTA**
  - Buy Stream Bunny Pro
- **CTA URL placeholder**
  - `{POLAR_CHECKOUT_URL}`
- **Microcopy**
  - Checkout runs on Polar. Paste your license key inside the plugin.

### Variant alternates
- **Pricing headline options**
  - Free to try. Pro to ship.
  - Two tiers. That’s it.
  - Pick a lane.
- **Pro CTA label alternates**
  - Buy Pro · $49
  - Upgrade to Pro
  - Buy on Polar · $49

### Notes for the designer
- Do **two columns**, not three. The “freemium” is the Free tier itself: **5 inserts per workspace** is the evaluation gate.
- Pro card gets the orange highlight treatment (border glow + “Best value” pill).
- Put the exact line **$49 once · lifetime updates** in Geist Mono.

---

## 07 — Open source

**Goal**: Make OSS feel like integrity, not an escape hatch.

### Content
- **Headline**
  - Open source stays visible.

- **Body (2 sentences)**
  - Stream Bunny’s components are open source (MIT) on GitHub. Fork them if you want.
    Pay for the plugin if you want the polished templates, license flow, and the “it just works” layer.

- **CTA**
  - Star on GitHub →
  - View repo →

- **Repo link**
  - `https://github.com/wearestokt/bunny-stream-official`

### Variant alternates
- **Headline alternates**
  - Fork it. Or buy the polish.
  - OSS components. Paid convenience.
  - You can look under the hood.

### Notes for the designer
- Treat this as an editorial block: big headline, tight body, one CTA.
- No guilt. No “support us.” Just facts.

---

## 08 — Docs / Getting started

**Goal**: Reduce fear. Answer “how do I set this up?” before they ask.

### Content

#### Card 1 — Quick start
- **Title**: Quick start
- **Body**: The in-plugin 60-second walkthrough. Install → Bunny Stream → IDs → play.
- **CTA**: Open Quick Start →

#### Card 2 — API key setup
- **Title**: API key setup
- **Body**: Where to find your **Library ID** and **Video ID** in bunny.net Stream. Copy, paste, done.
- **CTA**: Find my IDs →

#### Card 3 — Build a custom layout
- **Title**: Build a custom layout
- **Body**: Compose Player + Controls yourself. Put the play button wherever you want. That’s the point.
- **CTA**: Build a layout →

### Variant alternates
- **Section headline options**
  - Docs that don’t waste your time.
  - Getting started (fast).
  - Setup, IDs, layout.

### Notes for the designer
- Three cards, equal height. Make them feel like a kit.
- Use Geist Mono for “Library ID” and “Video ID.”

---

## 09 — Use cases (4 tiles)

**Goal**: Help them self-identify in one of the tiles. Then bounce back to pricing.

### Content

1) **Studio reels**
   - **Body**: Your reel shouldn’t look like YouTube chrome. Skin it like your studio.
   - **Image direction**: Dark reel page, big player, minimal control row, orange accent.

2) **Case study pages**
   - **Body**: Drop a clip into the layout grid. Put controls in the margin. Make it editorial.
   - **Image direction**: Split layout with video on left, text on right, floating play button.

3) **Course / tutorial sites**
   - **Body**: Progress bar, time, volume — all in your design system. No iframe box.
   - **Image direction**: Lesson row with player thumbnail + controls aligned to type grid.

4) **Portfolio cinematic heroes**
   - **Body**: Big hero video, tiny controls. Clean. Loud. Yours.
   - **Image direction**: Full-bleed hero still with subtle control overlay.

### Variant alternates
- **Section headline options**
  - Built for creative companies.
  - Where this hits hardest.
  - What you’ll ship first.

### Notes for the designer
- Use tiles with strong imagery. Keep copy short.
- Don’t add extra use cases. Four is enough.

---

## 10 — Mid-page CTA band

**Goal**: Catch the “I’m sold” moment mid-scroll.

### Content
- **Big sentence**
  - Drop Bunny Stream on the canvas. Build the controls like UI.
- **CTA**
  - Get plugin
- **CTA URL**
  - `{POLAR_CHECKOUT_URL}` (if this band is Pro-leaning) or same “Get plugin” path as hero (your call)

### Variant alternates
- **Band sentence options**
  - Stop shipping iframes.
  - Real HLS. Real layout control.
  - Player + Controls. Shared state. Your skin.
- **CTA label options**
  - Get Stream Bunny
  - Buy Pro · $49
  - Open in Framer

### Notes for the designer
- Make it full-bleed. One sentence. One button.
- Orange focus: button + one small accent line. Nothing else.

---

## 11 — Changelog / Roadmap

**Goal**: Prove it’s alive. Show momentum without promising dates.

### Content

#### Changelog (most recent 3)
- **v1.4.0** — Quality Picker for HLS streams (Pro add-on). Switch renditions beside any Player.
- **v1.3.0** — Templates pass: cleaner layout shells + faster drop-in flow.
- **v1.2.0** — Controls library tightened: progress + time + volume + fullscreen feel like a set.

#### Roadmap teaser (no dates)
- Captions (component + styling hooks)
- Chapter markers (for reels + tutorials)
- More templates (more layout genres, less fluff)

### Variant alternates
- **Section headline options**
  - Shipping. Not posting.
  - Changelog (real).
  - Roadmap (no promises).

### Notes for the designer
- Changelog list should use Geist Mono version pills.
- Roadmap items should be visually “lighter” than changelog.

---

## 12 — FAQ (7)

**Goal**: Kill objections without turning it into a sales page.

### Content

1) **Do I need a bunny.net account?**
   - Yes. Stream Bunny plays bunny.net Stream. Bunny has a free start, and you’ll grab your Library + Video IDs from their dashboard. If you’re signing up, use the affiliate link: `https://bunny.net?ref=f9ztcmeo63`.

2) **Is this just a styled iframe?**
   - No. The whole point is escaping the iframe ceiling. Stream Bunny gives you a real HLS Player plus separate Controls components with shared state — so you can build the UI inside your layout.

3) **What’s the difference between Free and Pro?**
   - Free gives you **5 free canvas inserts per workspace**, all six free components, and the Cinema Hero template. Pro removes insert limits, unlocks all templates, and adds the Quality Picker component.

4) **Is there a subscription?**
   - No. Stream Bunny Pro is **$49 once · lifetime updates**.

5) **Can I get a refund?**
   - Yes. Email `hello@wearestokt.com` and we’ll sort it out.

6) **Does it work with my existing Bunny library?**
   - Yes. If you already use Bunny Stream, you’re good. Paste your Library ID and Video ID into the Player component and you’re live.

7) **Is it open source?**
   - Yes — the components are MIT open source on GitHub. The plugin is sold via Polar so the polished templates + license flow can stay maintained.

### Variant alternates
- **Section headline options**
  - Questions. Answers.
  - FAQ (no fluff).
  - The stuff you’re about to ask.

### Notes for the designer
- Accordion with big hit areas. Keep answers 1 paragraph.
- Put “$49 once · lifetime updates” in mono even inside answers.

---

## 13 — Final CTA (two paths)

**Goal**: Convert, but keep the OSS path legit and visible.

### Content

#### Left / Primary — Plugin path
- **Headline**: Get Stream Bunny.
- **Body**: The fast path. Templates. Pro unlock. Clean inserts. Ship it.
- **Primary CTA**: Buy Stream Bunny Pro
- **Price line**: **$49 once · lifetime updates**
- **CTA URL placeholder**: `{POLAR_CHECKOUT_URL}`

#### Right / Secondary — Open source path
- **Headline**: Or go open source.
- **Body**: Fork the components. Build your own layer. No hard feelings.
- **Secondary CTA**: View GitHub →
- **Repo**: `https://github.com/wearestokt/bunny-stream-official`

### Variant alternates
- **Final CTA headline alternates (primary)**
  - Stop shipping iframes.
  - Ship streaming like UI.
  - Build the controls. Own the vibe.
- **Primary CTA alternates**
  - Buy Pro · $49
  - Upgrade to Pro
  - Buy on Polar · $49

### Notes for the designer
- Visually balanced cards, but conversion-weighted toward the Plugin side.
- One orange focal point: the primary button (and maybe a thin top accent).

---

## Footer

**Goal**: Close clean. No weird corporate footer bloat.

### Content
- **Logo/wordmark**: Stream Bunny (with small glyph)

#### Link groups
- **Product**
  - Features
  - Layouts
  - Pricing
  - Get plugin
- **Resources**
  - Docs
  - Quick start
  - Changelog
  - FAQ
- **Company**
  - Made by Stōkt (`https://wearestokt.com`)
  - Support: `hello@wearestokt.com`
  - Open source (GitHub)
- **Legal**
  - Privacy (placeholder: `/privacy`)
  - Terms (placeholder: `/terms`)

#### Credits row
- Made by Stōkt · Powered by bunny.net

#### Copyright
- © 2026 Stōkt

### Notes for the designer
- Keep it compact. 2–4 columns desktop, stacked mobile.
- Credits row is small, muted, and honest.

---

## Microcopy bank

Use these for buttons, states, badges, and tiny labels across the Paper design.

### Button labels (primary)
- Get plugin
- Get Stream Bunny
- Open in Framer
- Buy Stream Bunny Pro
- Buy on Polar · $49
- Upgrade to Pro

### Button labels (secondary / ghost / link)
- Watch 30s demo
- See layouts
- View GitHub →
- Star on GitHub →
- Remix this layout →
- Add to site
- Learn more

### Badges / pills
- Free
- Pro
- Coming soon
- Best value
- Most popular
- Open source
- HLS
- Player
- Controls

### Pricing microcopy
- **$49 once · lifetime updates**
- Free: **5 free canvas inserts per workspace**
- No subscription

### Locked-state microcopy
- Pro layout · unlock to use
- Pro component · unlock to use
- Unlock with Pro

### Loading / empty / error states
- Loading…
- Loading layouts…
- Loading components…
- Nothing here yet.
- No layouts match that filter.
- No results for “{QUERY}”.
- Try again
- Something broke. Reload.

### Alt text patterns
- “Stream Bunny plugin UI in Framer with a Bunny Stream HLS player and custom controls.”
- “Template card showing a video still inside the Stream Bunny player shell.”
- “Pricing cards for Free and Stream Bunny Pro on a black background with orange accents.”

