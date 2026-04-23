import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
    createInitialBunnyVideoState,
    reportControlHover,
    useBunnyVideoHoverRef,
    useBunnyVideoStore,
} from "./BunnyVideoStore.tsx"
import type { BunnyVideoStoreState } from "./BunnyVideoStore.tsx"

const HLS_JS_URL = "https://cdn.jsdelivr.net/npm/hls.js@1.5.7/dist/hls.min.js"
/** After loud (fake-mute) autoplay actually starts, wait this long before unmuting so the browser keeps playback. */
const LOUD_UNMUTE_DELAY_MS = 220

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
 * Bunny’s **primary** poster at `thumbnail.jpg` (the library “thumbnail” / cover).
 * `thumbnail_1.jpg`, `thumbnail_2.jpg`, … are indexed preview stills and are not guaranteed to be t=0.
 */
function getThumbnailUrl(
    libraryId: string,
    videoId: string,
    pullZoneHostname?: string
): string {
    if (pullZoneHostname?.trim()) {
        const host = pullZoneHostname.replace(/^https?:\/\//, "").split("/")[0].trim()
        return `https://${host}/${videoId}/thumbnail.jpg`
    }
    return `https://vz-${libraryId}.b-cdn.net/${videoId}/thumbnail.jpg`
}

/**
 * Build HLS stream URL from Bunny Stream library + video IDs.
 * 1) pullZoneHostname if provided (e.g. vz-12345.b-cdn.net from library API/settings)
 * 2) vz-{libraryId}.b-cdn.net (Stream library pull zone pattern)
 */
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

/** hls.js level / master manifest row — kept in this file so Framer uploads a single component file. */
type HlsLevelLike = {
    height?: number
    videoCodec?: string
    codecs?: string
    url?: string
}

type CodecClass = "hevc" | "av1" | "vp" | "avc" | "unknown"

function hlsGetCodecString(level: HlsLevelLike): string {
    if (level.videoCodec && level.videoCodec.trim()) return level.videoCodec.trim()
    if (level.codecs && level.codecs.trim()) {
        const parts = level.codecs.split(",").map((p) => p.trim())
        const video = parts.find(
            (p) =>
                /^(avc|hvc|hev|dvh|vp0|vp9|av01|av1)/i.test(p) || /(avc1|hvc1|hev1|dvh1|vp09|vp08|av01)/i.test(p)
        )
        return (video || parts[0] || "").trim()
    }
    if (level.url) {
        const u = level.url.toLowerCase()
        if (u.includes("hevc") || u.includes("h265")) return "hvc1.synthetic"
        if (u.includes("vp9") || u.includes("webm")) return "vp09.synthetic"
    }
    return ""
}

function hlsClassifyRendition(codecStr: string): CodecClass {
    const c = codecStr.toLowerCase()
    if (c.includes("hvc1") || c.includes("hev1") || c.includes("dvh1") || c.includes("hevc")) {
        return "hevc"
    }
    if (c.startsWith("av01") || c.includes("av1")) {
        return "av1"
    }
    if (c.includes("vp09") || c.includes("vp8") || c.includes("vp0")) {
        return "vp"
    }
    if (c.includes("avc1") || c.includes("avc3") || c.includes("avc")) {
        return "avc"
    }
    return "unknown"
}

const hlsRankHevc = (c: CodecClass): number => {
    switch (c) {
        case "hevc":
            return 0
        case "av1":
            return 1
        case "avc":
            return 2
        case "vp":
            return 3
        case "unknown":
            return 4
        default:
            return 5
    }
}

const hlsRankNonHevc = (c: CodecClass): number => {
    switch (c) {
        case "vp":
            return 0
        case "av1":
            return 1
        case "avc":
            return 2
        case "unknown":
            return 3
        case "hevc":
            return 4
        default:
            return 5
    }
}

function hlsGetPreferHevcRendition(): boolean {
    if (typeof navigator === "undefined") return false
    const ua = navigator.userAgent
    if (
        /Chrome|Chromium|CriOS|CrMo|Edg\/|EdgA|EdgiOS|OPR\/|Opera|OPiOS|SamsungBrowser|Firefox|FxiOS|Vivaldi|Brave/.test(ua)
    ) {
        return false
    }
    if (/(iPhone|iPad|iPod)/.test(ua) && /Safari/.test(ua)) return true
    if (/Safari/.test(ua) && /Macintosh|Mac OS X/.test(ua)) return true
    return false
}

type HlsIndexedLevel = { hlsIndex: number; height: number; codecStr: string; cls: CodecClass }

function hlsPickBestInGroup(group: HlsIndexedLevel[], preferHevc: boolean): HlsIndexedLevel {
    const rank = preferHevc ? hlsRankHevc : hlsRankNonHevc
    return [...group].sort((a, b) => {
        const d = rank(a.cls) - rank(b.cls)
        if (d !== 0) return d
        return a.hlsIndex - b.hlsIndex
    })[0]
}

function findClosestHeightIndex(heights: number[], target: number): number {
    if (!heights.length) return 0
    let best = 0
    let bestDiff = Infinity
    for (let i = 0; i < heights.length; i++) {
        const d = Math.abs((heights[i] ?? 0) - target)
        if (d < bestDiff) {
            bestDiff = d
            best = i
        }
    }
    return best
}

function buildQualitySelection(
    levels: HlsLevelLike[],
    preferHevc: boolean
): { labels: string[]; heights: number[]; hlsLevelIndices: number[] } {
    if (!levels.length) {
        return { labels: [], heights: [], hlsLevelIndices: [] }
    }
    const indexed: HlsIndexedLevel[] = levels.map((l, hlsIndex) => {
        const codecStr = hlsGetCodecString(l)
        return {
            hlsIndex,
            height: Math.max(0, l.height ?? 0),
            codecStr,
            cls: hlsClassifyRendition(codecStr),
        }
    })
    const byHeight = new Map<number, HlsIndexedLevel[]>()
    for (const row of indexed) {
        if (row.height <= 0) continue
        if (!byHeight.has(row.height)) byHeight.set(row.height, [])
        byHeight.get(row.height)!.push(row)
    }
    const chosen: { hlsIndex: number; height: number; label: string }[] = []
    for (const [, group] of byHeight) {
        if (group.length === 0) continue
        const height = group[0].height
        const best = group.length === 1 ? group[0] : hlsPickBestInGroup(group, preferHevc)
        chosen.push({ hlsIndex: best.hlsIndex, height, label: `${height}p` })
    }
    chosen.sort((a, b) => a.height - b.height)
    return {
        labels: chosen.map((c) => c.label),
        heights: chosen.map((c) => c.height),
        hlsLevelIndices: chosen.map((c) => c.hlsIndex),
    }
}

function ControlsOverlay(props: {
    store: BunnyVideoStoreState
    setStore: (partial: Partial<BunnyVideoStoreState>) => void
    hoverLeaveTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
    children: React.ReactNode
}) {
    const { store, setStore, hoverLeaveTimeoutRef, children } = props
    return (
        <div
            data-bunny-controls-overlay
            onMouseOver={(e) => {
                if ((e.target as HTMLElement).closest?.("[data-bunny-control]")) {
                    reportControlHover(true, setStore, hoverLeaveTimeoutRef)
                }
            }}
            onMouseOut={(e) => {
                const overlayEl = e.currentTarget
                const related = e.relatedTarget as Node | null
                if (!related || !overlayEl.contains(related)) {
                    reportControlHover(false, setStore, hoverLeaveTimeoutRef)
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
    )
}

// Canvas insert: any-prefer-fixed + intrinsic 600×338 (16:9) so the frame is not Fit×Fit at 0×0.
/**
 * @framerDisableUnlink
 * @framerDisableEdit
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
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
    /** Play while the pointer is over the player; pauses on leave. Touch devices still use Tap to Play. */
    playOnHover?: boolean
    previewOnCanvas?: boolean
    lazyLoad?: boolean
    /**
     * With Lazy Load on: `viewport` mounts when near/in view (default). `interaction` mounts only after the first
     * pointer hover or press on this player — best for dense grids (many videos on one page).
     */
    deferVideoUntil?: "viewport" | "interaction"
    /** Lazy viewport observer `rootMargin` (viewport mode only). Default `100px`. Use `0px` to avoid preloading off-screen cards. */
    lazyRootMargin?: string
    /** Minimum visible fraction (0–1) before lazy viewport mode mounts. `0` = first pixel (default). Try `0.1`–`0.25` on portfolios. */
    lazyLoadMinRatio?: number
    /** Pause playback when the player leaves the viewport; resume when it returns if it was playing. Helps CPU/GPU with many videos. */
    pauseWhenOutOfView?: boolean
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
        playOnHover = false,
        previewOnCanvas = false,
        lazyLoad = false,
        deferVideoUntil = "viewport",
        lazyRootMargin = "100px",
        lazyLoadMinRatio = 0,
        pauseWhenOutOfView = true,
        fit = "cover",
        quality = "auto",
        storeId = "default",
        style,
        children,
    } = props

    const lazyMarginResolved = lazyRootMargin?.trim() || "100px"
    /** Framer control is 0–100 (% of element visible); IO uses 0–1. */
    const lazyMinRatioResolved = Math.min(1, Math.max(0, (lazyLoadMinRatio ?? 0) / 100))

    const videoRef = useRef<HTMLVideoElement>(null)
    const programmaticPauseRef = useRef(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const hlsRef = useRef<HlsInstance | null>(null)
    const levelsRef = useRef<HlsLevelLike[]>([])
    const qualityRef = useRef(quality)
    qualityRef.current = quality
    const startTimeAppliedRef = useRef(false)
    /** `timeupdate` is ~4 Hz; use a ref so we only sync currentTime from it while paused. */
    const playRef = useRef(false)
    /** If we paused because the player left the viewport, resume when it returns (if still "playing"). */
    const resumePlayAfterVisibleRef = useRef(false)
    /** Last pointer position (viewport) — used when Play on Hover + carousel moves the player without firing pointerleave. */
    const lastPointerClientRef = useRef({ x: 0, y: 0 })
    const [store, setStore] = useBunnyVideoStore(storeId)
    const hoverLeaveTimeoutRef = useBunnyVideoHoverRef(storeId)
    const prevStoreIdRef = useRef(storeId)
    useEffect(() => {
        if (prevStoreIdRef.current !== storeId) {
            prevStoreIdRef.current = storeId
            setStore(createInitialBunnyVideoState())
        }
    }, [storeId, setStore])
    playRef.current = store.play
    const controlsVisibleRef = useRef(store.controlsVisible)
    controlsVisibleRef.current = store.controlsVisible
    /** Clear "resume when visible" once playback is on; does not run when `play` is false (so scroll-away keeps the flag). */
    useEffect(() => {
        if (!store.play) return
        resumePlayAfterVisibleRef.current = false
    }, [store.play])
    const [showPoster, setShowPoster] = useState(true)
    /** When no Framer Poster: decoded first video frame, else Bunny `thumbnail.jpg` fallback. */
    const [firstFramePosterUrl, setFirstFramePosterUrl] = useState<string | null>(null)
    const firstFramePosterUrlRef = useRef<string | null>(null)
    const [videoError, setVideoError] = useState(false)

    const pauseVideoProgrammatic = (v: HTMLVideoElement) => {
        programmaticPauseRef.current = true
        v.pause()
        requestAnimationFrame(() => {
            programmaticPauseRef.current = false
        })
    }

    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const shouldLoadVideo = !isCanvas || previewOnCanvas
    const showStaticFirstFrame = isCanvas && !previewOnCanvas && !poster

    const [inView, setInView] = useState(!lazyLoad)
    const readyToLoad = shouldLoadVideo && (!lazyLoad || inView)

    const streamUrl = libraryId && videoId ? buildStreamUrl(libraryId, videoId, pullZoneHostname) : ""

    /** New video id on the same instance: require interaction again before mounting (published site only). */
    useEffect(() => {
        if (!lazyLoad || deferVideoUntil !== "interaction") return
        if (RenderTarget.current() === RenderTarget.preview) return
        setInView(false)
    }, [streamUrl, lazyLoad, deferVideoUntil])
    /** Browsers allow autoplay when muted. Start muted, then unmute in `onPlaying` + interval (Autoplay on + Mute off, not play-on-hover). */
    const useLoudAutoplay = Boolean(autoplay && !muted && !playOnHover)
    const [loudPretendMuted, setLoudPretendMuted] = useState(
        () => Boolean(autoplay && !muted && !playOnHover)
    )
    const loudPretendMutedRef = useRef(loudPretendMuted)
    const loudUnmuteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    /** While true, `onPause` is ignored and we re-call play (browser can emit spurious pause when unmuting). */
    const loudUnmuteSpuriousPauseGuardRef = useRef(false)
    const loudAutoplayBruteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const useLoudAutoplayRef = useRef(false)
    /**
     * While `Date.now() <` this value, off-screen `IntersectionObserver` must not set `play: false`.
     * Unmute can race with a false "not visible" first frame; then the play effect pauses.
     */
    const loudOovUnmuteGuardUntilRef = useRef(0)
    const prevLoudAutoplayKeyRef = useRef<string>("")
    const loudAutoplayKey = `${String(autoplay)}|${String(muted)}|${String(playOnHover)}|${streamUrl}`
    loudPretendMutedRef.current = loudPretendMuted
    useLoudAutoplayRef.current = useLoudAutoplay

    /** Do not mount `<video>` until lazy viewport gate passes — avoids native `.m3u8` load + `onError` before HLS.js attaches. */
    const shouldMountVideo = shouldLoadVideo && Boolean(streamUrl) && (!lazyLoad || readyToLoad)
    const bunnyPosterUrl =
        libraryId && videoId ? getThumbnailUrl(libraryId, videoId, pullZoneHostname) : ""
    const hasCustomPoster = Boolean(poster?.trim())
    const posterForUi = hasCustomPoster ? poster.trim() : firstFramePosterUrl || bunnyPosterUrl
    /** Avoid double Bunny image on canvas: PreviewPlaceholder already draws the default thumbnail. */
    const showPosterOverlay = showPoster && posterForUi && !showStaticFirstFrame

    useEffect(() => {
        if (hasCustomPoster || !shouldMountVideo || !streamUrl) {
            if (firstFramePosterUrlRef.current) {
                URL.revokeObjectURL(firstFramePosterUrlRef.current)
                firstFramePosterUrlRef.current = null
            }
            setFirstFramePosterUrl(null)
            return
        }
        const v = videoRef.current
        if (!v) return
        let cancelled = false
        let didCapture = false
        const captureIfStillAtStart = () => {
            if (cancelled || didCapture) return
            if (v.currentTime > 0.12) return
            if (v.videoWidth < 2 || v.videoHeight < 2) return
            didCapture = true
            try {
                const canvas = document.createElement("canvas")
                canvas.width = v.videoWidth
                canvas.height = v.videoHeight
                const ctx = canvas.getContext("2d")
                if (!ctx) return
                ctx.drawImage(v, 0, 0)
                canvas.toBlob(
                    (blob) => {
                        if (cancelled || !blob) return
                        if (firstFramePosterUrlRef.current) {
                            URL.revokeObjectURL(firstFramePosterUrlRef.current)
                        }
                        const u = URL.createObjectURL(blob)
                        firstFramePosterUrlRef.current = u
                        setFirstFramePosterUrl(u)
                    },
                    "image/jpeg",
                    0.9
                )
            } catch {
                didCapture = false
            }
        }
        const onLoadedData = () => captureIfStillAtStart()
        v.addEventListener("loadeddata", onLoadedData)
        if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            queueMicrotask(captureIfStillAtStart)
        }
        return () => {
            cancelled = true
            v.removeEventListener("loadeddata", onLoadedData)
            if (firstFramePosterUrlRef.current) {
                URL.revokeObjectURL(firstFramePosterUrlRef.current)
                firstFramePosterUrlRef.current = null
            }
            setFirstFramePosterUrl(null)
        }
    }, [hasCustomPoster, shouldMountVideo, streamUrl, loudAutoplayKey])

    useLayoutEffect(() => {
        const inFramerBuilderPreview = RenderTarget.current() === RenderTarget.preview
        /* In-app Preview uses nested layouts / iframes where IntersectionObserver is unreliable (often “not visible”) →
         * pauses immediately = black. Lazy viewport can also never fire → video never mounts. */
        if (inFramerBuilderPreview && lazyLoad) {
            setInView(true)
        }
        const needLazyObserver =
            lazyLoad && !inFramerBuilderPreview && deferVideoUntil !== "interaction"
        const needVisibilityObserver = pauseWhenOutOfView && !inFramerBuilderPreview
        if (!needLazyObserver && !needVisibilityObserver) return

        const el = containerRef.current
        if (!el) return

        const observers: IntersectionObserver[] = []

        /** Preload stream slightly before the player enters the viewport (separate from visibility below). */
        if (needLazyObserver) {
            const lazyObs = new IntersectionObserver(
                ([entry]) => {
                    if (!entry?.isIntersecting) return
                    const ratio = entry.intersectionRatio ?? 0
                    if (ratio < lazyMinRatioResolved) return
                    setInView(true)
                },
                { root: null, rootMargin: lazyMarginResolved, threshold: 0 }
            )
            lazyObs.observe(el)
            observers.push(lazyObs)
        }

        /**
         * Pause/resume against the real viewport: `rootMargin: 0` + `threshold: 0` so the first visible pixel
         * counts as intersecting. (Do not reuse the lazy observer's expanded root — that broke resume timing.)
         */
        if (needVisibilityObserver) {
            const visibilityObs = new IntersectionObserver(
                ([entry]) => {
                    if (!entry) return
                    const visible =
                        entry.isIntersecting === true || (entry.intersectionRatio ?? 0) > 0
                    if (visible) {
                        if (resumePlayAfterVisibleRef.current) {
                            resumePlayAfterVisibleRef.current = false
                            setStore({ play: true })
                            requestAnimationFrame(() => {
                                const v = videoRef.current
                                if (v) {
                                    v.playbackRate = 1
                                    void v.play().catch(() => {})
                                }
                            })
                        }
                    } else if (playRef.current) {
                        if (loudPretendMutedRef.current) return
                        if (
                            loudOovUnmuteGuardUntilRef.current > 0 &&
                            Date.now() < loudOovUnmuteGuardUntilRef.current
                        )
                            return
                        const v = videoRef.current
                        if (v && document.fullscreenElement === v) return
                        resumePlayAfterVisibleRef.current = true
                        setStore({ play: false })
                    }
                },
                { root: null, rootMargin: "0px", threshold: 0 }
            )
            visibilityObs.observe(el)
            observers.push(visibilityObs)
        }

        return () => {
            for (const o of observers) o.disconnect()
        }
    }, [
        lazyLoad,
        deferVideoUntil,
        lazyMarginResolved,
        lazyMinRatioResolved,
        pauseWhenOutOfView,
        setStore,
    ])

    /** Lazy + interaction: mount `<video>` only after pointer hover or press (not Framer Preview — that keeps viewport lazy). */
    useLayoutEffect(() => {
        const inFramerBuilderPreview = RenderTarget.current() === RenderTarget.preview
        if (inFramerBuilderPreview || !lazyLoad || deferVideoUntil !== "interaction") return
        const el = containerRef.current
        if (!el) return
        let done = false
        const activate = () => {
            if (done) return
            done = true
            setInView(true)
            el.removeEventListener("pointerenter", activate)
            el.removeEventListener("pointerdown", activate)
        }
        el.addEventListener("pointerenter", activate, { passive: true })
        el.addEventListener("pointerdown", activate, { passive: true })
        return () => {
            done = true
            el.removeEventListener("pointerenter", activate)
            el.removeEventListener("pointerdown", activate)
        }
    }, [lazyLoad, deferVideoUntil, streamUrl])

    /**
     * Re-arm muted→unmute only when the player actually needs the trick (key change: new video or Framer prop flip).
     * Do not re-arm on every frame after onPlaying has cleared `loudPretendMuted` (key unchanged).
     */
    useLayoutEffect(() => {
        if (loudUnmuteTimeoutRef.current) {
            clearTimeout(loudUnmuteTimeoutRef.current)
            loudUnmuteTimeoutRef.current = null
        }
        if (!useLoudAutoplay) {
            setLoudPretendMuted(false)
            loudOovUnmuteGuardUntilRef.current = 0
            prevLoudAutoplayKeyRef.current = loudAutoplayKey
            return
        }
        if (prevLoudAutoplayKeyRef.current !== loudAutoplayKey) {
            setLoudPretendMuted(true)
            /* Cover load + unmute + layout flicker so OOV must not clear `play`. */
            loudOovUnmuteGuardUntilRef.current = Date.now() + 45_000
        }
        prevLoudAutoplayKeyRef.current = loudAutoplayKey
    }, [loudAutoplayKey, useLoudAutoplay])

    /**
     * Autoplay must drive `store.play`. Otherwise the play-sync effect calls `video.pause()` while
     * `autoPlay` is on — the native autoplay path loses to React and the video often never starts.
     * `playOnHover` uses pointer events instead, so we do not set play here.
     * When the video is lazy-gated, we set play once it actually mounts.
     */
    useLayoutEffect(() => {
        if (playOnHover || !autoplay || !shouldLoadVideo || !shouldMountVideo) return
        setStore({ play: true })
    }, [autoplay, playOnHover, shouldLoadVideo, shouldMountVideo, setStore])

    useEffect(() => {
        if (store.muted) {
            if (loudUnmuteTimeoutRef.current) {
                clearTimeout(loudUnmuteTimeoutRef.current)
                loudUnmuteTimeoutRef.current = null
            }
            setLoudPretendMuted(false)
        }
    }, [store.muted])

    useEffect(() => {
        setStore({ muted })
    }, [muted, setStore])

    useEffect(() => {
        const hls = hlsRef.current
        if (!hls) return
        if (quality === "auto") {
            hls.currentLevel = -1
            return
        }
        const map = store.qualityHlsLevelByIndex
        if (!map.length) return
        const opt = QUALITY_OPTIONS.find((o) => o.value === quality)
        if (opt && opt.height > 0) {
            const menuIdx = findClosestHeightIndex(store.qualityHeights ?? [], opt.height)
            hls.currentLevel = map[menuIdx] ?? 0
        }
    }, [quality, store.qualityHeights, store.qualityHlsLevelByIndex])

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
                    /* Preview iframe can block HLS’s worker → no decoder / no playback. */
                    enableWorker: RenderTarget.current() !== RenderTarget.preview,
                    lowLatencyMode: false,
                })
                hlsRef.current = hls

                if (mounted) {
                    setStore({
                        loadingPercent: 0,
                        qualities: [],
                        qualityHeights: [],
                        qualityHlsLevelByIndex: [],
                    })
                }
                hls.loadSource(streamUrl)
                hls.attachMedia(video)

                hls.on(Hls.Events.MANIFEST_PARSED, (_, data: unknown) => {
                    if (!mounted) return
                    const levels = (data as { levels?: HlsLevelLike[] }).levels ?? []
                    levelsRef.current = levels
                    const preferHevc = hlsGetPreferHevcRendition()
                    const sel = buildQualitySelection(levels, preferHevc)
                    const q = qualityRef.current
                    let storeQuality = 0
                    if (q === "auto") {
                        hls.currentLevel = -1
                        storeQuality = 0
                    } else {
                        const opt = QUALITY_OPTIONS.find((o) => o.value === q)
                        if (opt && opt.height > 0 && sel.hlsLevelIndices.length > 0) {
                            const menuIdx = findClosestHeightIndex(sel.heights, opt.height)
                            hls.currentLevel = sel.hlsLevelIndices[menuIdx] ?? 0
                            storeQuality = menuIdx + 1
                        }
                    }
                    setStore({
                        qualities: sel.labels,
                        qualityHeights: sel.heights,
                        qualityHlsLevelByIndex: sel.hlsLevelIndices,
                        quality: storeQuality,
                        ready: true,
                        muted,
                    })
                    setShowPoster(false)
                })

                hls.on(Hls.Events.ERROR, (_, data: unknown) => {
                    if (!mounted) return
                    if ((data as { fatal?: boolean }).fatal) {
                        setVideoError(true)
                        setStore({ error: "Video failed to load" })
                    }
                })
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (mounted) setStore({ loadingPercent: 0 })
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

        /* Loud autoplay: start muted (browser allows), then onPlaying flips `loudPretendMuted` and we go full volume. */
        const videoMuted = store.muted || (useLoudAutoplay && loudPretendMuted)
        if (videoMuted) {
            video.muted = true
        } else {
            video.muted = false
            video.volume = store.volume / 100
        }

        if (store.play) {
            video.playbackRate = 1
            video.play().catch(() => {})
        } else {
            pauseVideoProgrammatic(video)
        }

        if (store.seekTo != null) {
            video.currentTime = store.seekTo
            setStore({ seekTo: null })
        }

        if (store.qualityToSet != null && hlsRef.current) {
            try {
                const map = store.qualityHlsLevelByIndex
                const hlsLevel =
                    store.qualityToSet === 0
                        ? -1
                        : map.length > 0
                          ? (map[store.qualityToSet - 1] ?? 0)
                          : store.qualityToSet - 1
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
    }, [
        store.play,
        store.muted,
        store.volume,
        store.seekTo,
        store.qualityToSet,
        store.fullscreenRequest,
        store.fullscreen,
        store.ready,
        setStore,
        useLoudAutoplay,
        loudPretendMuted,
    ])

    useEffect(() => {
        if (!useLoudAutoplay || !store.play || !loudPretendMuted) return
        if (loudAutoplayBruteIntervalRef.current) {
            clearInterval(loudAutoplayBruteIntervalRef.current)
            loudAutoplayBruteIntervalRef.current = null
        }
        let n = 0
        const id = window.setInterval(() => {
            n += 1
            if (n > 100) {
                if (loudAutoplayBruteIntervalRef.current === id) {
                    clearInterval(id)
                    loudAutoplayBruteIntervalRef.current = null
                }
                return
            }
            if (!loudPretendMutedRef.current) return
            const v = videoRef.current
            if (!v) return
            v.muted = true
            v.playbackRate = 1
            void v.play().catch(() => {})
        }, 100)
        loudAutoplayBruteIntervalRef.current = id
        return () => {
            clearInterval(id)
            if (loudAutoplayBruteIntervalRef.current === id) loudAutoplayBruteIntervalRef.current = null
        }
    }, [useLoudAutoplay, store.play, loudPretendMuted, store.ready])

    const storeRef = useRef(store)
    storeRef.current = store

    const scheduleLoudAutoplayUnmute = useCallback(() => {
        if (!useLoudAutoplayRef.current || !loudPretendMutedRef.current) return
        if (loudUnmuteTimeoutRef.current != null) return
        loudUnmuteTimeoutRef.current = window.setTimeout(() => {
            loudUnmuteTimeoutRef.current = null
            if (!loudPretendMutedRef.current) return
            if (loudAutoplayBruteIntervalRef.current) {
                clearInterval(loudAutoplayBruteIntervalRef.current)
                loudAutoplayBruteIntervalRef.current = null
            }
            loudPretendMutedRef.current = false
            const el = videoRef.current
            if (!el) {
                setLoudPretendMuted(false)
                return
            }
            loudUnmuteSpuriousPauseGuardRef.current = true
            const vol = (storeRef.current.volume ?? 100) / 100
            el.muted = false
            el.volume = vol
            el.playbackRate = 1
            void el.play().catch(() => {})
            requestAnimationFrame(() => {
                const v = videoRef.current
                if (v) {
                    v.muted = false
                    v.volume = vol
                    v.playbackRate = 1
                    void v.play().catch(() => {})
                }
            })
            setLoudPretendMuted(false)
            setStore({ play: true })
            loudOovUnmuteGuardUntilRef.current = Date.now() + 12_000
            window.setTimeout(() => {
                loudUnmuteSpuriousPauseGuardRef.current = false
            }, 400)
        }, LOUD_UNMUTE_DELAY_MS)
    }, [setStore])

    useEffect(() => {
        return () => {
            if (loudUnmuteTimeoutRef.current) {
                clearTimeout(loudUnmuteTimeoutRef.current)
                loudUnmuteTimeoutRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (playOnHover || !autoplay || muted || !shouldMountVideo) return
        const onPageClick = () => {
            if (loudUnmuteTimeoutRef.current) {
                clearTimeout(loudUnmuteTimeoutRef.current)
                loudUnmuteTimeoutRef.current = null
            }
            setLoudPretendMuted((m) => (m ? false : m))
            const v = videoRef.current
            const s = storeRef.current
            if (!v || !s.play) return
            if (!v.paused) return
            v.muted = false
            v.volume = s.volume / 100
            v.playbackRate = 1
            void v.play().catch(() => {})
        }
        window.addEventListener("click", onPageClick, { once: true, passive: true, capture: false })
        return () => window.removeEventListener("click", onPageClick, false)
    }, [autoplay, muted, playOnHover, shouldMountVideo])

    useEffect(() => {
        if (!autoplay || playOnHover) return
        const onPageShow = (e: PageTransitionEvent) => {
            if (!e.persisted) return
            setStore({ play: true })
            const v = videoRef.current
            if (v) {
                v.playbackRate = 1
                void v.play().catch(() => {})
            }
        }
        window.addEventListener("pageshow", onPageShow)
        return () => window.removeEventListener("pageshow", onPageShow)
    }, [autoplay, playOnHover, setStore])

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
            if (!controlsVisibleRef.current) setStore({ controlsVisible: true })
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

    const playOnHoverRef = useRef(playOnHover)
    playOnHoverRef.current = playOnHover
    const shouldLoadVideoRef = useRef(shouldLoadVideo)
    shouldLoadVideoRef.current = shouldLoadVideo

    /** Native pointer events + immediate play/pause — avoids one+ frame lag from setState → useEffect. */
    useLayoutEffect(() => {
        if (!playOnHover || !shouldLoadVideo) return
        const el = containerRef.current
        if (!el) return

        const onPointerEnter = (e: PointerEvent) => {
            if (!playOnHoverRef.current || !shouldLoadVideoRef.current) return
            const v = videoRef.current
            if (v && document.fullscreenElement === v) return
            lastPointerClientRef.current = { x: e.clientX, y: e.clientY }
            resumePlayAfterVisibleRef.current = false
            if (v) {
                v.playbackRate = 1
                void v.play().catch(() => {})
            }
            setStore({ play: true })
        }
        const onPointerLeave = () => {
            if (!playOnHoverRef.current || !shouldLoadVideoRef.current) return
            const v = videoRef.current
            if (v && document.fullscreenElement === v) return
            if (v) pauseVideoProgrammatic(v)
            setStore({ play: false })
        }

        el.addEventListener("pointerenter", onPointerEnter as EventListener, { passive: true })
        el.addEventListener("pointerleave", onPointerLeave, { passive: true })
        return () => {
            el.removeEventListener("pointerenter", onPointerEnter as EventListener)
            el.removeEventListener("pointerleave", onPointerLeave)
        }
    }, [playOnHover, shouldLoadVideo, setStore])

    /** Keep pointer coords fresh while the carousel can move the player without moving the mouse. */
    useEffect(() => {
        if (!playOnHover || !store.play) return
        const sync = (e: PointerEvent) => {
            lastPointerClientRef.current = { x: e.clientX, y: e.clientY }
        }
        document.addEventListener("pointermove", sync as EventListener, { passive: true })
        return () => document.removeEventListener("pointermove", sync as EventListener)
    }, [playOnHover, store.play])

    /**
     * Transform-based carousels move the player under a stationary pointer — `pointerleave` never fires.
     * Each frame, test pointer vs current bounding rect and pause when outside.
     */
    useEffect(() => {
        if (!playOnHover || !shouldMountVideo || !store.play) return
        let rafId = 0
        const tick = () => {
            if (!playOnHoverRef.current) return
            const container = containerRef.current
            if (!container) {
                rafId = requestAnimationFrame(tick)
                return
            }
            const { x, y } = lastPointerClientRef.current
            const r = container.getBoundingClientRect()
            const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
            if (!inside) {
                const v = videoRef.current
                if (v) {
                    v.playbackRate = 1
                    pauseVideoProgrammatic(v)
                }
                setStore({ play: false })
                return
            }
            rafId = requestAnimationFrame(tick)
        }
        rafId = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafId)
    }, [playOnHover, shouldMountVideo, store.play, setStore])

    const onPlay = useCallback(() => setStore({ play: true }), [setStore])
    const onVideoPlaying = useCallback(() => {
        setStore({ play: true })
        scheduleLoudAutoplayUnmute()
    }, [setStore, scheduleLoudAutoplayUnmute])
    const onPause = useCallback(() => {
        if (programmaticPauseRef.current) return
        if (loudUnmuteSpuriousPauseGuardRef.current) {
            const v = videoRef.current
            if (v && !document.hidden) {
                v.playbackRate = 1
                void v.play().catch(() => {})
            }
            return
        }
        if (document.hidden) {
            setStore({ play: false })
            return
        }
        if (autoplay && !muted && !playOnHover && !storeRef.current.fullscreen) {
            return
        }
        setStore({ play: false })
    }, [setStore, autoplay, muted, playOnHover])
    const onEnded = useCallback(() => setStore({ ended: true }), [setStore])
    const onSeeked = useCallback(() => setStore({ seeked: true }), [setStore])
    const onError = useCallback(() => {
        setVideoError(true)
        setStore({ error: "Video failed to load" })
    }, [setStore])
    const onTimeUpdate = useCallback(() => {
        const v = videoRef.current
        if (!v) return
        if (
            useLoudAutoplayRef.current &&
            loudPretendMutedRef.current &&
            !v.paused &&
            v.currentTime > 0.05
        ) {
            scheduleLoudAutoplayUnmute()
        }
        const duration = v.duration
        const d = Number.isFinite(duration) ? duration : 0
        if (!playRef.current) {
            setStore({ currentTime: v.currentTime, duration: d })
        }
        if (startTimePercent > 0 && d > 0 && !startTimeAppliedRef.current) {
            startTimeAppliedRef.current = true
            v.currentTime = (startTimePercent / 100) * d
        }
    }, [startTimePercent, setStore, scheduleLoudAutoplayUnmute])

    /**
     * Smooth progress UI: ~60fps store updates while playing.
     * When Play on Hover is on, skip this — carousels + many tickers would otherwise thrash React; `timeupdate` is enough.
     */
    useEffect(() => {
        if (!shouldMountVideo || !store.play || playOnHover) return
        let rafId = 0
        const tick = () => {
            const v = videoRef.current
            if (v) {
                const dur = v.duration
                setStore({
                    currentTime: v.currentTime,
                    duration: Number.isFinite(dur) ? dur : 0,
                })
            }
            rafId = requestAnimationFrame(tick)
        }
        rafId = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafId)
    }, [shouldMountVideo, store.play, playOnHover, setStore])
    const onProgress = useCallback(() => {
        const v = videoRef.current
        if (!v?.buffered?.length) return
        const buffered = v.buffered.end(v.buffered.length - 1)
        const duration = v.duration
        if (!Number.isFinite(duration) || duration <= 0) {
            setStore({ loadingPercent: 0 })
            return
        }
        const pct = Math.min(100, Math.max(0, (buffered / duration) * 100))
        setStore({ loadingPercent: pct })
    }, [setStore])

    const handleTapToPlay = () => {
        if (!tapToPlay || !shouldLoadVideo || store.fullscreen) return
        if (lazyLoad && deferVideoUntil === "interaction" && !inView) {
            setInView(true)
            return
        }
        if (loudPretendMuted) {
            if (loudUnmuteTimeoutRef.current) {
                clearTimeout(loudUnmuteTimeoutRef.current)
                loudUnmuteTimeoutRef.current = null
            }
            setLoudPretendMuted(false)
        }
        const video = videoRef.current
        if (video && autoplay && !muted && store.play && video.paused) {
            video.muted = false
            video.volume = store.volume / 100
            video.playbackRate = 1
            void video.play().catch(() => {})
            return
        }
        const nextPlay = !store.play
        resumePlayAfterVisibleRef.current = false
        if (video) {
            if (nextPlay) {
                video.playbackRate = 1
                video.play().catch(() => {})
            } else pauseVideoProgrammatic(video)
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

    const hasCustomFallback = Boolean(fallbackImage?.trim())
    const fallbackForError = hasCustomFallback ? fallbackImage.trim() : isCanvas ? bunnyPosterUrl : ""

    if (videoError && fallbackForError) {
        return (
            <div style={{ width: "100%", height: "100%", ...style }}>
                <img
                    src={fallbackForError}
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
            tabIndex={tapToPlay || playOnHover ? 0 : undefined}
            onClick={handleTapToPlay}
            onKeyDown={handleKeyDown}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                cursor: tapToPlay || playOnHover ? "pointer" : undefined,
                ...style,
            }}
        >
            {showPosterOverlay && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        background: "#000",
                    }}
                >
                    <img
                        src={posterForUi}
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
            {shouldMountVideo && (
                <>
                    <video
                        ref={videoRef}
                        crossOrigin={
                            !hasCustomPoster && shouldMountVideo && streamUrl
                                ? "anonymous"
                                : undefined
                        }
                        poster={posterForUi || undefined}
                        preload={lazyLoad ? "metadata" : "auto"}
                        loop={loop}
                        muted={!!(muted || (useLoudAutoplay && loudPretendMuted))}
                        autoPlay={autoplay && !useLoudAutoplay}
                        playsInline
                        controls={showControls && store.fullscreen}
                        onPlay={onPlay}
                        onPlaying={onVideoPlaying}
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
                <ControlsOverlay
                    store={store}
                    setStore={setStore}
                    hoverLeaveTimeoutRef={hoverLeaveTimeoutRef}
                >
                    {children}
                </ControlsOverlay>
            )}
        </div>
    )
}

BunnyVideoPlayer.defaultProps = {
    videoId: "",
    libraryId: "",
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
    playOnHover: false,
    previewOnCanvas: false,
    lazyLoad: false,
    deferVideoUntil: "viewport" as const,
    lazyRootMargin: "100px",
    lazyLoadMinRatio: 0,
    pauseWhenOutOfView: true,
    fit: "cover" as const,
    quality: "auto" as const,
    storeId: "default",
}

addPropertyControls(BunnyVideoPlayer, {
    children: {
        type: ControlType.ComponentInstance,
        title: "Content",
        hidden: () => true,
    },
    videoId: { type: ControlType.String, title: "Video ID" },
    libraryId: { type: ControlType.String, title: "Library ID" },
    pullZoneHostname: { type: ControlType.String, title: "CDN host name" },
    previewOnCanvas: {
        type: ControlType.Boolean,
        title: "Preview on Canvas",
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    autoplay: {
        type: ControlType.Boolean,
        title: "Autoplay",
        description:
            "With Muted off: playback starts muted so the browser allows it, then un-mutes ~0.22s after playback really starts (`playing` / time). Play on hover overrides. If needed, one click anywhere retries.",
    },
    tapToPlay: {
        type: ControlType.Boolean,
        title: "Tap to Play",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
    playOnHover: {
        type: ControlType.Boolean,
        title: "Play on Hover",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: false,
        description: "Play while the cursor is over the player; pauses when it leaves. Touch devices still use Tap to Play.",
    },
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
        hidden: (props: { hideControlsOnIdle?: boolean }) => !props.hideControlsOnIdle,
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
        description:
            "When on, the stream mounts only after the gate below (viewport or interaction). On dense grids many cards can still be in view at once — use Defer until + Min visible % or 0px margin to avoid loading every tile at once.",
    },
    deferVideoUntil: {
        type: ControlType.Enum,
        title: "Defer until",
        options: ["viewport", "interaction"],
        optionTitles: ["Viewport", "Interaction"],
        defaultValue: "viewport",
        hidden: (props: { lazyLoad?: boolean }) => !props.lazyLoad,
        description:
            "Viewport: mount when this player intersects the viewport (see Lazy margin / Min visible %). Interaction: poster only until the user hovers or presses this player — best for portfolio grids and many videos on one page. Framer Preview still loads so you can edit.",
    },
    lazyRootMargin: {
        type: ControlType.String,
        title: "Lazy margin",
        defaultValue: "100px",
        placeholder: "100px",
        hidden: (props: { lazyLoad?: boolean; deferVideoUntil?: string }) =>
            !props.lazyLoad || props.deferVideoUntil === "interaction",
        description:
            "IntersectionObserver rootMargin for Viewport mode only (e.g. 0px = no preload outside the viewport).",
    },
    lazyLoadMinRatio: {
        type: ControlType.Number,
        title: "Min visible %",
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 0,
        displayStepper: true,
        hidden: (props: { lazyLoad?: boolean; deferVideoUntil?: string }) =>
            !props.lazyLoad || props.deferVideoUntil === "interaction",
        description:
            "Minimum percent of this player that must be visible before Viewport mode mounts the video. 0 = first visible pixel. Try 10–25 on grids so only mostly-visible tiles load.",
    },
    pauseWhenOutOfView: {
        type: ControlType.Boolean,
        title: "Pause Off-Screen",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
        description:
            "Pause when this player leaves the viewport and resume when it returns (if it was playing). Reduces load with many videos.",
    },
    storeId: {
        type: ControlType.String,
        title: "Store ID",
        defaultValue: "default",
        description:
            "Same id on every control for this video. Duplicate slides may share one id; play state stays linked.\n\nMade by [Stōkt](https://wearestokt.com/)",
    },
})
