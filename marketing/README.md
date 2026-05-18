---
title: Stream Bunny — Launch Pack
owner: Stōkt (Jay Nadeau)
status: Draft v1 — content locked, design + assets in flight
last-updated: 2026-05-08
---

# Stream Bunny — Launch Pack

This folder is the single source of truth for the **Stream Bunny v1.4.0** launch on the Framer Marketplace and the standalone landing page. Everything written, designed, or shipped during launch should reference these files — don't invent copy, voice, or visual rules anywhere else.

**Product documentation** (setup, components, plugin usage) lives in [`../docs/README.md`](../docs/README.md) — link there instead of duplicating technical setup in marketing copy.

## Files in this pack

| File | Purpose | Owner |
|---|---|---|
| [`voice-guidelines.md`](voice-guidelines.md) | Brand voice rules. Read this **first** before writing or reviewing anything else. | Jay |
| [`marketplace-listing.md`](marketplace-listing.md) | All Framer Marketplace submission fields, in 3 voice variants where it matters. | Jay |
| [`marketplace-assets.md`](marketplace-assets.md) | Asset checklist + capture spec for icon, cover, screenshots, optional demo. | Jay |
| [`landing-copy.md`](landing-copy.md) | Full landing page copy (Nav + sections 01–13 + Footer + Microcopy bank). | Jay |
| [`paper-design-brief.md`](paper-design-brief.md) | Tokens, type scale, component patterns, section-by-section design direction for the Paper file. | Jay |

## Cross-file consistency (verified)

These appear identically everywhere they're used:

- **Pricing**: `$49 once · lifetime updates` — never "just $49", never "lifetime deal", never a subscription frame.
- **Free tier**: `5 canvas inserts per workspace` — never "trial", never "evaluation period".
- **Version**: `v1.4.0` (matches `plugin/src/copy.ts` `PLUGIN_VERSION`).
- **Support**: `hello@wearestokt.com`.
- **Repo**: `https://github.com/wearestokt/bunny-stream-official`.
- **Bunny affiliate**: `https://bunny.net?ref=f9ztcmeo63`.

No banned hype words appear in any copy file (only in the "don't use" reference lists inside `voice-guidelines.md` and `paper-design-brief.md`).

## Status by deliverable

| Track | Status | Notes |
|---|---|---|
| Marketplace listing copy | **Done** | 3 voice variants for one-liner / tagline / short description; long description, feature bullets, pricing, privacy, support, semver policy, changelog stub, submission checklist all written. |
| Marketplace assets | **Spec done. Capture pending.** | Spec, screen list (8 shots + optional canvas result), capture instructions, cover/hero brief, demo storyboard, file naming, and asset QA all in `marketplace-assets.md`. **You still need to capture the actual files.** |
| Landing copy | **Done** | All sections 01–13 + nav + footer, with 2–3 variants for headlines and primary CTAs. Microcopy bank at the end. |
| Paper design brief | **Done** | Tokens, Geist type scale, spacing, shadcn → custom component map, section-by-section direction, build sequence, definition of done. |
| Paper file (desktop) | **Draft built. Polish pending.** | 3 artboards exist: `Stream Bunny — Tokens`, `Stream Bunny — Components (Marketing)`, `Stream Bunny — Landing Page (Desktop)`. All sections drafted using copy from `landing-copy.md`. **Not polished**: scroll order needs a reshuffle to match the build sequence, hero media + layout cards + use-case tiles are labeled placeholder rectangles, Components artboard is slightly cramped. **Geist Sans was not installed in Paper — Inter was used as the fallback. Geist Mono is installed and was used.** |
| Paper file (mobile) | **Not started** | Explicitly out of scope for v1 draft. Add after desktop polish pass. |
| Voice guidelines | **Done** | 1–2 page reference. Use it for any future copy. |

## Open questions for human review

Resolve these before submitting to Marketplace or coding the landing page:

### Marketplace
1. **Framer constraints**: confirm current character limits (one-liner, tagline, short desc) and asset dimensions (icon, cover, screenshots, GIF). The pack flags everything unverified as "verify with current Framer submission requirements".
2. **Embed / source mode wording**: keep the conditional reference in public copy or strip it entirely from the listing? (My instinct: strip it. It's a maintainer detail.)
3. **Tag list**: confirm Framer's controlled tag vocabulary so we can match it.

### Landing
4. **Mid-page CTA band (10)**: should it route to the same "Get plugin" path as the Hero, or hard-link to `{POLAR_CHECKOUT_URL}` as a Pro push?
5. **Demo asset**: what's the actual `{DEMO_VIDEO_URL}` for the Hero secondary CTA? And do we want the Hero media to be a looped product video or a static plugin-window mock?
6. **Changelog accuracy**: `v1.4.0` is real (Quality Picker). The `v1.3.x` and `v1.2.x` lines in `landing-copy.md` and `marketplace-listing.md` are generic placeholders — replace with real release notes if you want them surfaced publicly, or compress to "v1.4.0 + earlier".

### Polar / payments
7. **Polar checkout URL**: only kept private inside `plugin/.env.local` (intentional). All marketing files use the `{POLAR_CHECKOUT_URL}` placeholder so the real URL never lives in the markdown. Inject it at build time when wiring the landing page.

## Manual user tasks still pending

In rough order:

1. **Resolve the 7 open questions above.**
2. **Polish the Paper file**:
   - Reorder sections on `Stream Bunny — Landing Page (Desktop)` to match the build sequence in `paper-design-brief.md` § "Paper build sequence".
   - Replace the four placeholder rectangles (Hero media, layout cards, use case tiles, docs cards) with real-feeling video stills / icons. Stay within the no-stock / no-blob rules.
   - Run an orange-budget pass: target ≤ 30 instances of `#FF4A1F` on the desktop full-page export.
   - Decide on Geist: either install Geist Sans in Paper or accept Inter as the brand fallback (and update the brief to reflect that decision).
3. **Capture the 8 Marketplace screenshots** per the spec in `marketplace-assets.md`. Use the dev tier toggle + reset-quota button to set up Free/Pro pairs and the limit toast.
4. **Produce the cover / hero image** per the brief in `marketplace-assets.md`.
5. **Run the submission checklist** at the end of `marketplace-listing.md` before clicking Submit.
6. **Mobile pass on the Paper file** (Hero, Pricing, FAQ, Footer minimum).

## Workflow for any future copy or design change

1. Edit the source-of-truth file in this folder (never duplicate copy elsewhere).
2. Cross-check against `voice-guidelines.md` before publishing.
3. If pricing, free-tier wording, version, or support email changes anywhere, search this folder and `plugin/src/copy.ts` together to keep them in sync.

## What's intentionally NOT in this pack

- The actual Polar checkout URL (lives in `plugin/.env.local`, not in marketing markdown).
- The Vercel API hostname (also private).
- A built, code-deployed landing page — only the copy + design brief + Paper draft. Implementation comes after the Paper polish pass and the open questions are resolved.
- Email-launch copy (announcement, post-purchase email, etc.) — add as a follow-up file when needed.
