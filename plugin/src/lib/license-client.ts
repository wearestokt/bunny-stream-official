/**
 * Validates a Stream Bunny Pro license via backend proxy (Polar customer-portal validate).
 * Set `VITE_LICENSE_VALIDATE_URL` to your deployed `/api/license/validate` absolute URL.
 */

export type LicenseValidateResponse =
    | {
          ok: true
          email?: string
          /** Polar customer id if returned */
          customerId?: string
      }
    | { ok: false; error: string; status?: number }

function getValidateUrl(): string | undefined {
    const raw = import.meta.env.VITE_LICENSE_VALIDATE_URL as string | undefined
    if (typeof raw === "string" && raw.trim().startsWith("http")) return raw.trim()
    return undefined
}

export async function validateLicenseRemote(key: string, instanceId: string): Promise<LicenseValidateResponse> {
    const url = getValidateUrl()
    if (!url) {
        return { ok: false, error: "License validation URL is not configured (VITE_LICENSE_VALIDATE_URL)." }
    }

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: key.trim(), instanceId }),
        })
        const json = (await res.json()) as unknown
        if (!res.ok) {
            const err =
                typeof json === "object" && json !== null && "error" in json && typeof (json as { error?: unknown }).error === "string"
                    ? (json as { error: string }).error
                    : `Validation failed (${res.status})`
            return { ok: false, error: err, status: res.status }
        }
        if (typeof json === "object" && json !== null && "ok" in json && (json as { ok?: unknown }).ok === true) {
            const j = json as { email?: string; customerId?: string }
            return { ok: true, email: j.email, customerId: j.customerId }
        }
        return { ok: false, error: "Unexpected response from license server." }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Network error" }
    }
}
