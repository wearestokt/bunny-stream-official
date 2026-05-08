import * as React from "react"

import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader"
import { ArrowUpRightIcon, FileTextIcon, MonitorPlayIcon } from "@/icons"
import {
    PLUGIN_VERSION,
    URL_CHANGELOG,
    URL_FEATURE_REQUEST,
    URL_README,
    URL_REPO,
    URL_SUPPORT_EMAIL,
} from "@/copy"

import styles from "./HelpScreen.module.css"

type Resource = {
    label: string
    href: string
}

const RESOURCES: Resource[] = [
    { label: "Documentation", href: URL_README },
    { label: "Changelog", href: URL_CHANGELOG },
    { label: "Request a feature", href: URL_FEATURE_REQUEST },
    { label: "Open source on GitHub", href: URL_REPO },
    { label: "Email support", href: URL_SUPPORT_EMAIL },
]

export function HelpScreen({
    onBack,
    onOpenTutorial,
}: {
    onBack: () => void
    onOpenTutorial: () => void
}) {
    return (
        <div className={styles.screen}>
            <ScreenHeader
                compact
                title="Help"
                onBack={onBack}
                rightLabel={<span className={styles.versionTag}>{PLUGIN_VERSION}</span>}
            />

            <div className={`${styles.body} scrollable`}>
                <div
                    role="button"
                    tabIndex={0}
                    className={styles.tourCard}
                    onClick={onOpenTutorial}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            onOpenTutorial()
                        }
                    }}
                >
                    <span className={styles.tourIcon} aria-hidden>
                        <MonitorPlayIcon />
                    </span>
                    <div className={styles.tourText}>
                        <span className={styles.tourTitle}>Watch the Quick Start tour</span>
                        <span className={styles.tourSub}>
                            A guided walkthrough of every screen in this plugin.
                        </span>
                    </div>
                </div>

                <div className={styles.resourcesSection}>
                    <span className={styles.eyebrow}>RESOURCES</span>
                    <div className={styles.resourcesList}>
                        {RESOURCES.map((r) => (
                            <a
                                key={r.label}
                                className={styles.resourceRow}
                                href={r.href}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className={styles.rowIcon} aria-hidden>
                                    <FileTextIcon />
                                </span>
                                <span className={styles.rowTitle}>{r.label}</span>
                                <span className={styles.rowTrailing} aria-hidden>
                                    <ArrowUpRightIcon />
                                </span>
                            </a>
                        ))}
                    </div>
                </div>

                <div className={styles.statusCard}>
                    <div className={styles.statusMeta}>
                        <span className={styles.statusDot} aria-hidden />
                        <span className={styles.statusLabel}>STATUS · ALL SYSTEMS NORMAL</span>
                    </div>
                    <p className={styles.statusBody}>Average response under 2 hours.</p>
                </div>
            </div>
        </div>
    )
}
