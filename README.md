# Stream Bunny

Framer code components and plugin for **[Bunny Stream](https://bunny.net/stream)** HLS video — a real Player plus separate Controls on your canvas, not an iframe embed.

## Documentation

**Full docs:** [`docs/README.md`](docs/README.md)

| Guide | Link |
| --- | --- |
| Plugin (install, screens, Pro) | [docs/plugin.md](docs/plugin.md) |
| Bunny.net account setup | [docs/bunny-stream-setup.md](docs/bunny-stream-setup.md) |
| Component properties | [docs/components.md](docs/components.md) |
| Architecture | [docs/architecture.md](docs/architecture.md) |
| Troubleshooting | [docs/troubleshooting.md](docs/troubleshooting.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |

## Quick start

1. Install the **Stream Bunny** plugin from Framer (or run the dev plugin — [plugin/README.md](plugin/README.md)).
2. Drag **BunnyVideoPlayer** onto the canvas; set **Library ID**, **Video ID**, and **CDN host name** ([where to find them](docs/bunny-stream-setup.md#ids)).
3. Add controls (play, progress, volume, etc.) — they share state automatically.

**Manual install (no plugin):** paste files from [`components/`](components/) in order: `BunnyVideoStore` → `BunnyVideoPlayer` → controls. See [docs/plugin.md](docs/plugin.md) for the same flow.

## Repo layout

| Path | What |
| --- | --- |
| [`components/`](components/) | Player, store, controls |
| [`plugin/`](plugin/) | Stream Bunny Framer plugin |
| [`docs/`](docs/) | User documentation hub |
| [`bunny-image-carousel/`](bunny-image-carousel/) | Separate image carousel plugin (optional) |

## License

MIT for open-source components — see [LICENSE](LICENSE). The distributed Framer plugin binary is sold separately (Polar / Marketplace).
