import { framer, isCodeFileComponentExport } from "framer-plugin"
import { Layers } from "lucide-react"
import React, { useCallback, useEffect, useRef } from "react"
import { COMPONENT_FILES } from "./componentSources.ts"

const README_URL =
    "https://github.com/wearestokt/bunny-stream-official/blob/main/bunny-image-carousel/README.md"

framer.showUI({
    position: "top right",
    width: 300,
    height: 420,
})

export function App() {
    const [urlMap, setUrlMap] = React.useState<Record<string, string>>({})
    const [ready, setReady] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const initRef = useRef(false)

    const ensureComponents = useCallback(async () => {
        try {
            const files = await framer.getCodeFiles()
            const byName = Object.fromEntries(files.map((f) => [f.name, f]))

            for (const { name, code } of COMPONENT_FILES) {
                if (!byName[name]) {
                    await framer.createCodeFile(name, code, { editViaPlugin: false })
                }
            }

            const updated = await framer.getCodeFiles()
            const map: Record<string, string> = {}
            for (const file of updated) {
                const baseName = file.name.replace(".tsx", "")
                const compExport = file.exports?.find(isCodeFileComponentExport)
                if (compExport?.insertURL) {
                    map[baseName] = compExport.insertURL
                }
            }
            setUrlMap(map)
            setReady(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load components")
        }
    }, [])

    useEffect(() => {
        if (initRef.current) return
        initRef.current = true
        ensureComponents()
    }, [ensureComponents])

    if (error) {
        return (
            <main style={{ padding: 16 }}>
                <p style={{ color: "#f87171" }}>{error}</p>
            </main>
        )
    }

    if (!ready) {
        return (
            <main style={{ padding: 16 }}>
                <p style={{ color: "#a3a3a3" }}>Loading…</p>
            </main>
        )
    }

    const name = "BunnyImageCarousel.tsx"
    const baseName = "BunnyImageCarousel"
    const url = urlMap[baseName]

    return (
        <main style={{ display: "flex", flexDirection: "column", minHeight: "100%", padding: "12px 14px" }}>
            <header style={{ marginBottom: 14 }}>
                <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Bunny Image Carousel</h1>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#a3a3a3", lineHeight: 1.45 }}>
                    Add <strong>three</strong> in Framer → Code → npm, then drag the component onto the canvas.
                </p>
            </header>

            {url ? (
                <DraggableItem url={url} displayName="Image Carousel" />
            ) : (
                <p style={{ color: "#a3a3a3", fontSize: 12 }}>No insert URL for {name}.</p>
            )}

            <footer style={{ marginTop: "auto", paddingTop: 16, fontSize: 11, color: "#737373" }}>
                <a href={README_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#a3a3a3" }}>
                    Documentation →
                </a>
                <span style={{ margin: "0 8px" }}>·</span>
                <a
                    href="https://wearestokt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#a3a3a3" }}
                >
                    Stōkt
                </a>
            </footer>
        </main>
    )
}

function DraggableItem({ url, displayName }: { url: string; displayName: string }) {
    const elRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = elRef.current
        if (!el) return
        const cleanup = framer.makeDraggable(
            el,
            () => ({
                type: "componentInstance",
                name: displayName,
                url,
            }),
            (result) => {
                if (result.status === "error") {
                    framer.notify(result.reason ?? "Drop failed")
                }
            }
        )
        return () => {
            if (typeof cleanup === "function") {
                cleanup()
            } else if (cleanup && typeof (cleanup as Promise<() => void>).then === "function") {
                ;(cleanup as Promise<() => void>).then((fn) => typeof fn === "function" && fn())
            }
        }
    }, [url, displayName])

    return (
        <div ref={elRef}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #2a2a2a",
                    background: "#141414",
                    cursor: "grab",
                }}
            >
                <Layers size={18} strokeWidth={1.75} style={{ color: "#ffa726", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{displayName}</span>
            </div>
        </div>
    )
}
