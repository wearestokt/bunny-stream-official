# Bunny Stream Framer Components

Standalone Framer code components for [Bunny Stream](https://bunny.net/stream) video playback, plus a **separate** optional image carousel.

## Repos layout

| Path | What it is |
|------|----------------|
| [`components/`](components/) | Video player, store, controls |
| [`plugin/`](plugin/) | **Stream Bunny** Framer plugin (installs everything under `components/` except the carousel) |
| [`bunny-image-carousel/`](bunny-image-carousel/) | **Image carousel** only: one [`BunnyImageCarousel.tsx`](bunny-image-carousel/BunnyImageCarousel.tsx) + its own [`plugin/`](bunny-image-carousel/plugin/) |

The carousel is **not** bundled with the main Stream plugin so you can ship or omit it independently.

## Install Options

### Video player + controls

**Option A – Plugin:** [`plugin/`](plugin/) → `npm install && npm run dev`, open **Stream Bunny** in Framer, install components.

**Option B – Manual:** See [Setup in Framer (manual)](#setup-in-framer-manual) below.

### Image carousel only

**Option A – Plugin:** [`bunny-image-carousel/plugin/`](bunny-image-carousel/plugin/) → `npm install && npm run dev`, open **Bunny Image Carousel** in Framer. Add the **`three`** npm package in Framer first.

**Option B – Manual:** Add **`three`**, then paste [`bunny-image-carousel/BunnyImageCarousel.tsx`](bunny-image-carousel/BunnyImageCarousel.tsx) into a single Framer code file. Details: [`bunny-image-carousel/README.md`](bunny-image-carousel/README.md).

## Setup in Framer (manual) — video stack

**Order matters** – Create shared modules first, then the player, then controls.

1. **BunnyVideoStore** – Paste [`components/BunnyVideoStore.tsx`](components/BunnyVideoStore.tsx) as `BunnyVideoStore.tsx`.

2. **BunnyVideoPlayer** – Paste [`components/BunnyVideoPlayer.tsx`](components/BunnyVideoPlayer.tsx) (imports `./BunnyVideoStore.tsx` only).

3. **Control components** – One file each from [`components/`](components/); each imports `./BunnyVideoStore.tsx`.

4. **Add to Library** – Right-click each component → Add to Library.

## Components

### Core (video)

- **BunnyVideoPlayer** – Main video embed. Requires `libraryId` and `videoId` from your Bunny Stream dashboard.

### Image carousel (separate folder)

- **BunnyImageCarousel** – Lives under [`bunny-image-carousel/`](bunny-image-carousel/). Self-contained `BunnyImageCarousel.tsx` (only `framer`, `react`, `three`). See [`bunny-image-carousel/README.md`](bunny-image-carousel/README.md).

### Method Triggers (buttons/sliders that control the player)

- BunnyPlayPauseButton
- BunnyVolumeSlider
- BunnyProgressBar (seekable)
- BunnyTimeDisplay
- BunnyQualityPickerButton
- BunnyFullscreenButton

## Usage (video)

1. Add **BunnyVideoPlayer** to the canvas. Set Library ID and Video ID in the Properties panel.
2. Add control components (e.g. BunnyPlayPauseButton, BunnyProgressBar) near the player.
3. **For fullscreen:** **BunnyFullscreenButton** enters fullscreen only. When in fullscreen, exit via the native video controls' fullscreen button.
4. All components share state via the store – no wiring needed.

## Bunny Stream

Get your Library ID and Video ID from [Bunny Stream](https://bunny.net/stream). The player uses HLS streams from Bunny's CDN.

**URL format:** `https://vz-{libraryId}.b-cdn.net/{videoId}/playlist.m3u8`

If your library uses a different CDN hostname, set **CDN host name** in the component properties (e.g. `vz-12345.b-cdn.net` from your library's API/settings).
