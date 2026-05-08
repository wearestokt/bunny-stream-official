import * as React from "react"

import { cn } from "@/lib/utils"

import styles from "./Badge.module.css"

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "muted"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    tone?: BadgeTone
}

export function Badge({ className, tone = "neutral", ...rest }: BadgeProps) {
    return <span className={cn(styles.badge, styles[tone], className)} {...rest} />
}
