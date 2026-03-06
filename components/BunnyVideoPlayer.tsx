import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useCallback, useEffect, useRef, useState } from "react"
import { useBunnyVideoStore, reportControlHover } from "./BunnyVideoStore.tsx"

const HLS_JS_URL = "https://cdn.jsdelivr.net/npm/hls.js@1.5.7/dist/hls.min.js"

interface HlsInstance {
    loadSource: (url: string) => void
    attachMedia: (el: HTMLMediaElement) => void
    on: (event: string, cb: (e: string, d: unknown) => void) => void
    destroy: () => void
    currentLevel: number
}

interface HlsConstructor {
    isSupported: () => boolean
    Events: { MANIFEST_PARSED: string; ERROR: string; FRAG_LOADING: string; FRAG_LOADED: string }
    new (config?: object): HlsInstance
}

function loadHlsJs(): Promise<HlsConstructor | null> {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve(null)
            return
        }
        const w = window as Window & { Hls?: HlsConstructor }
        if (w.Hls) {
            resolve(w.Hls)
            return
        }
        const script = document.createElement("script")
        script.src = HLS_JS_URL
        script.async = true
        script.onload = () => resolve(w.Hls ?? null)
        script.onerror = () => resolve(null)
        document.head.appendChild(script)
    })
}

/**
 * Build HLS stream URL from Bunny Stream library + video IDs.
 * 1) pullZoneHostname if provided (e.g. vz-12345.b-cdn.net from library API/settings)
 * 2) vz-{libraryId}.b-cdn.net (Stream library pull zone pattern)
 */
function getThumbnailUrl(
    libraryId: string,
    videoId: string,
    pullZoneHostname?: string
): string {
    if (pullZoneHostname?.trim()) {
        const host = pullZoneHostname.replace(/^https?:\/\//, "").split("/")[0].trim()
        return `https://${host}/${videoId}/thumbnail_1.jpg`
    }
    return `https://vz-${libraryId}.b-cdn.net/${videoId}/thumbnail_1.jpg`
}

function PreviewPlaceholder(props: {
    libraryId: string
    videoId: string
    pullZoneHostname?: string
    poster: string
    fitStyle: React.CSSProperties
}) {
    const { libraryId, videoId, pullZoneHostname, poster, fitStyle } = props
    const [thumbError, setThumbError] = useState(false)
    const thumbUrl = libraryId && videoId ? getThumbnailUrl(libraryId, videoId, pullZoneHostname) : ""

    if (poster) {
        return (
            <div style={{ position: "absolute", inset: 0, background: "#000" }}>
                <img src={poster} alt="" style={{ width: "100%", height: "100%", ...fitStyle }} />
            </div>
        )
    }
    if (thumbUrl && !thumbError) {
        return (
            <img
                src={thumbUrl}
                alt=""
                onError={() => setThumbError(true)}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    ...fitStyle,
                }}
            />
        )
    }
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                fontSize: 14,
            }}
        >
            Video
        </div>
    )
}

const QUALITY_OPTIONS = [
    { value: "auto", label: "Auto", height: 0 },
    { value: "2160", label: "4K (2160p)", height: 2160 },
    { value: "1440", label: "2K (1440p)", height: 1440 },
    { value: "1080", label: "1080p", height: 1080 },
    { value: "720", label: "720p", height: 720 },
    { value: "480", label: "480p", height: 480 },
    { value: "360", label: "360p", height: 360 },
] as const

type QualityValue = (typeof QUALITY_OPTIONS)[number]["value"]

function findClosestLevelIndex(levels: { height?: number }[], targetHeight: number): number {
    if (!levels.length) return 0
    let bestIdx = 0
    let bestDiff = Infinity
    for (let i = 0; i < levels.length; i++) {
        const h = levels[i].height ?? 0
        const diff = Math.abs(h - targetHeight)
        if (diff < bestDiff) {
            bestDiff = diff
            bestIdx = i
        }
    }
    return bestIdx
}

function buildStreamUrl(
    libraryId: string,
    videoId: string,
    pullZoneHostname?: string
): string {
    if (pullZoneHostname?.trim()) {
        const host = pullZoneHostname.replace(/^https?:\/\//, "").split("/")[0].trim()
        return `https://${host}/${videoId}/playlist.m3u8`
    }
    return `https://vz-${libraryId}.b-cdn.net/${videoId}/playlist.m3u8`
}

/**
 * @framerDisableUnlink
 * @framerDisableEdit
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 600
 * @framerIntrinsicHeight 338
 */
export function BunnyVideoPlayer(props: {
    libraryId: string
    videoId: string
    pullZoneHostname?: string
    autoplay?: boolean
    loop?: boolean
    muted?: boolean
    showControls?: boolean
    hideControlsOnIdle?: boolean
    controlsHideDelay?: number
    poster?: string
    fallbackImage?: string
    startTimePercent?: number
    tapToPlay?: boolean
    previewOnCanvas?: boolean
    lazyLoad?: boolean
    fit?: "cover" | "contain" | "fill"
    quality?: QualityValue
    storeId?: string
    style?: React.CSSProperties
    children?: React.ReactNode
}) {
    const {
        libraryId,
        videoId,
        pullZoneHostname,
        autoplay = false,
        loop = false,
        muted = false,
        showControls = true,
        hideControlsOnIdle = true,
        controlsHideDelay = 3,
        poster = "",
        fallbackImage = "",
        startTimePercent = 0,
        tapToPlay = true,
        previewOnCanvas = false,
        lazyLoad = false,
        fit = "cover",
        quality = "auto",
        style,
        children,
    } = props

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const hlsRef = useRef<HlsInstance | null>(null)
    const levelsRef = useRef<{ height?: number }[]>([])
    const qualityRef = useRef(quality)
    qualityRef.current = quality
    const startTimeAppliedRef = useRef(false)
    const [store, setStore] = useBunnyVideoStore()
    const [showPoster, setShowPoster] = useState(true)
    const [videoError, setVideoError] = useState(false)

    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const shouldLoadVideo = !isCanvas || previewOnCanvas
    const showStaticFirstFrame = isCanvas && !previewOnCanvas && !poster

    const [inView, setInView] = useState(!lazyLoad)
    const readyToLoad = shouldLoadVideo && (!lazyLoad || inView)

    const streamUrl = libraryId && videoId ? buildStreamUrl(libraryId, videoId, pullZoneHostname) : ""

    useEffect(() => {
        if (!lazyLoad) return
        const el = containerRef.current
        if (!el) return
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) setInView(true)
            },
            { rootMargin: "100px", threshold: 0 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [lazyLoad])

    useEffect(() => {
        setStore({ muted })
    }, [muted, setStore])

    useEffect(() => {
        const hls = hlsRef.current
        if (!hls || levelsRef.current.length === 0) return
        if (quality === "auto") {
            hls.currentLevel = -1
        } else {
            const opt = QUALITY_OPTIONS.find((o) => o.value === quality)
            if (opt && opt.height > 0) {
                hls.currentLevel = findClosestLevelIndex(levelsRef.current, opt.height)
            }
        }
    }, [quality])

    useEffect(() => {
        if (!libraryId || !videoId || (!readyToLoad && !showStaticFirstFrame)) return

        let mounted = true
        const video = videoRef.current
        if (!video || showStaticFirstFrame) return

        const init = async () => {
            const Hls = await loadHlsJs()
            if (!mounted || !video) return

            if (Hls?.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                })
                hlsRef.current = hls

                hls.loadSource(streamUrl)
                hls.attachMedia(video)

                hls.on(Hls.Events.MANIFEST_PARSED, (_, data: { levels?: { height?: number }[] }) => {
                    if (!mounted) return
                    const levels = data.levels ?? []
                    levelsRef.current = levels
                    const qualityLabels = levels.map((l) => `${l.height ?? 0}p`)
                    const q = qualityRef.current
                    let storeQuality = 0
                    if (q === "auto") {
                        hls.currentLevel = -1
                        storeQuality = 0
                    } else {
                        const opt = QUALITY_OPTIONS.find((o) => o.value === q)
                        if (opt && opt.height > 0 && levels.length > 0) {
                            const levelIdx = findClosestLevelIndex(levels, opt.height)
                            hls.currentLevel = levelIdx
                            storeQuality = levelIdx + 1
                        }
                    }
                    setStore({ qualities: qualityLabels, quality: storeQuality, ready: true, muted })
                    setShowPoster(false)
                })

                hls.on(Hls.Events.ERROR, (_, data: { fatal?: boolean }) => {
                    if (!mounted) return
                    if (data.fatal) {
                        setVideoError(true)
                        setStore({ error: "Video failed to load" })
                    }
                })

                hls.on(Hls.Events.FRAG_LOADING, () => {
                    if (mounted) setStore({ loadingPercent: 50 })
                })
                hls.on(Hls.Events.FRAG_LOADED, () => {
                    if (mounted) setStore({ loadingPercent: 100 })
                })
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl
                video.addEventListener("loadedmetadata", () => {
                    if (mounted) {
                        setStore({ ready: true, muted })
                        setShowPoster(false)
                    }
                })
                video.addEventListener("error", () => {
                    if (mounted) {
                        setVideoError(true)
                        setStore({ error: "Video failed to load" })
                    }
                })
            } else {
                setVideoError(true)
                setStore({ error: "HLS not supported" })
            }
        }

        init()
        return () => {
            mounted = false
            hlsRef.current?.destroy()
            hlsRef.current = null
            startTimeAppliedRef.current = false
        }
    }, [libraryId, videoId, streamUrl, muted, readyToLoad, showStaticFirstFrame, setStore])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (store.play) video.play().catch(() => {})
        else video.pause()

        if (store.muted) {
            video.muted = true
        } else {
            video.muted = false
            video.volume = store.volume / 100
        }

        if (store.seekTo != null) {
            video.currentTime = store.seekTo
            setStore({ seekTo: null })
        }

        if (store.qualityToSet != null && hlsRef.current) {
            try {
                const hlsLevel = store.qualityToSet === 0 ? -1 : store.qualityToSet - 1
                hlsRef.current.currentLevel = hlsLevel
                setStore({ quality: store.qualityToSet, qualityToSet: null })
            } catch {
                setStore({ qualityToSet: null })
            }
        }

        if (store.fullscreenRequest) {
            const video = videoRef.current
            try {
                if (store.fullscreen) {
                    document.exitFullscreen?.()
                } else if (video) {
                    video.requestFullscreen?.()
                }
                setStore({ fullscreen: !store.fullscreen, fullscreenRequest: false })
            } catch {
                setStore({ fullscreenRequest: false })
            }
        }
    }, [store.play, store.muted, store.volume, store.seekTo, store.qualityToSet, store.fullscreenRequest, store.fullscreen, setStore])

    useEffect(() => {
        const onFullscreenChange = () => setStore({ fullscreen: !!document.fullscreenElement })
        document.addEventListener("fullscreenchange", onFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
    }, [setStore])

    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hoverOverControlRef = useRef(false)
    hoverOverControlRef.current = store.hoverOverControl ?? false
    useEffect(() => {
        if (isCanvas || !hideControlsOnIdle) {
            setStore({ controlsVisible: true })
            return
        }
        const delayMs = Math.max(0.5, controlsHideDelay) * 1000
        const scheduleHide = () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
            idleTimerRef.current = setTimeout(() => {
                if (!hoverOverControlRef.current) setStore({ controlsVisible: false })
            }, delayMs)
        }
        const showAndReschedule = () => {
            setStore({ controlsVisible: true })
            scheduleHide()
        }
        const onMouseLeave = () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
            idleTimerRef.current = setTimeout(() => setStore({ controlsVisible: false }), delayMs)
        }
        const el = containerRef.current
        if (!el) return
        el.addEventListener("mousemove", showAndReschedule)
        el.addEventListener("mouseenter", showAndReschedule)
        el.addEventListener("mouseleave", onMouseLeave)
        scheduleHide()
        return () => {
            el.removeEventListener("mousemove", showAndReschedule)
            el.removeEventListener("mouseenter", showAndReschedule)
            el.removeEventListener("mouseleave", onMouseLeave)
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        }
    }, [isCanvas, hideControlsOnIdle, controlsHideDelay, setStore])

    const onPlay = useCallback(() => setStore({ play: true }), [setStore])
    const onPause = useCallback(() => setStore({ play: false }), [setStore])
    const onEnded = useCallback(() => setStore({ ended: true }), [setStore])
    const onSeeked = useCallback(() => setStore({ seeked: true }), [setStore])
    const onError = useCallback(() => {
        setVideoError(true)
        setStore({ error: "Video failed to load" })
    }, [setStore])
    const onTimeUpdate = useCallback(() => {
        const v = videoRef.current
        if (!v) return
        const duration = v.duration
        const currentTime = v.currentTime
        setStore({ currentTime, duration })
        if (startTimePercent > 0 && duration > 0 && !startTimeAppliedRef.current) {
            startTimeAppliedRef.current = true
            v.currentTime = (startTimePercent / 100) * duration
        }
    }, [startTimePercent, setStore])
    const onProgress = useCallback(() => {
        const v = videoRef.current
        if (!v?.buffered?.length) return
        const buffered = v.buffered.end(v.buffered.length - 1)
        const duration = v.duration
        const pct = duration > 0 ? (buffered / duration) * 100 : 0
        setStore({ loadingPercent: pct })
    }, [setStore])

    const handleTapToPlay = () => {
        if (!tapToPlay || !shouldLoadVideo || store.fullscreen) return
        const video = videoRef.current
        const nextPlay = !store.play
        if (video) {
            if (nextPlay) video.play().catch(() => {})
            else video.pause()
        }
        setStore({ play: nextPlay })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (store.fullscreen) return
        if (e.key === " " || e.key === "Spacebar") {
            e.preventDefault()
            handleTapToPlay()
        }
    }

    const fitStyle: React.CSSProperties =
        fit === "cover"
            ? { objectFit: "cover" }
            : fit === "contain"
              ? { objectFit: "contain" }
              : { objectFit: "cover" } /* fill: use cover to avoid distortion, crop to fill */

    if (videoError && fallbackImage) {
        return (
            <div style={{ width: "100%", height: "100%", ...style }}>
                <img
                    src={fallbackImage}
                    alt="Video unavailable"
                    style={{ width: "100%", height: "100%", ...fitStyle }}
                />
            </div>
        )
    }

    if (videoError) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#222",
                    color: "#fff",
                    ...style,
                }}
            >
                Video failed to load
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            role="button"
            tabIndex={tapToPlay ? 0 : undefined}
            onClick={handleTapToPlay}
            onKeyDown={handleKeyDown}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                cursor: tapToPlay ? "pointer" : undefined,
                ...style,
            }}
        >
            {showPoster && poster && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        background: "#000",
                    }}
                >
                    <img
                        src={poster}
                        alt=""
                        style={{ width: "100%", height: "100%", ...fitStyle }}
                    />
                </div>
            )}
            {showStaticFirstFrame && (
                <PreviewPlaceholder
                    libraryId={libraryId}
                    videoId={videoId}
                    pullZoneHostname={pullZoneHostname}
                    poster={poster}
                    fitStyle={fitStyle}
                />
            )}
            {shouldLoadVideo && streamUrl && (
                <>
                    <video
                        ref={videoRef}
                        src={streamUrl}
                        poster={poster || undefined}
                        loop={loop}
                        muted={muted}
                        autoPlay={autoplay}
                        playsInline
                        controls={showControls && store.fullscreen}
                        onPlay={onPlay}
                        onPause={onPause}
                        onEnded={onEnded}
                        onSeeked={onSeeked}
                        onError={onError}
                        onTimeUpdate={onTimeUpdate}
                        onProgress={onProgress}
                        onLoadedMetadata={() => {
                            setStore({ ready: true, muted })
                            setShowPoster(false)
                        }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            ...fitStyle,
                            pointerEvents: store.fullscreen ? "auto" : "none",
                        }}
                    />
                </>
            )}
            {children && (
                <div
                    data-bunny-controls-overlay
                    onMouseOver={(e) => {
                        if ((e.target as HTMLElement).closest?.("[data-bunny-control]")) {
                            reportControlHover(true, setStore)
                        }
                    }}
                    onMouseOut={(e) => {
                        const overlay = e.currentTarget
                        const related = e.relatedTarget as Node | null
                        if (!related || !overlay.contains(related)) {
                            reportControlHover(false, setStore)
                        }
                    }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: store.controlsVisible ? "auto" : "none",
                        opacity: store.controlsVisible ? 1 : 0,
                        transition: "opacity 0.3s ease",
                        zIndex: 2,
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    )
}

BunnyVideoPlayer.defaultProps = {
    libraryId: "",
    videoId: "",
    pullZoneHostname: "",
    autoplay: false,
    loop: false,
    muted: false,
    showControls: true,
    hideControlsOnIdle: true,
    controlsHideDelay: 3,
    poster: "",
    fallbackImage: "",
    startTimePercent: 0,
    tapToPlay: true,
    previewOnCanvas: false,
    lazyLoad: false,
    fit: "cover" as const,
    quality: "auto" as const,
}

addPropertyControls(BunnyVideoPlayer, {
    children: {
        type: ControlType.ComponentInstance,
        title: "Content",
        hidden: () => true,
    },
    libraryId: { type: ControlType.String, title: "Library ID" },
    videoId: { type: ControlType.String, title: "Video ID" },
    pullZoneHostname: { type: ControlType.String, title: "CDN host name" },
    previewOnCanvas: {
        type: ControlType.Boolean,
        title: "Preview on Canvas",
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    autoplay: { type: ControlType.Boolean, title: "Autoplay" },
    loop: { type: ControlType.Boolean, title: "Loop" },
    muted: { type: ControlType.Boolean, title: "Muted" },
    showControls: { type: ControlType.Boolean, title: "Show Controls" },
    hideControlsOnIdle: {
        type: ControlType.Boolean,
        title: "Hide Controls on Idle",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
        description: "Hide controls when the mouse is idle.",
    },
    controlsHideDelay: {
        type: ControlType.Number,
        title: "Hide Delay",
        min: 0.5,
        max: 30,
        step: 0.5,
        unit: "s",
        defaultValue: 3,
        hidden: (props) => !props.hideControlsOnIdle,
        description: "Seconds of idle time before controls vanish.",
    },
    quality: {
        type: ControlType.Enum,
        title: "Quality",
        options: ["auto", "2160", "1440", "1080", "720", "480", "360"],
        optionTitles: ["Auto", "4K (2160p)", "2K (1440p)", "1080p", "720p", "480p", "360p"],
    },
    poster: { type: ControlType.Image, title: "Poster" },
    fallbackImage: { type: ControlType.Image, title: "Fallback (video error)" },
    startTimePercent: {
        type: ControlType.Number,
        title: "Start %",
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
    },
    fit: {
        type: ControlType.Enum,
        title: "Fit",
        options: ["cover", "contain", "fill"],
        optionTitles: ["Cover", "Contain", "Fill"],
    },
    lazyLoad: {
        type: ControlType.Boolean,
        title: "Lazy Load",
        enabledTitle: "On",
        disabledTitle: "Off",
        description: "Made by [Stōkt](https://wearestokt.com/)",
    },
})
