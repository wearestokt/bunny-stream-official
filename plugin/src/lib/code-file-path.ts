/**
 * Framer `CodeFile.name` may be a basename (`BunnyVideoPlayer.tsx`) or a path
 * (`components/BunnyVideoPlayer.tsx`). Match plugin filenames using basenames only.
 */
export function codeFileBasename(fileName: string): string {
    const normalized = fileName.replace(/\\/g, "/")
    const slash = normalized.lastIndexOf("/")
    return slash >= 0 ? normalized.slice(slash + 1) : normalized
}
