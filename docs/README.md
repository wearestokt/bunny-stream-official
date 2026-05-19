# Stream Bunny documentation

Stream Bunny brings **bunny.net Stream** HLS playback into Framer as real code components — a Player plus separate Controls that share state. No iframe embed.

## Start here

| I want to… | Read |
| --- | --- |
| Install and use the Framer plugin | [Plugin guide](plugin.md) |
| Set up bunny.net Stream for best results | [Bunny Stream setup](bunny-stream-setup.md) |
| Look up every property on every component | [Component reference](components.md) |
| Understand how Player + Store + Controls connect | [Architecture](architecture.md) |
| Fix playback, IDs, or license issues | [Troubleshooting](troubleshooting.md) |
| Ship or review the plugin for Framer Marketplace | [Framer plugin checklist](framer-plugin-checklist.md) |

## Install paths

**Recommended — Stream Bunny plugin**

1. Install **Stream Bunny** from the Framer Marketplace (or load the dev plugin — see [plugin/README.md](../plugin/README.md)).
2. Open the plugin → **Components** → drag **Video Player** and controls onto the canvas.
3. Paste your Bunny **Library ID**, **Video ID**, and **CDN host name** on the Player (see [Bunny Stream setup](bunny-stream-setup.md#ids)).

**Manual — paste code components**

If you are not using the plugin, follow the short path in the [repository README](../README.md) and still use this hub for Bunny setup and property reference.

## Tiers

| Tier | Canvas inserts | Templates | Quality Picker | Idle Fade override |
| --- | --- | --- | --- | --- |
| Free | 5 per workspace | SB - Basic | — | — |
| **Stream Bunny Pro** ($49 once · lifetime updates) | Unlimited | SB - Basic (+ more as they ship) | Yes | Yes |

Activate Pro in the plugin **Account** screen with your Polar license key.

## Maintainer workflow

Keep docs in sync when you change the product:

1. **Component properties** — edit `components/*.tsx`, then run `npm run docs:components` and commit `docs/components.generated.md`.
2. **Version** — bump `plugin/package.json`, `plugin/src/copy.ts` (`PLUGIN_VERSION`), and root `CHANGELOG.md`.
3. **Pricing / free tier** — update `plugin/src/copy.ts` when tiers or checkout copy change.
4. **In-plugin copy** — prefer `copy.ts` or link to these docs instead of duplicating long setup text.

## Changelog

Release notes: [CHANGELOG.md](../CHANGELOG.md) in the repository root.

## Support

- Email: [hello@wearestokt.com](mailto:hello@wearestokt.com?subject=Stream%20Bunny%20support)
- GitHub: [wearestokt/bunny-stream-official](https://github.com/wearestokt/bunny-stream-official)
