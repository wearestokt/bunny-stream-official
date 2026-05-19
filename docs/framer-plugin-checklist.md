# Framer plugin checklist

Use this before `npm run pack` and Framer Marketplace submission. UI requirements are detailed in [CURSOR-framer-plugin.md](../CURSOR-framer-plugin.md).

## Marketplace requirements

Source: [framer.com/plugin-requirements](https://www.framer.com/plugin-requirements)

- [ ] Plugin UI is in English
- [ ] Supports **light and dark** mode (`plugin/src/styles/global.css`)
- [ ] Matches Framer design language (Inter, panel tokens, no Tailwind/shadcn in plugin UI)
- [ ] Loads fast — no blocking bundle; embed chunk only for maintainer mode
- [ ] No ads or unrelated promotions in the UI
- [ ] Plugin icon is **30×30** SVG ([`plugin/public/icon.svg`](../plugin/public/icon.svg))
- [ ] Listing features match the built plugin
- [ ] Authentication / license flow includes **sign out** (Menu API)
- [ ] No direct DOM access to the Framer canvas (SDK only)
- [ ] Code is modular and documented

## Version and pack

- [ ] `plugin/package.json` version matches `PLUGIN_VERSION` in `plugin/src/copy.ts` (e.g. **1.4.0** / **v1.4.0**)
- [ ] [CHANGELOG.md](../CHANGELOG.md) updated for the release
- [ ] `npm run pack` in `plugin/` produces `plugin.zip`
- [ ] Release build has every `VITE_SB_MODULE_*` set — **not** `VITE_STREAM_BUNNY_EMBED_SOURCES=true`

## Release environment

Set in CI or local release `.env` before `npm run build` / `pack`:

| Variable | Purpose |
| --- | --- |
| `VITE_SB_MODULE_*` | Published Framer module URLs for each component |
| `VITE_LICENSE_VALIDATE_URL` | Deployed Polar license API |
| `VITE_POLAR_CHECKOUT_URL` | Checkout for Pro |
| `VITE_DOCS_URL` | Hosted docs (e.g. GitHub Pages) |
| `VITE_CHANGELOG_URL` | Changelog URL (repo `CHANGELOG.md` or Releases) |

See [plugin/.env.example](../plugin/.env.example).

## Marketplace listing

- [ ] Name **Stream Bunny**
- [ ] Free tier: **5 canvas inserts per workspace**
- [ ] Pro: **$49 once · lifetime updates**
- [ ] Support: **hello@wearestokt.com**
- [ ] Repo link: `https://github.com/wearestokt/bunny-stream-official`
- [ ] Icon (30×30 SVG), cover image, and 4–8 screenshots match the shipped plugin

## User documentation

- [ ] [docs/README.md](README.md) is current
- [ ] `npm run docs:components` run if properties changed
