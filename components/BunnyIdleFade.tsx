/**
 * Standalone Framer code override — fades the layer after pointer idle anywhere
 * on the page, shows again on cursor movement. Not tied to BunnyVideoPlayer.
 * Edit `IDLE_HIDE_DELAY_SEC` below, or duplicate this file to customize.
 *
 * Apply: Code Override → BunnyIdleFade → withBunnyIdleFade
 */

import {
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ComponentType,
    type CSSProperties,
} from "react"

/** Seconds of no pointer activity before the layer fades out (matches BunnyVideoPlayer `controlsHideDelay` default) */
export const IDLE_HIDE_DELAY_SEC = 3

const FADE_TRANSITION = "opacity 0.3s ease"
const DOC_LISTENER_OPTS = { capture: true, passive: true } as const

type LayerProps = {
    style?: CSSProperties
}

export function withBunnyIdleFade<P extends LayerProps>(
    Component: ComponentType<P>
): ComponentType<P> {
    return forwardRef<unknown, P>(function WithBunnyIdleFade(props, ref) {
        const [visible, setVisible] = useState(true)
        const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

        const scheduleHide = useCallback(() => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
            hideTimerRef.current = setTimeout(() => {
                hideTimerRef.current = null
                setVisible(false)
            }, Math.max(0.5, IDLE_HIDE_DELAY_SEC) * 1000)
        }, [])

        const wake = useCallback(() => {
            setVisible(true)
            scheduleHide()
        }, [scheduleHide])

        useEffect(() => {
            if (typeof document === "undefined") return

            const onPointerActivity = () => wake()

            document.addEventListener("mousemove", onPointerActivity, DOC_LISTENER_OPTS)
            document.addEventListener("pointermove", onPointerActivity, DOC_LISTENER_OPTS)
            scheduleHide()

            return () => {
                document.removeEventListener("mousemove", onPointerActivity, DOC_LISTENER_OPTS)
                document.removeEventListener("pointermove", onPointerActivity, DOC_LISTENER_OPTS)
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
            }
        }, [wake, scheduleHide])

        return (
            <Component
                ref={ref}
                {...props}
                style={{
                    ...props.style,
                    opacity: visible ? 1 : 0,
                    transition: FADE_TRANSITION,
                    pointerEvents: visible ? "auto" : "none",
                }}
            />
        )
    }) as ComponentType<P>
}
