/**
 * Code file inserted into user projects for idle-fade code overrides.
 * Re-exports from the published Stream Bunny library module.
 */

export const BUNNY_IDLE_FADE_PROJECT_FILENAME = "BunnyIdleFade.tsx"

export function buildBunnyIdleFadeProjectFile(idleFadeModuleUrl: string): string {
    const safeUrl = idleFadeModuleUrl.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    return `/**
 * Stream Bunny — idle fade (published library)
 * Override: BunnyIdleFade → withBunnyIdleFade
 * Edit IDLE_HIDE_DELAY_SEC in the library module, or fork this file locally.
 */
export { withBunnyIdleFade } from "${safeUrl}"
`
}
