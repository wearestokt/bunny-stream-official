import * as React from "react"

import { CheckIcon, XIcon, ZapIcon } from "@/icons"
import { cn } from "@/lib/utils"

import styles from "./InsertedToast.module.css"

type InsertedToastVariant = "success" | "limit"

export function InsertedToast({
    title,
    subtitle,
    onDismiss,
    variant = "success",
    ctaLabel,
    onCta,
}: {
    title?: string
    subtitle: string
    onDismiss: () => void
    variant?: InsertedToastVariant
    ctaLabel?: string
    onCta?: () => void
}) {
    if (variant === "limit") {
        return (
            <div role="status" className={cn(styles.toast, styles.toastLimit)}>
                <div className={styles.limitHeader}>
                    <span className={cn(styles.icon, styles.iconLimit)} aria-hidden>
                        <ZapIcon />
                    </span>
                    <div className={styles.limitText}>
                        {title ? <p className={styles.limitTitle}>{title}</p> : null}
                        <p className={styles.limitSub}>{subtitle}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onDismiss}
                        className={styles.dismiss}
                        aria-label="Dismiss notification"
                    >
                        <XIcon />
                    </button>
                </div>
                {onCta ? (
                    <button
                        type="button"
                        onClick={onCta}
                        className={styles.ctaButtonFull}
                    >
                        {ctaLabel ?? "Upgrade to Pro"}
                    </button>
                ) : null}
            </div>
        )
    }

    return (
        <div role="status" className={styles.toast}>
            <span className={styles.icon} aria-hidden>
                <CheckIcon />
            </span>
            <div className={styles.text}>
                {title ? <p className={styles.title}>{title}</p> : null}
                <p className={styles.sub}>{subtitle}</p>
            </div>
            <button
                type="button"
                onClick={onDismiss}
                className={styles.dismiss}
                aria-label="Dismiss notification"
            >
                <XIcon />
            </button>
        </div>
    )
}
