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

- [ ] `plugin/package.json` version matches `PLUGIN_VERSION` in `plugin/src/copy.ts` (e.g. **1.4.1** / **v1.4.1**)
- [ ] [CHANGELOG.md](../CHANGELOG.md) updated for the release
- [ ] `npm run pack` in `plugin/` produces **`Stream Bunny plugin.zip`**
- [ ] Release build has every `VITE_SB_MODULE_*` set — **not** `VITE_STREAM_BUNNY_EMBED_SOURCES=true`

## Release environment

Library module URLs, license API, and Polar checkout are **baked into production builds** by default (`plugin/src/component-modules.ts`, `plugin/src/lib/build-env.ts`). You only need env overrides when republishing components or changing checkout.

Optional overrides in CI or `plugin/.env.local` before `npm run build` / `pack`:

| Variable | Purpose |
| --- | --- |
| `VITE_SB_MODULE_*` | Override published Framer module URLs after republishing |
| `VITE_LICENSE_VALIDATE_URL` | Override license API URL |
| `VITE_POLAR_CHECKOUT_URL` | Override Polar checkout URL |
| `VITE_DOCS_URL` | Hosted docs (e.g. GitHub Pages) |
| `VITE_CHANGELOG_URL` | Changelog URL (repo `CHANGELOG.md` or Releases) |

See [plugin/.env.example](../plugin/.env.example).

## Framer reviewer notes (paste into Marketplace submission)

Include this in the submission **review notes** field so Framer can test Pro and inserts without contacting support:

```text
Stream Bunny — reviewer quick start

1. Open the plugin → Library tab. Drag “Video Player” (or any control) onto the canvas.
2. Select the player → paste a Bunny.net Stream Library ID + Video ID in the property panel (any public Stream video works).
3. Use Preview to confirm HLS playback.

Free tier: 5 canvas inserts per workspace (enough to verify Library + Templates).

Pro / Quality Picker / extra templates:
- Account → “Have a license?” → paste: SB-REVW-FRAM-MARK → Activate
  (Framer review license — unlimited inserts, Quality Picker, Pro templates)

Cinema Hero template: Templates tab → SB - Basic (free).

Support: hello@wearestokt.com
```

After approval, rotate or disable the review key via `FRAMER_REVIEW_LICENSE_KEY` on the license API deployment if desired.

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
