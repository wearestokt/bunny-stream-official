import * as React from "react"

import { Button } from "@/components/Button/Button"
import { DialogActions, DialogClose, DialogPopup } from "@/components/Dialog/Dialog"
import { TUTORIAL_DIALOG_EMPTY, TUTORIAL_DIALOG_TITLE } from "@/copy"

import styles from "./TutorialDialog.module.css"

export function TutorialDialog({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const url = import.meta.env.VITE_TUTORIAL_VIDEO_URL as string | undefined
    const hasVideo = typeof url === "string" && url.trim().length > 0

    return (
        <DialogPopup open={open} onOpenChange={onOpenChange} title={TUTORIAL_DIALOG_TITLE}>
            {hasVideo ? (
                <video
                    key={url}
                    className={styles.video}
                    controls
                    playsInline
                    src={url.trim()}
                />
            ) : (
                <p className={styles.empty}>{TUTORIAL_DIALOG_EMPTY}</p>
            )}
            <DialogActions>
                <DialogClose render={<Button variant="secondary" fullWidth />}>Close</DialogClose>
            </DialogActions>
        </DialogPopup>
    )
}
