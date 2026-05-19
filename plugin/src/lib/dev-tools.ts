/**
 * Maintainer QA controls (Account dev toggles, DEV license shortcut, upgrade dialog hint).
 * Set to `true` only for internal testing — keep `false` for marketplace and release builds.
 */
export const DEV_TOOLS_ENABLED = false

/** Show dev-only plugin UI. Requires both the flag and a Vite dev build. */
export function isDevToolsUiEnabled(): boolean {
    return DEV_TOOLS_ENABLED && import.meta.env.DEV
}
