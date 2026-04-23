# Bunny Image Carousel (Framer)

Self-contained **9:16** carousel for [Bunny Stream](https://bunny.net/stream) thumbnails (`thumbnail_1.jpg`), optional per-slide images, draggable 3D layout, and optional WebGL distortion (requires **`three`** in your Framer project).

This folder is **separate** from the main [Bunny Stream player plugin](../plugin/): use the carousel plugin here, or copy the component file manually.

## Install

### Plugin (recommended)

1. From this folder run `cd plugin && npm install && npm run dev`
2. Open the **Bunny Image Carousel** plugin in Framer and install the component.

### Manual

1. In Framer → Code → npm, add **`three`** (e.g. `three@0.170.0`).
2. Create a code file **`BunnyImageCarousel.tsx`** and paste [`BunnyImageCarousel.tsx`](./BunnyImageCarousel.tsx) (this folder root).

## CMS

Use the **Slides** array in the Properties panel and connect CMS fields where Framer allows. See [Framer: code components and the CMS](https://www.framer.com/help/articles/issues-with-code-components-accessing-the-cms/).

## “Not supported” vs Marketplace URLs (`framer.com/m/...`)

URLs like [Curve3DCarousel](https://framer.com/m/Curve3DCarousel-Np42na.js@2wFkYImJtV2vMCEZlg9o) are **Framer Marketplace modules**: Framer serves a tiny file that re-exports code from **`framerusercontent.com`**. The Import field in Framer generally only accepts **that kind of Framer-hosted module**, not GitHub raw URLs or arbitrary JS.

This repo is **not** on Framer’s CDN until you **publish it as a Marketplace component** (Framer’s submission flow). Until then, use one of these—same end result as “complex import,” just not a `framer.com/m/` link:

1. **Bunny Image Carousel plugin** – `cd plugin && npm run dev`, open the dev plugin in Framer, drag **Image Carousel** (installs `BunnyImageCarousel.tsx` into Code).
2. **Manual** – Assets → Code → new file `BunnyImageCarousel.tsx`, paste this folder’s `BunnyImageCarousel.tsx`, add the **`three`** npm dependency.

If Framer still says the component is unsupported after that, check the **Code** panel for a red error (often missing **`three`** or a syntax issue after paste).
