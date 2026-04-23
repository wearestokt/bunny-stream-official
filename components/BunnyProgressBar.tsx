import { addPropertyControls, ControlType } from "framer"
import { useCallback, useEffect, useRef, useState } from "react"
import { useBunnyVideoStore, reportControlHover, useBunnyVideoHoverRef } from "./BunnyVideoStore.tsx"

const DEFAULT_PROGRESS_GRADIENT =
    "linear-gradient(90deg,rgba(255, 255, 237, 1) 0%, rgba(230, 114, 32, 1) 60%, rgba(255, 64, 0, 1) 100%)"

function toTrackColor(color: string, alpha: number): string {
    if (color.includes("gradient")) return color
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
    if (rgbMatch) {
        const [, r, g, b] = rgbMatch
        return `rgba(${r},${g},${b},${alpha})`
    }
    let h = color.replace("#", "")
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    if (h.length !== 6) return `rgba(255,255,255,${alpha})`
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
}

/**
 * @framerDisableUnlink
 * @framerDisableEdit
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 200
 * @framerIntrinsicHeight 16
 */
export function BunnyProgressBar(props: {
    storeId?: string
    track?: {
        trackHeight?: number
        trackColor?: string
        trackRadius?: number
    }
    buffer?: {
        showBuffer?: boolean
        bufferColor?: string
    }
    progress?: {
        progressFill?: "color" | "gradient"
        progressColor?: string
        progressGradient?: string
    }
    playhead?: {
        thumbColor?: string
        thumbSize?: number
        thumbIcon?: string
        thumbShadow?: string
    }
    style?: React.CSSProperties
}) {
    const trackConfig = props.track ?? {}
    const {
        trackHeight = 6,
        trackColor = "rgba(255,255,255,0.3)",
        trackRadius: trackRadiusProp,
    } = trackConfig
    const progressConfig = props.progress ?? {}
    const {
        progressFill = "color",
        progressColor = "#fff",
        progressGradient = "",
    } = progressConfig
    const bufferConfig = props.buffer ?? {}
    const { showBuffer = true, bufferColor = "#ffffff" } = bufferConfig
    const playheadConfig = props.playhead ?? {}
    const {
        thumbColor = "#ffffff",
        thumbSize = 8,
        thumbIcon = "",
        thumbShadow = "0 0 0 2px rgba(0,0,0,0.2)",
    } = playheadConfig
    const { style, storeId = "default" } = props
    const [store, setStore] = useBunnyVideoStore(storeId)
    const hoverLeaveTimeoutRef = useBunnyVideoHoverRef(storeId)
    const onControlHover = (isHovering: boolean) =>
        reportControlHover(isHovering, setStore, hoverLeaveTimeoutRef)
    const [isDragging, setIsDragging] = useState(false)
    const [dragPercent, setDragPercent] = useState<number | null>(null)
    const wasPlayingRef = useRef(false)
    const barRef = useRef<HTMLDivElement>(null)

    const percent = store.duration > 0 ? (store.currentTime / store.duration) * 100 : 0
    const displayPercent = isDragging && dragPercent != null ? dragPercent : percent
    const bufferPercent = store.loadingPercent ?? 0

    const getPercentFromClientX = useCallback((clientX: number) => {
        const bar = barRef.current
        if (!bar) return 0
        const rect = bar.getBoundingClientRect()
        const x = clientX - rect.left
        return Math.max(0, Math.min(100, (x / rect.width) * 100))
    }, [])

    const seekToPercent = useCallback(
        (pct: number) => {
            const time = (pct / 100) * store.duration
            setStore({ seekTo: time })
        },
        [store.duration, setStore]
    )

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault()
            if (store.duration <= 0) return
            const pct = getPercentFromClientX(e.clientX)
            wasPlayingRef.current = store.play
            setStore({ play: false })
            setIsDragging(true)
            setDragPercent(pct)
            seekToPercent(pct)
        },
        [store.duration, store.play, getPercentFromClientX, setStore, seekToPercent]
    )

    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            if (!isDragging || store.duration <= 0) return
            const pct = getPercentFromClientX(e.clientX)
            setDragPercent(pct)
            seekToPercent(pct)
        },
        [isDragging, store.duration, getPercentFromClientX, seekToPercent]
    )

    const handlePointerUp = useCallback(() => {
        if (!isDragging) return
        setIsDragging(false)
        setDragPercent(null)
        setStore({ play: wasPlayingRef.current })
    }, [isDragging, setStore])

    useEffect(() => {
        if (!isDragging) return
        window.addEventListener("pointermove", handlePointerMove)
        window.addEventListener("pointerup", handlePointerUp)
        window.addEventListener("pointercancel", handlePointerUp)
        return () => {
            window.removeEventListener("pointermove", handlePointerMove)
            window.removeEventListener("pointerup", handlePointerUp)
            window.removeEventListener("pointercancel", handlePointerUp)
        }
    }, [isDragging, handlePointerMove, handlePointerUp])

    const trackBg = trackColor
    const progressGradientRaw =
        typeof progressGradient === "string" ? progressGradient : ""
    const progressGradientTrimmed = progressGradientRaw
        .trim()
        .replace(/;\s*$/, "")
    const useProgressGradient = progressFill === "gradient"
    const progressBg = useProgressGradient
        ? (progressGradientTrimmed || DEFAULT_PROGRESS_GRADIENT)
        : progressColor
    const bufferBg = toTrackColor(bufferColor, 0.5)
    // Framer Number controls may pass strings; React only adds "px" for numeric style values.
    const resolvedTrackHeight = Math.max(2, Math.min(24, Number(trackHeight) || 6))
    const resolvedThumbSize = Math.max(8, Math.min(40, Number(thumbSize) || 8))
    const resolvedTrackRadius =
        trackRadiusProp == null || trackRadiusProp === ""
            ? resolvedTrackHeight / 2
            : Math.max(0, Number(trackRadiusProp) || 0)
    const containerHeight = Math.max(resolvedTrackHeight, resolvedThumbSize)

    const resolvedThumbShadow = thumbIcon ? "none" : thumbShadow

    return (
        <div
            data-bunny-control
            ref={barRef}
            onPointerDown={handlePointerDown}
            onMouseEnter={() => onControlHover(true)}
            onMouseLeave={() => onControlHover(false)}
            style={{
                width: "100%",
                height: containerHeight,
                minHeight: containerHeight,
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                overflow: "visible",
                touchAction: "none",
                userSelect: "none",
                opacity: store.controlsVisible ? 1 : 0,
                pointerEvents: store.controlsVisible ? "auto" : "none",
                transition: "opacity 0.3s ease",
                ...style,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: (containerHeight - resolvedTrackHeight) / 2,
                    height: resolvedTrackHeight,
                    background: trackBg,
                    borderRadius: resolvedTrackRadius,
                    overflow: "hidden",
                }}
            >
                {showBuffer && bufferPercent > 0 && (
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: `${bufferPercent}%`,
                            height: "100%",
                            background: bufferBg,
                            borderRadius: resolvedTrackRadius,
                            pointerEvents: "none",
                        }}
                    />
                )}
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: `${displayPercent}%`,
                        height: "100%",
                        ...(useProgressGradient
                            ? { backgroundImage: progressBg }
                            : { background: progressBg }),
                        borderRadius: resolvedTrackRadius,
                        /* No width transition: progress is driven at rAF while playing; easing looked laggy. */
                        pointerEvents: "none",
                    }}
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: `${displayPercent}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: resolvedThumbSize,
                    height: resolvedThumbSize,
                    borderRadius: thumbIcon ? 0 : "50%",
                    background: thumbIcon ? "transparent" : thumbColor,
                    boxShadow: resolvedThumbShadow,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                {thumbIcon ? (
                    <img
                        src={thumbIcon}
                        alt=""
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}
                    />
                ) : null}
            </div>
        </div>
    )
}

BunnyProgressBar.defaultProps = {
    storeId: "default",
}

addPropertyControls(BunnyProgressBar, {
    storeId: {
        type: ControlType.String,
        title: "Store ID",
        defaultValue: "default",
        description: "Must match BunnyVideoPlayer.",
    },
    track: {
        type: ControlType.Object,
        title: "Track Settings",
        controls: {
            trackHeight: {
                type: ControlType.Number,
                title: "Height",
                min: 2,
                max: 24,
                step: 1,
                unit: "px",
            },
            trackColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "rgba(255,255,255,0.3)",
            },
            trackRadius: {
                type: ControlType.Number,
                title: "Radius",
                min: 0,
                max: 24,
                step: 1,
                unit: "px",
                defaultValue: 3,
            },
        },
    },
    buffer: {
        type: ControlType.Object,
        title: "Buffer",
        controls: {
            showBuffer: {
                type: ControlType.Boolean,
                title: "Show",
                enabledTitle: "On",
                disabledTitle: "Off",
            },
            bufferColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#ffffff",
                hidden: (props) => !(props.buffer?.showBuffer ?? true),
            },
        },
    },
    progress: {
        type: ControlType.Object,
        title: "Progress Bar",
        controls: {
            progressFill: {
                type: ControlType.Enum,
                title: "Fill",
                options: ["color", "gradient"],
                optionTitles: ["Color", "Gradient"],
                defaultValue: "color",
            },
            progressColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#ffffff",
                hidden: (props) => props.progress?.progressFill === "gradient",
            },
            progressGradient: {
                type: ControlType.String,
                title: "Gradient",
                placeholder: "linear-gradient(90deg, #fff 0%, #000 100%)",
                hidden: (props) => props.progress?.progressFill === "color",
                description:
                    "Custom CSS gradient. [Create one visually](https://cssgradient.io/) and paste the value here.",
            },
        },
    },
    playhead: {
        type: ControlType.Object,
        title: "Playhead",
        controls: {
            thumbColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#ffffff",
            },
            thumbSize: {
                type: ControlType.Number,
                title: "Size",
                min: 8,
                max: 40,
                step: 1,
                unit: "px",
            },
            thumbIcon: {
                type: ControlType.Image,
                title: "Icon",
                description: "Custom image for the playhead.",
            },
            thumbShadow: {
                type: ControlType.BoxShadow,
                title: "Shadows",
                defaultValue: "0 0 0 2px rgba(0,0,0,0.2)",
                description: "Made by [Stōkt](https://wearestokt.com/)",
            },
        },
    },
})
