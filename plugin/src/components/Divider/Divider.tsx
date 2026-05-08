import * as React from "react"

import { cn } from "@/lib/utils"

import styles from "./Divider.module.css"

export function Divider({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
    return <div role="separator" className={cn(styles.divider, className)} {...rest} />
}
