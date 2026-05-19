---
title: Stream Bunny · Framer Marketplace Listing
owner: Jay Nadeau / Stōkt
last-updated: 2026-05-08
source-of-truth: true
repo: https://github.com/wearestokt/bunny-stream-official
support-email: hello@wearestokt.com
website: https://wearestokt.com
version: v1.4.0
---

## Quick reference

Copy/paste map for Framer Marketplace fields.

| Marketplace field | Copy from this doc |
| --- | --- |
| Plugin name | `Plugin name` |
| One-liner (store card) | `One-liner (≤ 60 chars)` |
| Tagline | `Tagline (≤ 100 chars)` |
| Short description | `Short description (~150 chars)` |
| Long description / body | `Long description` |
| Feature bullets | `Feature bullets` |
| Categories / tags | `Categories / tags suggestion` |
| Pricing | `Pricing block` |
| Compatibility / requirements | `Compatibility & requirements` |
| Privacy / data | `Privacy & data` |
| Support | `Support & SLA` |
| Version | `Versioning policy` |
| Changelog | `Changelog stub` |
| License | `License` |
| Final pre-submit check | `Submission checklist` |

Related docs:
- Asset plan + capture spec: `./marketplace-assets.md`
- Voice + copy rules: `./voice-guidelines.md`

## Plugin name

**Stream Bunny**

## One-liner (≤ 60 chars)

- **Direct**: Bunny.net Stream (HLS) players for Framer
- **Brand-forward**: Kill the iframe. Build real video UI.
- **Marketplace-safe**: Drop Bunny Stream players + controls on canvas

## Tagline (≤ 100 chars)

- **Direct**: Adaptive HLS player + skinnable controls for Bunny.net Stream in Framer.
- **Brand-forward**: Your Bunny Stream player—without the iframe ceiling.
- **Marketplace-safe**: Bunny.net Stream components: Player + Controls that share state in Framer.

## Short description (~150 chars)

- **Direct**: Drop Bunny.net Stream HLS players on your Framer canvas. Separate Player + Controls, fully skinnable. Free tier + Pro unlock.
- **Brand-forward**: Bunny Stream in Framer without the iframe ceiling. Real Player + Controls. Skin it. Ship it.
- **Marketplace-safe**: Add Bunny.net Stream (HLS) video players and controls to Framer. Adaptive playback, native layout, Pro quality picker.

## Full marketplace description (paste-ready)

Use this for the Framer Marketplace **long description** field. No em dashes. Pricing and product facts match v1.4.x.

---

**Stream Bunny** brings **bunny.net Stream (HLS)** into Framer as native code components: a real **Video Player** plus separate **Controls** that share state. You get the power of adaptive streaming and a **fully customizable video player UI** built directly on your canvas, not trapped inside an iframe embed.

### Why not just use the Bunny embed?

Bunny.net’s default Stream player is an iframe. That works until you need real design control.

With an iframe you cannot restyle controls like Framer layers. You cannot place only the play button. You cannot put the timeline under the player or float controls anywhere in the layout. The embed decides the UI.

Stream Bunny breaks that pattern. Drop components. Skin them in Framer. Ship a layout that looks like your site, not a stock widget.

### What you can build

- **Adaptive HLS playback** from your Bunny Stream library (quality adapts to the network)
- **Video Player** with Library ID, Video ID, and CDN host on the property panel
- **Controls** as separate layers: play/pause, seekable progress, time display, volume, fullscreen
- **Shared player state** across every control on the page
- **Templates** for pre-composed player layouts (one free starter today; more rolling out over time)
- **Quality Picker (Pro)** for manual rendition switching when you need it

Everything is layout-native: spacing, color, radius, typography, and position work like any other Framer component.

### Components

**Free tier (6 components)**
- BunnyVideoPlayer (HLS · adaptive quality)
- BunnyPlayPauseButton
- BunnyProgressBar (seekable)
- BunnyTimeDisplay
- BunnyVolumeSlider
- BunnyFullscreenButton

**Pro**
- BunnyQualityPickerButton (renditions · adaptive)
- Idle Fade code override (fade layer after pointer idle)
- Additional templates as they ship

**Coming soon**
- Captions
- Chapter markers

### Templates

Pre-composed player layouts you can drop in one step instead of wiring every control by hand.

- **Free:** one starter template (full-width hero-style layout).
- **Pro:** additional templates as they ship (portfolio reels, grids, tutorials, and similar layouts).
- More layouts are added over time; names and lineup may change between releases.

### Pricing

**Free**
- 5 canvas inserts per workspace
- All six free components
- One starter template

**Stream Bunny Pro · $49 once · lifetime updates**
- Unlimited canvas inserts
- Quality Picker
- Pro templates and features as they ship
- Priority email support

Purchase on Polar. You receive a license key by email. Open the plugin → **Account** → paste the key → **Activate**.

### Requirements

- A **Framer** project (latest plugin runtime)
- A **bunny.net** account with a **Stream** library and at least one encoded video
- Paste **Library ID**, **Video ID**, and **CDN host** on the Player (no Bunny API key in Framer)

Optional Bunny signup: https://bunny.net?ref=f9ztcmeo63

### Clean projects

By default, the plugin inserts **published Framer module instances**. Your project does not get a pile of `.tsx` source files unless you use maintainer embed mode. Your canvas stays clean.

### Privacy

- No analytics, tracking, or telemetry
- License activation validates your key via a small API (Polar); only the key is sent
- Insert count and license key are stored locally in your browser

Open source components: https://github.com/wearestokt/bunny-stream-official

### Support

Questions or playback help: **hello@wearestokt.com**  
Built by **Stōkt** · https://wearestokt.com

---

## Long description

### The iframe ceiling

Bunny.net’s default Stream embed is an iframe.

That’s fine until you try to design.

You can’t restyle controls. You can’t place just the play button. You can’t build a layout where the timeline lives outside the player. The embed decides everything.

Stream Bunny exists to break that ceiling.

### What Stream Bunny does

Stream Bunny is a Framer plugin that drops **bunny.net Stream** video building blocks onto your canvas:

- A real **Video Player** (adaptive **HLS**, Netflix/YouTube-style)
- Separate **Controls** you can place anywhere
- Shared state (play/pause, time, volume, fullscreen, quality)

You build the UI in your layout. Not inside an iframe.

### Free vs Pro (no games)

- **Free**: 5 canvas inserts per workspace, 6 components, and one starter template.
- **Stream Bunny Pro**: **$49 once · lifetime updates**. Unlimited inserts, every template, **Quality Picker**, priority email support.

Checkout runs on Polar. After purchase, you’ll get a license key by email. Paste it into the Account screen → instant unlock.

### Components shipped

**Free tier**
- BunnyVideoPlayer (HLS · adaptive quality)
- BunnyPlayPauseButton
- BunnyProgressBar (seekable)
- BunnyTimeDisplay (00:00 / 00:00)
- BunnyVolumeSlider (mute + slider)
- BunnyFullscreenButton

**Pro-only**
- BunnyQualityPickerButton (renditions · adaptive)

**Coming soon**
- Captions (subtitle tracks)
- Chapter markers

### Templates (pre-composed players)

- **Free:** one starter template
- **Pro:** additional pre-composed layouts as they ship (lineup grows over time)

### Compatibility / requirements

- **Framer**: Works in the **latest Framer plugin runtime** (verify with current Framer submission requirements if a version field is required).
- **Bunny.net Stream**: Requires a Bunny.net Stream library + video (you’ll paste Library ID + Video ID into the Player).

Affiliate link (optional): `https://bunny.net?ref=f9ztcmeo63`

### Privacy + open source posture

- No analytics. No tracking. No telemetry.
- Plugin runs inside the Framer plugin window. No backend collecting user data.
- License validation calls a Vercel-hosted proxy endpoint (`/api/license/validate`) which forwards to Polar’s customer-portal API. The Polar org token stays server-side only.
- Local-only storage: insert count + license key in localStorage.
- Open source repo: `https://github.com/wearestokt/bunny-stream-official`

### How inserts work (clean projects)

By default, components insert as **published Framer module URLs**.

That means: no `.tsx` source gets added to your project unless you explicitly choose an embed/source mode (if available in your build). Your canvas stays clean.

### Support

Email: `hello@wearestokt.com`  
Made by Jay Nadeau / Stōkt: `https://wearestokt.com`

## Feature bullets

- **Drop a real Bunny Stream player**, not an iframe embed.
- **Adaptive HLS playback** (quality switches with the network).
- **Player + separate Controls** that share state.
- **Skin everything in Framer**: layout, color, radius, spacing, typography.
- **Place controls anywhere** (timeline under the player, play button as a floating chip, etc.).
- **Seekable progress bar** with native Framer layout control.
- **Time display** (00:00 / 00:00) you can style like any text.
- **Volume slider + mute** as standalone controls.
- **Fullscreen button** you can position wherever your layout wants it.
- **Quality Picker (Pro)** for manual rendition switching.
- **Templates** for common layouts, ready to drop.
- **Hosted module inserts by default** (keeps source files out of your project).

## Who this is for / Who this is not for

**This is for**
- Studios and agencies building case studies, reels, and landing pages.
- Filmmakers who want portfolio video that doesn’t look like a stock embed.
- Designers who treat video UI like product UI.
- Indie builders shipping a site that needs clean, styled playback.

**This is not for**
- “Video CMS” shopping.
- SaaS marketing teams hunting for dashboards, analytics, and funnels.
- Anyone who wants to paste an iframe and never think about UI.

## Categories / tags suggestion

Proposed tags (verify against Framer’s current tag list):
- Video
- Streaming
- Player
- HLS
- Bunny.net
- Media
- Components
- Templates

## Pricing block

Use this wording everywhere. Don’t “discount” it with extra adjectives.

**Free**
- 5 canvas inserts per workspace
- 6 free components
- One starter template

**Stream Bunny Pro**
- **$49 once · lifetime updates**
- Unlimited inserts
- Every template
- Quality Picker
- Priority email support

Sold via Polar. Polar emails a license key after checkout.

## Compatibility & requirements

- **Framer**: Latest Framer plugin runtime (verify with current Framer submission requirements if a specific API/runtime version is required).
- **Bunny.net Stream**: A Bunny.net account + Stream library + video.
- **Internet**: Required for license validation during activation and for playback, since streams are delivered via Bunny’s CDN.

## Privacy & data

**What we collect**
- Nothing.

**What’s stored locally (in your browser)**
- Insert count
- License key (if you paste one)

**What’s sent to our backend**
- Only the license key during activation/validation.

**What’s sent to Polar**
- License key validation request (via a proxy). No analytics payload. No tracking identifiers from us.

No telemetry. No marketing pixels.

## Support & SLA

Email: `hello@wearestokt.com`  
Target reply time: **within 24 hours on weekdays**

## Versioning policy

- **Current version**: **v1.4.0**
- **Policy**: Semantic Versioning (semver)
  - Patch: fixes + small polish
  - Minor: new components/templates/features (backwards compatible)
  - Major: breaking changes (rare; clearly called out)

## Changelog

Public release notes: [`CHANGELOG.md`](../CHANGELOG.md) in the repository root.

### v1.4.0 (current)

- **BunnyQualityPickerButton** (Pro) for manual HLS rendition switching.
- Documentation hub under `docs/`, plugin versioning and Help links aligned.

## License

- **Components**: MIT-style open source in `https://github.com/wearestokt/bunny-stream-official`
- **Plugin**: sold via Polar (license key unlock for Pro features)
- **Plugin binary distribution**: proprietary license for the distributed plugin build (no resale / no redistribution of the paid build outside approved marketplaces)

## Submission checklist

One pass before you hit Submit.

- **Listing copy**
  - Plugin name is exactly **Stream Bunny**
  - One-liner / tagline / short description stay within Framer’s current character limits (verify with current submission requirements)
  - Pricing is written **exactly**: **$49 once · lifetime updates**
  - No hype words, no funnel language, no fake stats, no testimonials
  - Support email present: `hello@wearestokt.com`
  - Repo link present: `https://github.com/wearestokt/bunny-stream-official`
  - Bunny affiliate link uses: `https://bunny.net?ref=f9ztcmeo63`

- **Product truth**
  - Free tier: **5 canvas inserts per workspace** (not “trial”)
  - Pro: unlimited inserts + templates + Quality Picker + priority support
  - Coming soon: captions + chapter markers (only; no extra promises)

- **Privacy / data**
  - “No analytics / no tracking / no telemetry” included
  - License validation described without leaking hostnames or secrets
  - Local storage items: insert count + license key

- **Assets**
  - Icon + cover + 4–8 screenshots ready (see `./marketplace-assets.md`)
  - No debug toggles visible
  - No personal email addresses, license keys, or real customer data visible
  - Version shown (if shown anywhere) matches **v1.4.0**

