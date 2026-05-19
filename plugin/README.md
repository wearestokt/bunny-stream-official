# Stream Bunny — Framer Plugin (maintainers)

Framer plugin that inserts published **bunny.net Stream** components on the canvas. **End-user documentation:** [`../docs/README.md`](../docs/README.md).

## UI guidelines

The plugin UI follows [CURSOR-framer-plugin.md](../CURSOR-framer-plugin.md): Inter, CSS Modules, `@base-ui/react`, inline SVG — no Tailwind, shadcn, or Lucide in the plugin shell.

## Hosted components (default)

The marketplace build does **not** add `.tsx` files to user projects. Set `VITE_SB_MODULE_*` to each component’s Framer **Copy URL**, then `npm run build` / `npm run pack`.

`VITE_STREAM_BUNNY_EMBED_SOURCES=true` is **maintainers only** — never ship marketplace builds with embed mode.

See [`.env.example`](.env.example) for all variables.

## Development

```bash
npm install
# plugin/.env.local — VITE_SB_MODULE_* URLs (and optional embed flag)
npm run dev
```

Framer: enable **Developer Tools** → **Plugins → Open Development Plugin**.

Troubleshooting: [Framer plugin troubleshooting](https://www.framer.com/developers/troubleshooting) and [docs/troubleshooting.md](../docs/troubleshooting.md).

## Pack for publishing

```bash
npm run pack
```

Produces `plugin.zip`. Before packing:

- [ ] [`CHANGELOG.md`](../CHANGELOG.md) has a new semver entry for this release
- [ ] `package.json` version matches `PLUGIN_VERSION` in `src/copy.ts` (and root `package.json`)
- [ ] Dashboard / Help version strings in `copy.ts` updated if the release is user-visible
- [ ] All `VITE_SB_MODULE_*` set; embed mode **off**
- [ ] Optional: `VITE_DOCS_URL`, `VITE_CHANGELOG_URL` for Help links ([docs/framer-plugin-checklist.md](../docs/framer-plugin-checklist.md))

## Release URLs (Help screen)

| Variable | Example |
| --- | --- |
| `VITE_DOCS_URL` | `https://wearestokt.github.io/bunny-stream-official/` (after GitHub Pages enabled) |
| `VITE_CHANGELOG_URL` | `https://github.com/wearestokt/bunny-stream-official/blob/main/CHANGELOG.md` |

Docs deploy: push to `main` with changes under `docs/` — [`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

## Stream Bunny Pro (Polar)

Free tier: limited canvas inserts. Pro: Polar license key validated via `POST /api/license/validate` — see [`../api/license/validate.ts`](../api/license/validate.ts) and `.env.example`.

## Changelog

See [../CHANGELOG.md](../CHANGELOG.md).
