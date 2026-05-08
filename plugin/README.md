# Stream Bunny — Framer Plugin

Framer plugin that provides a component palette for **bunny.net Stream** HLS playback (video player + controls). Drag components from the plugin window onto your canvas.

The **image carousel** is a separate plugin under [`../bunny-image-carousel/plugin/`](../bunny-image-carousel/plugin/).

## UI guidelines

The plugin UI strictly follows the [Framer Plugin UI spec](../CURSOR-framer-plugin.md): Inter
typography, Framer Blue primary accent, dark + light mode tokens, 280px panel width with 28px
control rows, CSS Modules + [`@base-ui/react`](https://base-ui.com) primitives, and inline SVG
icons (no Tailwind, shadcn, or Lucide). Editing the UI? Read that file before changing tokens or
adding new components — the spec is the source of truth, not the screenshots.

## Hosted components (default) — no source in user projects

By default the plugin **does not** add `.tsx` files to a user’s Framer project. It only drags **published Framer module URLs** (the same `framer.com/m/...` links you get from **Assets → Code Component → Copy URL**). That keeps implementation out of the project’s Code panel for end users.

1. In Framer, **publish** each Stream Bunny code component (player, controls, store as needed) from your team’s package.
2. Copy each module URL and set the matching `VITE_SB_MODULE_*` environment variables (see [`.env.example`](.env.example)).
3. Build the plugin with those variables set (e.g. in CI) and run `npm run pack` for the marketplace.

`componentSources.ts` and **embedded** mode are for **maintainers** only; they load via a separate chunk when you set `VITE_STREAM_BUNNY_EMBED_SOURCES=true`. Development behaves like production otherwise: **without module URLs**, the plugin shows a configuration message instead of injecting sources.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Choose how you load components during `npm run dev`:
   - **Hosted modules (recommended):** add `plugin/.env.local` with every `VITE_SB_MODULE_*` URL (same values you use for release builds). Dragging inserts published modules — **no `.tsx` in the project.**
   - **Legacy embed (maintainers only):** add `VITE_STREAM_BUNNY_EMBED_SOURCES=true` to `.env.local`. That injects the repo’s `.tsx` files — **do not** use this for marketplace builds.

3. Run the plugin in dev mode:
   ```bash
   npm run dev
   ```

4. In Framer:
   - Enable **Developer Tools** (Plugins section in main menu)
   - Open **Plugins** → **Open Development Plugin**
   - **Stream Bunny** will load

5. Drag any component from the list onto the canvas to insert it.

### Troubleshooting “Failed to load Development Plugin”

Framer’s [troubleshooting guide](https://www.framer.com/developers/troubleshooting) covers this. Quick checks:

1. **Keep `npm run dev` running** in this folder until you see `VITE … ready` and `Local: https://localhost:5173/`.
2. **Enable Developer Tools** — Framer menu → Plugins (or Settings) → turn on plugin developer tools, then **Plugins → Open Development Plugin**. Without this, the dev plugin entry may not work.
3. **Port 5173 in use** — If Vite exits or picks another port, stop the other process (`lsof -i :5173`) or change the port in `vite.config.ts` and use that URL when Framer asks for the dev server.
4. **HTTPS certificate** — This project uses **HTTPS** on localhost (via `vite-plugin-mkcert`). If the OS hasn’t trusted the local CA yet, open `https://localhost:5173` once in your browser, accept the warning if prompted, then try Framer again.
5. **Ad blockers / Brave** — Allow-list `framer.com` (Framer’s docs note localhost can be blocked).
6. **Use a current Node.js** — Prefer Node 20+ (`node -v`).
7. **`module with same type/name already exists`** — Usually means the project already has those components under a folder (e.g. `components/BunnyVideoPlayer.tsx`). The plugin now matches files by **basename** and skips re-creating them. Pull the latest plugin and click **Try again**; if it persists, remove duplicate code files that export the same component name.

## Components

The plugin ensures all Stream Bunny components exist in your project (creates them if missing). You can drag:

- BunnyVideoPlayer (main video embed)
- BunnyPlayPauseButton
- BunnyVolumeSlider
- BunnyProgressBar
- BunnyTimeDisplay
- BunnyQualityPickerButton
- BunnyFullscreenButton

**BunnyVideoStore** is installed automatically when missing (not shown as a draggable item). It is required by the player and controls.

## Stream Bunny Pro (Polar)

The plugin includes a **free tier** (limited canvas inserts) and **Stream Bunny Pro**, sold as a **one-time** purchase on [Polar](https://polar.sh). Checkout opens in a new tab; Polar emails a **license key**. Users paste the key in **Account** or the upgrade dialog; the plugin calls your deployed **`POST /api/license/validate`** endpoint, which proxies to Polar’s license-key validation API (the org token never ships in the plugin bundle).

### Plugin environment variables (release builds)

Set these when you run `npm run build` / CI (see [`.env.example`](.env.example)):

| Variable | Purpose |
| -------- | ------- |
| `VITE_LICENSE_VALIDATE_URL` | Absolute URL of your deployed validator, e.g. `https://your-project.vercel.app/api/license/validate`. Required for real remote validation. |
| `VITE_POLAR_CHECKOUT_URL` | Polar product checkout URL for the **Buy on Polar** button. |
| `VITE_TUTORIAL_VIDEO_URL` | Optional direct video URL for the dashboard tutorial modal (e.g. MP4). |
| `VITE_CHANGELOG_URL` | Optional link for the Latest update card (e.g. GitHub Releases). |
| `VITE_FEATURE_REQUEST_URL` | Optional link for empty-search “request a component” / roadmap. |

Without `VITE_LICENSE_VALIDATE_URL`, remote validation is unavailable; local dev may still use the documented **DEV** unlock path where implemented in [`src/lib/entitlement.ts`](src/lib/entitlement.ts).

### License API (Vercel)

The repo includes [`../api/license/validate.ts`](../api/license/validate.ts): a **Node** handler that accepts `POST` JSON `{ key, instanceId? }` and forwards validation to Polar.

**Server environment (e.g. Vercel project env):**

| Variable | Purpose |
| -------- | ------- |
| `POLAR_ORGANIZATION_ID` | Required. Polar organization ID sent to the validate endpoint (see Polar dashboard). |

Deploy the **repository root** (or a project that includes the `api/` directory) on Vercel so `api/license/validate` is routed as a serverless function. CORS is set to allow the Framer plugin origin.

Optional: [`../api/webhooks/polar.ts`](../api/webhooks/polar.ts) is a stub for Polar webhooks (issuance, refunds, etc.); extend it if you want server-side logs or analytics.

### Maintainer smoke test (Framer)

1. Load the dev or packed plugin in Framer with module URLs configured.
2. From the **Dashboard**, open **Components** and insert components until the free limit blocks further inserts.
3. Open **Account** → **Buy on Polar** (should open your checkout URL).
4. After setting `VITE_LICENSE_VALIDATE_URL` to a deployed API, paste a real license key and confirm the UI switches to **Pro** and the insert limit no longer applies.
5. Exercise **Help**, **Quick Start**, and back navigation from nested screens.

## Pack for Publishing

```bash
npm run pack
```

Creates `plugin.zip` for submission to the Framer plugin marketplace.
