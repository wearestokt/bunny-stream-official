import type { VercelRequest, VercelResponse } from "@vercel/node"

/**
 * Polar webhooks (optional) — log payload for now; extend with DB / email when needed.
 * Verify signature in production: https://docs.polar.sh/integrate/webhooks
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        res.status(405).end("Method not allowed")
        return
    }
    // eslint-disable-next-line no-console
    console.info("[polar-webhook]", req.headers["webhook-id"], JSON.stringify(req.body).slice(0, 500))
    res.status(200).json({ received: true })
}
