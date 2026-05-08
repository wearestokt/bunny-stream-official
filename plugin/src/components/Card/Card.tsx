import * as React from "react"

import { cn } from "@/lib/utils"

import styles from "./Card.module.css"

type CardElevation = "elevated" | "subtle"

export function Card({
    className,
    elevation = "elevated",
    children,
    ...rest
}: React.HTMLAttributes<HTMLDivElement> & { elevation?: CardElevation }) {
    return (
        <div
            className={cn(styles.card, elevation === "subtle" ? styles.subtle : styles.elevated, className)}
            {...rest}
        >
            {children}
        </div>
    )
}

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(styles.header, className)} {...rest} />
}

export function CardTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn(styles.title, className)} {...rest} />
}

export function CardBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(styles.body, className)} {...rest} />
}
