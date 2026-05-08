import * as React from "react"

import { cn } from "@/lib/utils"

import styles from "./LabelRow.module.css"

export function LabelRow({
    label,
    description,
    htmlFor,
    children,
    className,
}: {
    label: React.ReactNode
    description?: React.ReactNode
    htmlFor?: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn(styles.row, className)}>
            <div className={styles.labelGroup}>
                <label htmlFor={htmlFor} className={styles.label}>
                    {label}
                </label>
                {description ? <p className={styles.description}>{description}</p> : null}
            </div>
            <div className={styles.control}>{children}</div>
        </div>
    )
}
