---
title: Stream Bunny · Marketplace Asset Checklist
owner: Jay Nadeau / Stōkt
last-updated: 2026-05-08
version: v1.4.0
related:
  - ./marketplace-listing.md
  - ./voice-guidelines.md
---

This is the production checklist for Framer Marketplace submission assets.

If Framer’s exact constraints differ from what’s below, **verify with current Framer submission requirements** and update this doc. Don’t guess.

## Required assets

Typical Marketplace submission needs (verify current requirements):

- **Plugin icon**
  - Format: SVG + PNG fallback
  - Size: verify with current Framer submission requirements
- **Cover / hero image**
  - Format: PNG (or JPG if required)
  - Dimensions: verify with current Framer submission requirements
- **Gallery screenshots** (4–8)
  - Format: PNG
  - Dimensions: verify with current Framer submission requirements
  - Purpose: show the plugin UI + what it inserts on the canvas
- **Optional: short demo GIF**
  - 8–15s loop, no sound
  - Size/weight: keep it light; verify submission limits
- **Optional: short MP4 demo**
  - 10–30s max (if Marketplace supports video)
  - Size/codec: verify with current Framer submission requirements

## Recommended screenshot set (capture order)

Capture these in order so you don’t fight state.

1. **01 — Dashboard (Free)**
   - Shows: hero copy + 2x2 tile grid + Free Quota card.
   - Why: first impression; frames “not an iframe” without saying it.

2. **02 — Components screen**
   - Shows: Player section + Controls section + “Coming soon” pill.
   - Why: proves it’s modular + skinnable.

3. **03 — Templates screen**
   - Shows: Cinema Hero free + 5 Pro-locked overlays.
   - Why: makes Free vs Pro obvious without sales copy.

4. **04 — Quick Start**
   - Shows: 6-step guide (visible list).
   - Why: reduces friction; answers “how do I set this up?”

5. **05 — Account (Free state)**
   - Shows: plan label + quota progress bar + upgrade CTA.
   - Why: clean explanation of free inserts without “trial” language.

6. **06 — Account (Pro state)**
   - Shows: Pro status + active license info.
   - Why: shows unlock is real and stable.

7. **07 — Upgrade dialog**
   - Shows: “Stream Bunny Pro” + “$49 once · lifetime updates” + bullets.
   - Why: pricing clarity; no subscription.

8. **08 — Limit state toast on Components**
   - Shows: inserted toast in limit state (upgrade CTA variant).
   - Why: demonstrates the edge case politely (no “blocked” vibe).

Optional (strong if you have time):

9. **09 — Canvas result**
   - Shows: a styled page section in Framer with the inserted Player + a custom control layout.
   - Why: proof of “build controls in your layout.”

## Asset capture instructions

Goal: clean, consistent screenshots. No debug vibes.

### Setup

- Use a clean Framer project (no client work, no personal assets).
- Use a real Bunny.net Stream library + video so the Player screenshot is alive (no empty player).
- Make sure the player can buffer and play (first frame visible, controls responsive).
- Set your system theme and plugin window size consistently (same viewport across shots).

### States you’ll need (pairs)

You’ll capture both **Free** and **Pro** states.

- Use the **dev tier toggle** to switch Free/Pro for the paired screens.
- Use the dev **Reset Quota** button to set up quota screenshots.
- For the limit/toast shot: set quota to **5 / 5 used** so the limit toast appears in the Components screen.

Before final submission captures:
- Hide or disable dev toggles (if your build supports it).
- Ensure no “Dev:” hints are visible anywhere.
- Ensure no real license keys are visible.

### Per-screen instructions (what state to leave it in)

- **Dashboard (Free)**
  - State: Free
  - Quota: something like “2 free inserts remaining” looks real without being “at limit”
  - Player: not required on this screen

- **Components**
  - State: either (doesn’t matter), but keep consistent with the story
  - Search: empty (no filtered state)
  - Scroll: top of list; show Player + Controls sections

- **Templates**
  - State: Free
  - Ensure Cinema Hero is visible and marked Free
  - Ensure Pro templates show a lock/overlay

- **Quick Start**
  - State: either
  - Ensure all 6 steps are visible without scrolling (adjust window height if needed)

- **Account (Free)**
  - State: Free
  - Quota: show progress bar with a believable used/max count

- **Account (Pro)**
  - State: Pro
  - License: show “Active” and masked key format if possible (never full key)

- **Upgrade dialog**
  - State: Free (pre-upgrade)
  - Ensure it shows “$49 once · lifetime updates” and bullets

- **Limit toast**
  - State: Free
  - Quota: 5 / 5 used
  - Action: attempt an insert to trigger the toast
  - Capture: toast fully visible, not mid-animation

## Cover / hero image direction

Brief for the cover image.

- **Palette**: orange on black. Hard contrast. No gradients.
- **Type**: bold, modern sans (use Geist if available).
- **Composition**:
  - Plugin window mockup (Stream Bunny) beside a Framer canvas.
  - On-canvas: a styled video section with controls laid out outside the player.
  - Keep it real: UI should match v1.4.0 screens.
- **Headline direction** (pick one; keep it short):
  - “Kill the iframe ceiling.”
  - “Bunny Stream. Built like UI.”
  - “Video controls that live in your layout.”
- **Hard nos**:
  - Stock graphics.
  - “Gradient bro” aesthetics.
  - Fake charts, fake metrics, fake testimonials.

## Demo video / GIF (optional)

10–15 seconds. Tight cuts. No voiceover required.

Storyboard:

1. Open the plugin on Dashboard.
2. Drag **Cinema Hero** template onto the canvas.
3. Show HLS playback on the canvas (first frame → play).
4. Drop **Quality Picker** beside the player (shows Pro lock → then unlocked).
5. Paste license key in Account → Pro unlock.
6. Back to Components → insert again (unlimited inserts).

Notes:
- Keep cursor movement intentional.
- Avoid showing dev toggles.
- Don’t show real license keys (use masked or placeholder).

## File naming + delivery

Put all deliverables under `marketing/assets/`.

Proposed structure:

- `marketing/assets/icon/`
  - `icon.svg`
  - `icon-512.png` (name/size may change—verify)
- `marketing/assets/cover/`
  - `cover.png`
  - `cover-source.fig` (optional working file)
- `marketing/assets/screenshots/`
  - `screenshot-01-dashboard-free.png`
  - `screenshot-02-components.png`
  - `screenshot-03-templates-free.png`
  - `screenshot-04-quick-start.png`
  - `screenshot-05-account-free.png`
  - `screenshot-06-account-pro.png`
  - `screenshot-07-upgrade-dialog.png`
  - `screenshot-08-limit-toast.png`
  - `screenshot-09-canvas-result.png` (optional)
- `marketing/assets/demo/`
  - `demo.gif` (optional)
  - `demo.mp4` (optional)

## Final asset QA

Run this before exporting finals.

- **No personal data**
  - No personal email addresses
  - No real license keys (masked only)
  - No client names, no client URLs

- **No debug vibes**
  - No dev tier toggle visible
  - No “Dev:” hints visible
  - No console/error overlays

- **Truth + consistency**
  - Pricing reads **$49 once · lifetime updates**
  - Free tier reads **5 canvas inserts per workspace**
  - Version shown (if shown) matches **v1.4.0**
  - “Coming soon” only mentions captions + chapter markers

- **Visual consistency**
  - Same plugin window size across screenshots
  - Sharp text (no scaling blur)
  - Orange-on-black cover matches the product vibe

