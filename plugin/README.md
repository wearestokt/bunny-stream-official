# Bunny Stream Framer Plugin

Framer plugin that provides a component palette for the Bunny Stream **video player** and controls. Drag components from the plugin window onto your canvas.

The **image carousel** is a separate plugin under [`../bunny-image-carousel/plugin/`](../bunny-image-carousel/plugin/).

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the plugin in dev mode:
   ```bash
   npm run dev
   ```

3. In Framer:
   - Enable **Developer Tools** (Plugins section in main menu)
   - Open **Plugins** → **Open Development Plugin**
   - The Bunny Stream plugin will load

4. Drag any component from the list onto the canvas to insert it.

## Components

The plugin ensures all Bunny Stream components exist in your project (creates them if missing). You can drag:

- BunnyVideoPlayer (main video embed)
- BunnyPlayPauseButton
- BunnyVolumeSlider
- BunnyProgressBar
- BunnyTimeDisplay
- BunnyQualityPickerButton
- BunnyFullscreenButton

**BunnyVideoStore** is installed automatically when missing (not shown as a draggable item). It is required by the player and controls.

## Pack for Publishing

```bash
npm run pack
```

Creates `plugin.zip` for submission to the Framer plugin marketplace.
