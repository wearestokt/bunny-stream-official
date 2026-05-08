import * as React from "react"
import { framer } from "framer-plugin"

import { ChevronLeftIcon, XIcon } from "@/icons"
import { cn } from "@/lib/utils"

import styles from "./ScreenHeader.module.css"

export function ScreenHeader({
    title,
    subtitle,
    onBack,
    showClose = true,
    rightLabel,
    className,
    compact = false,
}: {
    title: string
    subtitle?: string
    onBack?: () => void
    showClose?: boolean
    rightLabel?: React.ReactNode
    className?: string
    compact?: boolean
}) {
    const close = React.useCallback(() => {
        try {
            ;(framer as { closePlugin?: () => void }).closePlugin?.()
        } catch {
            /* noop */
        }
    }, [])

    if (compact) {
        return (
            <header className={cn(styles.header, styles.compactHeader, className)}>
                <div className={styles.compactRow}>
                    {onBack ? (
                        <button
                            type="button"
                            onClick={onBack}
                            className={styles.backIcon}
                            aria-label="Back"
                        >
                            <ChevronLeftIcon />
                        </button>
                    ) : null}
                    <h1 className={styles.compactTitle}>{title}</h1>
                    <span aria-hidden className={styles.compactSpacer} />
                    {rightLabel ? (
                        <span className={styles.rightLabel}>{rightLabel}</span>
                    ) : null}
                </div>
            </header>
        )
    }

    return (
        <header className={cn(styles.header, className)}>
            <div className={styles.row}>
                {onBack ? (
                    <button type="button" onClick={onBack} className={styles.backButton}>
                        <ChevronLeftIcon />
                        Back
                    </button>
                ) : (
                    <span aria-hidden className={styles.spacer} />
                )}
                <div className={styles.right}>
                    {rightLabel ? <span className={styles.rightLabel}>{rightLabel}</span> : null}
                    {showClose ? (
                        <button
                            type="button"
                            onClick={close}
                            className={styles.iconButton}
                            aria-label="Close plugin"
                        >
                            <XIcon />
                        </button>
                    ) : null}
                </div>
            </div>
            <div className={styles.titles}>
                <h1 className={styles.title}>{title}</h1>
                {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            </div>
        </header>
    )
}
