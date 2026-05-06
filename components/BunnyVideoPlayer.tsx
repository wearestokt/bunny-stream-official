import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
    claimAudioFloor,
    createInitialBunnyVideoState,
    ensureAudioUnlockGestureListener,
    getAudioFloorOwner,
    getAudioUnlocked,
    normalizeStoreKey,
    registerFullscreenHandler,
    releaseAudioFloor,
    reportControlHover,
    setAudioUnlocked,
    subscribeAudioFloor,
    subscribeAudioUnlocked,
    subscribeLoudAutoplayGestureRetry,
    useBunnyVideoHoverRef,
    useBunnyVideoStore,
} from "./BunnyVideoStore.tsx"
import type { BunnyVideoStoreState } from "./BunnyVideoStore.tsx"

const HLS_JS_URL = "https://cdn.jsdelivr.net/npm/hls.js@1.5.7/dist/hls.min.js"
/** After loud (fake-mute) autoplay actually starts, wait this long before unmuting so the browser keeps playback. */
const LOUD_UNMUTE_DELAY_MS = 220
/**
 * Mobile: hold muted playback far longer before attempting the unmute flip so the
 * native HLS decoder is fully warm. Flipping `muted` during iOS decoder warmup resets
 * the audio pipeline and produces visible frame stutter; a ~1.5s dwell is the industry
 * standard used by Reels / TikTok / Vimeo to avoid this.
 */
const MOBILE_LOUD_UNMUTE_DELAY_MS = 1500

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
    /** Latest `IntersectionObserver` “visible” for Pause Off-Screen; stays `true` when that observer is disabled. */
    const playerIntersectingRef = useRef(true)
    /**
     * Ignore viewport-driven autoplay pause briefly after the visibility observer attaches.
     * Safari (especially first cold load) often delivers an initial IntersectionObserver tick with
     * `isIntersecting === false` before layout/size settles — that cleared `store.play` and looked like
     * “autoplay only works after reload or interaction.”
     */
    const visibilityOovPauseGraceUntilRef = useRef(0)
    /** First `playing` fired — before this, Safari may emit spurious `pause` during src/HLS attach. */
    const heardPlayingOnceRef = useRef(false)
    /** Last pointer position (viewport) — used when Play on Hover + carousel moves the player without firing pointerleave. */
    const lastPointerClientRef = useRef({ x: 0, y: 0 })
    const [store, setStore] = useBunnyVideoStore(storeId)
    const hoverLeaveTimeoutRef = useBunnyVideoHoverRef(storeId)
    const prevStoreIdRef = useRef(storeId)
    useEffect(() => {
        if (prevStoreIdRef.current === storeId) return
        releaseAudioFloor(prevStoreIdRef.current)
        prevStoreIdRef.current = storeId
        /* Same component, new videoId/storeId: reset per-video state but preserve "autoplay means play now". */
        const next = createInitialBunnyVideoState()
        if (autoplay && !playOnHover) next.play = true
        setStore(next)
    }, [storeId, setStore, autoplay, playOnHover])
    playRef.current = store.play
    const storeRef = useRef(store)
    storeRef.current = store
    const autoplayRef = useRef(autoplay)
    autoplayRef.current = autoplay
    const framerMutedRef = useRef(muted)
    framerMutedRef.current = muted
    const playOnHoverRef = useRef(playOnHover)
    playOnHoverRef.current = playOnHover
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
    /**
     * Site-wide "audio unlocked" flag, tracked reactively so `useLoudAutoplay` below
     * collapses to false the instant any user gesture promotes the session — every
     * subsequent video switch then mounts with native `autoPlay` + unmuted directly,
     * which is the only way to reliably get unmuted playback on route changes
     * (JS-driven `.play()` outside a user-activation call stack is often throttled).
     */
    const [audioUnlockedState, setAudioUnlockedState] = useState(() => getAudioUnlocked())
    /**
     * Browsers allow autoplay when muted. Start muted, then unmute in `onPlaying` + interval
     * (Autoplay on + Mute off, not play-on-hover) — but skip the whole dance once audio is
     * unlocked for the session and rely on native unmuted autoplay instead.
     */
    const useLoudAutoplay = Boolean(autoplay && !muted && !playOnHover) && !audioUnlockedState
    const [loudPretendMuted, setLoudPretendMuted] = useState(
        () => Boolean(autoplay && !muted && !playOnHover) && !getAudioUnlocked()
    )
    const loudPretendMutedRef = useRef(loudPretendMuted)
    const loudUnmuteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    /** Mobile scheduled-unmute can run before `readyState`/buffer are ready — bounded retries. */
    const loudUnmuteMobileRetryCountRef = useRef(0)
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

    /**
     * When unmuted `play()` is rejected on the audio-unlocked path (`useLoudAutoplay === false`),
     * React would keep forcing `muted={false}` on the `<video>` — we need a real state bit so
     * we can fall back to muted playback + gesture unmute (same as loud-autoplay reject).
     */
    const [playbackMuteFallback, setPlaybackMuteFallback] = useState(false)
    const playbackMuteFallbackRef = useRef(false)
    playbackMuteFallbackRef.current = playbackMuteFallback

    /** Do not mount `<video>` until lazy viewport gate passes — avoids native `.m3u8` load + `onError` before HLS.js attaches. */
    const shouldMountVideo = shouldLoadVideo && Boolean(streamUrl) && (!lazyLoad || readyToLoad)
    const shouldMountVideoRef = useRef(shouldMountVideo)
    shouldMountVideoRef.current = shouldMountVideo

    /**
     * Mobile (< 810px viewport) autoplay follows the industry-standard gate used by
     * YouTube Shorts / Instagram Reels / Vimeo:
     *   1. Wait for `window.load` (page's critical resources finished) + a short
     *      settle delay so we never fight the initial render for bandwidth.
     *   2. Wait for `canplaythrough` or ~5s of buffered lead before starting playback.
     *   3. Skip autoplay entirely on Save-Data / 2g / slow-2g connections.
     *   4. Explicit user gestures always play immediately (bypass the gate).
     */
    const [isMobile, setIsMobile] = useState<boolean>(() =>
        typeof window !== "undefined" && window.matchMedia("(max-width: 809px)").matches
    )
    const isMobileRef = useRef(isMobile)
    isMobileRef.current = isMobile
    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia("(max-width: 809px)")
        const apply = () => setIsMobile(mq.matches)
        apply()
        mq.addEventListener?.("change", apply)
        return () => mq.removeEventListener?.("change", apply)
    }, [])
    const canPlayThroughRef = useRef(false)
    const deferredAutoPlayRef = useRef(false)
    /** Page load gate: mobile autoplay must not start before `window.load` (+ small settle). */
    const pageLoadReadyRef = useRef(
        typeof document !== "undefined" && document.readyState === "complete"
    )
    /** Returns `true` if we must skip mobile autoplay entirely (Save-Data or 2g/slow-2g). */
    const shouldSkipMobileAutoplay = (): boolean => {
        if (typeof navigator === "undefined") return false
        const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })
            .connection
        if (!c) return false
        if (c.saveData === true) return true
        return c.effectiveType === "slow-2g" || c.effectiveType === "2g"
    }
    /**
     * Extra settle delay after the browser reports it can play through. iPhone Safari's
     * native HLS decoder stays warm-up-y for ~1s after `canplaythrough` / `readyState === 4`;
     * calling `play()` before that settles produces visible jank on cold loads.
     */
    const mobileSettleDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const tryReleaseDeferredAutoPlay = useCallback(() => {
        if (!deferredAutoPlayRef.current) return
        const v = videoRef.current
        if (!v || !storeRef.current.play || !v.paused) return
        if (!pageLoadReadyRef.current) return
        const mutedPlayback =
            framerMutedRef.current ||
            storeRef.current.muted ||
            (useLoudAutoplayRef.current && loudPretendMutedRef.current) ||
            playbackMuteFallbackRef.current
        const minReady = mutedPlayback
            ? HTMLMediaElement.HAVE_FUTURE_DATA
            : HTMLMediaElement.HAVE_ENOUGH_DATA
        if (!canPlayThroughRef.current && v.readyState < minReady) return
        if (isMobileRef.current) {
            if (mobileSettleDelayTimerRef.current != null) return
            mobileSettleDelayTimerRef.current = window.setTimeout(() => {
                mobileSettleDelayTimerRef.current = null
                if (!deferredAutoPlayRef.current) return
                const el = videoRef.current
                if (!el || !storeRef.current.play || !el.paused) return
                deferredAutoPlayRef.current = false
                el.playbackRate = 1
                void el.play().catch(() => {})
            }, 1000)
            return
        }
        deferredAutoPlayRef.current = false
        v.playbackRate = 1
        void v.play().catch(() => {})
    }, [])
    useEffect(() => {
        return () => {
            if (mobileSettleDelayTimerRef.current != null) {
                clearTimeout(mobileSettleDelayTimerRef.current)
                mobileSettleDelayTimerRef.current = null
            }
        }
    }, [])
    useEffect(() => {
        if (mobileSettleDelayTimerRef.current != null) {
            clearTimeout(mobileSettleDelayTimerRef.current)
            mobileSettleDelayTimerRef.current = null
        }
    }, [streamUrl])
    useEffect(() => {
        if (typeof window === "undefined" || typeof document === "undefined") return
        if (pageLoadReadyRef.current) return
        let settleTimer: ReturnType<typeof setTimeout> | null = null
        const onLoad = () => {
            /* Short settle after `load` so post-load microtasks / analytics finish. */
            settleTimer = window.setTimeout(() => {
                pageLoadReadyRef.current = true
                tryReleaseDeferredAutoPlay()
            }, 300)
        }
        if (document.readyState === "complete") {
            onLoad()
        } else {
            window.addEventListener("load", onLoad, { once: true })
        }
        return () => {
            window.removeEventListener("load", onLoad)
            if (settleTimer != null) clearTimeout(settleTimer)
        }
    }, [tryReleaseDeferredAutoPlay])
    /** Returns `true` if autoplay-style `video.play()` is safe to call right now. */
    const canAutoPlayNow = useCallback((v: HTMLVideoElement | null): boolean => {
        if (!isMobileRef.current) return true
        if (shouldSkipMobileAutoplay()) return false
        if (!pageLoadReadyRef.current) return false
        if (canPlayThroughRef.current) return true
        const mutedPlayback =
            framerMutedRef.current ||
            storeRef.current.muted ||
            (useLoudAutoplayRef.current && loudPretendMutedRef.current) ||
            playbackMuteFallbackRef.current
        const minReady = mutedPlayback
            ? HTMLMediaElement.HAVE_FUTURE_DATA
            : HTMLMediaElement.HAVE_ENOUGH_DATA
        return Boolean(v && v.readyState >= minReady)
    }, [])

    /**
     * Session already has audio permission (`getAudioUnlocked`) but the `<video>` can still be
     * left muted (floor store vs element, kickPlayback reject, or browser quirks). Re-assert
     * `muted=false` for a few frames — one `play()` per frame at most, no store churn.
     */
    const audibleAssertRafRef = useRef(0)
    const cancelAudibleAssertLoop = () => {
        if (audibleAssertRafRef.current) {
            cancelAnimationFrame(audibleAssertRafRef.current)
            audibleAssertRafRef.current = 0
        }
    }
    const scheduleAudibleAssertUntilHeard = useCallback(() => {
        if (!getAudioUnlocked()) return
        if (framerMutedRef.current) return
        if (playOnHoverRef.current) return
        cancelAudibleAssertLoop()
        const maxFrames = 36
        let n = 0
        const step = () => {
            audibleAssertRafRef.current = 0
            if (++n > maxFrames) return
            const v = videoRef.current
            if (!v || !storeRef.current.play || v.paused) return
            const owner = getAudioFloorOwner()
            const my = normalizeStoreKey(storeId)
            if (owner != null && owner !== my) return
            if (storeRef.current.muted) return
            if (!v.muted) return
            v.muted = false
            v.volume = (storeRef.current.volume ?? 100) / 100
            v.playbackRate = 1
            void v.play().catch(() => {})
            audibleAssertRafRef.current = requestAnimationFrame(step)
        }
        audibleAssertRafRef.current = requestAnimationFrame(step)
    }, [storeId])

    useEffect(() => {
        return () => cancelAudibleAssertLoop()
    }, [])

    useEffect(() => {
        canPlayThroughRef.current = false
        deferredAutoPlayRef.current = false
        setPlaybackMuteFallback(false)
        cancelAudibleAssertLoop()
        heardPlayingOnceRef.current = false
    }, [streamUrl])

    const kickPlaybackRef = useRef<() => void>(() => {})
    const kickPlayback = useCallback(() => {
        const v = videoRef.current
        if (!v) return
        if (!storeRef.current.play) return
        if (playOnHoverRef.current) return
        if (!v.paused) return
        if (!canAutoPlayNow(v)) {
            deferredAutoPlayRef.current = true
            return
        }
        const videoMuted =
            framerMutedRef.current ||
            storeRef.current.muted ||
            (useLoudAutoplayRef.current && loudPretendMutedRef.current) ||
            playbackMuteFallbackRef.current
        v.playbackRate = 1
        if (videoMuted) {
            v.muted = true
        } else {
            v.muted = false
            v.volume = (storeRef.current.volume ?? 100) / 100
        }
        const attemptedUnmuted = !videoMuted
        void Promise.resolve(v.play())
            .then(() => {
                if (attemptedUnmuted) {
                    setAudioUnlocked(true)
                    setPlaybackMuteFallback(false)
                    playbackMuteFallbackRef.current = false
                }
                const el = videoRef.current
                if (el?.muted && getAudioUnlocked() && !framerMutedRef.current && !storeRef.current.muted) {
                    scheduleAudibleAssertUntilHeard()
                }
            })
            .catch(() => {
                if (!attemptedUnmuted) return
                if (getAudioUnlocked()) {
                    scheduleAudibleAssertUntilHeard()
                    window.setTimeout(() => {
                        const el = videoRef.current
                        if (!el?.muted) return
                        playbackMuteFallbackRef.current = true
                        setPlaybackMuteFallback(true)
                        loudPretendMutedRef.current = true
                        setLoudPretendMuted(true)
                        el.muted = true
                        el.playbackRate = 1
                        void el.play().catch(() => {})
                    }, 450)
                    return
                }
                playbackMuteFallbackRef.current = true
                setPlaybackMuteFallback(true)
                loudPretendMutedRef.current = true
                setLoudPretendMuted(true)
                v.muted = true
                v.playbackRate = 1
                void v.play().catch(() => {})
            })
    }, [canAutoPlayNow, scheduleAudibleAssertUntilHeard])
    kickPlaybackRef.current = kickPlayback

    /**
     * Bounded safety net: if `store.play` is true but the element is still paused with enough
     * data, retry `kickPlayback` a few times (covers OOV races, bfcache return, Safari quirks).
     */
    useEffect(() => {
        if (!shouldMountVideo || playOnHover) return
        const v = videoRef.current
        if (!v) return
        let attempts = 0
        const maxAttempts = 3
        const start = Date.now()
        const maxMs = 500
        const trySafetyKick = () => {
            if (Date.now() - start > maxMs) return
            if (attempts >= maxAttempts) return
            attempts += 1
            if (!storeRef.current.play || !v.paused) return
            if (v.readyState < 3 /* HAVE_FUTURE_DATA */) return
            if (!canAutoPlayNow(v)) return
            kickPlaybackRef.current()
        }
        const t0 = window.setTimeout(trySafetyKick, 0)
        const t250 = window.setTimeout(trySafetyKick, 250)
        const t500 = window.setTimeout(trySafetyKick, 500)
        const onCanPlay = () => trySafetyKick()
        v.addEventListener("canplay", onCanPlay)
        return () => {
            clearTimeout(t0)
            clearTimeout(t250)
            clearTimeout(t500)
            v.removeEventListener("canplay", onCanPlay)
        }
    }, [streamUrl, shouldMountVideo, playOnHover, canAutoPlayNow])

    /**
     * Loud autoplay + unmute: claim LIFO floor whenever this tile should be audible; release when not.
     * Always register an unmount cleanup — non-loud-autoplay players can still end up on the floor
     * stack (e.g. user unmutes via the volume slider) and must be removed when they disappear, or
     * they linger as phantom owners and prevent the previous claimant from getting the sound back.
     */
    useEffect(() => {
        if (!autoplay || muted || playOnHover || !shouldMountVideo) {
            releaseAudioFloor(storeId)
            return () => releaseAudioFloor(storeId)
        }
        claimAudioFloor(storeId)
        return () => releaseAudioFloor(storeId)
    }, [autoplay, muted, playOnHover, shouldMountVideo, storeId, streamUrl])

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
            visibilityOovPauseGraceUntilRef.current = Date.now() + 480
            const visibilityObs = new IntersectionObserver(
                ([entry]) => {
                    if (!entry) return
                    const visible =
                        entry.isIntersecting === true || (entry.intersectionRatio ?? 0) > 0
                    playerIntersectingRef.current = visible
                    if (visible) {
                        if (resumePlayAfterVisibleRef.current) {
                            resumePlayAfterVisibleRef.current = false
                            setStore({ play: true })
                            requestAnimationFrame(() => {
                                const v = videoRef.current
                                if (!v) return
                                if (!canAutoPlayNow(v)) {
                                    deferredAutoPlayRef.current = true
                                    return
                                }
                                v.playbackRate = 1
                                void v.play().catch(() => {})
                            })
                        } else if (
                            storeRef.current.play &&
                            autoplayRef.current &&
                            !playOnHoverRef.current &&
                            !framerMutedRef.current
                        ) {
                            /* Store says play (e.g. autoplay) but element can stay paused (policy / hand-off). */
                            requestAnimationFrame(() => {
                                const v = videoRef.current
                                if (!v?.paused) return
                                if (!canAutoPlayNow(v)) {
                                    deferredAutoPlayRef.current = true
                                    return
                                }
                                v.playbackRate = 1
                                void v.play().catch(() => {})
                            })
                        }
                    } else if (playRef.current) {
                        if (Date.now() < visibilityOovPauseGraceUntilRef.current) return
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
        streamUrl,
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
            /**
             * Audio already unlocked site-wide → start unmuted directly, no muted dance.
             * Browser autoplay policy allows this once there's been a prior user activation
             * on the document (which `audioUnlocked` captures and persists via sessionStorage).
             */
            setLoudPretendMuted(!getAudioUnlocked())
            /* Cover load + unmute + layout flicker so OOV must not clear `play`. */
            loudOovUnmuteGuardUntilRef.current = Date.now() + 45_000
        }
        prevLoudAutoplayKeyRef.current = loudAutoplayKey
    }, [loudAutoplayKey, useLoudAutoplay])

    /**
     * Install the site-wide gesture listener once; keep a reactive mirror of `audioUnlocked`
     * so `useLoudAutoplay` above flips to false the moment any player/page gesture unlocks
     * audio. Also fast-path collapse any in-progress muted dwell on the current player so
     * it goes unmuted immediately instead of waiting out the 220ms / 1500ms timer.
     */
    useEffect(() => {
        ensureAudioUnlockGestureListener()
        const unsub = subscribeAudioUnlocked((unlocked) => {
            setAudioUnlockedState(unlocked)
            if (!unlocked) return
            if (!loudPretendMutedRef.current && !playbackMuteFallbackRef.current) return
            if (loudUnmuteTimeoutRef.current) {
                clearTimeout(loudUnmuteTimeoutRef.current)
                loudUnmuteTimeoutRef.current = null
            }
            loudPretendMutedRef.current = false
            setLoudPretendMuted(false)
            playbackMuteFallbackRef.current = false
            setPlaybackMuteFallback(false)
            const v = videoRef.current
            if (v) {
                v.muted = false
                v.volume = (storeRef.current.volume ?? 100) / 100
                if (v.paused && storeRef.current.play) {
                    void v.play().catch(() => {
                        v.muted = true
                        void v.play().catch(() => {})
                    })
                }
            }
        })
        return unsub
    }, [])

    /**
     * Autoplay must drive `store.play`. Otherwise the play-sync effect calls `video.pause()` while
     * `autoPlay` is on — the native autoplay path loses to React and the video often never starts.
     * `playOnHover` uses pointer events instead, so we do not set play here.
     * When the video is lazy-gated, we set play once it actually mounts.
     */
    useLayoutEffect(() => {
        if (playOnHover || !autoplay || !shouldLoadVideo || !shouldMountVideo) return
        setStore({ play: true })
    }, [autoplay, playOnHover, shouldLoadVideo, shouldMountVideo, setStore, streamUrl, storeId])

    useEffect(() => {
        if (store.muted) {
            if (loudUnmuteTimeoutRef.current) {
                clearTimeout(loudUnmuteTimeoutRef.current)
                loudUnmuteTimeoutRef.current = null
            }
            /* Do not clear loud fake-mute when another player holds the audio floor (we are floor-muted). */
            const owner = getAudioFloorOwner()
            const my = normalizeStoreKey(storeId)
            if (owner != null && owner !== my) return
            setLoudPretendMuted(false)
        }
    }, [store.muted, storeId])

    useEffect(() => {
        const owner = getAudioFloorOwner()
        const my = normalizeStoreKey(storeId)
        if (owner !== null && owner !== my) return
        setStore({ muted })
    }, [muted, setStore, storeId])

    /**
     * When the floor empties, restore Framer mute. When we become owner, nudge playback back
     * on ONLY if the store still wants it (user pause sets `store.play = false`; respect that).
     */
    useEffect(() => {
        return subscribeAudioFloor((owner) => {
            const my = normalizeStoreKey(storeId)
            if (owner == null) {
                setStore({ muted: framerMutedRef.current })
                return
            }
            if (owner !== my) return
            if (!storeRef.current.play) return
            requestAnimationFrame(() => {
                const v = videoRef.current
                if (!v?.paused) return
                if (!canAutoPlayNow(v)) {
                    deferredAutoPlayRef.current = true
                    return
                }
                v.playbackRate = 1
                void v.play().catch(() => {})
            })
        })
    }, [storeId, setStore])

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

        const onSafariLoadedMetadata = () => {
            if (!mounted) return
            setStore({ ready: true, muted })
            setShowPoster(false)
            kickPlaybackRef.current()
        }
        const onSafariCanPlay = () => {
            kickPlaybackRef.current()
        }
        const onSafariError = () => {
            if (!mounted) return
            setVideoError(true)
            setStore({ error: "Video failed to load" })
        }

        const init = async () => {
            const Hls = await loadHlsJs()
            if (!mounted || !video) return

            if (Hls?.isSupported()) {
                /**
                 * Mobile tuning (matches YouTube/Vimeo defaults for small screens):
                 *  - start at the lowest rendition and let ABR promote when bandwidth allows,
                 *  - cap the rendition to the player size (never pick 1080p for a 360px tile),
                 *  - tighter buffer so we don't pre-load 60s of segments competing with decode,
                 *  - conservative initial bandwidth estimate so we don't over-pick on cold start.
                 * Without this, fresh (uncached) videos can pick a rendition the device can't
                 * decode smoothly, thrashing the main thread and freezing the UI.
                 */
                const onMobile =
                    isMobileRef.current ||
                    (typeof window !== "undefined" &&
                        window.matchMedia("(max-width: 809px)").matches)
                const hls = new Hls({
                    /* Preview iframe can block HLS’s worker → no decoder / no playback. */
                    enableWorker: RenderTarget.current() !== RenderTarget.preview,
                    lowLatencyMode: false,
                    ...(onMobile
                        ? {
                              startLevel: 0,
                              capLevelToPlayerSize: true,
                              maxBufferLength: 10,
                              maxMaxBufferLength: 20,
                              backBufferLength: 10,
                              abrEwmaDefaultEstimate: 500_000,
                          }
                        : {}),
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
                    /* Deterministic start after MSE attach — native `autoPlay` often misses the race. */
                    kickPlaybackRef.current()
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
                video.addEventListener("loadedmetadata", onSafariLoadedMetadata)
                video.addEventListener("canplay", onSafariCanPlay, { once: true })
                video.addEventListener("error", onSafariError)
            } else {
                setVideoError(true)
                setStore({ error: "HLS not supported" })
            }
        }

        init()
        return () => {
            mounted = false
            video.removeEventListener("loadedmetadata", onSafariLoadedMetadata)
            video.removeEventListener("canplay", onSafariCanPlay)
            video.removeEventListener("error", onSafariError)
            hlsRef.current?.destroy()
            hlsRef.current = null
            startTimeAppliedRef.current = false
        }
    }, [libraryId, videoId, streamUrl, muted, readyToLoad, showStaticFirstFrame, setStore])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        /* Prefer Framer `muted` prop — store can lag one tick behind on first paint; Safari then sees an unmuted play() attempt and blocks autoplay. */
        const videoMuted =
            muted ||
            store.muted ||
            (useLoudAutoplay && loudPretendMuted) ||
            playbackMuteFallback
        if (videoMuted) {
            video.muted = true
        } else {
            video.muted = false
            video.volume = store.volume / 100
        }

        if (store.play) {
            if (canAutoPlayNow(video)) {
                video.playbackRate = 1
                video.play().catch(() => {})
            } else {
                /* Mobile + thin buffer: wait for `canplaythrough` instead of frame-stuttering. */
                deferredAutoPlayRef.current = true
            }
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

        /* `store.fullscreenRequest` is no longer used — the toggle runs synchronously
         * inside the button's click handler via `registerFullscreenHandler` so iOS Safari
         * preserves the user-activation token (deferred React state loses it). */
    }, [
        store.play,
        store.muted,
        store.volume,
        store.seekTo,
        store.qualityToSet,
        store.ready,
        setStore,
        muted,
        useLoudAutoplay,
        loudPretendMuted,
        playbackMuteFallback,
    ])

    useEffect(() => {
        if (!useLoudAutoplay || !store.play || !loudPretendMuted) return
        /**
         * Mobile: do NOT hammer `play()` during muted loud-autoplay warmup. Every call queues
         * decoder work on iOS/Android's main thread; combined with native HLS segment decoding
         * during cold load, this is what produces the frame-by-frame jank. Mobile relies on
         * the deferred-autoplay gate + a single `play()` call once buffered.
         */
        if (isMobileRef.current) return
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
            if (!canAutoPlayNow(v)) {
                /* Mobile + thin buffer: stop hammering `play()` — it causes frame-by-frame stutter. */
                deferredAutoPlayRef.current = true
                return
            }
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

    const scheduleLoudAutoplayUnmute = useCallback(() => {
        if (!useLoudAutoplayRef.current || !loudPretendMutedRef.current) return
        if (loudUnmuteTimeoutRef.current != null) return
        loudUnmuteMobileRetryCountRef.current = 0
        /**
         * Mobile unmute strategy (industry standard for iOS/Android):
         *  - hold muted playback for ~1500ms after onVideoPlaying so the decoder is stable,
         *  - only flip `muted` when `readyState`/buffer are healthy; if not, retry soon
         *    instead of returning forever muted with an "unmuted" UI.
         *  - on failure, fall back to muted + gesture / audible-assert retry.
         */
        const onMobile = isMobileRef.current
        const initialDelay = onMobile ? MOBILE_LOUD_UNMUTE_DELAY_MS : LOUD_UNMUTE_DELAY_MS

        const tryFlip = () => {
            if (!loudPretendMutedRef.current) return
            const el = videoRef.current
            if (!el) {
                setLoudPretendMuted(false)
                return
            }
            if (onMobile) {
                const leadOk =
                    el.buffered.length === 0 ||
                    el.buffered.end(el.buffered.length - 1) - el.currentTime >= 3
                if (el.readyState < 4 /* HAVE_ENOUGH_DATA */ || el.paused || !leadOk) {
                    if (loudUnmuteMobileRetryCountRef.current++ >= 50) return
                    loudUnmuteTimeoutRef.current = window.setTimeout(() => {
                        loudUnmuteTimeoutRef.current = null
                        tryFlip()
                    }, 400)
                    return
                }
            }
            if (loudAutoplayBruteIntervalRef.current) {
                clearInterval(loudAutoplayBruteIntervalRef.current)
                loudAutoplayBruteIntervalRef.current = null
            }
            loudPretendMutedRef.current = false
            loudUnmuteSpuriousPauseGuardRef.current = true
            const vol = (storeRef.current.volume ?? 100) / 100
            claimAudioFloor(storeId)
            const playUnmutedDesktop = (media: HTMLVideoElement) => {
                media.muted = false
                media.volume = vol
                media.playbackRate = 1
                Promise.resolve(media.play())
                    .then(() => {
                        /* Unmuted play() resolved → browser accepted audio. Persist site-wide. */
                        setAudioUnlocked(true)
                    })
                    .catch(() => {
                        loudPretendMutedRef.current = true
                        setLoudPretendMuted(true)
                        media.muted = true
                        void media.play().catch(() => {})
                    })
            }
            const playUnmutedMobile = (media: HTMLVideoElement) => {
                media.muted = false
                media.volume = vol
                media.playbackRate = 1
                Promise.resolve(media.play())
                    .then(() => {
                        setAudioUnlocked(true)
                    })
                    .catch(() => {
                        loudPretendMutedRef.current = true
                        setLoudPretendMuted(true)
                        media.muted = true
                        void media.play().catch(() => {})
                        if (getAudioUnlocked()) scheduleAudibleAssertUntilHeard()
                    })
            }
            const playUnmuted = onMobile ? playUnmutedMobile : playUnmutedDesktop
            playUnmuted(el)
            if (!onMobile) {
                requestAnimationFrame(() => {
                    const v = videoRef.current
                    if (v) playUnmuted(v)
                })
            }
            setLoudPretendMuted(false)
            setPlaybackMuteFallback(false)
            setStore({ play: true })
            loudOovUnmuteGuardUntilRef.current = Date.now() + 12_000
            window.setTimeout(() => {
                loudUnmuteSpuriousPauseGuardRef.current = false
            }, 400)
        }

        loudUnmuteTimeoutRef.current = window.setTimeout(() => {
            loudUnmuteTimeoutRef.current = null
            tryFlip()
        }, initialDelay)
    }, [setStore, storeId, scheduleAudibleAssertUntilHeard])

    useEffect(() => {
        return () => {
            if (loudUnmuteTimeoutRef.current) {
                clearTimeout(loudUnmuteTimeoutRef.current)
                loudUnmuteTimeoutRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if ((!useLoudAutoplay && !playbackMuteFallback) || !shouldMountVideo) return
        const onUserActivation = () => {
            if (playOnHoverRef.current || !shouldMountVideoRef.current) return
            if (!useLoudAutoplayRef.current && !playbackMuteFallbackRef.current) return
            const v = videoRef.current
            const s = storeRef.current
            if (!v || !s.play) return
            /**
             * Global `pointerdown` gesture retry fires for EVERY player on EVERY click anywhere
             * on the page. If another player already owns the audio floor, a random click (e.g. on
             * a modal backdrop) must not let this player steal the floor back — respect the
             * z-index of whichever player the user explicitly interacted with. We only silently
             * resume paused playback (muted) so the element stays visually alive.
             */
            const owner = getAudioFloorOwner()
            const my = normalizeStoreKey(storeId)
            if (owner != null && owner !== my) {
                if (v.paused && canAutoPlayNow(v)) {
                    v.muted = true
                    v.playbackRate = 1
                    void v.play().catch(() => {})
                }
                return
            }
            if (loudUnmuteTimeoutRef.current) {
                clearTimeout(loudUnmuteTimeoutRef.current)
                loudUnmuteTimeoutRef.current = null
            }
            if (loudAutoplayBruteIntervalRef.current) {
                clearInterval(loudAutoplayBruteIntervalRef.current)
                loudAutoplayBruteIntervalRef.current = null
            }
            loudPretendMutedRef.current = false
            setLoudPretendMuted(false)
            playbackMuteFallbackRef.current = false
            setPlaybackMuteFallback(false)
            claimAudioFloor(storeId)
            v.muted = false
            v.volume = s.volume / 100
            v.playbackRate = 1
            Promise.resolve(v.play())
                .then(() => {
                    /* Gesture-driven unmuted play resolved → persist site-wide unlock. */
                    setAudioUnlocked(true)
                })
                .catch(() => {
                    /* Browser still refuses unmuted: revert to loud-muted retry so we try again next gesture. */
                    loudPretendMutedRef.current = true
                    setLoudPretendMuted(true)
                    playbackMuteFallbackRef.current = true
                    setPlaybackMuteFallback(true)
                    v.muted = true
                    void v.play().catch(() => {})
                })
        }
        return subscribeLoudAutoplayGestureRetry(onUserActivation)
    }, [useLoudAutoplay, playbackMuteFallback, shouldMountVideo, storeId])

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

    /**
     * Fullscreen state sync. Listens for both the standard `fullscreenchange` and the
     * WebKit-prefixed event used by older Safari and the mobile WebView. iOS Safari
     * (iPhone) does not fire `fullscreenchange` at all — instead the **video element**
     * fires `webkitbeginfullscreen` / `webkitendfullscreen`, so we listen on the video
     * too and treat those as authoritative for the icon swap.
     */
    useEffect(() => {
        type FullscreenDoc = Document & {
            webkitFullscreenElement?: Element | null
            webkitCurrentFullScreenElement?: Element | null
            mozFullScreenElement?: Element | null
            msFullscreenElement?: Element | null
        }
        const fsDoc = document as FullscreenDoc
        const isFullscreenActive = (): boolean => {
            const v = videoRef.current as (HTMLVideoElement & { webkitDisplayingFullscreen?: boolean }) | null
            if (v?.webkitDisplayingFullscreen) return true
            return Boolean(
                document.fullscreenElement ||
                    fsDoc.webkitFullscreenElement ||
                    fsDoc.webkitCurrentFullScreenElement ||
                    fsDoc.mozFullScreenElement ||
                    fsDoc.msFullscreenElement
            )
        }
        const onFullscreenChange = () => setStore({ fullscreen: isFullscreenActive() })
        document.addEventListener("fullscreenchange", onFullscreenChange)
        document.addEventListener("webkitfullscreenchange", onFullscreenChange)
        const v = videoRef.current
        v?.addEventListener("webkitbeginfullscreen", onFullscreenChange)
        v?.addEventListener("webkitendfullscreen", onFullscreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", onFullscreenChange)
            document.removeEventListener("webkitfullscreenchange", onFullscreenChange)
            v?.removeEventListener("webkitbeginfullscreen", onFullscreenChange)
            v?.removeEventListener("webkitendfullscreen", onFullscreenChange)
        }
    }, [setStore, shouldMountVideo])

    /**
     * Synchronous fullscreen toggle. The button calls this directly from its `onClick`
     * so the user-activation token is still alive when `requestFullscreen` runs —
     * required by iOS Safari and most mobile browsers. Falls back through the matrix:
     *   1. Standard `requestFullscreen` on the container (best UX: overlay controls visible).
     *   2. WebKit-prefixed `webkitRequestFullscreen` on the container (older WebKit / iPad).
     *   3. `video.webkitEnterFullscreen()` — the only path that works on iPhone Safari.
     */
    useEffect(() => {
        type FullscreenDoc = Document & {
            webkitFullscreenElement?: Element | null
            webkitCurrentFullScreenElement?: Element | null
            webkitExitFullscreen?: () => Promise<void> | void
            mozCancelFullScreen?: () => Promise<void> | void
            msExitFullscreen?: () => Promise<void> | void
        }
        type FullscreenEl = HTMLElement & {
            webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void> | void
            webkitRequestFullScreen?: () => void
            mozRequestFullScreen?: () => Promise<void> | void
            msRequestFullscreen?: () => Promise<void> | void
        }
        type FullscreenVideo = HTMLVideoElement & {
            webkitEnterFullscreen?: () => void
            webkitExitFullscreen?: () => void
            webkitDisplayingFullscreen?: boolean
        }

        const handler = () => {
            const fsDoc = document as FullscreenDoc
            const container = containerRef.current as FullscreenEl | null
            const video = videoRef.current as FullscreenVideo | null
            const inFullscreen =
                Boolean(
                    document.fullscreenElement ||
                        fsDoc.webkitFullscreenElement ||
                        fsDoc.webkitCurrentFullScreenElement
                ) || Boolean(video?.webkitDisplayingFullscreen)

            try {
                if (inFullscreen) {
                    if (document.exitFullscreen) {
                        void document.exitFullscreen().catch(() => {})
                    } else if (fsDoc.webkitExitFullscreen) {
                        fsDoc.webkitExitFullscreen()
                    } else if (fsDoc.mozCancelFullScreen) {
                        fsDoc.mozCancelFullScreen()
                    } else if (fsDoc.msExitFullscreen) {
                        fsDoc.msExitFullscreen()
                    } else if (video?.webkitExitFullscreen) {
                        video.webkitExitFullscreen()
                    }
                    return
                }

                if (container?.requestFullscreen) {
                    void container.requestFullscreen().catch(() => {
                        if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen()
                    })
                    return
                }
                if (container?.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen()
                    return
                }
                if (container?.webkitRequestFullScreen) {
                    container.webkitRequestFullScreen()
                    return
                }
                if (container?.mozRequestFullScreen) {
                    void container.mozRequestFullScreen()
                    return
                }
                if (container?.msRequestFullscreen) {
                    void container.msRequestFullscreen()
                    return
                }
                /* iPhone Safari — only path available; works only on a `<video>` element. */
                if (video?.webkitEnterFullscreen) {
                    /* iOS requires the video to be ready (have metadata) before entering. */
                    if (video.readyState < 1 /* HAVE_METADATA */) {
                        const onReady = () => {
                            video.removeEventListener("loadedmetadata", onReady)
                            try {
                                video.webkitEnterFullscreen?.()
                            } catch {
                                /* user gesture token is lost by now — best effort */
                            }
                        }
                        video.addEventListener("loadedmetadata", onReady, { once: true })
                        try {
                            video.load()
                        } catch {
                            /* ignore */
                        }
                    } else {
                        video.webkitEnterFullscreen()
                    }
                }
            } catch {
                /* swallow — caller can retry on next tap */
            }
        }
        return registerFullscreenHandler(storeId, handler)
    }, [storeId])

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

    const onPlay = useCallback(() => {
        setStore({ play: true })
        const s = storeRef.current
        const loudStillPretend = useLoudAutoplayRef.current && loudPretendMutedRef.current
        if (!s.muted && !loudStillPretend) {
            claimAudioFloor(storeId)
            /**
             * Audible playback actually started (not the muted warmup) → persist site-wide unlock.
             * Covers every path that lands in `onPlay`: autoplay-unmuted-direct, manual unmute
             * via controls, tap-to-play, visibility resume, etc.
             */
            const v = videoRef.current
            if (v && !v.muted) setAudioUnlocked(true)
        }
    }, [setStore, storeId])
    /** Fired when the browser thinks it can play through without rebuffering. Release any deferred autoplay. */
    const onVideoCanPlayThrough = useCallback(() => {
        canPlayThroughRef.current = true
        tryReleaseDeferredAutoPlay()
    }, [tryReleaseDeferredAutoPlay])
    /** Buffer under-ran mid-playback: re-gate autoplay on mobile until `canplaythrough` fires again. */
    const onVideoWaiting = useCallback(() => {
        if (!isMobileRef.current) return
        canPlayThroughRef.current = false
    }, [])
    const onVideoPlaying = useCallback(() => {
        heardPlayingOnceRef.current = true
        setStore({ play: true })
        scheduleLoudAutoplayUnmute()
        if (getAudioUnlocked() && !framerMutedRef.current) {
            scheduleAudibleAssertUntilHeard()
        }
    }, [setStore, scheduleLoudAutoplayUnmute, scheduleAudibleAssertUntilHeard])
    const onPause = useCallback(() => {
        if (programmaticPauseRef.current) return
        if (loudUnmuteSpuriousPauseGuardRef.current) {
            const v = videoRef.current
            if (v && !document.hidden && storeRef.current.play) {
                if (!canAutoPlayNow(v)) {
                    deferredAutoPlayRef.current = true
                } else {
                    v.playbackRate = 1
                    void v.play().catch(() => {})
                }
            }
            return
        }
        if (document.hidden) {
            setStore({ play: false })
            return
        }
        /**
         * Safari often emits `pause` during pipeline attach / track swap before the first
         * `playing` frame. For muted autoplay we previously fell through and cleared
         * `store.play`, which looked like “must tap / reload to start.” Mirror the loud-autoplay
         * resume path: retry `play()` instead of clearing intent until we've actually played once.
         */
        if (
            autoplay &&
            muted &&
            !playOnHover &&
            storeRef.current.play &&
            !heardPlayingOnceRef.current
        ) {
            const v = videoRef.current
            if (v?.paused) {
                if (!canAutoPlayNow(v)) {
                    deferredAutoPlayRef.current = true
                } else {
                    v.playbackRate = 1
                    void v.play().catch(() => {})
                }
            }
            return
        }
        /* Auto-resume loud-autoplay ONLY when the store still wants play (user pause clears it). */
        if (
            autoplay &&
            !muted &&
            !playOnHover &&
            !storeRef.current.fullscreen &&
            storeRef.current.play
        ) {
            const v = videoRef.current
            if (v?.paused) {
                if (!canAutoPlayNow(v)) {
                    deferredAutoPlayRef.current = true
                } else {
                    v.playbackRate = 1
                    void v.play().catch(() => {})
                }
            }
            return
        }
        setStore({ play: false })
    }, [setStore, autoplay, muted, playOnHover, canAutoPlayNow])
    const onEnded = useCallback(() => {
        setStore({ ended: true })
    }, [setStore])
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
     * Smooth progress UI: ~60fps store updates while playing on desktop.
     * Mobile uses 4Hz `setInterval` instead — running React state updates on every animation
     * frame can pile up and block the main thread when the device is already under decode
     * pressure (cold-load jank). The native `timeupdate` event also fires ~4Hz as a backstop.
     * When Play on Hover is on, skip this — carousels + many tickers would otherwise thrash React.
     */
    useEffect(() => {
        if (!shouldMountVideo || !store.play || playOnHover) return
        const tick = () => {
            const v = videoRef.current
            if (!v) return
            const dur = v.duration
            setStore({
                currentTime: v.currentTime,
                duration: Number.isFinite(dur) ? dur : 0,
            })
        }
        if (isMobileRef.current) {
            const id = window.setInterval(tick, 250)
            return () => clearInterval(id)
        }
        let rafId = 0
        const loop = () => {
            tick()
            rafId = requestAnimationFrame(loop)
        }
        rafId = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(rafId)
    }, [shouldMountVideo, store.play, playOnHover, setStore])
    const onProgress = useCallback(() => {
        const v = videoRef.current
        if (!v?.buffered?.length) return
        const buffered = v.buffered.end(v.buffered.length - 1)
        const duration = v.duration
        /**
         * Mobile autoplay fallback: some HLS streams never fire `canplaythrough`, so release the
         * deferred autoplay once we have ~8s of buffer lead ahead of `currentTime`, or the full
         * video fits in the buffer. 8s matches the "healthy start" threshold typical mobile
         * players use before beginning playback on a cold (uncached) load.
         */
        if (isMobileRef.current && !canPlayThroughRef.current && deferredAutoPlayRef.current) {
            const lead = buffered - v.currentTime
            const fullyBuffered =
                Number.isFinite(duration) && duration > 0 && buffered >= duration - 0.1
            if (lead >= 8 || fullyBuffered) {
                canPlayThroughRef.current = true
                tryReleaseDeferredAutoPlay()
            }
        }
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
            claimAudioFloor(storeId)
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
                        preload={isMobile || lazyLoad ? "metadata" : "auto"}
                        loop={loop}
                        muted={!!(muted || (useLoudAutoplay && loudPretendMuted) || playbackMuteFallback)}
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
                        onCanPlayThrough={onVideoCanPlayThrough}
                        onWaiting={onVideoWaiting}
                        onLoadedMetadata={() => {
                            setStore({ ready: true, muted })
                            setShowPoster(false)
                            kickPlaybackRef.current()
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
            "Pause when this player leaves the viewport and resume when it returns (if it was playing). Reduces load with many videos. For carousels with Autoplay + unmuted, turn Off so inactive slides stay playing (muted via Store ID / exclusive audio) and can regain sound when they return without a fresh tap.",
    },
    storeId: {
        type: ControlType.String,
        title: "Store ID",
        defaultValue: "default",
        description:
            "Same id on every control for this video. Duplicate slides may share one id; play state stays linked.\n\nUse a different Store ID per video on the same page: only the latest autoplay-unmuted player is audible; when it unmounts or mutes, sound returns to the previous one (audio floor stack).\n\nMade by [Stōkt](https://wearestokt.com/)",
    },
})
