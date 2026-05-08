import * as React from "react"

import { QuickStart } from "@/components/QuickStart/QuickStart"
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader"
import { QUICK_START_TITLE } from "@/copy"

import styles from "./QuickStartScreen.module.css"

export function QuickStartScreen({
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
                title={QUICK_START_TITLE}
                onBack={onBack}
                rightLabel={<span className={styles.timeTag}>5 min</span>}
            />
            <div className={`${styles.body} scrollable`}>
                <div className={styles.intro}>
                    <h2 className={styles.introTitle}>Set up Stream Bunny</h2>
                    <p className={styles.introBody}>
                        Six quick steps to a working stream on your canvas.
                    </p>
                </div>
                <QuickStart onOpenTutorial={onOpenTutorial} />
            </div>
        </div>
    )
}
