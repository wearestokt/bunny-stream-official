import * as React from "react"

import { ExternalLinkIcon, MonitorPlayIcon } from "@/icons"
import { Button } from "@/components/Button/Button"
import { URL_BUNNY_REF } from "@/copy"

import styles from "./QuickStart.module.css"

export function QuickStart({ onOpenTutorial }: { onOpenTutorial: () => void }) {
    return (
        <ol className={styles.list}>
            <li className={styles.card}>
                <div className={styles.row}>
                    <span className={`${styles.index} ${styles.indexActive}`}>1</span>
                    <span className={styles.title}>Create a bunny.net account</span>
                </div>
                <div className={styles.body}>
                    <p>Sign up so you have a Stream library to point the player at.</p>
                    <Button
                        variant="primary"
                        leadingIcon={ExternalLinkIcon}
                        onClick={() => window.open(URL_BUNNY_REF, "_blank", "noopener,noreferrer")}
                    >
                        Open bunny.net
                    </Button>
                    <p className={styles.subLine}>Already have one? Skip to step 2.</p>
                </div>
            </li>
            <li className={styles.card}>
                <div className={styles.row}>
                    <span className={`${styles.index} ${styles.indexActive}`}>2</span>
                    <span className={styles.title}>Watch the setup video</span>
                </div>
                <div className={styles.body}>
                    <p>
                        A 2-minute walkthrough so your Bunny account is wired up correctly before
                        you start building.
                    </p>
                    <Button variant="secondary" leadingIcon={MonitorPlayIcon} onClick={onOpenTutorial}>
                        Watch video
                    </Button>
                </div>
            </li>
            <li className={styles.card}>
                <div className={styles.row}>
                    <span className={styles.index}>3</span>
                    <span className={styles.title}>Drag a Player onto your canvas</span>
                </div>
                <div className={styles.body}>
                    <p>From Components, drop a Video Player into any Frame.</p>
                </div>
            </li>
            <li className={styles.card}>
                <div className={styles.row}>
                    <span className={styles.index}>4</span>
                    <span className={styles.title}>Paste your Stream API info</span>
                </div>
                <div className={styles.body}>
                    <p>CDN Hostname, Video Library ID, and Video ID — from your Bunny dashboard.</p>
                </div>
            </li>
            <li className={styles.card}>
                <div className={styles.row}>
                    <span className={styles.index}>5</span>
                    <span className={styles.title}>Drag and style controls</span>
                </div>
                <div className={styles.body}>
                    <p>Place play, scrub, captions, and quality directly on the canvas.</p>
                </div>
            </li>
            <li className={styles.card}>
                <div className={styles.row}>
                    <span className={styles.index}>6</span>
                    <span className={styles.title}>Enjoy</span>
                </div>
                <div className={styles.body}>
                    <p>Hit preview and watch your stream play natively in Framer.</p>
                </div>
            </li>
        </ol>
    )
}
