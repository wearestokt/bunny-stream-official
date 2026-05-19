import * as React from "react"

import { Alert } from "@/components/Alert/Alert"
import { Button } from "@/components/Button/Button"
import { DialogActions, DialogClose, DialogPopup } from "@/components/Dialog/Dialog"
import { Input } from "@/components/Input/Input"
import {
    BTN_BUY_POLAR,
    BTN_UNLOCK,
    LICENSE_DEV_HINT,
    LICENSE_ERROR_GENERIC,
    LICENSE_INVALID,
    LICENSE_LABEL,
    LICENSE_PLACEHOLDER,
    POLAR_CHECKOUT_FALLBACK,
    UPGRADE_BULLETS,
    UPGRADE_DIALOG_BODY,
    UPGRADE_DIALOG_TITLE,
} from "@/copy"
import { isDevToolsUiEnabled } from "@/lib/dev-tools"
import { tryUnlockWithLicenseKey } from "@/lib/entitlement"

import styles from "./UpgradeDialog.module.css"

export function UpgradeDialog({
    open,
    onOpenChange,
    onUnlocked,
    polarCheckoutUrl,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onUnlocked: () => void
    polarCheckoutUrl: string
}) {
    const [key, setKey] = React.useState("")
    const [error, setError] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(false)

    const checkout = polarCheckoutUrl?.trim() || POLAR_CHECKOUT_FALLBACK

    React.useEffect(() => {
        if (!open) {
            setKey("")
            setError(null)
            setLoading(false)
        }
    }, [open])

    const submit = async () => {
        setLoading(true)
        setError(null)
        const res = await tryUnlockWithLicenseKey(key)
        setLoading(false)
        if (res.ok) {
            onUnlocked()
            onOpenChange(false)
            return
        }
        if (res.error === "invalid_format") {
            setError(LICENSE_INVALID)
            return
        }
        setError(res.error ?? LICENSE_ERROR_GENERIC)
    }

    return (
        <DialogPopup
            open={open}
            onOpenChange={onOpenChange}
            title={UPGRADE_DIALOG_TITLE}
        >
            <p className={styles.priceLine}>{UPGRADE_DIALOG_BODY}</p>
            <ul className={styles.bullets}>
                {UPGRADE_BULLETS.map((b) => (
                    <li key={b}>{b}</li>
                ))}
            </ul>
            <Button
                variant="primary"
                fullWidth
                onClick={() => window.open(checkout, "_blank", "noopener,noreferrer")}
            >
                {BTN_BUY_POLAR}
            </Button>
            <div className={styles.licenseGroup}>
                <label htmlFor="license-input" className={styles.label}>
                    {LICENSE_LABEL}
                </label>
                <Input
                    id="license-input"
                    value={key}
                    onChange={(e) => {
                        setKey(e.target.value)
                        setError(null)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") void submit()
                    }}
                    placeholder={LICENSE_PLACEHOLDER}
                    disabled={loading}
                    invalid={Boolean(error)}
                    autoComplete="off"
                />
                {error ? (
                    <Alert tone="danger" title="Could not unlock">
                        {error}
                    </Alert>
                ) : null}
                {isDevToolsUiEnabled() ? <p className={styles.devHint}>{LICENSE_DEV_HINT}</p> : null}
            </div>
            <DialogActions>
                <Button variant="primary" onClick={() => void submit()} disabled={loading}>
                    {loading ? "Checking…" : BTN_UNLOCK}
                </Button>
                <DialogClose render={<Button variant="secondary" disabled={loading} fullWidth />}>
                    Cancel
                </DialogClose>
            </DialogActions>
        </DialogPopup>
    )
}
