# Architecture

## Components overview

```mermaid
flowchart LR
  subgraph framer [Framer canvas]
    Player[BunnyVideoPlayer]
    Store[BunnyVideoStore]
    Controls[Controls]
    Player --> Store
    Controls --> Store
  end
  subgraph bunny [Bunny CDN]
    HLS["playlist.m3u8"]
  end
  Player --> HLS
```

| Piece | Role |
| --- | --- |
| **BunnyVideoPlayer** | `<video>` + HLS (hls.js where needed), lazy load, autoplay policy, optional native controls |
| **BunnyVideoStore** | Shared React state per `storeId` (play, time, volume, quality, hover, etc.) |
| **Controls** | UI that reads/writes the same store — no manual wiring between siblings |
| **BunnyIdleFade** | Optional code override; not tied to the store |

## Store ID

Every Player and control on the **same video** must use the same **Store ID** (default: `default`).

- **Multiple videos on one page:** use a **different Store ID** per video (e.g. `hero`, `card-2`). Autoplay-with-sound uses an audio “floor” so only one unmuted autoplay player wins at a time.
- **Duplicate slides** with the same Store ID intentionally share play state.

## Stream URLs

The Player builds:

- **Stream:** `https://{cdnHost}/{videoId}/playlist.m3u8`
- **Thumbnail:** `https://{cdnHost}/{videoId}/thumbnail.jpg`

`cdnHost` is **CDN host name** if set; otherwise `vz-{libraryId}.b-cdn.net`.

## Plugin vs manual install

| Mode | What lands in the Framer project |
| --- | --- |
| **Marketplace plugin (default)** | Published `framer.com/m/…` module instances only |
| **Manual** | You paste `components/*.tsx` into Code (see [README](../README.md)) |
| **Maintainer embed** | Plugin injects local `.tsx` when `VITE_STREAM_BUNNY_EMBED_SOURCES=true` — not for end users |

## Pro features

- **BunnyQualityPickerButton** — switches HLS levels via hls.js when multiple renditions exist.
- **BunnyIdleFade** — `withBunnyIdleFade` code override; delay edited in library source.

## Coming soon (not shipped)

The plugin catalog lists **Captions** and **Chapter markers** as upcoming; they are not in the repo yet.

## Separate product

The **Bunny Image Carousel** lives in [`bunny-image-carousel/`](../bunny-image-carousel/) with its own plugin — not part of Stream Bunny.
