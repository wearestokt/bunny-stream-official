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

const registry = new Map<string, StoreEntry>()

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
    const key = storeId || "default"
    if (!registry.has(key)) {
        registry.set(key, createStoreEntry())
    }
    return registry.get(key)!
}

export function useBunnyVideoStore(storeId: string = "default"): readonly [
    BunnyVideoStoreState,
    (partial: Partial<BunnyVideoStoreState>) => void,
] {
    const key = storeId || "default"
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
