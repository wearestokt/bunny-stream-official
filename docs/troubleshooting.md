# Troubleshooting

## Video does not play / black screen

1. **Check IDs** — [Library ID, Video ID, CDN host](bunny-stream-setup.md#ids) must match the Bunny dashboard for that video.
2. **Encoding** — wait until the video is **Finished** in Stream.
3. **Test the HLS URL** — open `https://{cdnHost}/{videoId}/playlist.m3u8` in a browser. If it fails, fix Bunny/CDN first.
4. **CDN host name** — if default `vz-{libraryId}.b-cdn.net` fails, paste the library’s real pull zone hostname.
5. **Lazy load** — with **Lazy Load** on, the stream may not mount until viewport or interaction rules are met; test in **Preview**, not only on canvas.

## Autoplay does not start or stays muted

Browsers block unmuted autoplay.

- **Autoplay** with **Muted** off: the Player starts muted, then may un-mute shortly after playback starts; one user click may be required on strict browsers.
- Use **Muted** on for guaranteed autoplay.
- **Play on Hover** overrides autoplay behavior while the cursor is over the player.
- On mobile, autoplay often needs **Muted** or **Tap to Play**.

## Controls do not affect the video

- Confirm every control uses the same **Store ID** as the **BunnyVideoPlayer**.
- Ensure **BunnyVideoStore** exists in the project (the plugin adds it automatically).

## Quality Picker is empty or disabled

- Video must have **multiple encoded resolutions** in Bunny Stream.
- Feature requires **Stream Bunny Pro** and a published **BunnyQualityPickerButton** module URL in the plugin build.

## Plugin: “Failed to load Development Plugin”

See [plugin/README.md](../plugin/README.md#troubleshooting-failed-to-load-development-plugin): dev server running, Developer Tools enabled, port 5173, HTTPS trust, no duplicate component files.

## Plugin: configuration / module URL error

The distributed plugin needs `VITE_SB_MODULE_*` set at **build** time. End users should not see this; if you are building the plugin, copy every component’s Framer **Copy URL** into `.env` before `npm run pack`.

## License / Pro not unlocking

1. Set `VITE_LICENSE_VALIDATE_URL` to your deployed `POST /api/license/validate` endpoint (see [plugin/README.md](../plugin/README.md)).
2. Paste the Polar license key in **Account** (no extra spaces).
3. Check network in browser devtools — validation must return success from your API.

## Fullscreen

Enter with **BunnyFullscreenButton**. Exit with the **native video control** fullscreen button while in fullscreen.

## Still stuck?

Email [hello@wearestokt.com](mailto:hello@wearestokt.com?subject=Stream%20Bunny%20support) with your Library ID, Video ID, CDN host (not your API key), and a link to your Framer preview.
