/**
 * Production defaults for marketplace / reviewer builds when Vite env vars are unset.
 * CI or local `.env.local` values always win.
 */

function readViteEnv(key: string): string | undefined {
    const raw = (import.meta.env as Record<string, string | undefined>)[key]
    if (typeof raw !== "string") return undefined
    const trimmed = raw.trim()
    return trimmed.length > 0 ? trimmed : undefined
}

/** Polar license validation (deployed Vercel API). */
export const DEFAULT_LICENSE_VALIDATE_URL =
    "https://stream-bunny-official.vercel.app/api/license/validate"

/** Polar checkout for Stream Bunny Pro. */
export const DEFAULT_POLAR_CHECKOUT_URL =
    "https://buy.polar.sh/polar_cl_R4LcXWdS5IpOSvzIoVAhfH2oFCW12MLJSJa6t42cg1d"

export function resolveLicenseValidateUrl(): string | undefined {
    const raw = readViteEnv("VITE_LICENSE_VALIDATE_URL")
    if (raw?.startsWith("http")) return raw
    return DEFAULT_LICENSE_VALIDATE_URL
}

export function resolvePolarCheckoutUrl(): string | undefined {
    const raw = readViteEnv("VITE_POLAR_CHECKOUT_URL")
    if (raw?.startsWith("http")) return raw
    return DEFAULT_POLAR_CHECKOUT_URL
}
