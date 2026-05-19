import type { VercelRequest, VercelResponse } from "@vercel/node"

/**
 * POST { key, instanceId? } — proxies to Polar public customer-portal validate.
 * Env: POLAR_ORGANIZATION_ID (required for production)
 * CORS: * (Framer plugin runs on framer.com origin)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")

    if (req.method === "OPTIONS") {
        res.status(204).end()
        return
    }

    if (req.method !== "POST") {
        res.status(405).json({ ok: false, error: "Method not allowed" })
        return
    }

    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
        key?: string
        instanceId?: string
    }
    const key = body?.key
    if (!key || !String(key).trim()) {
        res.status(400).json({ ok: false, error: "Missing key" })
        return
    }

    const trimmedKey = String(key).trim()
    const reviewKey = (process.env.FRAMER_REVIEW_LICENSE_KEY || "SB-REVW-FRAM-MARK").trim()
    if (reviewKey.length > 0 && trimmedKey.toUpperCase() === reviewKey.toUpperCase()) {
        res.status(200).json({
            ok: true,
            email: "framer-review@wearestokt.com",
        })
        return
    }

    const orgId = process.env.POLAR_ORGANIZATION_ID
    if (!orgId) {
        res.status(500).json({ ok: false, error: "Server misconfigured: POLAR_ORGANIZATION_ID" })
        return
    }

    const polarRes = await fetch("https://api.polar.sh/v1/customer-portal/license-keys/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            key: trimmedKey,
            organization_id: orgId,
        }),
    })

    if (!polarRes.ok) {
        const text = await polarRes.text()
        res.status(400).json({ ok: false, error: text || "Invalid license key" })
        return
    }

    const data = (await polarRes.json()) as Record<string, unknown>
    const customer = data.customer as { email?: string; id?: string } | undefined
    const email = customer?.email
    res.status(200).json({
        ok: true,
        email: email || undefined,
        customerId: customer?.id,
    })
}
