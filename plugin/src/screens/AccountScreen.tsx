import * as React from "react"
import { framer } from "framer-plugin"

import { Badge } from "@/components/Badge/Badge"
import { Button } from "@/components/Button/Button"
import { Input } from "@/components/Input/Input"
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader"
import { CreditCardIcon, SignOutIcon, ZapIcon } from "@/icons"
import {
    BADGE_FREE,
    BADGE_PRO,
    LICENSE_PLACEHOLDER,
    POLAR_CHECKOUT_FALLBACK,
    SCREEN_ACCOUNT_TITLE,
} from "@/copy"
import { isDevToolsUiEnabled } from "@/lib/dev-tools"
import {
    type EntitlementSnapshot,
    FREE_TIER_MAX_CANVAS_INSERTS,
    downgradeToFree,
    resetInsertCount,
    tryUnlockWithLicenseKey,
    unlockProLocal,
} from "@/lib/entitlement"

import styles from "./AccountScreen.module.css"

export function AccountScreen({
    entitlement,
    onBack,
    onUpgradeClick,
    polarCheckoutUrl,
    onEntitlementChange,
}: {
    entitlement: EntitlementSnapshot
    onBack: () => void
    onUpgradeClick: () => void
    polarCheckoutUrl: string
    onEntitlementChange: () => void
}) {
    const isPro = entitlement.tier === "pro"
    const checkout = polarCheckoutUrl || POLAR_CHECKOUT_FALLBACK
    const used = Math.min(entitlement.insertsUsed, FREE_TIER_MAX_CANVAS_INSERTS)
    const maxFree = FREE_TIER_MAX_CANVAS_INSERTS
    const remaining = Math.max(0, entitlement.insertsRemaining ?? 0)
    const pct = Math.min(100, Math.round((used / maxFree) * 100))
    const [licenseKey, setLicenseKey] = React.useState("")
    const [activating, setActivating] = React.useState(false)

    return (
        <div className={styles.screen}>
            <ScreenHeader
                compact
                title={SCREEN_ACCOUNT_TITLE}
                onBack={onBack}
                rightLabel={
                    <Badge tone={isPro ? "accent" : "neutral"}>
                        {isPro ? BADGE_PRO : BADGE_FREE}
                    </Badge>
                }
            />

            <div className={`${styles.body} scrollable`}>
                {isPro ? (
                    <>
                        <section className={styles.card}>
                            <div className={styles.planHeader}>
                                <span className={styles.eyebrow}>CURRENT PLAN</span>
                                <span className={styles.activePill}>● ACTIVE</span>
                            </div>
                            <p className={styles.planName}>Pro</p>
                        </section>

                        <section className={styles.card}>
                            <span className={styles.eyebrow}>LICENSE</span>
                            <div className={styles.infoRows}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Email</span>
                                    <span className={styles.infoValue}>
                                        {entitlement.licenseEmail ?? "—"}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Activated</span>
                                    <span className={styles.infoValue}>
                                        {entitlement.lastValidatedAt
                                            ? new Date(entitlement.lastValidatedAt).toLocaleDateString()
                                            : "—"}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Last validated</span>
                                    <span className={styles.infoValue}>
                                        {entitlement.lastValidatedAt
                                            ? new Date(entitlement.lastValidatedAt).toLocaleDateString()
                                            : "—"}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <div className={styles.actions}>
                            <Button
                                variant="ghost"
                                leadingIcon={CreditCardIcon}
                                fullWidth
                                onClick={() =>
                                    window.open(checkout, "_blank", "noopener,noreferrer")
                                }
                            >
                                Manage subscription
                            </Button>
                            <Button
                                variant="ghost"
                                leadingIcon={SignOutIcon}
                                fullWidth
                                onClick={() => {
                                    downgradeToFree()
                                    onEntitlementChange()
                                }}
                            >
                                Sign out of this license
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <section className={styles.card}>
                            <span className={styles.eyebrow}>CURRENT PLAN</span>
                            <p className={styles.planName}>Free</p>
                            <div className={styles.usageRow}>
                                <span className={styles.usageLeft}>
                                    {used} of {maxFree} used
                                </span>
                                <span className={styles.usageRight}>{remaining} left</span>
                            </div>
                            <div className={styles.progress} aria-hidden>
                                <span
                                    className={styles.progressFill}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </section>

                        <section className={`${styles.card} ${styles.proUpsell}`}>
                            <div className={styles.proHead}>
                                <ZapIcon className={styles.proIcon} />
                                <span className={styles.eyebrowAccent}>PRO · $49 ONCE</span>
                            </div>
                            <p className={styles.upsellCopy}>
                                Unlimited inserts, every template, lifetime updates.
                            </p>
                            <Button variant="primary" fullWidth onClick={onUpgradeClick}>
                                Upgrade to Pro
                            </Button>
                        </section>

                        <section className={styles.card}>
                            <span className={styles.eyebrow}>HAVE A LICENSE?</span>
                            <div className={styles.licenseRow}>
                                <div className={styles.licenseInputWrap}>
                                    <Input
                                        placeholder={LICENSE_PLACEHOLDER}
                                        value={licenseKey}
                                        onChange={(e) => setLicenseKey(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="secondary"
                                    disabled={activating}
                                    onClick={() => {
                                        void (async () => {
                                            setActivating(true)
                                            try {
                                                const res = await tryUnlockWithLicenseKey(licenseKey)
                                                if (!res.ok) {
                                                    framer.notify(
                                                        "Could not unlock. Check your key or try again."
                                                    )
                                                    return
                                                }
                                                onEntitlementChange()
                                            } finally {
                                                setActivating(false)
                                            }
                                        })()
                                    }}
                                >
                                    Activate
                                </Button>
                            </div>
                            <p className={styles.licenseHelper}>
                                Validates remotely on activate. Works offline after first sign-in.
                            </p>
                        </section>
                    </>
                )}

                {isDevToolsUiEnabled() ? (
                    <div className={styles.devToggleRow}>
                        <button
                            type="button"
                            className={styles.devToggle}
                            onClick={() => {
                                if (isPro) {
                                    downgradeToFree()
                                } else {
                                    unlockProLocal("DEV", "dev@local")
                                }
                                onEntitlementChange()
                            }}
                        >
                            <span className={styles.devToggleLabel}>DEV</span>
                            Switch to {isPro ? "Free" : "Pro"}
                        </button>
                        <button
                            type="button"
                            className={styles.devToggle}
                            onClick={() => {
                                resetInsertCount()
                                onEntitlementChange()
                            }}
                        >
                            <span className={styles.devToggleLabel}>DEV</span>
                            Reset Quota
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
