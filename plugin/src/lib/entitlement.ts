/**
 * Free tier: each successful canvas drop counts once (see Library drag complete).
 * Pro: unlimited inserts; unlocked via Polar license key validated remotely.
 * Storage is localStorage — best-effort client-side (see product ToS).
 */

import { validateLicenseRemote } from "@/lib/license-client"

export const FREE_TIER_MAX_CANVAS_INSERTS = 5

const STORAGE_INSERT_COUNT = "bunny-stream-plugin-canvas-inserts-v2"
const STORAGE_PRO = "bunny-stream-plugin-pro-unlocked-v2"
const STORAGE_LICENSE_KEY = "bunny-stream-plugin-license-key-v2"
const STORAGE_LICENSE_EMAIL = "bunny-stream-plugin-license-email-v2"
const STORAGE_INSTANCE_ID = "bunny-stream-plugin-instance-id-v1"
const STORAGE_LAST_VALIDATED_AT = "bunny-stream-plugin-license-validated-at-v1"

/** Re-check license with Polar periodically (ms). */
export const LICENSE_REVALIDATE_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000

export type Tier = "free" | "pro"

export interface EntitlementSnapshot {
    tier: Tier
    insertsUsed: number
    insertsRemaining: number | null
    atLimit: boolean
    nearLimit: boolean
    /** Email from Polar when Pro + validated */
    licenseEmail: string | null
    /** Last successful remote validation (ISO), if any */
    lastValidatedAt: string | null
    /** True when Pro was granted offline / cache only — show reconnect banner */
    licenseStale?: boolean
}

function safeGetStorage(): Storage | null {
    if (typeof window === "undefined") return null
    try {
        return window.localStorage
    } catch {
        return null
    }
}

export function getOrCreateInstanceId(): string {
    const s = safeGetStorage()
    if (!s) return "anonymous"
    let id = s.getItem(STORAGE_INSTANCE_ID)
    if (!id || id.length < 8) {
        id =
            typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `sb-${Date.now()}-${Math.random().toString(36).slice(2)}`
        s.setItem(STORAGE_INSTANCE_ID, id)
    }
    return id
}

export function isProUnlocked(): boolean {
    const s = safeGetStorage()
    if (!s) return false
    return s.getItem(STORAGE_PRO) === "1"
}

function getInsertCount(): number {
    const s = safeGetStorage()
    if (!s) return 0
    const raw = s.getItem(STORAGE_INSERT_COUNT)
    const n = raw ? Number.parseInt(raw, 10) : 0
    return Number.isFinite(n) && n >= 0 ? n : 0
}

function getStoredLicenseKey(): string | null {
    const s = safeGetStorage()
    if (!s) return null
    return s.getItem(STORAGE_LICENSE_KEY)
}

export function getLicenseEmail(): string | null {
    const s = safeGetStorage()
    if (!s) return null
    return s.getItem(STORAGE_LICENSE_EMAIL)
}

export function getLastValidatedAt(): string | null {
    const s = safeGetStorage()
    if (!s) return null
    return s.getItem(STORAGE_LAST_VALIDATED_AT)
}

export function getEntitlementSnapshot(): EntitlementSnapshot {
    if (isProUnlocked()) {
        return {
            tier: "pro",
            insertsUsed: getInsertCount(),
            insertsRemaining: null,
            atLimit: false,
            nearLimit: false,
            licenseEmail: getLicenseEmail(),
            lastValidatedAt: getLastValidatedAt(),
        }
    }

    const insertsUsed = getInsertCount()
    const remaining = Math.max(0, FREE_TIER_MAX_CANVAS_INSERTS - insertsUsed)
    return {
        tier: "free",
        insertsUsed,
        insertsRemaining: remaining,
        atLimit: remaining <= 0,
        nearLimit: remaining > 0 && remaining <= 2,
        licenseEmail: null,
        lastValidatedAt: null,
    }
}

export function recordSuccessfulCanvasInsert(): void {
    if (isProUnlocked()) return
    const s = safeGetStorage()
    if (!s) return
    const next = getInsertCount() + 1
    s.setItem(STORAGE_INSERT_COUNT, String(next))
}

export function recordTemplateInsert(count: number): void {
    if (isProUnlocked()) return
    const s = safeGetStorage()
    if (!s) return
    const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0
    if (safeCount <= 0) return
    const next = getInsertCount() + safeCount
    s.setItem(STORAGE_INSERT_COUNT, String(next))
}

/** Dev/QA helper — wipe the local insert counter so Free-tier behavior can be re-tested. */
export function resetInsertCount(): void {
    const s = safeGetStorage()
    if (!s) return
    s.removeItem(STORAGE_INSERT_COUNT)
}

/** Best-effort undo for free-tier quota after a mistaken drop (cannot remove canvas node without Framer API). */
export function decrementSuccessfulCanvasInsert(): void {
    if (isProUnlocked()) return
    const s = safeGetStorage()
    if (!s) return
    const next = Math.max(0, getInsertCount() - 1)
    s.setItem(STORAGE_INSERT_COUNT, String(next))
}

function persistProUnlock(key: string, email?: string): void {
    const s = safeGetStorage()
    if (!s) return
    s.setItem(STORAGE_PRO, "1")
    s.setItem(STORAGE_LICENSE_KEY, key.trim())
    if (email) s.setItem(STORAGE_LICENSE_EMAIL, email)
    s.setItem(STORAGE_LAST_VALIDATED_AT, new Date().toISOString())
}

export function unlockProLocal(key: string, email?: string): void {
    persistProUnlock(key, email)
}

export function downgradeToFree(): void {
    const s = safeGetStorage()
    if (!s) return
    s.removeItem(STORAGE_PRO)
    s.removeItem(STORAGE_LICENSE_KEY)
    s.removeItem(STORAGE_LICENSE_EMAIL)
    s.removeItem(STORAGE_LAST_VALIDATED_AT)
}

/**
 * Format check only — real validation is remote (or DEV shortcuts).
 * SB-XXXX-XXXX-XXXX or legacy BRNY- prefix.
 */
export function validateLicenseKeyFormat(key: string): boolean {
    const t = key.trim()
    if (t.length === 0) return false
    return /^(SB|BRNY|BUNNY)-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(t)
}

/**
 * Async unlock: calls Polar proxy when `VITE_LICENSE_VALIDATE_URL` is set.
 * DEV without URL: `DEV` unlocks; regex-only unlock for local testing.
 */
export async function tryUnlockWithLicenseKey(key: string): Promise<{ ok: boolean; error?: string }> {
    const trimmed = key.trim()
    if (import.meta.env.DEV && trimmed.toUpperCase() === "DEV") {
        unlockProLocal("DEV", "dev@local")
        return { ok: true }
    }

    const hasRemote = typeof import.meta.env.VITE_LICENSE_VALIDATE_URL === "string" && import.meta.env.VITE_LICENSE_VALIDATE_URL.startsWith("http")

    if (hasRemote) {
        const instanceId = getOrCreateInstanceId()
        const res = await validateLicenseRemote(trimmed, instanceId)
        if (!res.ok) {
            return { ok: false, error: res.error }
        }
        unlockProLocal(trimmed, res.email)
        return { ok: true }
    }

    /** Local / staging without deployed API: format-only gate */
    if (!validateLicenseKeyFormat(trimmed)) {
        return { ok: false, error: "invalid_format" }
    }
    unlockProLocal(trimmed)
    return { ok: true }
}

/**
 * On app load: if Pro and remote URL configured, revalidate if stale.
 */
export async function maybeRevalidateStoredLicense(): Promise<{ stale: boolean; revoked?: boolean }> {
    if (!isProUnlocked()) return { stale: false }

    const hasRemote =
        typeof import.meta.env.VITE_LICENSE_VALIDATE_URL === "string" &&
        import.meta.env.VITE_LICENSE_VALIDATE_URL.startsWith("http")
    if (!hasRemote) return { stale: true }

    const key = getStoredLicenseKey()
    if (!key || key === "DEV") return { stale: false }

    const last = getLastValidatedAt()
    const lastMs = last ? Date.parse(last) : 0
    const now = Date.now()
    if (now - lastMs < LICENSE_REVALIDATE_INTERVAL_MS) {
        return { stale: false }
    }

    const instanceId = getOrCreateInstanceId()
    const res = await validateLicenseRemote(key, instanceId)
    if (!res.ok) {
        downgradeToFree()
        return { stale: false, revoked: true }
    }
    const s = safeGetStorage()
    if (s) s.setItem(STORAGE_LAST_VALIDATED_AT, new Date().toISOString())
    if (res.email) {
        const st = safeGetStorage()
        if (st) st.setItem(STORAGE_LICENSE_EMAIL, res.email)
    }
    return { stale: false }
}
