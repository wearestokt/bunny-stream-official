import * as React from "react"

import { HelpCircleIcon } from "@/icons"

import styles from "./PluginFooter.module.css"

export function PluginFooter({
    version,
    onOpenHelp,
}: {
    version: string
    onOpenHelp: () => void
}) {
    return (
        <footer className={styles.footer}>
            <button type="button" className={styles.helpButton} onClick={onOpenHelp}>
                <HelpCircleIcon />
                <span>Help & tutorial</span>
            </button>
            <span className={styles.version}>{version}</span>
        </footer>
    )
}

