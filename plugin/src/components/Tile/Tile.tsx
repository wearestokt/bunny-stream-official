import * as React from "react"

import { cn } from "@/lib/utils"

import styles from "./Tile.module.css"

export function TileGrid({ className, children }: { className?: string; children: React.ReactNode }) {
    return <div className={cn(styles.grid, className)}>{children}</div>
}

export function Tile({
    icon,
    iconAccent,
    title,
    subtitle,
    onClick,
    className,
    disabled,
}: {
    icon?: React.ReactNode
    iconAccent?: boolean
    title: string
    subtitle?: string
    onClick?: () => void
    className?: string
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(styles.tile, className)}
        >
            {icon ? (
                <span
                    className={cn(styles.icon, iconAccent ? styles.iconAccent : undefined)}
                    aria-hidden
                >
                    {icon}
                </span>
            ) : null}
            <div className={styles.text}>
                <span className={styles.title}>{title}</span>
                {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
            </div>
        </button>
    )
}
