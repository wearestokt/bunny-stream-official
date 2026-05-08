import * as React from "react"

import { Badge } from "@/components/Badge/Badge"
import { BADGE_FREE, BADGE_PRO } from "@/copy"
import type { EntitlementSnapshot } from "@/lib/entitlement"

import styles from "./PluginTopBar.module.css"

export function PluginTopBar({ entitlement }: { entitlement: EntitlementSnapshot }) {
    return (
        <div className={styles.bar}>
            <span aria-hidden className={styles.spacer} />
            <div className={styles.right}>
                <Badge tone={entitlement.tier === "pro" ? "accent" : "neutral"}>
                    {entitlement.tier === "pro" ? BADGE_PRO : BADGE_FREE}
                </Badge>
            </div>
        </div>
    )
}
