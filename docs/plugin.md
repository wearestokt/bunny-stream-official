# Stream Bunny plugin guide

The **Stream Bunny** Framer plugin installs published Bunny Stream components on your canvas. By default it does **not** copy `.tsx` source into your project — it inserts hosted Framer module URLs (same as **Assets → Code Component → Copy URL**).

## Install the plugin

### From the Framer Marketplace

1. In Framer, open **Plugins** and search for **Stream Bunny**.
2. Install and open the plugin from the plugin menu.

### For development (maintainers)

See [plugin/README.md](../plugin/README.md): `npm install`, configure `plugin/.env.local` with `VITE_SB_MODULE_*` URLs, `npm run dev`, then **Plugins → Open Development Plugin**.

## Plugin screens

| Screen | Purpose |
| --- | --- |
| **Dashboard** | Overview, what’s new, links to docs and tutorial |
| **Components** | Drag Player, controls, and Pro items onto the canvas |
| **Templates** | Pre-built layouts (Pro; requires published template module URLs) |
| **Quick Start** | Six-step setup (account → tutorial → player → IDs → controls) |
| **Account** | Free tier usage, **Buy on Polar**, paste license key for Pro |
| **Help** | Tutorial, documentation, changelog, GitHub, support |

## Add components to the canvas

1. Open **Components** in the plugin.
2. Drag **BunnyVideoPlayer** into a Frame.
3. Set **Library ID**, **Video ID**, and **CDN host name** in the Properties panel ([where to find them](bunny-stream-setup.md#ids)).
4. Drag controls (play/pause, progress, time, volume, fullscreen). They connect automatically when **Store ID** matches the Player (default: `default`).
5. Optional (Pro): add **Quality Picker** and **Idle Fade** code override — see below.

**BunnyVideoStore** is installed automatically when needed. Do not delete it; the Player and controls depend on it.

## Free tier vs Pro

| Feature | Free | Pro |
| --- | --- | --- |
| Canvas inserts | 5 per workspace | Unlimited |
| Player + core controls | Yes | Yes |
| Templates | — | Yes (when module URLs are configured) |
| BunnyQualityPickerButton | — | Yes |
| BunnyIdleFade code override | — | Yes |

Upgrade via **Account** → **Buy on Polar** ($49 once · lifetime updates). Polar emails a license key; paste it in **Account** to unlock Pro.

## Code override: Idle Fade (Pro)

1. In **Components**, open **Code Override** → **Idle Fade** → **Add to project**.
2. Select any layer → **Code Override** in the property panel → choose **`withBunnyIdleFade`**.
3. To change the delay, edit `IDLE_HIDE_DELAY_SEC` in the published `BunnyIdleFade` library file (default 3 seconds).

Idle Fade is independent of the video Player — it fades any layer after pointer idle anywhere on the page.

## Fullscreen behavior

**BunnyFullscreenButton** enters fullscreen. Exit via the **native video controls** fullscreen control while in fullscreen mode.

## Hosted modules (how installs work)

Production plugin builds use environment variables (`VITE_SB_MODULE_*`) set at build time. Each variable is a Framer **Copy URL** for a published code component. Users get modules only — not your source tree.

Maintainers may use `VITE_STREAM_BUNNY_EMBED_SOURCES=true` locally to inject repo `.tsx` files; **never** ship marketplace builds with embed mode enabled.

## Related docs

- [Bunny.net Stream setup](bunny-stream-setup.md)
- [Component property reference](components.md)
- [Troubleshooting](troubleshooting.md)
- Maintainer build/pack: [plugin/README.md](../plugin/README.md)
