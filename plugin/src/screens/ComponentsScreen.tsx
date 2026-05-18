import * as React from "react"
import { Draggable, framer, type DragCompleteResult } from "framer-plugin"

import { Badge } from "@/components/Badge/Badge"
import { Button } from "@/components/Button/Button"
import { CodeOverrideInfo } from "@/components/CodeOverrideInfo/CodeOverrideInfo"
import { InputWithIcon } from "@/components/Input/Input"
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader"
import { SectionHeader } from "@/components/SectionHeader/SectionHeader"
import {
    ClockIcon,
    CogIcon,
    FileTextIcon,
    GripVerticalIcon,
    LockIcon,
    SearchIcon,
    SubtitlesIcon,
} from "@/icons"
import {
    BADGE_FREE,
    BADGE_PRO,
    CODE_OVERRIDE_ADD_TO_PROJECT,
    CODE_OVERRIDE_ADD_SUCCESS,
    CODE_OVERRIDE_ADDING,
    CODE_OVERRIDE_ALREADY_PRESENT,
    CODE_OVERRIDE_NOT_CONFIGURED,
    CODE_OVERRIDE_IN_PROJECT,
    SCREEN_COMPONENTS_TITLE,
    SEARCH_PLACEHOLDER,
} from "@/copy"
import {
    canAddIdleFadeFromLibrary,
    ensureCodeOverrideInProject,
    IdleFadeLibraryNotConfiguredError,
    idleFadeUtilityFilenames,
} from "@/lib/add-code-utility-files"
import { codeFileBasename } from "@/lib/code-file-path"
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
    if (entry.kind === "code-override") {
        return `${entry.title} ${entry.subtitle}`.toLowerCase().includes(s)
    }
    return `${entry.displayName} ${entry.subtitle}`.toLowerCase().includes(s)
}

function codeOverrideFilesPresent(
    basenames: Set<string>,
    handlerId: "bunny-idle-fade"
): boolean {
    if (handlerId === "bunny-idle-fade") {
        return idleFadeUtilityFilenames().every((name) => basenames.has(name))
    }
    return false
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
    const [projectBasenames, setProjectBasenames] = React.useState<Set<string>>(() => new Set())
    const [codeOverrideAddingId, setCodeOverrideAddingId] = React.useState<string | null>(null)
    const searchRef = React.useRef<HTMLInputElement>(null)

    const refreshProjectBasenames = React.useCallback(async () => {
        const files = await framer.getCodeFiles()
        setProjectBasenames(new Set(files.map((f) => codeFileBasename(f.name))))
    }, [])

    React.useEffect(() => {
        void refreshProjectBasenames()
    }, [refreshProjectBasenames])

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
            codeOverride: [],
        }
        for (const e of filtered) {
            if (e.kind === "code-override") {
                map.codeOverride.push(e)
            } else {
                map[e.section].push(e)
            }
        }
        const sectionSortWeight = (e: CatalogEntry) => {
            if (e.kind === "soon") return 2
            if (e.kind === "module" && e.pro) return 1
            return 0
        }
        for (const k of ["player", "controls"] as const) {
            map[k] = [...map[k]].sort((a, b) => sectionSortWeight(a) - sectionSortWeight(b))
        }
        return map
    }, [filtered])

    const renderRow = (entry: CatalogEntry) => {
        const rowKey = catalogRowKey(entry)
        const highlighted = highlightKey === rowKey

        if (entry.kind === "code-override") {
            const isProLocked = Boolean(entry.pro) && entitlementTier === "free"
            const inProject = codeOverrideFilesPresent(projectBasenames, entry.handlerId)
            const adding = codeOverrideAddingId === entry.id
            const libraryReady = canAddIdleFadeFromLibrary()

            const handleAdd = async () => {
                if (isProLocked) {
                    onUpgradeClick()
                    return
                }
                if (inProject || adding || !libraryReady) {
                    if (!libraryReady) framer.notify(CODE_OVERRIDE_NOT_CONFIGURED)
                    return
                }
                setCodeOverrideAddingId(entry.id)
                try {
                    const result = await ensureCodeOverrideInProject(entry.handlerId)
                    await refreshProjectBasenames()
                    if (result.created.length === 0 && result.skipped.length > 0) {
                        framer.notify(CODE_OVERRIDE_ALREADY_PRESENT)
                    } else {
                        framer.notify(CODE_OVERRIDE_ADD_SUCCESS)
                    }
                } catch (err) {
                    if (err instanceof IdleFadeLibraryNotConfiguredError) {
                        framer.notify(CODE_OVERRIDE_NOT_CONFIGURED)
                    } else {
                        framer.notify(err instanceof Error ? err.message : "Could not add code files")
                    }
                } finally {
                    setCodeOverrideAddingId(null)
                }
            }

            return (
                <div
                    key={rowKey}
                    className={cn(styles.codeOverrideRow, isProLocked && styles.codeOverrideRowLocked)}
                >
                    <span className={styles.rowIcon} aria-hidden>
                        <FileTextIcon />
                    </span>
                    <span className={styles.codeOverrideLabel}>
                        <span
                            className={cn(styles.rowTitle, isProLocked && styles.lockedTitle)}
                        >
                            {entry.title}
                        </span>
                        <CodeOverrideInfo subtitle={entry.subtitle} />
                    </span>
                    {isProLocked ? (
                        <Button
                            type="button"
                            variant="secondary"
                            className={styles.codeOverrideBtn}
                            onClick={onUpgradeClick}
                        >
                            <span className={styles.proLock}>
                                <LockIcon />
                                Pro
                            </span>
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            className={styles.codeOverrideBtn}
                            disabled={inProject || adding || !libraryReady}
                            title={
                                !libraryReady
                                    ? CODE_OVERRIDE_NOT_CONFIGURED
                                    : inProject
                                      ? CODE_OVERRIDE_ALREADY_PRESENT
                                      : undefined
                            }
                            onClick={() => void handleAdd()}
                        >
                            {adding
                                ? CODE_OVERRIDE_ADDING
                                : inProject
                                  ? CODE_OVERRIDE_IN_PROJECT
                                  : CODE_OVERRIDE_ADD_TO_PROJECT}
                        </Button>
                    )}
                </div>
            )
        }

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
                    {sections.codeOverride.length > 0 ? (
                        <section className={styles.sectionCard}>
                            <div className={styles.sectionHead}>
                                <SectionHeader>Code Override</SectionHeader>
                                <span className={styles.sectionCount}>
                                    {sections.codeOverride.length}
                                </span>
                            </div>
                            <div className={styles.rowList}>
                                {sections.codeOverride.map(renderRow)}
                            </div>
                        </section>
                    ) : null}
                </div>
            )}
        </div>
    )
}
