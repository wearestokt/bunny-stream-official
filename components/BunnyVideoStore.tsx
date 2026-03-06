/**
 * Shared store for Bunny Stream video player state.
 * Copy this file to Framer and ensure BunnyVideoPlayer + control components use the same store.
 */

// @ts-expect-error - Framer CDN URL import
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"

const initialState = {
    play: false,
    muted: false,
    volume: 100,
    volumeBeforeMute: 100,
    controlsVisible: true,
    hoverOverControl: false,
    seekTo: null as number | null,
    currentTime: 0,
    duration: 0,
    ready: false,
    loadingPercent: 0,
    ended: false,
    seeked: false,
    error: null as string | null,
    quality: 0,
    qualities: [] as string[],
    qualityToSet: null as number | null,
    fullscreen: false,
    fullscreenRequest: false,
}

let hoverLeaveTimeout: ReturnType<typeof setTimeout> | null = null
export function reportControlHover(isHovering: boolean, setStore: (s: Record<string, unknown>) => void) {
    if (isHovering) {
        if (hoverLeaveTimeout) {
            clearTimeout(hoverLeaveTimeout)
            hoverLeaveTimeout = null
        }
        setStore({ hoverOverControl: true })
    } else {
        hoverLeaveTimeout = setTimeout(() => {
            hoverLeaveTimeout = null
            setStore({ hoverOverControl: false })
        }, 50)
    }
}

export const useBunnyVideoStore = createStore(initialState)
