import * as React from "react"
import { Draggable, framer, type DragCompleteResult } from "framer-plugin"

import { Alert } from "@/components/Alert/Alert"
import { Badge } from "@/components/Badge/Badge"
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader"
import { LockIcon, PlayIcon } from "@/icons"
import { BADGE_FREE, BADGE_PRO, TAG_COMING_SOON, TEMPLATES_SCREEN_TITLE } from "@/copy"
import type { LibraryModuleKey, TemplateModuleKey } from "@/component-modules"
import { recordTemplateInsert } from "@/lib/entitlement"

import styles from "./TemplatesScreen.module.css"

type TemplateEntry = {
    /** Stable identifier used as a React key. */
    id: string
    title: string
    sub: string
    /** Templates flagged `pro` are gated for Free users (Pro lock overlay). */
    pro: boolean
    /** Shown in the grid but not insertable until the upstream template ships. */
    comingSoon?: boolean
    /**
     * Upstream library export name. When the URL exists in `templateUrlMap`,
     * the card becomes a real `<Draggable>` and inserts that single component.
     * Until then, SB - Basic falls back to the legacy bundle insert below.
     */
    moduleKey: TemplateModuleKey
    /**
     * Optional fallback used while the template component does not yet exist
     * upstream. We synthesize the layout from primitive components.
     */
    legacyBundle?: LibraryModuleKey[]
    /** Render the subtitle in the brand orange (used for the free-tier cost line). */
    subAccent?: boolean
}

const TEMPLATES: TemplateEntry[] = [
    {
        id: "cinema-hero",
        title: "SB - Basic",
        sub: "Uses 5 inserts",
        pro: false,
        moduleKey: "BunnyTemplateCinemaHero",
        subAccent: true,
        legacyBundle: [
            "BunnyVideoPlayer",
            "BunnyPlayPauseButton",
            "BunnyProgressBar",
            "BunnyTimeDisplay",
            "BunnyFullscreenButton",
        ],
    },
    {
        id: "press-reel",
        title: "Press Reel",
        sub: "16:9 · 1080p",
        pro: false,
        comingSoon: true,
        moduleKey: "BunnyTemplatePressReel",
    },
    {
        id: "story-tile",
        title: "Story Tile",
        sub: "9:16 · vertical",
        pro: false,
        comingSoon: true,
        moduleKey: "BunnyTemplateStoryTile",
    },
    {
        id: "wall-stack",
        title: "Wall Stack",
        sub: "4:5 · social",
        pro: false,
        comingSoon: true,
        moduleKey: "BunnyTemplateWallStack",
    },
    {
        id: "tutorial-row",
        title: "Tutorial Row",
        sub: "16:9 · grid",
        pro: false,
        comingSoon: true,
        moduleKey: "BunnyTemplateTutorialRow",
    },
    {
        id: "showcase-strip",
        title: "Showcase Strip",
        sub: "21:9 · cinematic",
        pro: false,
        comingSoon: true,
        moduleKey: "BunnyTemplateShowcaseStrip",
    },
]

function PreviewMockup() {
    return (
        <span className={styles.playerMock} aria-hidden>
            <span className={styles.playBtn}>
                <PlayIcon />
            </span>
            <span className={styles.progress}>
                <span className={styles.progressFill} />
            </span>
        </span>
    )
}

export function TemplatesScreen({
    onBack,
    onUpgradeClick,
    onInsertSuccess,
    entitlementTier,
    urlMap,
    templateUrlMap,
}: {
    onBack: () => void
    onUpgradeClick: () => void
    onInsertSuccess: (baseName: string, displayName: string) => void
    entitlementTier: "free" | "pro"
    urlMap: Record<string, string>
    templateUrlMap: Record<TemplateModuleKey, string | undefined>
}) {
    const insertLegacyBundle = React.useCallback(
        async (entry: TemplateEntry) => {
            const bundle = entry.legacyBundle ?? []
            if (bundle.length === 0) {
                framer.notify("Template not yet available")
                return
            }
            try {
                const nodes = []
                for (const key of bundle) {
                    const url = urlMap[key]
                    if (!url) throw new Error("Component URL missing")
                    nodes.push(await framer.addComponentInstance({ url }))
                }
                recordTemplateInsert(bundle.length)
                await framer.setSelection(nodes.map((n) => n.id))
                framer.notify(`Inserted ${entry.title}`)
            } catch (err) {
                framer.notify(err instanceof Error ? err.message : "Insert failed")
            }
        },
        [urlMap]
    )

    return (
        <div className={`${styles.screen} scrollable`}>
            <ScreenHeader
                compact
                title={TEMPLATES_SCREEN_TITLE}
                onBack={onBack}
                rightLabel={
                    <Badge tone={entitlementTier === "pro" ? "accent" : "neutral"}>
                        {entitlementTier === "pro" ? BADGE_PRO : BADGE_FREE}
                    </Badge>
                }
            />

            {entitlementTier === "free" ? (
                <Alert tone="warning" title="Templates use all 5 free inserts">
                    Each template ships with 5+ components. Upgrade to Pro for unlimited.
                </Alert>
            ) : null}

            <div className={styles.grid}>
                {TEMPLATES.map((entry) => {
                    const comingSoon = entry.comingSoon === true
                    const locked = !comingSoon && entitlementTier === "free" && entry.pro
                    const dragUrl = comingSoon
                        ? undefined
                        : templateUrlMap[entry.moduleKey]

                    const card = (
                        <CardShell
                            locked={locked}
                            comingSoon={comingSoon}
                            title={entry.title}
                            sub={entry.sub}
                            subAccent={entry.subAccent}
                        />
                    )

                    if (comingSoon) {
                        return (
                            <StaticCardButton
                                key={entry.id}
                                onActivate={() => framer.notify(TAG_COMING_SOON)}
                            >
                                {card}
                            </StaticCardButton>
                        )
                    }

                    if (locked) {
                        return (
                            <div
                                key={entry.id}
                                role="button"
                                tabIndex={0}
                                className={styles.cardBtn}
                                onClick={onUpgradeClick}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        onUpgradeClick()
                                    }
                                }}
                            >
                                {card}
                            </div>
                        )
                    }

                    if (!dragUrl) {
                        return (
                            <div
                                key={entry.id}
                                role="button"
                                tabIndex={0}
                                className={styles.cardBtn}
                                onClick={() => framer.notify(TAG_COMING_SOON)}
                            >
                                {card}
                            </div>
                        )
                    }

                    return (
                        <Draggable
                            key={entry.id}
                            data={() => ({
                                type: "componentInstance" as const,
                                name: entry.moduleKey,
                                url: dragUrl,
                            })}
                            onDragComplete={(result: DragCompleteResult) => {
                                if (result.status === "error") {
                                    framer.notify(result.reason ?? "Drop failed")
                                    return
                                }
                                const bundleCost = entry.legacyBundle?.length ?? 0
                                if (bundleCost > 1) {
                                    // `onInsertSuccess` records one insert; add the remaining bundle cost.
                                    recordTemplateInsert(bundleCost - 1)
                                }
                                void framer.setSelection([result.nodeId])
                                onInsertSuccess(entry.moduleKey, entry.title)
                            }}
                        >
                            <div
                                role="button"
                                tabIndex={0}
                                className={styles.cardBtn}
                                onClick={() => {
                                    /**
                                     * Click is a convenience fallback for SB - Basic (inserts the
                                     * full multi-component bundle in place of the not-yet-existing
                                     * template). Other templates rely on drag-and-drop only.
                                     */
                                    if (entry.legacyBundle?.length) {
                                        void insertLegacyBundle(entry)
                                    }
                                }}
                            >
                                {card}
                            </div>
                        </Draggable>
                    )
                })}
            </div>
        </div>
    )
}

function StaticCardButton({
    children,
    onActivate,
}: {
    children: React.ReactNode
    onActivate: () => void
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            className={styles.cardBtn}
            onClick={onActivate}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onActivate()
                }
            }}
        >
            {children}
        </div>
    )
}

function CardShell({
    locked,
    comingSoon,
    title,
    sub,
    subAccent,
}: {
    locked: boolean
    comingSoon?: boolean
    title: string
    sub: string
    subAccent?: boolean
}) {
    return (
        <span
            className={`${styles.card} ${locked ? styles.locked : ""} ${
                comingSoon ? styles.comingSoon : ""
            }`}
        >
            <span className={styles.previewArt}>
                <PreviewMockup />
            </span>
            <span className={styles.previewMeta}>
                <span className={styles.previewTitle}>{title}</span>
                {sub ? (
                    <span
                        className={`${styles.previewSub} ${
                            subAccent ? styles.previewSubAccent : ""
                        }`}
                    >
                        {sub}
                    </span>
                ) : null}
            </span>
            {locked ? (
                <span className={styles.lockOverlay} aria-hidden>
                    <span className={styles.lockPill}>
                        <LockIcon />
                        Pro
                    </span>
                </span>
            ) : null}
            {comingSoon ? (
                <span className={styles.soonOverlay} aria-hidden>
                    <span className={styles.soonPill}>{TAG_COMING_SOON}</span>
                </span>
            ) : null}
        </span>
    )
}
