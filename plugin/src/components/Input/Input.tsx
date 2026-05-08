import * as React from "react"

import { cn } from "@/lib/utils"

import styles from "./Input.module.css"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, invalid, ...rest }, ref) => (
        <input
            ref={ref}
            data-invalid={invalid ? "" : undefined}
            className={cn(styles.input, className)}
            {...rest}
        />
    )
)
Input.displayName = "Input"

/** Input wrapped with a leading icon slot — used for the search field. */
export function InputWithIcon({
    icon,
    trailing,
    className,
    inputClassName,
    ...rest
}: InputProps & {
    icon: React.ReactNode
    trailing?: React.ReactNode
    inputClassName?: string
}) {
    return (
        <label className={cn(styles.wrapper, className)}>
            <span className={styles.icon} aria-hidden>
                {icon}
            </span>
            <input className={cn(styles.bareInput, inputClassName)} {...rest} />
            {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
        </label>
    )
}
