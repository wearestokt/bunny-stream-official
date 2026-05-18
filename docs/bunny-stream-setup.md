# Bunny.net Stream setup for Stream Bunny

Stream Bunny plays **HLS** from your Bunny Stream library. You need a bunny.net account, a Stream library, encoded videos, and three values in the Framer Player.

Sign up (optional affiliate): [bunny.net](https://bunny.net?ref=f9ztcmeo63) → enable **Stream**.

## 1. Create a Stream library

1. Log in to the [bunny.net dashboard](https://bunny.net).
2. Open **Stream** → **Video libraries**.
3. Create a library (or use an existing one).
4. Note the **Library ID** (numeric) — you will paste this into Framer as **Library ID**.

Each library has a pull zone / CDN hostname for delivery. Stream Bunny builds URLs from that host plus your video GUID.

## 2. Upload and encode videos

1. Open your library → **Upload** (or pull from URL/storage).
2. Wait until the video status is **Finished** (encoding complete).
3. For adaptive HLS and the **Quality Picker** (Pro), enable **multiple resolutions** in encoding settings (e.g. 1080p, 720p, 480p, 360p). A single rendition still plays, but viewers cannot switch quality.

The player uses **hls.js** in browsers without native HLS. When both HEVC and AVC exist for a height, the player prefers **HEVC** on capable devices, then falls back.

## 3. Find IDs for Framer {#ids}

Open the video in your Stream library and collect:

| Bunny dashboard | Framer property (BunnyVideoPlayer) | Example |
| --- | --- | --- |
| **Video library ID** | **Library ID** | `235256` |
| **Video GUID** (per video) | **Video ID** | `44626466-5195-4e9f-9f25-961994cd10df` |
| **CDN hostname** / pull zone host | **CDN host name** | `vz-a81672d8-ea0.b-cdn.net` |

**CDN host name**

- Default pattern: `vz-{libraryId}.b-cdn.net`
- If playback or thumbnails fail with the default, copy the exact hostname from your library’s **API** or **CDN** settings in the Bunny dashboard (some libraries use a custom `vz-….b-cdn.net` host).

Stream Bunny does **not** require your Bunny API key in Framer — playback uses public HLS URLs.

## 4. URL sanity check

Replace `{host}` and `{videoId}` with your values:

- **Playlist (HLS):** `https://{host}/{videoId}/playlist.m3u8`
- **Thumbnail:** `https://{host}/{videoId}/thumbnail.jpg`

Open the playlist URL in a browser or VLC. If it loads, the Player should work in Framer Preview.

## 5. Optimize for Framer layouts

### Portfolio grids (many videos on one page)

- Turn on **Lazy Load**.
- Set **Defer until** → **Interaction** so each tile loads only after hover or press (poster until then).
- Or keep **Viewport** but set **Lazy margin** to `0px` and **Min visible %** to `10`–`25` so off-screen tiles do not all mount at once.

### Long scrolling pages

- Keep **Pause Off-Screen** on so videos pause when scrolled away (saves CPU/GPU).

### Carousels with autoplay

- If slides should keep playing when off-screen (muted handoff between slides), turn **Pause Off-Screen** **off** on those players — see the property description on the Player.

### Editor performance

- Use **Preview on Canvas** to show a static first frame while designing heavy pages.

## 6. What you do not need

| Not required | Why |
| --- | --- |
| Bunny iframe embed | Stream Bunny uses native `<video>` + HLS |
| API key in components | URLs are public CDN paths |
| Re-exporting video for Framer | Stream stays on Bunny CDN |
| Custom CORS setup | Default playback does not fetch from your domain |

Only add CORS or signed URLs if you build custom fetch logic outside these components.

## Next steps

- [Plugin guide](plugin.md) — install components from the plugin
- [Component reference](components.md) — all Player and control properties
- [Troubleshooting](troubleshooting.md) — black screen, wrong host, autoplay
