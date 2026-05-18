import { framer } from "framer-plugin"

import { BUNNY_IDLE_FADE_EMBED_FILES } from "../componentSources.ts"
import { resolveIdleFadeModuleUrl } from "@/component-modules"
import type { CodeOverrideHandlerId } from "@/lib/component-catalog"
import {
    BUNNY_IDLE_FADE_PROJECT_FILENAME,
    buildBunnyIdleFadeProjectFile,
} from "@/lib/bunny-idle-fade-project-file"
import { codeFileBasename } from "@/lib/code-file-path"

export type EnsureCodeUtilityResult = {
    created: string[]
    skipped: string[]
}

/** @deprecated Idle fade always falls back to bundled source; kept for callers that instanceof-check. */
export class IdleFadeLibraryNotConfiguredError extends Error {
    constructor() {
        super("idle_fade_module_url_missing")
        this.name = "IdleFadeLibraryNotConfiguredError"
    }
}

function isDuplicateCodeModuleError(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err)
    return (
        msg.includes("already exists") ||
        msg.includes("same type/name") ||
        msg.includes("module with same")
    )
}

async function ensureFilesInProject(
    files: { name: string; code: string }[]
): Promise<EnsureCodeUtilityResult> {
    const existing = await framer.getCodeFiles()
    const existingBasenames = new Set(existing.map((f) => codeFileBasename(f.name)))
    const created: string[] = []
    const skipped: string[] = []

    for (const { name, code } of files) {
        if (existingBasenames.has(name)) {
            skipped.push(name)
            continue
        }
        try {
            await framer.createCodeFile(name, code, { editViaPlugin: false })
            existingBasenames.add(name)
            created.push(name)
        } catch (err) {
            if (isDuplicateCodeModuleError(err)) {
                skipped.push(name)
                continue
            }
            throw err
        }
    }

    return { created, skipped }
}

/**
 * Prefer published library re-export when `VITE_SB_MODULE_BunnyIdleFade` is set at
 * plugin build time; otherwise inject the bundled `BunnyIdleFade.tsx` source (local dev
 * and Framer plugin host — `import.meta.env.DEV` is not reliable there).
 */
function filesToInsertForIdleFade(): { name: string; code: string }[] {
    const idleFadeUrl = resolveIdleFadeModuleUrl()
    if (idleFadeUrl) {
        return [
            {
                name: BUNNY_IDLE_FADE_PROJECT_FILENAME,
                code: buildBunnyIdleFadeProjectFile(idleFadeUrl),
            },
        ]
    }
    if (BUNNY_IDLE_FADE_EMBED_FILES.length > 0) {
        return BUNNY_IDLE_FADE_EMBED_FILES
    }
    throw new IdleFadeLibraryNotConfiguredError()
}

export function canAddIdleFadeFromLibrary(): boolean {
    return !!resolveIdleFadeModuleUrl() || BUNNY_IDLE_FADE_EMBED_FILES.length > 0
}

export async function ensureBunnyIdleFadeSourcesInProject(): Promise<EnsureCodeUtilityResult> {
    return ensureFilesInProject(filesToInsertForIdleFade())
}

export async function ensureCodeOverrideInProject(
    handlerId: CodeOverrideHandlerId
): Promise<EnsureCodeUtilityResult> {
    switch (handlerId) {
        case "bunny-idle-fade":
            return ensureBunnyIdleFadeSourcesInProject()
        default: {
            const _exhaustive: never = handlerId
            return _exhaustive
        }
    }
}

export function idleFadeUtilityFilenames(): string[] {
    if (resolveIdleFadeModuleUrl()) {
        return [BUNNY_IDLE_FADE_PROJECT_FILENAME]
    }
    return BUNNY_IDLE_FADE_EMBED_FILES.map((f) => f.name)
}
