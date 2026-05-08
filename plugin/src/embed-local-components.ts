/**
 * Injects component **source files** into the Framer project (legacy / maintainer mode).
 * Dynamically imported so production builds that use published module URLs do not bundle raw TSX.
 */
import { framer, isCodeFileComponentExport } from "framer-plugin"

import { COMPONENT_FILES } from "./componentSources.ts"
import { codeFileBasename } from "@/lib/code-file-path"

function isDuplicateCodeModuleError(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err)
    return msg.includes("already exists") || msg.includes("same type/name") || msg.includes("module with same")
}

export async function loadUrlMapFromEmbeddedProjectFiles(): Promise<Record<string, string>> {
    const files = await framer.getCodeFiles()
    const existingBasenames = new Set(files.map((f) => codeFileBasename(f.name)))

    for (const { name, code } of COMPONENT_FILES) {
        if (existingBasenames.has(name)) continue
        try {
            await framer.createCodeFile(name, code, { editViaPlugin: false })
        } catch (err) {
            if (!isDuplicateCodeModuleError(err)) throw err
        }
    }

    const updated = await framer.getCodeFiles()
    const map: Record<string, string> = {}
    for (const file of updated) {
        const baseName = codeFileBasename(file.name).replace(/\.tsx$/i, "")
        const compExport = file.exports?.find(isCodeFileComponentExport)
        if (compExport?.insertURL && map[baseName] === undefined) {
            map[baseName] = compExport.insertURL
        }
    }
    return map
}
