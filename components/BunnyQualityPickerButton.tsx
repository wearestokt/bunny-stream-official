import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useBunnyVideoStore, reportControlHover, useBunnyVideoHoverRef } from "./BunnyVideoStore.tsx"

function parsePadding(value: string | undefined): { top: number; right: number; bottom: number; left: number } {
    if (!value || typeof value !== "string") return { top: 0, right: 0, bottom: 0, left: 0 }
    const parts = value.trim().split(/\s+/).map((p) => parseFloat(p) || 0)
    if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
    if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
    if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
    if (parts.length >= 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
    return { top: 0, right: 0, bottom: 0, left: 0 }
}

type IconStyle = "default" | "outlined"

function renderCogIcon(style: IconStyle, strokeWidth: number) {
    const pathD =
        "M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
    if (style === "default") {
        return <path d={pathD} fill="currentColor" />
    }
    return (
        <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    )
}

type PopupBorder = { width?: number; color?: string; opacity?: number } | undefined

type PopupPlacement = "up" | "down" | "left" | "right"

function getPopupFixedStyle(
    buttonRect: DOMRect,
    placement: PopupPlacement,
    gapPx: number
): React.CSSProperties {
    const g = Math.max(0, gapPx)
    const innerW = window.innerWidth
    const innerH = window.innerHeight
    const base: React.CSSProperties = { position: "fixed", zIndex: 1000 }

    switch (placement) {
        case "up":
            return {
                ...base,
                left: buttonRect.left + buttonRect.width / 2,
                bottom: innerH - buttonRect.top + g,
                transform: "translateX(-50%)",
            }
        case "down":
            return {
                ...base,
                left: buttonRect.left + buttonRect.width / 2,
                top: buttonRect.bottom + g,
                transform: "translateX(-50%)",
            }
        case "left":
            return {
                ...base,
                right: innerW - buttonRect.left + g,
                top: buttonRect.top + buttonRect.height / 2,
                transform: "translateY(-50%)",
            }
        case "right":
            return {
                ...base,
                left: buttonRect.right + g,
                top: buttonRect.top + buttonRect.height / 2,
                transform: "translateY(-50%)",
            }
        default:
            return {
                ...base,
                left: buttonRect.left + buttonRect.width / 2,
                top: buttonRect.bottom + g,
                transform: "translateX(-50%)",
            }
    }
}

function colorWithOpacity(c: string | undefined, o: number): string {
    if (!c) return "transparent"
    const rgbaMatch = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
    if (rgbaMatch) return `rgba(${rgbaMatch[1]},${rgbaMatch[2]},${rgbaMatch[3]},${o})`
    const hex = c.replace("#", "")
    if (hex.length >= 6) {
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)
        return `rgba(${r},${g},${b},${o})`
    }
    return c
}

/**
 * @framerDisableUnlink
 * @framerDisableEdit
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 24
 * @framerIntrinsicHeight 24
 */
export function BunnyQualityPickerButton(props: {
    storeId?: string
    iconButton?: {
        iconStyle?: IconStyle
        iconStrokeWidth?: number
        iconColor?: string
        iconSize?: number
        padding?: string
        icon?: string
    }
    popup?: {
        /** Where the menu opens relative to the button (fixed to viewport). */
        placement?: PopupPlacement
        /** Space between the button edge and the popup, in px. */
        gap?: number
        padding?: string
        backgroundColor?: string
        radius?: number
        border?: PopupBorder
    }
    items?: {
        font?: React.CSSProperties
        padding?: string
        radius?: number
        backgroundColor?: string
        hoverBackgroundColor?: string
        /** Default row text color (not hovered, not current quality). */
        defaultTextColor?: string
        /** Row text color while hovered. */
        hoverTextColor?: string
        /** Text color for the row that matches the current quality (store). */
        selectedTextColor?: string
        border?: PopupBorder
        checkIcon?: string
        /** Vertical space between quality rows, in px. */
        gap?: number
    }
    /**
     * Framer canvas only: when on, the quality menu stays open so you can style it in the property panel
     * (colors, padding, placement). No effect in in-app Preview or the published site.
     */
    previewPopupOnCanvas?: boolean
    style?: React.CSSProperties
}) {
    const iconBtn = props.iconButton ?? {}
    const {
        iconStyle = "default",
        iconStrokeWidth = 2,
        iconColor = "#ffffff",
        icon = "",
        iconSize = 24,
        padding = "0px",
    } = iconBtn

    const popupConfig = props.popup ?? {}
    const {
        placement: popupPlacement = "down",
        gap: popupGap = 8,
        padding: popupPadding = "8px 12px",
        backgroundColor: popupBackgroundColor = "rgba(28, 28, 28, 0.95)",
        radius: popupRadius = 8,
        border: popupBorder,
    } = popupConfig

    const itemsConfig = props.items ?? {}
    const {
        font: itemFont,
        padding: itemPadding,
        radius: itemRadius = 0,
        backgroundColor: itemBackgroundColor = "transparent",
        hoverBackgroundColor: itemHoverBackgroundColor = "rgba(255,255,255,0.1)",
        defaultTextColor = "#ffffff",
        hoverTextColor = "#ffffff",
        selectedTextColor = "#ffffff",
        border: itemBorder,
        checkIcon: popupCheckIcon,
        gap: itemGap = 0,
    } = itemsConfig

    const { style, storeId = "default", previewPopupOnCanvas = false } = props

    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const resolvedIconSize = Math.max(8, Math.min(64, Number(iconSize) || 24))
    const resolvedStrokeWidth = Math.max(0.5, Math.min(4, Number(iconStrokeWidth) || 2))
    const resolvedPopupRadius = (() => {
        const n = Number(popupRadius)
        return Number.isFinite(n) ? Math.max(0, n) : 8
    })()
    const resolvedItemRadius = (() => {
        const n = Number(itemRadius)
        return Number.isFinite(n) ? Math.max(0, n) : 0
    })()
    const pad = parsePadding(padding)
    const popupPad = parsePadding(popupPadding)
    const resolvedPadding = padding ?? "0px"
    const [store, setStore] = useBunnyVideoStore(storeId)
    const hoverLeaveTimeoutRef = useBunnyVideoHoverRef(storeId)
    const onControlHover = (isHovering: boolean) =>
        reportControlHover(isHovering, setStore, hoverLeaveTimeoutRef)
    const [popupOpen, setPopupOpen] = useState(false)
    const [popupFixedStyle, setPopupFixedStyle] = useState<React.CSSProperties | null>(null)
    const resolvedPopupGap = Math.max(0, Math.min(48, Number(popupGap) || 0))
    const resolvedItemGap = Math.max(0, Math.min(48, Number(itemGap) || 0))
    const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null)
    const buttonRef = useRef<HTMLDivElement>(null)
    const popupRef = useRef<HTMLDivElement>(null)

    const designShowPopup = isCanvas && previewPopupOnCanvas
    const showPopup = designShowPopup || popupOpen

    const options = ["Auto", ...store.qualities]

    useLayoutEffect(() => {
        if (!showPopup || !buttonRef.current) return
        const updatePosition = () => {
            if (buttonRef.current) {
                const r = buttonRef.current.getBoundingClientRect()
                setPopupFixedStyle(getPopupFixedStyle(r, popupPlacement, resolvedPopupGap))
            }
        }
        updatePosition()
        window.addEventListener("scroll", updatePosition, true)
        window.addEventListener("resize", updatePosition)
        return () => {
            window.removeEventListener("scroll", updatePosition, true)
            window.removeEventListener("resize", updatePosition)
        }
    }, [showPopup, popupPlacement, resolvedPopupGap])

    useEffect(() => {
        if (!showPopup) setHoveredItemIndex(null)
    }, [showPopup])

    useEffect(() => {
        if (designShowPopup) return
        if (!showPopup) return
        const handleDocClick = (e: MouseEvent) => {
            const target = e.target as Node
            if (
                popupRef.current &&
                !popupRef.current.contains(target) &&
                buttonRef.current &&
                !buttonRef.current.contains(target)
            ) {
                setPopupOpen(false)
            }
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPopupOpen(false)
        }
        document.addEventListener("mousedown", handleDocClick)
        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("mousedown", handleDocClick)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [showPopup, designShowPopup])

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setPopupOpen((prev) => !prev)
    }

    const handleOptionClick = (index: number) => {
        setStore({ qualityToSet: index })
        setPopupOpen(false)
    }

    const itemTextColor = (index: number) => {
        if (hoveredItemIndex === index) return hoverTextColor
        if (store.quality === index) return selectedTextColor
        return defaultTextColor
    }

    const iconStyleCss: React.CSSProperties = {
        width: resolvedIconSize,
        height: resolvedIconSize,
        objectFit: "contain",
    }

    const renderIcon = () => {
        if (icon) {
            return <img src={icon} alt="Quality settings" style={iconStyleCss} />
        }
        return (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                preserveAspectRatio="xMidYMid meet"
                style={{ width: resolvedIconSize, height: resolvedIconSize, flexShrink: 0, color: iconColor }}
            >
                {renderCogIcon(iconStyle, resolvedStrokeWidth)}
            </svg>
        )
    }

    return (
        <div
            ref={buttonRef}
            data-bunny-control
            style={{
                position: "relative",
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
            onClick={handleButtonClick}
            onMouseEnter={() => onControlHover(true)}
            onMouseLeave={() => onControlHover(false)}
        >
            {renderIcon()}
            {showPopup &&
                popupFixedStyle &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                    ref={popupRef}
                    data-bunny-control
                    style={{
                        ...popupFixedStyle,
                        background: popupBackgroundColor,
                        borderRadius: resolvedPopupRadius,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                        minWidth: 120,
                        overflow: "visible",
                        zIndex: 1000,
                        padding: `${popupPad.top}px ${popupPad.right}px ${popupPad.bottom}px ${popupPad.left}px`,
                        border:
                            Number(popupBorder?.width) > 0
                                ? `${Number(popupBorder.width)}px solid ${(() => {
                                      const c = popupBorder.color ?? "#ffffff"
                                      const o = popupBorder.opacity ?? 1
                                      const rgbaMatch = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
                                      if (rgbaMatch)
                                          return `rgba(${rgbaMatch[1]},${rgbaMatch[2]},${rgbaMatch[3]},${o})`
                                      const hex = c.replace("#", "")
                                      if (hex.length >= 6) {
                                          const r = parseInt(hex.slice(0, 2), 16)
                                          const g = parseInt(hex.slice(2, 4), 16)
                                          const b = parseInt(hex.slice(4, 6), 16)
                                          return `rgba(${r},${g},${b},${o})`
                                      }
                                      return c
                                  })()}`
                                : undefined,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: resolvedItemGap,
                        }}
                    >
                        {options.map((label, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleOptionClick(i)
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    padding: itemPadding ?? "10px 14px",
                                    border:
                                        Number(itemBorder?.width) > 0
                                            ? `${Number(itemBorder.width)}px solid ${colorWithOpacity(itemBorder.color ?? "#ffffff", itemBorder.opacity ?? 1)}`
                                            : "none",
                                    background:
                                        hoveredItemIndex === i ? itemHoverBackgroundColor : itemBackgroundColor,
                                    borderRadius: resolvedItemRadius,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    ...itemFont,
                                    color: itemTextColor(i),
                                }}
                                onMouseEnter={() => setHoveredItemIndex(i)}
                                onMouseLeave={() => setHoveredItemIndex(null)}
                            >
                                <span>{typeof label === "string" ? label : `Quality ${i}`}</span>
                                {store.quality === i &&
                                    (popupCheckIcon ? (
                                        <img
                                            src={popupCheckIcon}
                                            alt=""
                                            aria-hidden
                                            style={{ width: 16, height: 16, marginLeft: 8, flexShrink: 0 }}
                                        />
                                    ) : (
                                        <span style={{ marginLeft: 8, color: "inherit" }} aria-hidden>
                                            ✓
                                        </span>
                                    ))}
                            </button>
                        ))}
                    </div>
                </div>,
                    document.body
                )}
        </div>
    )
}

BunnyQualityPickerButton.defaultProps = {
    storeId: "default",
    previewPopupOnCanvas: false,
}

addPropertyControls(BunnyQualityPickerButton, {
    storeId: {
        type: ControlType.String,
        title: "Store ID",
        defaultValue: "default",
        description: "Must match BunnyVideoPlayer.",
    },
    previewPopupOnCanvas: {
        type: ControlType.Boolean,
        title: "Preview menu on canvas",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: false,
        description:
            "Framer canvas only: keeps the quality menu open so you can tune popup/row settings. In Preview and on the published site this does nothing. Turn off when finished editing.",
    },
    iconButton: {
        type: ControlType.Object,
        title: "Icon / Button",
        description: "Style, color, size, padding, and custom icon for the gear button.",
        controls: {
            iconStyle: {
                type: ControlType.Enum,
                title: "Icon Style",
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
                hidden: (props) => props.iconButton?.iconStyle !== "outlined",
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
            icon: {
                type: ControlType.Image,
                title: "Icon (custom)",
            },
        },
    },
    popup: {
        type: ControlType.Object,
        title: "Popup",
        description: "Placement, gap, background, padding, radius, and border for the quality menu.",
        controls: {
            placement: {
                type: ControlType.Enum,
                title: "Position",
                options: ["up", "down", "left", "right"],
                optionTitles: ["Up", "Down", "Left", "Right"],
                defaultValue: "down",
                description: "Where the menu opens relative to the button.",
            },
            gap: {
                type: ControlType.Number,
                title: "Gap",
                min: 0,
                max: 48,
                step: 1,
                unit: "px",
                defaultValue: 8,
                description: "Space between the button and the popup (like volume slider margin).",
            },
            padding: {
                type: ControlType.Padding,
                title: "Padding",
                defaultValue: "8px 12px",
            },
            backgroundColor: {
                type: ControlType.Color,
                title: "Background",
                defaultValue: "rgba(28, 28, 28, 0.95)",
            },
            radius: {
                type: ControlType.Number,
                title: "Radius",
                min: 0,
                max: 24,
                step: 1,
                unit: "px",
                defaultValue: 8,
            },
            border: {
                type: ControlType.Object,
                title: "Border",
                controls: {
                    width: {
                        type: ControlType.Number,
                        title: "Width",
                        min: 0,
                        max: 8,
                        step: 1,
                        unit: "px",
                    },
                    color: {
                        type: ControlType.Color,
                        title: "Color",
                    },
                    opacity: {
                        type: ControlType.Number,
                        title: "Opacity",
                        min: 0,
                        max: 1,
                        step: 0.1,
                    },
                },
            },
        },
    },
    items: {
        type: ControlType.Object,
        title: "Items",
        description:
            "Font, padding, gap between rows, radius, backgrounds, text colors (default / hover / selected), border, and check icon for each quality option.",
        controls: {
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
            },
            padding: {
                type: ControlType.Padding,
                title: "Padding",
                defaultValue: "10px 14px",
            },
            gap: {
                type: ControlType.Number,
                title: "Gap",
                min: 0,
                max: 48,
                step: 1,
                unit: "px",
                defaultValue: 0,
                description: "Space between each quality option row.",
            },
            radius: {
                type: ControlType.Number,
                title: "Radius",
                min: 0,
                max: 24,
                step: 1,
                unit: "px",
                defaultValue: 0,
            },
            backgroundColor: {
                type: ControlType.Color,
                title: "Background",
                defaultValue: "transparent",
            },
            hoverBackgroundColor: {
                type: ControlType.Color,
                title: "Hover Background",
                defaultValue: "rgba(255,255,255,0.1)",
            },
            defaultTextColor: {
                type: ControlType.Color,
                title: "Text — Default",
                defaultValue: "#ffffff",
            },
            hoverTextColor: {
                type: ControlType.Color,
                title: "Text — Hover",
                defaultValue: "#ffffff",
            },
            selectedTextColor: {
                type: ControlType.Color,
                title: "Text — Selected",
                defaultValue: "#ffffff",
            },
            checkIcon: {
                type: ControlType.Image,
                title: "Check Icon (custom)",
                description: "Custom icon for selected quality. Default: ✓",
            },
            border: {
                type: ControlType.Object,
                title: "Border",
                controls: {
                    width: {
                        type: ControlType.Number,
                        title: "Width",
                        min: 0,
                        max: 8,
                        step: 1,
                        unit: "px",
                    },
                    color: {
                        type: ControlType.Color,
                        title: "Color",
                    },
                    opacity: {
                        type: ControlType.Number,
                        title: "Opacity",
                        min: 0,
                        max: 1,
                        step: 0.1,
                    },
                },
            },
        },
    },
})
