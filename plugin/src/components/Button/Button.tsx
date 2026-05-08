import * as React from "react"

import { cn } from "@/lib/utils"

import styles from "./Button.module.css"

type Variant = "primary" | "secondary" | "ghost"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    fullWidth?: boolean
    leadingIcon?: React.ComponentType<{ className?: string }>
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            fullWidth = false,
            type = "button",
            leadingIcon: LeadingIcon,
            children,
            ...rest
        },
        ref
    ) => (
        <button
            ref={ref}
            type={type}
            className={cn(styles.button, styles[variant], fullWidth && styles.fullWidth, className)}
            {...rest}
        >
            {LeadingIcon ? (
                <span className={styles.leadingIcon} aria-hidden>
                    <LeadingIcon />
                </span>
            ) : null}
            {children}
        </button>
    )
)
Button.displayName = "Button"
