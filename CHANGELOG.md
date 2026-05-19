# Changelog

All notable changes to **Stream Bunny** follow [Semantic Versioning](https://semver.org/).

## [1.4.3] - 2026-05-19

### Changed

- Docs: nesting Player + controls inside Framer components, variant animations, and shared **BunnyVideoStore** on the canvas ([`docs/architecture.md`](docs/architecture.md), [`docs/plugin.md`](docs/plugin.md)).

## [1.4.2] - 2026-05-18

### Changed

- Disabled maintainer dev tools by default (`DEV_TOOLS_ENABLED` in `plugin/src/lib/dev-tools.ts`) — Account DEV toggles, DEV license shortcut, and upgrade hint hidden for release builds.

## [1.4.1] - 2026-05-18

### Changed

- **Templates** — only **SB - Basic** is insertable; Press Reel, Story Tile, Wall Stack, Tutorial Row, and Showcase Strip show **Coming soon** (no Pro lock, no player fallback).
- **Bunny Stream setup** docs — recommended library settings: High volume delivery, Premium encoding, H.265 + VP9 (H.264 off), JIT encoding disabled, Early play enabled.
- User docs no longer reference the `marketing/` folder or Bunny Image Carousel.

## [1.4.0] - 2026-05-18

### Added

- **BunnyQualityPickerButton** (Stream Bunny Pro) — manual HLS rendition switching beside any Player.
- **BunnyIdleFade** code override (Pro) — page-wide pointer idle fade via `withBunnyIdleFade`.
- Documentation hub under [`docs/`](docs/README.md): plugin guide, Bunny.net setup, component reference, troubleshooting.

### Changed

- Plugin versioning aligned: `package.json` **1.4.0** matches in-app **v1.4.0**.
- Help screen links to documentation and changelog URLs (configurable via `VITE_DOCS_URL` / `VITE_CHANGELOG_URL`).
- Plugin panel light mode uses proper light tokens (Framer marketplace requirement).

## Earlier releases

Components and the Framer plugin shipped incrementally before this changelog file. See [GitHub commit history](https://github.com/wearestokt/bunny-stream-official/commits/main) for prior work.

[1.4.2]: https://github.com/wearestokt/bunny-stream-official/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/wearestokt/bunny-stream-official/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/wearestokt/bunny-stream-official/compare/v1.3.0...v1.4.0
