import { addPropertyControls, ControlType } from "framer"
import { useCallback, useEffect, useRef, useState } from "react"
import { useBunnyVideoStore, reportControlHover } from "./BunnyVideoStore.tsx"

function parsePadding(value: string | undefined): { top: number; right: number; bottom: number; left: number } {
    if (!value || typeof value !== "string") return { top: 0, right: 0, bottom: 0, left: 0 }
    const parts = value.trim().split(/\s+/).map((p) => parseFloat(p) || 0)
    if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
    if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
    if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
    if (parts.length >= 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
    return { top: 0, right: 0, bottom: 0, left: 0 }
}

const DEFAULT_PROGRESS_GRADIENT =
    "linear-gradient(90deg,rgba(255, 255, 237, 1) 0%, rgba(230, 114, 32, 1) 60%, rgba(255, 64, 0, 1) 100%)"

type IconStyle = "default" | "outlined"
type SliderPosition = "left" | "right" | "top" | "bottom"

function renderSpeakerIcon(style: IconStyle, strokeWidth: number) {
    const sw = style === "outlined" ? strokeWidth : 2
    return (
        <>
            <polygon
                points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                fill="none"
                stroke="currentColor"
                strokeWidth={sw}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15.54 8.46a5 5 0 0 1 0 7.07"
                fill="none"
                stroke="currentColor"
                strokeWidth={sw}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M19.07 4.93a10 10 0 0 1 0 14.14"
                fill="none"
                stroke="currentColor"
                strokeWidth={sw}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </>
    )
}

function renderSpeakerOffIcon(style: IconStyle, strokeWidth: number) {
    const sw = style === "outlined" ? strokeWidth : 2
    return (
        <>
            <polygon
                points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                fill="none"
                stroke="currentColor"
                strokeWidth={sw}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
            <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </>
    )
}

/**
 * @framerDisableUnlink
 * @framerDisableEdit
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 40
 * @framerIntrinsicHeight 40
 */
export function BunnyVolumeSlider(props: {
    storeId?: string
    muteIconStyle?: IconStyle
    unmuteIconStyle?: IconStyle
    iconStrokeWidth?: number
    muteIcon?: string
    unmuteIcon?: string
    iconColor?: string
    iconSize?: number
    padding?: string
    volumeSlider?: boolean
    sliderPosition?: SliderPosition
    iconSliderMargin?: number
    mobileBreakpoint?: number
    min?: number
    max?: number
    sliderLength?: number
    sliderThickness?: number
    sliderColor?: string
    sliderRadius?: number
    progressFill?: "color" | "gradient"
    progressColor?: string
    progressGradient?: string
    thumbColor?: string
    thumbSize?: number
    thumbIcon?: string
    thumbShadow?: string
    style?: React.CSSProperties
}) {
    const {
        muteIconStyle = "default",
        unmuteIconStyle = "default",
        iconStrokeWidth = 2,
        muteIcon = "",
        unmuteIcon = "",
        iconColor = "#ffffff",
        iconSize = 24,
        padding = "0px",
        volumeSlider = true,
        sliderPosition = "right",
        iconSliderMargin = 8,
        mobileBreakpoint = 768,
        min = 0,
        max = 100,
        sliderLength = 80,
        sliderThickness = 6,
        sliderColor = "rgba(255,255,255,0.3)",
        sliderRadius: sliderRadiusProp,
        progressFill = "color",
        progressColor = "#fff",
        progressGradient = "",
        thumbColor = "#ffffff",
        thumbSize = 8,
        thumbIcon = "",
        thumbShadow = "0 0 0 2px rgba(0,0,0,0.2)",
    } = props

    const resolvedStrokeWidth = Math.max(0.5, Math.min(4, Number(iconStrokeWidth) || 2))
    const resolvedSliderRadius = sliderRadiusProp ?? sliderThickness / 2
    const resolvedThumbSize = Math.max(8, thumbSize)
    const containerHeight = Math.max(sliderThickness, resolvedThumbSize)
    const resolvedThumbShadow = thumbIcon ? "none" : thumbShadow

    const progressGradientRaw = typeof progressGradient === "string" ? progressGradient : ""
    const progressGradientTrimmed = progressGradientRaw.trim().replace(/;\s*$/, "")
    const useProgressGradient = progressFill === "gradient"
    const progressBg = useProgressGradient
        ? (progressGradientTrimmed || DEFAULT_PROGRESS_GRADIENT)
        : progressColor

    const isVertical = sliderPosition === "top" || sliderPosition === "bottom"
    const isBottom = sliderPosition === "bottom"
    const verticalGradient = isVertical && useProgressGradient
        ? progressBg.replace("90deg", "0deg")
        : progressBg

    const { style } = props
    const [store, setStore] = useBunnyVideoStore()
    const onControlHover = (isHovering: boolean) => reportControlHover(isHovering, setStore)
    const [isMobile, setIsMobile] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragPercent, setDragPercent] = useState<number | null>(null)
    const sliderRef = useRef<HTMLDivElement>(null)

    const volumePercent = ((store.volume - min) / (max - min)) * 100
    const displayPercent = isDragging && dragPercent != null ? dragPercent : volumePercent

    const sliderVisible = volumeSlider && (isMobile || isHovering || isDragging)
    const resolvedSliderLength = Math.max(40, Math.min(200, sliderLength ?? 80))
    const thumbHalf = resolvedThumbSize / 2
    const thumbRange = Math.max(0, resolvedSliderLength)
    const sliderContainerWidth = resolvedSliderLength + resolvedThumbSize
    const sliderContainerHeight = containerHeight + resolvedThumbSize
    const thumbLeftPx = thumbHalf + (displayPercent / 100) * thumbRange

    const showMuteIcon = store.volume <= 0

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`)
        const handler = () => setIsMobile(mq.matches)
        handler()
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [mobileBreakpoint])

    const getPercentFromPosition = useCallback(
        (clientX: number, clientY: number) => {
            const el = sliderRef.current
            if (!el) return volumePercent
            const rect = el.getBoundingClientRect()
            const range = Math.max(1, thumbRange)
            if (isVertical) {
                const y = isBottom
                    ? clientY - rect.top - thumbHalf
                    : rect.bottom - clientY - thumbHalf
                return Math.max(0, Math.min(100, (y / range) * 100))
            } else {
                const x = clientX - rect.left - thumbHalf
                return Math.max(0, Math.min(100, (x / range) * 100))
            }
        },
        [isVertical, isBottom, volumePercent, thumbHalf, thumbRange]
    )

    const setVolumeFromPercent = useCallback(
        (pct: number) => {
            const v = min + (pct / 100) * (max - min)
            const vol = Math.round(v)
            setStore({ volume: vol, muted: vol <= 0 })
        },
        [min, max, setStore]
    )

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault()
            if (!volumeSlider) return
            const pct = getPercentFromPosition(e.clientX, e.clientY)
            setIsDragging(true)
            setDragPercent(pct)
            setVolumeFromPercent(pct)
        },
        [volumeSlider, getPercentFromPosition, setVolumeFromPercent]
    )

    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            if (!isDragging || !volumeSlider) return
            const pct = getPercentFromPosition(e.clientX, e.clientY)
            setDragPercent(pct)
            setVolumeFromPercent(pct)
        },
        [isDragging, volumeSlider, getPercentFromPosition, setVolumeFromPercent]
    )

    const handlePointerUp = useCallback(() => {
        if (!isDragging) return
        setIsDragging(false)
        setDragPercent(null)
    }, [isDragging])

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

    const handleMuteClick = () => {
        if (store.volume <= 0) {
            const restore = Math.max(min, Math.min(max, store.volumeBeforeMute ?? min))
            setStore({ muted: false, volume: restore > 0 ? restore : Math.max(1, min) })
        } else {
            setStore({ muted: true, volume: 0, volumeBeforeMute: store.volume })
        }
    }

    const resolvedIconSize = Math.max(8, Math.min(64, iconSize ?? 24))
    const pad = parsePadding(padding)
    const resolvedPadding = padding ?? "0px"

    const iconStyle: React.CSSProperties = {
        width: resolvedIconSize,
        height: resolvedIconSize,
        objectFit: "contain",
    }

    const muteButton = (
        <button
            type="button"
            onClick={handleMuteClick}
            onMouseEnter={() => volumeSlider && !isMobile && setIsHovering(true)}
            style={{
                padding: resolvedPadding,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: iconColor,
                width: resolvedIconSize + pad.left + pad.right,
                height: resolvedIconSize + pad.top + pad.bottom,
                minWidth: 0,
                minHeight: 0,
                flexShrink: 0,
            }}
        >
            {showMuteIcon
                ? muteIcon
                    ? <img src={muteIcon} alt="" style={iconStyle} />
                    : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" preserveAspectRatio="xMidYMid meet" style={{ width: resolvedIconSize, height: resolvedIconSize, flexShrink: 0, color: iconColor }}>
                            {renderSpeakerOffIcon(muteIconStyle, resolvedStrokeWidth)}
                        </svg>
                    )
                : unmuteIcon
                    ? <img src={unmuteIcon} alt="" style={iconStyle} />
                    : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" preserveAspectRatio="xMidYMid meet" style={{ width: resolvedIconSize, height: resolvedIconSize, flexShrink: 0, color: iconColor }}>
                            {renderSpeakerIcon(unmuteIconStyle, resolvedStrokeWidth)}
                        </svg>
                    )
            }
        </button>
    )

    const sliderGap = Math.max(0, iconSliderMargin ?? 8)
    const sliderMargin = sliderVisible
        ? {
            left: { marginRight: sliderGap, marginLeft: thumbHalf },
            right: { marginLeft: sliderGap },
            top: { marginBottom: sliderGap, marginTop: thumbHalf },
            bottom: { marginTop: sliderGap, marginBottom: thumbHalf },
        }[sliderPosition]
        : {}

    const sliderPadding = sliderVisible
        ? (!isVertical && sliderPosition === "left"
            ? { paddingLeft: thumbHalf }
            : isVertical
                ? { paddingTop: thumbHalf }
                : {})
        : {}

    const volumeSliderElement = volumeSlider && (
        <div
            ref={sliderRef}
            onPointerDown={handlePointerDown}
            onMouseEnter={() => !isMobile && setIsHovering(true)}
            style={{
                position: "relative",
                width: isVertical ? sliderThickness + resolvedThumbSize : sliderContainerWidth,
                height: isVertical ? sliderContainerWidth : sliderContainerHeight,
                minWidth: 0,
                minHeight: 0,
                maxWidth: isVertical ? sliderThickness + resolvedThumbSize : (sliderVisible ? sliderContainerWidth : 0),
                maxHeight: isVertical ? (sliderVisible ? sliderContainerWidth : 0) : sliderContainerHeight,
                opacity: sliderVisible ? 1 : 0,
                cursor: sliderVisible ? "pointer" : "default",
                pointerEvents: sliderVisible ? "auto" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                touchAction: "none",
                userSelect: "none",
                flexShrink: 0,
                overflow: isVertical || sliderPosition === "left" ? "visible" : "hidden",
                transition: "opacity 0.2s ease, max-width 0.2s ease, max-height 0.2s ease, margin 0.2s ease",
                ...sliderMargin,
                ...sliderPadding,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    ...(isVertical
                        ? { left: thumbHalf, top: thumbHalf, bottom: thumbHalf, width: sliderThickness }
                        : { left: thumbHalf, right: thumbHalf, top: (sliderContainerHeight - sliderThickness) / 2, height: sliderThickness }),
                    background: sliderColor,
                    borderRadius: resolvedSliderRadius,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        ...(isVertical
                            ? isBottom
                                ? { left: 0, top: 0, width: "100%", height: `${displayPercent}%` }
                                : { left: 0, bottom: 0, width: "100%", height: `${displayPercent}%` }
                            : { left: 0, top: 0, width: `${displayPercent}%`, height: "100%" }),
                        ...(useProgressGradient ? { backgroundImage: verticalGradient } : { background: progressBg }),
                        borderRadius: resolvedSliderRadius,
                        transition: isDragging ? "none" : "all 0.1s",
                        pointerEvents: "none",
                    }}
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    ...(isVertical
                        ? isBottom
                            ? {
                                left: "50%",
                                top: thumbLeftPx,
                                transform: "translate(-50%, -50%)",
                            }
                            : {
                                left: "50%",
                                bottom: thumbLeftPx,
                                transform: "translate(-50%, 50%)",
                            }
                        : {
                            left: thumbLeftPx,
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                        }),
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
                    <img src={thumbIcon} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : null}
            </div>
        </div>
    )

    const layout = {
        left: { flexDirection: "row" as const, sliderFirst: true },
        right: { flexDirection: "row" as const, sliderFirst: false },
        top: { flexDirection: "column" as const, sliderFirst: true },
        bottom: { flexDirection: "column" as const, sliderFirst: false },
    }[sliderPosition]

    const buttonWidth = resolvedIconSize + pad.left + pad.right
    const buttonHeight = resolvedIconSize + pad.top + pad.bottom

    return (
        <div
            data-bunny-control
            onMouseEnter={() => {
                volumeSlider && !isMobile && setIsHovering(true)
                onControlHover(true)
            }}
            onMouseLeave={() => {
                !isMobile && !isDragging && setIsHovering(false)
                onControlHover(false)
            }}
            style={{
                display: "flex",
                flexDirection: layout.flexDirection,
                alignItems: "center",
                justifyContent: "flex-start",
                width: "fit-content",
                minWidth: buttonWidth,
                height: "fit-content",
                minHeight: buttonHeight,
                overflow: sliderPosition === "left" || isVertical ? "visible" : "hidden",
                opacity: store.controlsVisible ? 1 : 0,
                pointerEvents: store.controlsVisible ? "auto" : "none",
                transition: "opacity 0.3s ease",
                ...style,
            }}
        >
            {layout.sliderFirst ? (
                <>
                    {volumeSliderElement}
                    {muteButton}
                </>
            ) : (
                <>
                    {muteButton}
                    {volumeSliderElement}
                </>
            )}
        </div>
    )
}

BunnyVolumeSlider.defaultProps = { storeId: "default" }

addPropertyControls(BunnyVolumeSlider, {
    muteIconStyle: {
        type: ControlType.Enum,
        title: "Mute Icon",
        options: ["default", "outlined"],
        optionTitles: ["Default", "Outlined"],
        defaultValue: "default",
    },
    unmuteIconStyle: {
        type: ControlType.Enum,
        title: "Unmute Icon",
        options: ["default", "outlined"],
        optionTitles: ["Default", "Outlined"],
        defaultValue: "default",
    },
    iconStrokeWidth: {
        type: ControlType.Number,
        title: "Stroke Width",
        min: 0.5,
        max: 4,
        step: 0.25,
        unit: "px",
        defaultValue: 2,
        hidden: (props) => props.muteIconStyle !== "outlined" && props.unmuteIconStyle !== "outlined",
    },
    muteIcon: {
        type: ControlType.Image,
        title: "Mute Icon (custom)",
    },
    unmuteIcon: {
        type: ControlType.Image,
        title: "Unmute Icon (custom)",
    },
    iconColor: {
        type: ControlType.Color,
        title: "Icon Color",
        defaultValue: "#ffffff",
    },
    iconSize: {
        type: ControlType.Number,
        title: "Icon Size",
        min: 8,
        max: 64,
        step: 1,
        unit: "px",
        defaultValue: 24,
    },
    padding: {
        type: ControlType.Padding,
        title: "Padding",
        defaultValue: "0px",
    },
    volumeSlider: {
        type: ControlType.Boolean,
        title: "Volume Slider",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
    sliderPosition: {
        type: ControlType.Enum,
        title: "Slider Position",
        options: ["left", "right", "top", "bottom"],
        optionTitles: ["Left", "Right", "Top", "Bottom"],
        defaultValue: "right",
        hidden: (props) => !props.volumeSlider,
    },
    iconSliderMargin: {
        type: ControlType.Number,
        title: "Icon–Slider Margin",
        min: 0,
        max: 32,
        step: 1,
        unit: "px",
        defaultValue: 8,
        hidden: (props) => !props.volumeSlider,
        description: "Space between the volume icon and the slider.",
    },
    mobileBreakpoint: {
        type: ControlType.Number,
        title: "Mobile Breakpoint",
        min: 320,
        max: 1200,
        step: 1,
        unit: "px",
        defaultValue: 768,
        hidden: (props) => !props.volumeSlider,
    },
    min: {
        type: ControlType.Number,
        title: "Min",
        defaultValue: 0,
        hidden: (props) => !props.volumeSlider,
        description: "Volume minimum.",
    },
    max: {
        type: ControlType.Number,
        title: "Max",
        defaultValue: 100,
        hidden: (props) => !props.volumeSlider,
        description: "Volume maximum.",
    },
    sliderLength: {
        type: ControlType.Number,
        title: "Slider Length",
        min: 40,
        max: 200,
        step: 4,
        unit: "px",
        defaultValue: 80,
        hidden: (props) => !props.volumeSlider,
        description: "Length of the slider bar.",
    },
    sliderThickness: {
        type: ControlType.Number,
        title: "Slider Thickness",
        min: 2,
        max: 24,
        step: 1,
        unit: "px",
        defaultValue: 6,
        hidden: (props) => !props.volumeSlider,
    },
    sliderColor: {
        type: ControlType.Color,
        title: "Slider Color",
        defaultValue: "rgba(255,255,255,0.3)",
        hidden: (props) => !props.volumeSlider,
    },
    sliderRadius: {
        type: ControlType.Number,
        title: "Slider Radius",
        min: 0,
        max: 24,
        step: 1,
        unit: "px",
        hidden: (props) => !props.volumeSlider,
    },
    progressFill: {
        type: ControlType.Enum,
        title: "Progress Fill",
        options: ["color", "gradient"],
        optionTitles: ["Color", "Gradient"],
        defaultValue: "color",
        hidden: (props) => !props.volumeSlider,
    },
    progressColor: {
        type: ControlType.Color,
        title: "Progress Color",
        defaultValue: "#ffffff",
        hidden: (props) => !props.volumeSlider || props.progressFill === "gradient",
    },
    progressGradient: {
        type: ControlType.String,
        title: "Progress Gradient",
        placeholder: "linear-gradient(90deg, #fff 0%, #000 100%)",
        hidden: (props) => !props.volumeSlider || props.progressFill === "color",
    },
    thumbColor: {
        type: ControlType.Color,
        title: "Thumb Color",
        defaultValue: "#ffffff",
        hidden: (props) => !props.volumeSlider,
    },
    thumbSize: {
        type: ControlType.Number,
        title: "Thumb Size",
        min: 8,
        max: 40,
        step: 1,
        unit: "px",
        hidden: (props) => !props.volumeSlider,
    },
    thumbIcon: {
        type: ControlType.Image,
        title: "Thumb Icon",
        hidden: (props) => !props.volumeSlider,
    },
    thumbShadow: {
        type: ControlType.BoxShadow,
        title: "Thumb Shadow",
        defaultValue: "0 0 0 2px rgba(0,0,0,0.2)",
        hidden: (props) => !props.volumeSlider,
        description: "Made by [Stōkt](https://wearestokt.com/)",
    },
})
