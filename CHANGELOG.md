# Changelog

All notable changes to **Stream Bunny** follow [Semantic Versioning](https://semver.org/).

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

[1.4.0]: https://github.com/wearestokt/bunny-stream-official/compare/v1.3.0...v1.4.0
