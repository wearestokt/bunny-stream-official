import { framer, isCodeFileComponentExport } from "framer-plugin"
import {
    Clock,
    Fullscreen,
    Gauge,
    Play,
    Settings2,
    Video,
    Volume2,
} from "lucide-react"
import React, { useCallback, useEffect, useRef } from "react"
import { Item, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { COMPONENT_FILES } from "./componentSources.ts"

const NOT_DRAGGABLE = new Set(["BunnyVideoStore.tsx"])
const DROPPABLE_FILES = COMPONENT_FILES.filter((f) => !NOT_DRAGGABLE.has(f.name))

const DISPLAY_NAMES: Record<string, string> = {
    "BunnyVideoPlayer.tsx": "Video Player",
    "BunnyPlayPauseButton.tsx": "Play/Pause Button",
    "BunnyVolumeSlider.tsx": "Volume Slider",
    "BunnyProgressBar.tsx": "Progress Bar",
    "BunnyTimeDisplay.tsx": "Time Display",
    "BunnyQualityPickerButton.tsx": "Quality Picker",
    "BunnyFullscreenButton.tsx": "Fullscreen Button",
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    BunnyVideoPlayer: Video,
    BunnyPlayPauseButton: Play,
    BunnyVolumeSlider: Volume2,
    BunnyProgressBar: Gauge,
    BunnyTimeDisplay: Clock,
    BunnyQualityPickerButton: Settings2,
    BunnyFullscreenButton: Fullscreen,
}

const README_URL = "https://github.com/wearestokt/bunny-stream-official/blob/main/README.md"

framer.showUI({
    position: "top right",
    width: 320,
    height: 700,
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
            <main className="plugin-main">
                <p className="plugin-error">{error}</p>
            </main>
        )
    }

    if (!ready) {
        return (
            <main className="plugin-main">
                <p className="plugin-muted">Loading components…</p>
            </main>
        )
    }

    return (
        <main className="plugin-main">
            <div className="plugin-banner">
                <img src="/bunny-logo.png" alt="Bunny Stream" className="plugin-banner-img" />
            </div>
            <Tabs defaultValue="components" className="plugin-tabs-container">
                <TabsList variant="line" className="plugin-tabs-list">
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="templates">
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="docs">Docs</TabsTrigger>
                </TabsList>
                <TabsContent value="components" className="plugin-list-wrapper">
                    <ItemGroup className="plugin-list" data-size="sm">
                        {DROPPABLE_FILES.map(({ name }) => {
                            const baseName = name.replace(".tsx", "")
                            const url = urlMap[baseName]
                            const Icon = ICONS[baseName]
                            const displayName = DISPLAY_NAMES[name] ?? baseName
                            if (!url) return null
                            return (
                                <DraggableItem
                                    key={name}
                                    url={url}
                                    baseName={baseName}
                                    displayName={displayName}
                                    icon={Icon}
                                />
                            )
                        })}
                    </ItemGroup>
                </TabsContent>
                <TabsContent value="templates" className="plugin-list-wrapper">
                    <p className="plugin-muted">Templates are coming soon</p>
                </TabsContent>
                <TabsContent value="docs" className="plugin-docs-wrapper">
                    <div className="plugin-docs">
                        <p className="plugin-docs-desc">
                            Bunny Stream components for Framer. Drag components onto the canvas to add
                            video players and controls powered by{" "}
                            <a href="https://bunny.net?ref=f9ztcmeo63" target="_blank" rel="noopener noreferrer">
                                Bunny.net Stream
                            </a>
                            .
                        </p>
                        <a
                            href={README_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="plugin-docs-link"
                        >
                            Read the full documentation →
                        </a>
                    </div>
                </TabsContent>
            </Tabs>
            <footer className="plugin-footer">
                Made by{" "}
                <a
                    href="https://wearestokt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="plugin-footer-link"
                >
                    Stōkt
                </a>
            </footer>
        </main>
    )
}

function DraggableItem({
    url,
    baseName,
    displayName,
    icon: Icon,
}: {
    url: string
    baseName: string
    displayName: string
    icon: React.ComponentType<{ className?: string }>
}) {
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
    }, [url, baseName, displayName])

    return (
        <div ref={elRef} className="plugin-draggable-wrapper">
            <Item variant="default" size="sm" className="plugin-item">
                <ItemMedia variant="icon">
                    <Icon className="size-4" />
                </ItemMedia>
                <ItemTitle className="plugin-item-title">{displayName}</ItemTitle>
            </Item>
        </div>
    )
}
