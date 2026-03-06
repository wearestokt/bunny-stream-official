# Bunny Stream Plugin – Figma Design

## Import into Figma

1. Open Figma and create a new file (or use an existing one).
2. **File → Place image** (or drag & drop) the `bunny-stream-plugin-ui.figma-ready.svg` file.
3. Or: **Drag the SVG file** directly onto the Figma canvas.
4. Figma will import the SVG as vector layers you can edit.

## Design Spec (for manual recreation)

If you prefer to build from scratch in Figma, here are the specs:

### Panel
- **Size:** 320 × 420 px
- **Corner radius:** 12 px
- **Background:** `#1a1a1a` (dark) or `#ffffff` (light)

### Title
- **Text:** "Bunny Stream Video Player"
- **Font:** Geist Mono (or Inter as fallback)
- **Size:** 16 px
- **Weight:** 600 (Semibold)
- **Color:** `#ffffff` (dark) / `#333333` (light)
- **Position:** 16 px from top and left

### List
- **Gap between items:** 4 px
- **Top margin from title:** 16 px

### List item (each row)
- **Height:** 36 px
- **Width:** 288 px (full width minus 32 px padding)
- **Corner radius:** 6 px
- **Background:** `#2a2a2a` (dark) / `#f5f5f5` (light)
- **Padding:** 12 px horizontal, 10 px vertical (icon area)

### Icon
- **Size:** 16 × 16 px
- **Color:** `#ffffff` (dark) / `#333333` (light)
- **Left offset:** 12 px from row edge

### Item label
- **Font:** Geist Pixel (or monospace fallback)
- **Size:** 12 px
- **Color:** `#b0b0b0` (dark) / `#666666` (light)
- **Left offset:** 40 px (after icon + 12 px gap)

### Components (in order)
1. BunnyVideoPlayer – video/camera icon
2. BunnyPlayPauseButton – play triangle icon
3. BunnyVolumeSlider – speaker/volume icon
4. BunnyProgressBar – gauge/progress icon
5. BunnyTimeDisplay – clock icon
6. BunnyQualityPickerButton – settings/gear icon
7. BunnyFullscreenButton – expand/fullscreen icon

---

After editing in Figma, you can:
- Export updated assets
- Share the file link for implementation
- Use **Dev Mode** to inspect and copy specs
