import { addPropertyControls, ControlType } from "framer"
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

type IconStyle = "default" | "outlined" | "circleOutlined" | "circleFilled"

function renderPlayIcon(style: IconStyle, strokeWidth: number) {
    switch (style) {
        case "default":
            return <path d="M8 5v14l11-7z" fill="currentColor" />
        case "outlined":
            return (
                <path
                    d="M8 5v14l11-7z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                />
            )
        case "circleOutlined":
            return (
                <>
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M10 8v8l6-4z" fill="currentColor" />
                </>
            )
        case "circleFilled":
            return (
                <>
                    <defs>
                        <mask id="playMask">
                            <circle cx="12" cy="12" r="10" fill="white" />
                            <path d="M10 8v8l6-4z" fill="black" />
                        </mask>
                    </defs>
                    <circle cx="12" cy="12" r="10" fill="currentColor" mask="url(#playMask)" />
                </>
            )
    }
}

function renderPauseIcon(style: IconStyle, strokeWidth: number) {
    switch (style) {
        case "default":
            return <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor" />
        case "outlined":
            return (
                <path
                    d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                />
            )
        case "circleOutlined":
            return (
                <>
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 8h2v8H9V8zm4 0h2v8h-2V8z" fill="currentColor" />
                </>
            )
        case "circleFilled":
            return (
                <>
                    <defs>
                        <mask id="pauseMask">
                            <circle cx="12" cy="12" r="10" fill="white" />
                            <path d="M9 8h2v8H9V8zm4 0h2v8h-2V8z" fill="black" />
                        </mask>
                    </defs>
                    <circle cx="12" cy="12" r="10" fill="currentColor" mask="url(#pauseMask)" />
                </>
            )
    }
}

/**
 * @framerDisableUnlink
 * @framerDisableEdit
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 38
 * @framerIntrinsicHeight 38
 */
export function BunnyPlayPauseButton(props: {
    storeId?: string
    playIconStyle?: IconStyle
    pauseIconStyle?: IconStyle
    iconStrokeWidth?: number
    playIconColor?: string
    pauseIconColor?: string
    playIcon?: string
    pauseIcon?: string
    iconSize?: number
    padding?: string
    style?: React.CSSProperties
}) {
    const {
        playIconStyle = "default",
        pauseIconStyle = "default",
        iconStrokeWidth = 2,
        playIconColor = "#ffffff",
        pauseIconColor = "#ffffff",
        playIcon = "",
        pauseIcon = "",
        iconSize = 24,
        padding = "0px",
        style,
    } = props

    const resolvedIconSize = Math.max(8, Math.min(64, iconSize ?? 24))
    const pad = parsePadding(padding)
    const resolvedPadding = padding ?? "0px"
    const [store, setStore] = useBunnyVideoStore()
    const onControlHover = (isHovering: boolean) => reportControlHover(isHovering, setStore)

    const isPlaying = store.play

    const handleClick = () => {
        setStore({ play: !store.play })
    }

    const iconStyle: React.CSSProperties = {
        width: resolvedIconSize,
        height: resolvedIconSize,
        objectFit: "contain",
    }

    const renderIcon = () => {
        if (isPlaying) {
            if (pauseIcon) {
                return <img src={pauseIcon} alt="Pause" style={iconStyle} />
            }
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ width: resolvedIconSize, height: resolvedIconSize, flexShrink: 0, color: pauseIconColor }}
                >
                    {renderPauseIcon(pauseIconStyle, iconStrokeWidth)}
                </svg>
            )
        }
        if (playIcon) {
            return <img src={playIcon} alt="Play" style={iconStyle} />
        }
        return (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                preserveAspectRatio="xMidYMid meet"
                style={{ width: resolvedIconSize, height: resolvedIconSize, flexShrink: 0, color: playIconColor }}
            >
                {renderPlayIcon(playIconStyle, iconStrokeWidth)}
            </svg>
        )
    }

    return (
        <div
            data-bunny-control
            onClick={handleClick}
            onMouseEnter={() => onControlHover(true)}
            onMouseLeave={() => onControlHover(false)}
            style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: resolvedPadding,
                width: resolvedIconSize + pad.left + pad.right,
                height: resolvedIconSize + pad.top + pad.bottom,
                minWidth: 0,
                minHeight: 0,
                opacity: store.controlsVisible ? 1 : 0,
                pointerEvents: store.controlsVisible ? "auto" : "none",
                transition: "opacity 0.3s ease",
                ...style,
            }}
        >
            {renderIcon()}
        </div>
    )
}

BunnyPlayPauseButton.defaultProps = {
    storeId: "default",
    playIconStyle: "default" as const,
    pauseIconStyle: "default" as const,
    iconStrokeWidth: 2,
    playIconColor: "#ffffff",
    pauseIconColor: "#ffffff",
    playIcon: "",
    pauseIcon: "",
    iconSize: 24,
    padding: "0px",
}

addPropertyControls(BunnyPlayPauseButton, {
    playIconStyle: {
        type: ControlType.Enum,
        title: "Play Icon",
        options: ["default", "outlined", "circleOutlined", "circleFilled"],
        optionTitles: ["Default", "Outlined", "Circle outline", "Circle filled"],
    },
    pauseIconStyle: {
        type: ControlType.Enum,
        title: "Pause Icon",
        options: ["default", "outlined", "circleOutlined", "circleFilled"],
        optionTitles: ["Default", "Outlined", "Circle outline", "Circle filled"],
    },
    iconStrokeWidth: {
        type: ControlType.Number,
        title: "Stroke Width",
        min: 0.5,
        max: 4,
        step: 0.25,
        unit: "px",
        hidden: (props) => props.playIconStyle !== "outlined" && props.pauseIconStyle !== "outlined",
    },
    playIconColor: { type: ControlType.Color, title: "Play Icon Color" },
    pauseIconColor: { type: ControlType.Color, title: "Pause Icon Color" },
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
    playIcon: { type: ControlType.Image, title: "Play Icon (custom)" },
    pauseIcon: {
        type: ControlType.Image,
        title: "Pause Icon (custom)",
        description: "Made by [Stōkt](https://wearestokt.com/)",
    },
})
