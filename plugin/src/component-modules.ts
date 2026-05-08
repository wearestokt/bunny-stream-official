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
        const url = envModuleUrl(key)
        if (url) map[key] = url
        else missingKeys.push(key)
    }
    if (missingKeys.length > 0) return { ok: false, missingKeys }
    return { ok: true, map }
}

/** `true` = legacy mode: inject raw `.tsx` into the project (maintainers only; never marketplace). */
export function useEmbeddedLocalSources(): boolean {
    return import.meta.env.VITE_STREAM_BUNNY_EMBED_SOURCES === "true"
}

/**
 * Resolve template module URLs. Returns a partial map — missing templates are
 * silently absent so the plugin still boots while templates are being authored
 * upstream. The Templates screen falls back gracefully when a key has no URL.
 */
export function resolveTemplateModuleUrlMap(): Record<TemplateModuleKey, string | undefined> {
    const map = {} as Record<TemplateModuleKey, string | undefined>
    for (const key of TEMPLATE_MODULE_KEYS) {
        map[key] = envModuleUrl(key)
    }
    return map
}
