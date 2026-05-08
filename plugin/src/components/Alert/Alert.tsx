import * as React from "react"

import { cn } from "@/lib/utils"

import styles from "./Alert.module.css"

type AlertTone = "info" | "warning" | "danger" | "success"

export function Alert({
    className,
    tone = "info",
    title,
    children,
    ...rest
}: React.HTMLAttributes<HTMLDivElement> & { tone?: AlertTone; title?: React.ReactNode }) {
    return (
        <div role="alert" className={cn(styles.alert, styles[tone], className)} {...rest}>
            {title ? <div className={styles.title}>{title}</div> : null}
            {children ? <div className={styles.body}>{children}</div> : null}
        </div>
    )
}
