import * as React from "react"

import { cn } from "@/lib/utils"

import styles from "./SectionHeader.module.css"

export function SectionHeader({
    className,
    children,
    ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn(styles.label, className)} {...rest}>
            {children}
        </div>
    )
}
