import * as React from "react"

import { Button } from "@/components/Button/Button"
import { PluginTopBar } from "@/components/PluginTopBar/PluginTopBar"
import { Tile, TileGrid } from "@/components/Tile/Tile"
import { Card, CardBody } from "@/components/Card/Card"
import { ExternalLinkIcon, LayoutGridIcon, UserIcon, VideoIcon, ZapIcon } from "@/icons"
import {
    DASHBOARD_PAPER_HERO_BODY,
    DASHBOARD_PAPER_HERO_TITLE,
    DASHBOARD_PAPER_LEARN_MORE,
    TILE_ACCOUNT_SUB,
    TILE_ACCOUNT_TITLE,
    TILE_COMPONENTS_SUB,
    TILE_COMPONENTS_TITLE,
    TILE_QUICK_SUB,
    TILE_QUICK_TITLE,
    TILE_TEMPLATES_SUB,
    TILE_TEMPLATES_TITLE,
    WHATS_NEW_BODY,
    WHATS_NEW_LABEL,
    WHATS_NEW_TITLE,
    WHATS_NEW_VERSION,
    URL_README,
} from "@/copy"
import { FREE_TIER_MAX_CANVAS_INSERTS, type EntitlementSnapshot } from "@/lib/entitlement"
import type { ScreenId } from "@/lib/navigation"

import styles from "./Dashboard.module.css"

function FreeQuotaCard({
    entitlement,
    onUpgradeClick,
}: {
    entitlement: EntitlementSnapshot
    onUpgradeClick: () => void
}) {
    if (entitlement.tier !== "free") return null
    const used = entitlement.insertsUsed
    const remaining = entitlement.insertsRemaining ?? 0
    const atLimit = remaining <= 0

    return (
        <Card elevation="elevated" className={styles.quotaCard}>
            <CardBody className={styles.quotaBody}>
                <div className={styles.quotaHeader}>
                    <span className={styles.quotaLabel}>FREE QUOTA</span>
                    <span className={styles.quotaCount}>
                        {used} / {FREE_TIER_MAX_CANVAS_INSERTS}
                    </span>
                </div>
                <div className={styles.progress}>
                    <span
                        className={styles.progressFill}
                        style={{
                            width: `${Math.min(100, (used / FREE_TIER_MAX_CANVAS_INSERTS) * 100)}%`,
                        }}
                    />
                </div>
                <p className={styles.quotaNote}>
                    {atLimit
                        ? "You've used your free inserts. Upgrade to keep building."
                        : `${remaining} inserts left this workspace. Upgrade for unlimited.`}
                </p>
                {atLimit ? (
                    <Button variant="primary" fullWidth onClick={onUpgradeClick}>
                        Upgrade to Pro
                    </Button>
                ) : null}
            </CardBody>
        </Card>
    )
}

function WhatsNewCard() {
    return (
        <Card elevation="elevated" className={styles.whatsNewCard}>
            <CardBody className={styles.whatsNewBody}>
                <div className={styles.whatsNewMeta}>
                    <div className={styles.whatsNewLeft}>
                        <span className={styles.dot} aria-hidden />
                        <span className={styles.whatsNewLabel}>{WHATS_NEW_LABEL}</span>
                    </div>
                    <span className={styles.whatsNewVersion}>{WHATS_NEW_VERSION}</span>
                </div>
                <p className={styles.whatsNewTitle}>{WHATS_NEW_TITLE}</p>
                <p className={styles.whatsNewCopy}>{WHATS_NEW_BODY}</p>
            </CardBody>
        </Card>
    )
}

export function Dashboard({
    onNavigate,
    entitlement,
    onUpgradeClick,
}: {
    onNavigate: (s: ScreenId) => void
    entitlement: EntitlementSnapshot
    onUpgradeClick: () => void
}) {
    return (
        <div className={`${styles.screen} scrollable`}>
            <PluginTopBar entitlement={entitlement} />

            <section className={styles.intro}>
                <h1 className={styles.heroTitle}>{DASHBOARD_PAPER_HERO_TITLE}</h1>
                <p className={styles.heroSubtitle}>{DASHBOARD_PAPER_HERO_BODY}</p>
                <a
                    className={styles.learnMore}
                    href={URL_README}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {DASHBOARD_PAPER_LEARN_MORE} <ExternalLinkIcon className={styles.learnMoreIcon} />
                </a>
            </section>

            <FreeQuotaCard entitlement={entitlement} onUpgradeClick={onUpgradeClick} />

            <TileGrid className={styles.tileGrid}>
                <Tile
                    icon={<VideoIcon />}
                    iconAccent
                    title={TILE_COMPONENTS_TITLE}
                    subtitle={TILE_COMPONENTS_SUB}
                    onClick={() => onNavigate("components")}
                />
                <Tile
                    icon={<LayoutGridIcon />}
                    title={TILE_TEMPLATES_TITLE}
                    subtitle={TILE_TEMPLATES_SUB}
                    onClick={() => onNavigate("templates")}
                />
                <Tile
                    icon={<ZapIcon />}
                    title={TILE_QUICK_TITLE}
                    subtitle={TILE_QUICK_SUB}
                    onClick={() => onNavigate("quickstart")}
                />
                <Tile
                    icon={<UserIcon />}
                    title={TILE_ACCOUNT_TITLE}
                    subtitle={TILE_ACCOUNT_SUB}
                    onClick={() => onNavigate("account")}
                />
            </TileGrid>

            <WhatsNewCard />
        </div>
    )
}
