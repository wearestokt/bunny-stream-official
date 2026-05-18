/**
 * Video UI state is keyed by `storeId` (module registry). Framer cannot nest
 * controls inside the player, so React context cannot connect siblings — use the
 * same Store ID string on BunnyVideoPlayer and every control for that video.
 * Duplicate CMS items may share one store id; controls and playback state stay in sync.
 */

import { useMemo, useSyncExternalStore, type MutableRefObject } from "react"

export type BunnyVideoStoreState = {
    play: boolean
    muted: boolean
    /** True after explicit user unmute (volume button/slider) so playback can override Framer `muted` prop lock. */
    userUnmuted: boolean
    volume: number
    volumeBeforeMute: number
    controlsVisible: boolean
    hoverOverControl: boolean
    seekTo: number | null
    currentTime: number
    duration: number
    ready: boolean
    loadingPercent: number
    ended: boolean
    seeked: boolean
    error: string | null
    quality: number
    qualities: string[]
    /** Heights for each `qualities` row (same order); used to map the Quality prop to an HLS level. */
    qualityHeights: number[]
    /** hls.js `hls.levels` index for each `qualities` row (same order). */
    qualityHlsLevelByIndex: number[]
    qualityToSet: number | null
    fullscreen: boolean
    fullscreenRequest: boolean
}

export function createInitialBunnyVideoState(): BunnyVideoStoreState {
    return {
        play: false,
        muted: false,
        userUnmuted: false,
        volume: 100,
        volumeBeforeMute: 100,
        controlsVisible: true,
        hoverOverControl: false,
        seekTo: null,
        currentTime: 0,
        duration: 0,
        ready: false,
        loadingPercent: 0,
        ended: false,
        seeked: false,
        error: null,
        quality: 0,
        qualities: [],
        qualityHeights: [],
        qualityHlsLevelByIndex: [],
        qualityToSet: null,
        fullscreen: false,
        fullscreenRequest: false,
    }
}

type StoreEntry = {
    subscribe: (onStoreChange: () => void) => () => void
    getSnapshot: () => BunnyVideoStoreState
    setStore: (partial: Partial<BunnyVideoStoreState>) => void
    hoverLeaveTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
}

const REGISTRY_GLOBAL_KEY = "__bunnyStreamVideoStoreRegistry__"

function getStoreRegistry(): Map<string, StoreEntry> {
    const g = globalThis as typeof globalThis & {
        [REGISTRY_GLOBAL_KEY]?: Map<string, StoreEntry>
    }
    if (!g[REGISTRY_GLOBAL_KEY]) {
        g[REGISTRY_GLOBAL_KEY] = new Map()
    }
    return g[REGISTRY_GLOBAL_KEY]
}

export function normalizeStoreKey(storeId: string): string {
    return (storeId || "default").trim() || "default"
}

/** LIFO stack of normalized storeIds; last entry is the sole audible owner. */
const audioFloor: string[] = []
const audioFloorSubs = new Set<(ownerKey: string | null) => void>()

/**
 * Site-wide "audio unlocked" flag. Once any user gesture on the site has produced
 * audible media playback (or the user manually unmuted), every subsequent video can
 * start unmuted without the muted→unmute dance.
 *
 * Persisted in sessionStorage so it survives hard navigations within the same tab
 * (matches YouTube/Vimeo behavior: you click a thumbnail anywhere on the site, and
 * the next page's video starts with sound). Scoped per-tab so a fresh tab still
 * respects the browser's first-load muted-autoplay policy.
 */
const AUDIO_UNLOCKED_STORAGE_KEY = "bunny:audio-unlocked"
let audioUnlocked = ((): boolean => {
    if (typeof window === "undefined") return false
    try {
        return window.sessionStorage?.getItem(AUDIO_UNLOCKED_STORAGE_KEY) === "1"
    } catch {
        return false
    }
})()
const audioUnlockedSubs = new Set<(unlocked: boolean) => void>()

export function getAudioUnlocked(): boolean {
    return audioUnlocked
}

export function setAudioUnlocked(value: boolean): void {
    if (audioUnlocked === value) return
    audioUnlocked = value
    if (typeof window !== "undefined") {
        try {
            if (value) window.sessionStorage?.setItem(AUDIO_UNLOCKED_STORAGE_KEY, "1")
            else window.sessionStorage?.removeItem(AUDIO_UNLOCKED_STORAGE_KEY)
        } catch {
            /* ignore storage failures (private mode / disabled) */
        }
    }
    for (const fn of audioUnlockedSubs) {
        try {
            fn(value)
        } catch {
            /* ignore */
        }
    }
}

export function subscribeAudioUnlocked(fn: (unlocked: boolean) => void): () => void {
    audioUnlockedSubs.add(fn)
    return () => {
        audioUnlockedSubs.delete(fn)
    }
}

/**
 * Site-wide gesture listener that promotes any user interaction into "audio unlocked".
 * Covers pointerdown (mouse/touch) and keydown. Installed lazily on first video mount,
 * kept for the lifetime of the tab — user activation in browsers is document-scoped and
 * irreversible for our purposes.
 */
let audioUnlockGestureAttached = false
function markAudioUnlockedFromGesture(): void {
    if (audioUnlocked) return
    setAudioUnlocked(true)
}
export function ensureAudioUnlockGestureListener(): void {
    if (audioUnlockGestureAttached) return
    if (typeof document === "undefined") return
    audioUnlockGestureAttached = true
    const opts = { capture: true, passive: true } as const
    document.addEventListener("pointerdown", markAudioUnlockedFromGesture, opts)
    document.addEventListener("keydown", markAudioUnlockedFromGesture, opts)
    document.addEventListener("touchstart", markAudioUnlockedFromGesture, opts)
}

export function getAudioFloorOwner(): string | null {
    if (audioFloor.length === 0) return null
    return audioFloor[audioFloor.length - 1] ?? null
}

function notifyAudioFloorSubs(): void {
    const owner = getAudioFloorOwner()
    for (const fn of audioFloorSubs) {
        try {
            fn(owner)
        } catch {
            /* ignore */
        }
    }
}

function applyAudioFloorToStores(): void {
    const owner = getAudioFloorOwner()
    if (owner == null) {
        notifyAudioFloorSubs()
        return
    }
    for (const [key, entry] of getStoreRegistry()) {
        const floorMuted = normalizeStoreKey(key) !== owner
        const snap = entry.getSnapshot()
        if (snap.muted !== floorMuted) {
            entry.setStore({ muted: floorMuted })
        }
    }
    notifyAudioFloorSubs()
}

/** Move this store to the top of the audio floor (sole audible). */
export function claimAudioFloor(storeId: string): void {
    const key = normalizeStoreKey(storeId)
    const i = audioFloor.indexOf(key)
    if (i >= 0) audioFloor.splice(i, 1)
    audioFloor.push(key)
    applyAudioFloorToStores()
}

/** Remove this store from the floor; previous claimant becomes owner if any remain. */
export function releaseAudioFloor(storeId: string): void {
    const key = normalizeStoreKey(storeId)
    const i = audioFloor.indexOf(key)
    if (i < 0) return
    audioFloor.splice(i, 1)
    applyAudioFloorToStores()
}

export function subscribeAudioFloor(fn: (ownerKey: string | null) => void): () => void {
    audioFloorSubs.add(fn)
    return () => {
        audioFloorSubs.delete(fn)
    }
}

function createStoreEntry(): StoreEntry {
    const listeners = new Set<() => void>()
    let state = createInitialBunnyVideoState()
    const hoverLeaveTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null> = {
        current: null,
    }
    const setStore = (partial: Partial<BunnyVideoStoreState>) => {
        state = { ...state, ...partial }
        listeners.forEach((l) => l())
    }
    const subscribe = (onStoreChange: () => void) => {
        listeners.add(onStoreChange)
        return () => listeners.delete(onStoreChange)
    }
    const getSnapshot = () => state
    return { subscribe, getSnapshot, setStore, hoverLeaveTimeoutRef }
}

function getOrCreateStoreEntry(storeId: string): StoreEntry {
    const key = normalizeStoreKey(storeId)
    const registry = getStoreRegistry()
    if (!registry.has(key)) {
        registry.set(key, createStoreEntry())
    }
    return registry.get(key)!
}

const loudAutoplayGestureRetryCallbacks = new Set<() => void>()
let loudAutoplayGestureDocAttached = false

function dispatchLoudAutoplayGestureRetry(): void {
    for (const fn of loudAutoplayGestureRetryCallbacks) {
        try {
            fn()
        } catch {
            /* ignore */
        }
    }
}

function ensureLoudAutoplayGestureDocListener(): void {
    if (loudAutoplayGestureDocAttached) return
    loudAutoplayGestureDocAttached = true
    document.addEventListener("pointerdown", dispatchLoudAutoplayGestureRetry, {
        capture: true,
        passive: true,
    })
}

/**
 * Per-storeId fullscreen handler registry. Mobile browsers — especially iOS Safari — only
 * honor fullscreen requests when `requestFullscreen()` is called **synchronously** inside
 * the user gesture (click/tap) handler. Routing the request through React state + useEffect
 * loses the user-activation token before the request is made, so the browser silently
 * rejects it. The button calls the registered handler directly in its onClick instead.
 */
type BunnyFullscreenHandler = () => void
const fullscreenHandlers = new Map<string, BunnyFullscreenHandler>()

export function registerFullscreenHandler(storeId: string, handler: BunnyFullscreenHandler): () => void {
    const key = normalizeStoreKey(storeId)
    fullscreenHandlers.set(key, handler)
    return () => {
        if (fullscreenHandlers.get(key) === handler) fullscreenHandlers.delete(key)
    }
}

export function requestBunnyFullscreenToggle(storeId: string): boolean {
    const key = normalizeStoreKey(storeId)
    const handler = fullscreenHandlers.get(key)
    if (!handler) return false
    handler()
    return true
}

/**
 * One document-level `pointerdown` (capture); every callback runs on each user activation.
 * Lets any loud-autoplay instance retry `play()` after the first gesture — `once: true` on `window.click`
 * only ever helped the first mounted player.
 */
export function subscribeLoudAutoplayGestureRetry(cb: () => void): () => void {
    ensureLoudAutoplayGestureDocListener()
    loudAutoplayGestureRetryCallbacks.add(cb)
    return () => {
        loudAutoplayGestureRetryCallbacks.delete(cb)
        if (loudAutoplayGestureRetryCallbacks.size === 0 && loudAutoplayGestureDocAttached) {
            document.removeEventListener("pointerdown", dispatchLoudAutoplayGestureRetry, true)
            loudAutoplayGestureDocAttached = false
        }
    }
}

export function useBunnyVideoStore(storeId: string = "default"): readonly [
    BunnyVideoStoreState,
    (partial: Partial<BunnyVideoStoreState>) => void,
] {
    const key = normalizeStoreKey(storeId)
    const entry = useMemo(() => getOrCreateStoreEntry(key), [key])
    const store = useSyncExternalStore(entry.subscribe, entry.getSnapshot, entry.getSnapshot)
    return [store, entry.setStore] as const
}

export function useBunnyVideoHoverRef(storeId: string = "default"): MutableRefObject<
    ReturnType<typeof setTimeout> | null
> {
    const key = storeId || "default"
    const entry = useMemo(() => getOrCreateStoreEntry(key), [key])
    return entry.hoverLeaveTimeoutRef
}

export function reportControlHover(
    isHovering: boolean,
    setStore: (s: Record<string, unknown>) => void,
    hoverLeaveTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
) {
    if (isHovering) {
        if (hoverLeaveTimeoutRef.current) {
            clearTimeout(hoverLeaveTimeoutRef.current)
            hoverLeaveTimeoutRef.current = null
        }
        setStore({ hoverOverControl: true })
    } else {
        hoverLeaveTimeoutRef.current = setTimeout(() => {
            hoverLeaveTimeoutRef.current = null
            setStore({ hoverOverControl: false })
        }, 50)
    }
}
