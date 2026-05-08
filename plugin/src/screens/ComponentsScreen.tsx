import * as React from "react"
import { Draggable, framer, type DragCompleteResult } from "framer-plugin"

import { Badge } from "@/components/Badge/Badge"
import { Button } from "@/components/Button/Button"
import { InputWithIcon } from "@/components/Input/Input"
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader"
import { SectionHeader } from "@/components/SectionHeader/SectionHeader"
import {
    ClockIcon,
    CogIcon,
    GripVerticalIcon,
    LockIcon,
    SearchIcon,
    SubtitlesIcon,
} from "@/icons"
import {
    BADGE_FREE,
    BADGE_PRO,
    SCREEN_COMPONENTS_TITLE,
    SEARCH_PLACEHOLDER,
} from "@/copy"
import {
    catalogRowKey,
    COMPONENT_CATALOG,
    type CatalogEntry,
    type ComponentSectionId,
} from "@/lib/component-catalog"
import { cn } from "@/lib/utils"

import styles from "./ComponentsScreen.module.css"

function matchesQuery(entry: CatalogEntry, q: string): boolean {
    if (!q.trim()) return true
    const s = q.toLowerCase()
    if (entry.kind === "module") {
        return entry.baseName.toLowerCase().includes(s) || entry.subtitle.toLowerCase().includes(s)
    }
    return `${entry.displayName} ${entry.subtitle}`.toLowerCase().includes(s)
}

export function ComponentsScreen({
    urlMap,
    displayNames,
    icons,
    insertBlocked,
    onInsertSuccess,
    highlightKey,
    onBack,
    entitlementTier,
    onUpgradeClick,
}: {
    urlMap: Record<string, string>
    displayNames: Record<string, string>
    icons: Record<string, React.ComponentType<{ className?: string }>>
    insertBlocked: boolean
    onInsertSuccess: (baseName: string, displayName: string) => void
    highlightKey: string | null
    onBack: () => void
    entitlementTier: "free" | "pro"
    onUpgradeClick: () => void
}) {
    const [query, setQuery] = React.useState("")
    const searchRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                searchRef.current?.focus()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    const filtered = React.useMemo(() => {
        const q = query.trim()
        return COMPONENT_CATALOG.filter((e) => matchesQuery(e, q))
    }, [query])

    const showEmptySearch = query.trim().length > 0 && filtered.length === 0

    const sections = React.useMemo(() => {
        const map: Record<ComponentSectionId, CatalogEntry[]> = {
            player: [],
            controls: [],
            soon: [],
        }
        for (const e of filtered) {
            const section = e.kind === "module" ? e.section : "soon"
            map[section].push(e)
        }
        // Pro-locked entries always render at the bottom of their section so they
        // don't break the flow of free, draggable controls.
        const proWeight = (e: CatalogEntry) => (e.kind === "module" && e.pro ? 1 : 0)
        for (const k of Object.keys(map) as ComponentSectionId[]) {
            map[k] = [...map[k]].sort((a, b) => proWeight(a) - proWeight(b))
        }
        return map
    }, [filtered])

    const renderRow = (entry: CatalogEntry) => {
        const rowKey = catalogRowKey(entry)
        const highlighted = highlightKey === rowKey

        if (entry.kind === "soon") {
            return (
                <div key={rowKey} className={cn(styles.row, styles.disabledRow)}>
                    <span className={styles.rowIcon} aria-hidden>
                        {entry.id === "captions-soon" ? <SubtitlesIcon /> : <ClockIcon />}
                    </span>
                    <span className={styles.rowTitle}>{entry.displayName}</span>
                    <span className={styles.soonPill}>Coming soon</span>
                </div>
            )
        }

        const baseName = entry.baseName
        const url = urlMap[baseName]
        const Icon = icons[baseName]
        const displayName = displayNames[baseName] ?? baseName
        if (!url || !Icon) return null

        const isQualityPickerLocked = entry.pro && entitlementTier === "free"

        const inner = (
            <div
                className={cn(
                    styles.row,
                    highlighted && styles.highlight,
                    isQualityPickerLocked && styles.qualityLockedRow
                )}
            >
                <span className={styles.rowIcon} aria-hidden>
                    {entry.pro ? <CogIcon /> : <Icon />}
                </span>
                <span
                    className={cn(styles.rowTitle, isQualityPickerLocked && styles.lockedTitle)}
                >
                    {displayName}
                </span>
                {isQualityPickerLocked ? (
                    <span className={styles.proLock}>
                        <LockIcon />
                        Pro
                    </span>
                ) : (
                    <span className={styles.rowKindLabel}>Component</span>
                )}
                <span
                    className={cn(styles.grip, isQualityPickerLocked && styles.gripLocked)}
                    aria-hidden
                >
                    <GripVerticalIcon />
                </span>
            </div>
        )

        if (isQualityPickerLocked) {
            return (
                <button
                    key={rowKey}
                    type="button"
                    className={styles.lockedButton}
                    onClick={onUpgradeClick}
                >
                    {inner}
                </button>
            )
        }

        if (insertBlocked) return <div key={rowKey} className={styles.disabledWrapper}>{inner}</div>

        return (
            <Draggable
                key={rowKey}
                data={() => ({ type: "componentInstance" as const, name: baseName, url })}
                onDragComplete={(result: DragCompleteResult) => {
                    if (result.status === "error") {
                        framer.notify(result.reason ?? "Drop failed")
                        return
                    }
                    void framer.setSelection([result.nodeId])
                    onInsertSuccess(baseName, displayName)
                }}
            >
                {inner}
            </Draggable>
        )
    }

    return (
        <div className={styles.screen}>
            <ScreenHeader
                compact
                title={SCREEN_COMPONENTS_TITLE}
                onBack={onBack}
                rightLabel={
                    <Badge tone={entitlementTier === "pro" ? "accent" : "neutral"}>
                        {entitlementTier === "pro" ? BADGE_PRO : BADGE_FREE}
                    </Badge>
                }
            />

            <InputWithIcon
                ref={searchRef}
                icon={<SearchIcon />}
                placeholder={SEARCH_PLACEHOLDER}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                trailing={<kbd className={styles.kbd}>⌘K</kbd>}
            />

            {showEmptySearch ? (
                <div className={`${styles.empty} scrollable`}>
                    <span className={styles.emptyIcon} aria-hidden>
                        <SearchIcon width={28} height={28} />
                    </span>
                    <p className={styles.emptyTitle}>No matches</p>
                    <p className={styles.emptyBody}>
                        Try a shorter term, or browse the full library by clearing the search.
                    </p>
                    <Button variant="secondary" onClick={() => setQuery("")}>
                        Clear search
                    </Button>
                </div>
            ) : (
                <div className={`${styles.sections} scrollable`}>
                    <section className={styles.sectionCard}>
                        <div className={styles.sectionHead}>
                            <SectionHeader>Player</SectionHeader>
                            <span className={styles.sectionCount}>{sections.player.length}</span>
                        </div>
                        <div className={styles.rowList}>{sections.player.map(renderRow)}</div>
                    </section>
                    <section className={styles.sectionCard}>
                        <div className={styles.sectionHead}>
                            <SectionHeader>Controls</SectionHeader>
                            <span className={styles.sectionCount}>{sections.controls.length}</span>
                        </div>
                        <div className={styles.rowList}>{sections.controls.map(renderRow)}</div>
                    </section>
                    <section className={styles.sectionCard}>
                        <div className={styles.sectionHead}>
                            <SectionHeader>Coming Soon</SectionHeader>
                            <span className={styles.sectionCount}>{sections.soon.length}</span>
                        </div>
                        <div className={styles.rowList}>{sections.soon.map(renderRow)}</div>
                    </section>
                </div>
            )}
        </div>
    )
}
