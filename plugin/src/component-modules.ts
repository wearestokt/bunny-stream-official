/**
 * Published Framer module URLs — paste each component’s **Copy URL** from
 * Assets → Code Components (published packages). Dragging inserts instances via
 * `framer.com/m/...` modules; **no TSX is added** to the user’s project.
 *
 * Env keys: `VITE_SB_MODULE_<ExportName>` (see `resolvePublishedModuleUrlMap`).
 */

/** Component export base names that appear in the Library (matches draggable keys). */
export const LIBRARY_MODULE_KEYS = [
    "BunnyVideoPlayer",
    "BunnyPlayPauseButton",
    "BunnyVolumeSlider",
    "BunnyProgressBar",
    "BunnyTimeDisplay",
    "BunnyQualityPickerButton",
    "BunnyFullscreenButton",
] as const

export type LibraryModuleKey = (typeof LIBRARY_MODULE_KEYS)[number]

/**
 * Template export base names. Templates are pre-composed player layouts that live
 * in the same upstream Stream Bunny library project as the components above. Each
 * entry resolves from `VITE_SB_MODULE_<key>` like the components, but the plugin
 * does NOT block startup if a template URL is missing — templates are rolled out
 * incrementally and locked Templates UI handles the missing-URL case.
 */
export const TEMPLATE_MODULE_KEYS = [
    "BunnyTemplateCinemaHero",
    "BunnyTemplatePressReel",
    "BunnyTemplateStoryTile",
    "BunnyTemplateWallStack",
    "BunnyTemplateTutorialRow",
    "BunnyTemplateShowcaseStrip",
] as const

export type TemplateModuleKey = (typeof TEMPLATE_MODULE_KEYS)[number]

/**
 * Published from the Stream Bunny library (not draggable). Used for code-override
 * re-exports and to keep a single BunnyVideoStore across the site.
 */
export const UTILITY_MODULE_KEYS = ["BunnyVideoStore", "BunnyIdleFade"] as const

export type UtilityModuleKey = (typeof UTILITY_MODULE_KEYS)[number]

export function resolveUtilityModuleUrl(key: UtilityModuleKey): string | undefined {
    return resolveModuleUrl(key)
}

export function resolveIdleFadeModuleUrl(): string | undefined {
    return resolveUtilityModuleUrl("BunnyIdleFade")
}

export function resolveStoreModuleUrl(): string | undefined {
    return resolveUtilityModuleUrl("BunnyVideoStore")
}

/**
 * Published Stream Bunny library module URLs (Framer Assets → Copy URL).
 * Baked into marketplace builds so reviewers and CI packs work without `plugin/.env.local`.
 * Override any entry via `VITE_SB_MODULE_<ExportName>` at build time when republishing components.
 */
const DEFAULT_PUBLISHED_MODULE_URL_MAP: Record<LibraryModuleKey, string> = {
    BunnyVideoPlayer:
        "https://framer.com/m/BunnyVideoPlayer-wRCCJC.js#BunnyVideoPlayer",
    BunnyPlayPauseButton:
        "https://framer.com/m/BunnyPlayPauseButton-RQ3LVc.js#BunnyPlayPauseButton",
    BunnyVolumeSlider:
        "https://framer.com/m/BunnyVolumeSlider-FheZO1.js#BunnyVolumeSlider",
    BunnyProgressBar:
        "https://framer.com/m/BunnyProgressBar-jV02z6.js#BunnyProgressBar",
    BunnyTimeDisplay:
        "https://framer.com/m/BunnyTimeDisplay-8gM03S.js#BunnyTimeDisplay",
    BunnyQualityPickerButton:
        "https://framer.com/m/BunnyQualityPickerButton-vYcuNz.js#BunnyQualityPickerButton",
    BunnyFullscreenButton:
        "https://framer.com/m/BunnyFullscreenButton-AOAxST.js#BunnyFullscreenButton",
}

/** Built-in fallback template URLs used when env vars are not configured yet. */
const DEFAULT_TEMPLATE_URL_MAP: Partial<Record<TemplateModuleKey, string>> = {
    BunnyTemplateCinemaHero:
        "https://framer.com/m/SB-Default-Template-h2n29c.js@pVOTNbKPwZApyLFPqfMN",
}

function resolveModuleUrl(key: string, fallback?: string): string | undefined {
    return envModuleUrl(key) ?? fallback
}

function envModuleUrl(key: string): string | undefined {
    const envKey = `VITE_SB_MODULE_${key}`
    const raw = (import.meta.env as Record<string, string | undefined>)[envKey]
    if (typeof raw !== "string") return undefined
    const trimmed = raw.trim()
    if (!trimmed.startsWith("http")) return undefined
    /**
     * Defensive: dotenv strips unquoted `#fragment`. If the export hash is
     * missing, default it to the env key (the published export name). Avoids
     * silent fallback to `default` export inside Framer's component loader.
     */
    return trimmed.includes("#") ? trimmed : `${trimmed}#${key}`
}

export type PublishedModulesResult =
    | { ok: true; map: Record<string, string> }
    | { ok: false; missingKeys: string[] }

/** Non-empty https URL for every library component, or `missingKeys` listing unset modules. */
export function resolvePublishedModuleUrlMap(): PublishedModulesResult {
    const map: Record<string, string> = {}
    const missingKeys: string[] = []
    for (const key of LIBRARY_MODULE_KEYS) {
        const url = resolveModuleUrl(key, DEFAULT_PUBLISHED_MODULE_URL_MAP[key])
        if (url) map[key] = url
        else missingKeys.push(key)
    }
    if (missingKeys.length > 0) return { ok: false, missingKeys }
    return { ok: true, map }
}

/**
 * `true` = inject raw `.tsx` into the user project (maintainers / local dev).
 * Defaults to on during `vite` dev so Code Override → Add to project works without
 * publishing `BunnyIdleFade` first. Set `VITE_STREAM_BUNNY_EMBED_SOURCES=false` to
 * test the hosted re-export flow locally.
 */
export function useEmbeddedLocalSources(): boolean {
    const raw = import.meta.env.VITE_STREAM_BUNNY_EMBED_SOURCES
    if (raw === "true") return true
    if (raw === "false") return false
    return import.meta.env.DEV
}

/**
 * Resolve template module URLs. Returns a partial map — missing templates are
 * silently absent so the plugin still boots while templates are being authored
 * upstream. The Templates screen falls back gracefully when a key has no URL.
 */
export function resolveTemplateModuleUrlMap(): Record<TemplateModuleKey, string | undefined> {
    const map = {} as Record<TemplateModuleKey, string | undefined>
    for (const key of TEMPLATE_MODULE_KEYS) {
        map[key] = resolveModuleUrl(key, DEFAULT_TEMPLATE_URL_MAP[key])
    }
    return map
}
