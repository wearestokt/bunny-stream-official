# Bunny Stream Framer Components

Standalone Framer code components for [Bunny Stream](https://bunny.net/stream) video playback.

## Install Options

**Option A – Plugin (recommended):** Use the [Bunny Stream Framer plugin](plugin/) to install all components with one click. Run `npm run dev` in the `plugin/` folder, then open the plugin in Framer and click "Install Components".

**Option B – Manual copy-paste:** Copy each component into Framer and add to your Workspace Library (see below).

## Setup in Framer (manual)

**Order matters** – Create `BunnyVideoStore` first, then the player, then controls.

1. **BunnyVideoStore** – Assets → Code → Create Code File → name it `BunnyVideoStore`. Paste `components/BunnyVideoStore.tsx`. Use import `./BunnyVideoStore.tsx` (extension required).

2. **BunnyVideoPlayer** – Create code file, paste `components/BunnyVideoPlayer.tsx`. It imports from `./BunnyVideoStore`.

3. **Control components** – Create one code file per component. Each imports from `./BunnyVideoStore`. Framer resolves imports by file name.

4. **Add to Library** – Right-click each component → Add to Library.

## Components

### Core
- **BunnyVideoPlayer** – Main video embed. Requires `libraryId` and `videoId` from your Bunny Stream dashboard.

### Method Triggers (buttons/sliders that control the player)
- BunnyPlayPauseButton
- BunnyVolumeSlider
- BunnyProgressBar (seekable)
- BunnyTimeDisplay
- BunnyQualityPickerButton
- BunnyFullscreenButton

## Usage

1. Add **BunnyVideoPlayer** to the canvas. Set Library ID and Video ID in the Properties panel.
2. Add control components (e.g. BunnyPlayPauseButton, BunnyProgressBar) near the player.
3. **For fullscreen:** **BunnyFullscreenButton** enters fullscreen only. Position it where you want (e.g. bottom-right). When in fullscreen, exit via the native video controls' fullscreen button.
4. All components share state via the store – no wiring needed.

## Bunny Stream

Get your Library ID and Video ID from [Bunny Stream](https://bunny.net/stream). The player uses HLS streams from Bunny's CDN.

**URL format:** `https://vz-{libraryId}.b-cdn.net/{videoId}/playlist.m3u8`

If your library uses a different CDN hostname, set **CDN host name** in the component properties (e.g. `vz-12345.b-cdn.net` from your library's API/settings).
