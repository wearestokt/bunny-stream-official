import { framer } from "framer-plugin"
import * as React from "react"

import { Alert } from "@/components/Alert/Alert"
import { Button } from "@/components/Button/Button"
import { InsertedToast } from "@/components/InsertedToast/InsertedToast"
import { PluginFooter } from "@/components/PluginFooter/PluginFooter"
import { Skeleton } from "@/components/Skeleton/Skeleton"
import { TutorialDialog } from "@/components/TutorialDialog/TutorialDialog"
import { UpgradeDialog } from "@/components/UpgradeDialog/UpgradeDialog"
import {
    resolvePublishedModuleUrlMap,
    resolveTemplateModuleUrlMap,
    useEmbeddedLocalSources,
    type TemplateModuleKey,
} from "@/component-modules"
import {
    EMBED_SOURCE_MODE_BODY,
    EMBED_SOURCE_MODE_TITLE,
    ERROR_MODULE_URLS_BODY,
    ERROR_MODULE_URLS_DEV_HINT,
    ERROR_MODULE_URLS_TITLE,
    ERROR_RETRY,
    LICENSE_REVOKED,
    LICENSE_SIGN_OUT,
    LOADING_LABEL,
    POLAR_CHECKOUT_FALLBACK,
    PLUGIN_VERSION,
} from "@/copy"
import {
    ClockIcon,
    CogIcon,
    FullscreenIcon,
    GaugeIcon,
    PlayIcon,
    VideoIcon,
    VolumeIcon,
} from "@/icons"
import {
    downgradeToFree,
    FREE_TIER_MAX_CANVAS_INSERTS,
    getEntitlementSnapshot,
    maybeRevalidateStoredLicense,
    recordSuccessfulCanvasInsert,
} from "@/lib/entitlement"
import { NavigationProvider, useNavigation } from "@/lib/navigation"
import { AccountScreen } from "@/screens/AccountScreen"
import { ComponentsScreen } from "@/screens/ComponentsScreen"
import { Dashboard } from "@/screens/Dashboard"
import { HelpScreen } from "@/screens/HelpScreen"
import { QuickStartScreen } from "@/screens/QuickStartScreen"
import { TemplatesScreen } from "@/screens/TemplatesScreen"

import styles from "./App.module.css"

const DISPLAY_NAMES: Record<string, string> = {
    BunnyVideoPlayer: "Video Player",
    BunnyPlayPauseButton: "Play / Pause",
    BunnyVolumeSlider: "Volume",
    BunnyProgressBar: "Progress Bar",
    BunnyTimeDisplay: "Time Display",
    BunnyQualityPickerButton: "Quality Picker",
    BunnyFullscreenButton: "Fullscreen",
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    BunnyVideoPlayer: VideoIcon,
    BunnyPlayPauseButton: PlayIcon,
    BunnyVolumeSlider: VolumeIcon,
    BunnyProgressBar: GaugeIcon,
    BunnyTimeDisplay: ClockIcon,
    BunnyQualityPickerButton: CogIcon,
    BunnyFullscreenButton: FullscreenIcon,
}

framer.showUI({
    position: "top right",
    width: 300,
    height: 700,
})

function LoadingView() {
    return (
        <main className={styles.main}>
            <Skeleton style={{ height: 28 }} />
            <div className={styles.loadingBody}>
                <Skeleton style={{ height: 80 }} />
                <Skeleton style={{ flex: 1, minHeight: 0 }} />
                <p className={styles.loadingLabel}>{LOADING_LABEL}</p>
            </div>
        </main>
    )
}

function AppShell() {
    const { screen, push, back } = useNavigation()
    const [urlMap, setUrlMap] = React.useState<Record<string, string>>({})
    const templateUrlMap = React.useMemo(
        () => resolveTemplateModuleUrlMap(),
        []
    ) as Record<TemplateModuleKey, string | undefined>
    const [ready, setReady] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [, setEntitlementTick] = React.useState(0)
    const [upgradeOpen, setUpgradeOpen] = React.useState(false)
    const [tutorialOpen, setTutorialOpen] = React.useState(false)
    const [toastOpen, setToastOpen] = React.useState(false)
    const [toastTitle, setToastTitle] = React.useState<string | undefined>(undefined)
    const [toastUsed, setToastUsed] = React.useState(0)
    const [highlightKey, setHighlightKey] = React.useState<string | null>(null)
    const [revokedBanner, setRevokedBanner] = React.useState(false)

    const entitlement = getEntitlementSnapshot()
    const polarCheckout =
        (import.meta.env.VITE_POLAR_CHECKOUT_URL as string | undefined)?.trim() ||
        POLAR_CHECKOUT_FALLBACK
    const embedSourceMode = useEmbeddedLocalSources()

    const load = React.useCallback(async () => {
        setError(null)
        setReady(false)
        try {
            const published = resolvePublishedModuleUrlMap()
            if (embedSourceMode) {
                const { loadUrlMapFromEmbeddedProjectFiles } = await import(
                    "./embed-local-components.ts"
                )
                setUrlMap(await loadUrlMapFromEmbeddedProjectFiles())
                setReady(true)
                return
            }
            if (published.ok) {
                setUrlMap(published.map)
                setReady(true)
                return
            }
            setError(
                `${ERROR_MODULE_URLS_BODY}${
                    import.meta.env.DEV ? ` ${ERROR_MODULE_URLS_DEV_HINT}` : ""
                }`
            )
            setReady(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load components")
            setReady(false)
        }
    }, [embedSourceMode])

    React.useEffect(() => {
        void load()
    }, [load])

    React.useEffect(() => {
        void (async () => {
            const r = await maybeRevalidateStoredLicense()
            if (r.revoked) {
                setRevokedBanner(true)
                setEntitlementTick((t) => t + 1)
            }
        })()
    }, [])

    /**
     * Spec §15 — auth flows surface a logout option via the Menu API. We register a
     * Plugin window menu that exposes Sign out only when the user is on Pro.
     */
    React.useEffect(() => {
        const framerWithMenu = framer as { setMenu?: (items: unknown[]) => Promise<void> }
        if (typeof framerWithMenu.setMenu !== "function") return
        if (entitlement.tier === "pro") {
            void framerWithMenu.setMenu([
                {
                    type: "action",
                    label: LICENSE_SIGN_OUT,
                    onAction: () => {
                        downgradeToFree()
                        setEntitlementTick((t) => t + 1)
                    },
                },
            ])
        } else {
            void framerWithMenu.setMenu([])
        }
    }, [entitlement.tier])

    const onInsertSuccess = React.useCallback((baseName: string, displayName: string) => {
        recordSuccessfulCanvasInsert()
        const next = getEntitlementSnapshot()
        setEntitlementTick((t) => t + 1)
        setToastTitle(`Inserted ${displayName}`)
        setToastUsed(next.insertsUsed)
        setToastOpen(true)
        setHighlightKey(baseName)
        window.setTimeout(() => setHighlightKey(null), 4500)
    }, [])

    const onUnlocked = React.useCallback(() => {
        setEntitlementTick((t) => t + 1)
    }, [])

    const dismissToast = React.useCallback(() => {
        setToastOpen(false)
        setHighlightKey(null)
    }, [])

    const isFreeAtLimit = entitlement.tier === "free" && entitlement.atLimit

    React.useEffect(() => {
        if (!toastOpen) return
        // The limit toast is a CTA — keep it visible until the user acts on or dismisses it.
        if (isFreeAtLimit) return
        const t = window.setTimeout(() => setToastOpen(false), 4000)
        return () => window.clearTimeout(t)
    }, [toastOpen, isFreeAtLimit])

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") dismissToast()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [dismissToast])

    const insertBlocked = entitlement.tier === "free" && entitlement.atLimit
    const showPluginFooter = screen !== "help" && !upgradeOpen

    if (!ready && !error) return <LoadingView />

    if (error) {
        const isModuleConfigError = error.startsWith(ERROR_MODULE_URLS_BODY)
        return (
            <main className={styles.main}>
                <Alert
                    tone={isModuleConfigError ? "warning" : "danger"}
                    title={
                        isModuleConfigError ? ERROR_MODULE_URLS_TITLE : "Couldn't load components"
                    }
                >
                    {error}
                </Alert>
                <Button variant="primary" fullWidth onClick={() => void load()}>
                    {ERROR_RETRY}
                </Button>
            </main>
        )
    }

    return (
        <>
            <main className={styles.main}>
                {revokedBanner ? (
                    <Alert tone="danger" title="License">
                        {LICENSE_REVOKED}
                    </Alert>
                ) : null}
                {embedSourceMode ? (
                    <Alert tone="warning" title={EMBED_SOURCE_MODE_TITLE}>
                        {EMBED_SOURCE_MODE_BODY}
                    </Alert>
                ) : null}

                <div className={styles.body}>
                    {screen === "dashboard" ? (
                        <Dashboard
                            entitlement={entitlement}
                            onNavigate={push}
                            onUpgradeClick={() => setUpgradeOpen(true)}
                        />
                    ) : null}

                    {screen === "components" ? (
                        <ComponentsScreen
                            urlMap={urlMap}
                            displayNames={DISPLAY_NAMES}
                            icons={ICONS}
                            insertBlocked={insertBlocked}
                            onInsertSuccess={onInsertSuccess}
                            highlightKey={highlightKey}
                            entitlementTier={entitlement.tier}
                            onUpgradeClick={() => setUpgradeOpen(true)}
                            onBack={back}
                        />
                    ) : null}

                    {screen === "templates" ? (
                        <TemplatesScreen
                            entitlementTier={entitlement.tier}
                            urlMap={urlMap}
                            templateUrlMap={templateUrlMap}
                            onBack={back}
                            onUpgradeClick={() => setUpgradeOpen(true)}
                            onInsertSuccess={onInsertSuccess}
                        />
                    ) : null}

                    {screen === "quickstart" ? (
                        <QuickStartScreen onBack={back} onOpenTutorial={() => setTutorialOpen(true)} />
                    ) : null}

                    {screen === "help" ? (
                        <HelpScreen onBack={back} onOpenTutorial={() => setTutorialOpen(true)} />
                    ) : null}

                    {screen === "account" ? (
                        <AccountScreen
                            entitlement={entitlement}
                            onBack={back}
                            onUpgradeClick={() => setUpgradeOpen(true)}
                            polarCheckoutUrl={polarCheckout}
                            onEntitlementChange={() => setEntitlementTick((t) => t + 1)}
                        />
                    ) : null}
                </div>
                {toastOpen && screen === "components" ? (
                    isFreeAtLimit ? (
                        <InsertedToast
                            variant="limit"
                            title="You've used your free inserts"
                            subtitle="Upgrade to Pro for unlimited inserts, every template, and lifetime updates — one-time $49."
                            ctaLabel="Upgrade to Pro"
                            onCta={() => {
                                setToastOpen(false)
                                setUpgradeOpen(true)
                            }}
                            onDismiss={dismissToast}
                        />
                    ) : (
                        <InsertedToast
                            title={toastTitle}
                            subtitle={
                                entitlement.tier === "pro"
                                    ? "Pro plan · Unlimited inserts"
                                    : `${toastUsed} of ${FREE_TIER_MAX_CANVAS_INSERTS} free inserts used`
                            }
                            onDismiss={dismissToast}
                        />
                    )
                ) : null}
                {showPluginFooter ? (
                    <PluginFooter
                        version={PLUGIN_VERSION}
                        onOpenHelp={() => push("help")}
                    />
                ) : null}
            </main>
            <UpgradeDialog
                open={upgradeOpen}
                onOpenChange={setUpgradeOpen}
                onUnlocked={onUnlocked}
                polarCheckoutUrl={polarCheckout}
            />
            <TutorialDialog open={tutorialOpen} onOpenChange={setTutorialOpen} />
        </>
    )
}

export function App() {
    return (
        <NavigationProvider>
            <AppShell />
        </NavigationProvider>
    )
}
