import { addPropertyControls, ControlType } from "framer"
import { useBunnyVideoStore, reportControlHover, useBunnyVideoHoverRef } from "./BunnyVideoStore.tsx"

type FormatType =
    | "currentSlashDuration"
    | "currentDashDuration"
    | "currentOnly"
    | "durationOnly"
    | "remaining"

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const pad = (n: number) => n.toString().padStart(2, "0")
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
    return `${m}:${pad(s)}`
}

/**
 * @framerDisableUnlink
 * @framerDisableEdit
 * @framerIntrinsicWidth 80
 * @framerIntrinsicHeight 24
 */
export function BunnyTimeDisplay(props: {
    storeId?: string
    format?: FormatType
    font?: React.CSSProperties
    color?: string
    style?: React.CSSProperties
}) {
    const {
        storeId = "default",
        format = "currentSlashDuration",
        font = {},
        color = "#ffffff",
        style,
    } = props
    const [store, setStore] = useBunnyVideoStore(storeId)
    const hoverLeaveTimeoutRef = useBunnyVideoHoverRef(storeId)
    const onControlHover = (isHovering: boolean) =>
        reportControlHover(isHovering, setStore, hoverLeaveTimeoutRef)

    const current = formatTime(store.currentTime)
    const duration = formatTime(store.duration)
    const remaining = store.duration > 0 ? store.duration - store.currentTime : 0

    let text: string
    switch (format) {
        case "currentSlashDuration":
            text = `${current} / ${duration}`
            break
        case "currentDashDuration":
            text = `${current} - ${duration}`
            break
        case "currentOnly":
            text = current
            break
        case "durationOnly":
            text = duration
            break
        case "remaining":
            text = `-${formatTime(remaining)}`
            break
        default:
            text = `${current} / ${duration}`
    }

    return (
        <div
            data-bunny-control
            onMouseEnter={() => onControlHover(true)}
            onMouseLeave={() => onControlHover(false)}
            style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "100%",
                minWidth: 40,
                minHeight: 16,
                opacity: store.controlsVisible ? 1 : 0,
                pointerEvents: store.controlsVisible ? "auto" : "none",
                transition: "opacity 0.3s ease",
                ...font,
                color,
                ...style,
            }}
        >
            {text}
        </div>
    )
}

BunnyTimeDisplay.defaultProps = {
    storeId: "default",
    format: "currentSlashDuration" as const,
    font: {},
    color: "#ffffff",
}

addPropertyControls(BunnyTimeDisplay, {
    storeId: {
        type: ControlType.String,
        title: "Store ID",
        defaultValue: "default",
        description: "Must match BunnyVideoPlayer.",
    },
    format: {
        type: ControlType.Enum,
        title: "Format",
        defaultValue: "currentSlashDuration",
        options: [
            "currentSlashDuration",
            "currentDashDuration",
            "currentOnly",
            "durationOnly",
            "remaining",
        ],
        optionTitles: [
            "Current / Duration",
            "Current - Duration",
            "Current only",
            "Duration only",
            "Remaining",
        ],
    },
    font: {
        type: ControlType.Font,
        title: "Font",
        defaultValue: {
            textAlign: "left",
            fontSize: 14,
            letterSpacing: 0,
            lineHeight: 1.2,
        },
        defaultFontType: "sans-serif",
        displayTextAlignment: true,
        displayFontSize: true,
        controls: "extended",
    },
    color: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "#ffffff",
        description: "Made by [Stōkt](https://wearestokt.com/)",
    },
})
