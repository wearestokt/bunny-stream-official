import * as React from "react"

import { cn } from "@/lib/utils"

import styles from "./Skeleton.module.css"

export function Skeleton({
    className,
    ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(styles.skeleton, className)} {...rest} />
}
