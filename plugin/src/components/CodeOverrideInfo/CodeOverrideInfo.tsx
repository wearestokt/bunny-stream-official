import * as React from "react"
import { createPortal } from "react-dom"

import { HelpCircleIcon } from "@/icons"

import styles from "./CodeOverrideInfo.module.css"

const TOOLTIP_MAX_WIDTH = 220
const VIEWPORT_MARGIN = 8

function clampTooltipLeft(anchorCenterX: number): number {
    const half = TOOLTIP_MAX_WIDTH / 2
    const min = VIEWPORT_MARGIN + half
    const max = window.innerWidth - VIEWPORT_MARGIN - half
    return Math.max(min, Math.min(anchorCenterX, max))
}

export function CodeOverrideInfo({ subtitle }: { subtitle: string }) {
    const anchorRef = React.useRef<HTMLSpanElement>(null)
    const [open, setOpen] = React.useState(false)
    const [position, setPosition] = React.useState({ top: 0, left: 0 })

    const updatePosition = React.useCallback(() => {
        const el = anchorRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        setPosition({
            top: rect.top - 6,
            left: clampTooltipLeft(rect.left + rect.width / 2),
        })
    }, [])

    const show = React.useCallback(() => {
        updatePosition()
        setOpen(true)
    }, [updatePosition])

    const hide = React.useCallback(() => {
        setOpen(false)
    }, [])

    React.useEffect(() => {
        if (!open) return
        const onScrollOrResize = () => updatePosition()
        window.addEventListener("scroll", onScrollOrResize, true)
        window.addEventListener("resize", onScrollOrResize)
        return () => {
            window.removeEventListener("scroll", onScrollOrResize, true)
            window.removeEventListener("resize", onScrollOrResize)
        }
    }, [open, updatePosition])

    return (
        <>
            <span
                ref={anchorRef}
                className={styles.info}
                tabIndex={0}
                aria-label="About Idle Fade"
                aria-describedby={open ? "code-override-idle-fade-tooltip" : undefined}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
            >
                <HelpCircleIcon />
            </span>
            {open
                ? createPortal(
                      <span
                          id="code-override-idle-fade-tooltip"
                          role="tooltip"
                          className={styles.tooltip}
                          style={{
                              position: "fixed",
                              top: position.top,
                              left: position.left,
                              transform: "translate(-50%, -100%)",
                          }}
                      >
                          {subtitle}
                      </span>,
                      document.body
                  )
                : null}
        </>
    )
}
