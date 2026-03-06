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

function renderExpandIcon() {
    const pathD = "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
    return <path d={pathD} fill="currentColor" />
}

function renderExitIcon() {
    const pathD = "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
    return <path d={pathD} fill="currentColor" />
}

/**
 * @framerDisableUnlink
 * @framerDisableEdit
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 38
 * @framerIntrinsicHeight 38
 */
export function BunnyFullscreenButton(props: {
    storeId?: string
    iconColor?: string
    expandIcon?: string
    exitIcon?: string
    iconSize?: number
    padding?: string
    style?: React.CSSProperties
}) {
    const {
        iconColor = "#ffffff",
        expandIcon = "",
        exitIcon = "",
        iconSize = 24,
        padding = "0px",
        style,
    } = props

    const resolvedIconSize = Math.max(8, Math.min(64, iconSize ?? 24))
    const pad = parsePadding(padding)
    const resolvedPadding = padding ?? "0px"
    const [store, setStore] = useBunnyVideoStore()
    const onControlHover = (isHovering: boolean) => reportControlHover(isHovering, setStore)

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setStore({ fullscreenRequest: true })
    }

    const iconStyleCss: React.CSSProperties = {
        width: resolvedIconSize,
        height: resolvedIconSize,
        objectFit: "contain",
    }

    const renderIcon = () => {
        if (store.fullscreen) {
            if (exitIcon) {
                return <img src={exitIcon} alt="Exit fullscreen" style={iconStyleCss} />
            }
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ width: resolvedIconSize, height: resolvedIconSize, flexShrink: 0, color: iconColor }}
                >
                    {renderExitIcon()}
                </svg>
            )
        }
        if (expandIcon) {
            return <img src={expandIcon} alt="Expand fullscreen" style={iconStyleCss} />
        }
        return (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                preserveAspectRatio="xMidYMid meet"
                style={{ width: resolvedIconSize, height: resolvedIconSize, flexShrink: 0, color: iconColor }}
            >
                {renderExpandIcon()}
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
                pointerEvents: store.controlsVisible ? "auto" : "none",
                opacity: store.controlsVisible ? 1 : 0,
                transition: "opacity 0.3s ease",
                ...style,
            }}
        >
            {renderIcon()}
        </div>
    )
}

BunnyFullscreenButton.defaultProps = {
    storeId: "default",
    iconColor: "#ffffff",
    expandIcon: "",
    exitIcon: "",
    iconSize: 24,
    padding: "0px",
}

addPropertyControls(BunnyFullscreenButton, {
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
    expandIcon: {
        type: ControlType.Image,
        title: "Expand Icon (custom)",
    },
    exitIcon: {
        type: ControlType.Image,
        title: "Exit Icon (custom)",
        description: "Made by [Stōkt](https://wearestokt.com/)",
    },
})
