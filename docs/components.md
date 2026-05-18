# Component reference

Framer property panels for Stream Bunny are defined in code via `addPropertyControls` in [`components/`](../components/). This page explains how to use each component; the **property tables** below are generated from source.

## Shared rules

- **Store ID** — Every control must match the **BunnyVideoPlayer** `storeId` (default `default`).
- **BunnyVideoStore** — Required dependency; installed by the plugin. Do not remove.
- **No wiring** — Drop controls near the Player; state is shared automatically.

## BunnyVideoStore

Not draggable from the plugin palette. Holds playhead, duration, mute, quality, hover, and related state per `storeId`. One store module per project is typical.

## BunnyIdleFade (Pro code override)

Not a canvas component. Publish `BunnyIdleFade` from your library, add via plugin **Code Override → Idle Fade**, then apply **`withBunnyIdleFade`** on any layer.

| Setting | Where |
| --- | --- |
| Idle delay (seconds) | `IDLE_HIDE_DELAY_SEC` in `BunnyIdleFade.tsx` (default `3`) |

## Roadmap (not shipped)

**Captions** and **Chapter markers** appear in the plugin catalog as coming soon — not available in this release.

---

## Property tables (generated)

Regenerate after changing `addPropertyControls` in `components/*.tsx`:

```bash
npm run docs:components
```

The tables below are synced from source. Nested **Object (group)** rows open sub-controls in the Framer panel (e.g. **Track Settings** on the progress bar).
## BunnyVideoPlayer

| Property | Panel title | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `children` | Content | ComponentInstance | — | Conditional visibility |
| `videoId` | Video ID | String | 44626466-5195-4e9f-9f25-961994cd10df | — |
| `libraryId` | Library ID | String | 235256 | — |
| `pullZoneHostname` | CDN host name | String | vz-a81672d8-ea0.b-cdn.net | — |
| `previewOnCanvas` | Preview on Canvas | Boolean | — | — |
| `autoplay` | Autoplay | Boolean | — | With Muted off: playback starts muted so the browser allows it, then un-mutes ~0.22s after playback really starts (`playing` / time). Play on hover overrides. If needed, one click anywhere retries. |
| `tapToPlay` | Tap to Play | Boolean | true | — |
| `playOnHover` | Play on Hover | Boolean | false | Play while the cursor is over the player; pauses when it leaves. Touch devices still use Tap to Play. |
| `loop` | Loop | Boolean | — | — |
| `muted` | Muted | Boolean | — | — |
| `showControls` | Show Controls | Boolean | — | — |
| `hideControlsOnIdle` | Hide Controls on Idle | Boolean | true | Hide controls when the mouse is idle. |
| `controlsHideDelay` | Hide Delay | Number | 3 | Seconds of idle time before controls vanish. · Conditional visibility |
| `quality` | Quality | Enum | — | — |
| `poster` | Poster | Image | — | — |
| `fallbackImage` | Fallback (video error) | Image | — | — |
| `startTimePercent` | Start % | Number | — | — |
| `fit` | Fit | Enum | — | — |
| `lazyLoad` | Lazy Load | Boolean | — | When on, the stream mounts only after the gate below (viewport or interaction). On dense grids many cards can still be in view at once — use Defer until + Min visible % or 0px margin to avoid loading every tile at once. |
| `deferVideoUntil` | Defer until | Enum | viewport | Viewport: mount when this player intersects the viewport (see Lazy margin / Min visible %). Interaction: poster only until the user hovers or presses this player — best for portfolio grids and many videos on one page. Framer Preview still loads so you can edit. · Conditional visibility |
| `lazyRootMargin` | Lazy margin | String | 100px | IntersectionObserver rootMargin for Viewport mode only (e.g. 0px = no preload outside the viewport). · Conditional visibility |
| `lazyLoadMinRatio` | Min visible % | Number | 0 | Minimum percent of this player that must be visible before Viewport mode mounts the video. 0 = first visible pixel. Try 10–25 on grids so only mostly-visible tiles load. · Conditional visibility |
| `pauseWhenOutOfView` | Pause Off-Screen | Boolean | true | Pause when this player leaves the viewport and resume when it returns (if it was playing). Reduces load with many videos. For carousels with Autoplay + unmuted, turn Off so inactive slides stay playing (muted via Store ID / exclusive audio) and can regain sound when they return without a fresh tap. |
| `storeId` | Store ID | String | default | Same id on every control for this video. Duplicate slides may share one id; play state stays linked.\n\nUse a different Store ID per video on the same page: only the latest autoplay-unmuted player is audible; when it unmounts or mutes, sound returns to the previous one (audio floor stack).\n\nMade by [Stōkt](https://wearestokt.com/) |

## BunnyPlayPauseButton

| Property | Panel title | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `storeId` | Store ID | String | default | Must match BunnyVideoPlayer. |
| `playIconStyle` | Play Icon | Enum | — | — |
| `pauseIconStyle` | Pause Icon | Enum | — | — |
| `iconStrokeWidth` | Stroke Width | Number | — | Conditional visibility |
| `playIconColor` | Play Icon Color | Color | — | — |
| `pauseIconColor` | Pause Icon Color | Color | — | — |
| `iconSize` | Icon Size | Number | 24 | — |
| `padding` | Padding | Padding | 0px | — |
| `playIcon` | Play Icon (custom) | Image | — | — |
| `pauseIcon` | Pause Icon (custom) | Image | — | Made by [Stōkt](https://wearestokt.com/) |

## BunnyProgressBar

| Property | Panel title | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `storeId` | Store ID | String | default | Must match BunnyVideoPlayer. |
| `track` | Track Settings | Object (group) | — | — |
| `buffer` | Buffer | Object (group) | — | Conditional visibility |
| `progress` | Progress Bar | Object (group) | — | Custom CSS gradient. [Create one visually](https://cssgradient.io/) and paste the value here. · Conditional visibility |
| `playhead` | Playhead | Object (group) | — | Custom image for the playhead. |

## BunnyTimeDisplay

| Property | Panel title | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `storeId` | Store ID | String | default | Must match BunnyVideoPlayer. |
| `format` | Format | Enum | currentSlashDuration | — |
| `font` | Font | Font | — | — |
| `color` | Color | Color | #ffffff | Made by [Stōkt](https://wearestokt.com/) |

## BunnyVolumeSlider

| Property | Panel title | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `storeId` | Store ID | String | default | Must match BunnyVideoPlayer. |
| `muteIconStyle` | Mute Icon | Enum | default | — |
| `unmuteIconStyle` | Unmute Icon | Enum | default | — |
| `iconStrokeWidth` | Stroke Width | Number | 2 | Conditional visibility |
| `muteIcon` | Mute Icon (custom) | Image | — | — |
| `unmuteIcon` | Unmute Icon (custom) | Image | — | — |
| `iconColor` | Icon Color | Color | #ffffff | — |
| `iconSize` | Icon Size | Number | 24 | — |
| `padding` | Padding | Padding | 0px | — |
| `volumeSlider` | Volume Slider | Boolean | true | — |
| `sliderPosition` | Slider Position | Enum | right | Conditional visibility |
| `iconSliderMargin` | Icon–Slider Margin | Number | 8 | Space between the volume icon and the slider. · Conditional visibility |
| `mobileBreakpoint` | Mobile Breakpoint | Number | 768 | Conditional visibility |
| `min` | Min | Number | 0 | Volume minimum. · Conditional visibility |
| `max` | Max | Number | 100 | Volume maximum. · Conditional visibility |
| `sliderLength` | Slider Length | Number | 80 | Length of the slider bar. · Conditional visibility |
| `sliderThickness` | Slider Thickness | Number | 6 | Conditional visibility |
| `sliderColor` | Slider Color | Color | rgba(255,255,255,0.3) | Conditional visibility |
| `sliderRadius` | Slider Radius | Number | — | Conditional visibility |
| `progressFill` | Progress Fill | Enum | color | Conditional visibility |
| `progressColor` | Progress Color | Color | #ffffff | Conditional visibility |
| `progressGradient` | Progress Gradient | String | — | Conditional visibility |
| `thumbColor` | Thumb Color | Color | #ffffff | Conditional visibility |
| `thumbSize` | Thumb Size | Number | — | Conditional visibility |
| `thumbIcon` | Thumb Icon | Image | — | Conditional visibility |
| `thumbShadow` | Thumb Shadow | BoxShadow | 0 0 0 2px rgba(0,0,0,0.2) | Made by [Stōkt](https://wearestokt.com/) · Conditional visibility |

## BunnyQualityPickerButton

| Property | Panel title | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `storeId` | Store ID | String | default | Must match BunnyVideoPlayer. |
| `previewPopupOnCanvas` | Preview menu on canvas | Boolean | false | Framer canvas only: keeps the quality menu open so you can tune popup/row settings. In Preview and on the published site this does nothing. Turn off when finished editing. |
| `iconButton` | Icon / Button | Object (group) | — | Style, color, size, padding, and custom icon for the gear button. · Conditional visibility |
| `popup` | Popup | Object (group) | — | Placement, gap, background, padding, radius, and border for the quality menu. |
| `items` | Items | Object (group) | — | Font, padding, gap between rows, radius, backgrounds, text colors (default / hover / selected), border, and check icon for each quality option. |

## BunnyFullscreenButton

| Property | Panel title | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `storeId` | Store ID | String | default | Must match BunnyVideoPlayer. |
| `iconColor` | Icon Color | Color | #ffffff | — |
| `iconSize` | Icon Size | Number | 24 | — |
| `padding` | Padding | Padding | 0px | — |
| `expandIcon` | Expand Icon (custom) | Image | — | — |
| `exitIcon` | Exit Icon (custom) | Image | — | Made by [Stōkt](https://wearestokt.com/) |
