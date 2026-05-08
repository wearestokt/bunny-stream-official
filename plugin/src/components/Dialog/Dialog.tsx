import * as React from "react"
import { Dialog as BaseDialog } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { XIcon } from "@/icons"

import styles from "./Dialog.module.css"

export const DialogRoot = BaseDialog.Root

export function DialogPopup({
    open,
    onOpenChange,
    title,
    description,
    children,
    closeLabel = "Close",
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: React.ReactNode
    description?: React.ReactNode
    children: React.ReactNode
    closeLabel?: string
}) {
    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <BaseDialog.Portal>
                <BaseDialog.Backdrop className={styles.backdrop} />
                <BaseDialog.Popup className={styles.popup}>
                    <header className={styles.header}>
                        <BaseDialog.Title className={styles.title}>{title}</BaseDialog.Title>
                        <BaseDialog.Close className={styles.closeButton} aria-label={closeLabel}>
                            <XIcon />
                        </BaseDialog.Close>
                    </header>
                    {description ? (
                        <BaseDialog.Description className={styles.description}>
                            {description}
                        </BaseDialog.Description>
                    ) : null}
                    <div className={styles.body}>{children}</div>
                </BaseDialog.Popup>
            </BaseDialog.Portal>
        </DialogRoot>
    )
}

export function DialogActions({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return <div className={cn(styles.actions, className)}>{children}</div>
}

export const DialogClose = BaseDialog.Close
