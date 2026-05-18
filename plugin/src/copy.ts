/** User-facing strings: trial, upgrade, OSS — keep aligned with eventual Terms of Service. */

export const PLUGIN_TITLE = "Stream Bunny"

export const PLUGIN_VERSION = "v1.4.0"

/** Dashboard (Paper alignment) */
export const DASHBOARD_PAPER_HERO_TITLE = "Bunny Stream (HLS) into your Canva"

export const DASHBOARD_PAPER_HERO_BODY =
    "Stream Bunny lets you drop Bunny.net Stream players with adaptive HLS, buffering, and quality switching — Netflix/YouTube-style playback without exporting or compressing files. Build the UI in your layout with separate Player + Controls, fully skinnable."

export const DASHBOARD_PAPER_LEARN_MORE = "Learn more"

export const WHATS_NEW_LABEL = "WHAT'S NEW · MAY 5"

export const WHATS_NEW_VERSION = "v1.4.0"

export const WHATS_NEW_TITLE = "Quality Picker for HLS streams"

export const WHATS_NEW_BODY =
    "Drop it beside any Player so viewers can switch HLS rendition. Pro add-on."

/** Differentiator vs generic embed players: adaptive HLS via Bunny CDN. */
export const PLUGIN_SUBTITLE = "HLS streaming components for Framer"

export const TRIAL_DISCLAIMER =
    "Free tier includes canvas inserts for evaluation. Upgrade for unlimited inserts in this plugin."

/** One-line trial note when vertical space is constrained (tabbed 700px shell). */
export const TRIAL_DISCLAIMER_COMPACT =
    "Free tier: limited canvas inserts — upgrade for unlimited."

export const INSERTS_REMAINING = (n: number) =>
    `${n} free ${n === 1 ? "insert" : "inserts"} remaining`

export const INSERTS_DEPLETED =
    "You've used your free canvas inserts in this plugin. Upgrade once for unlimited inserts."

export const BADGE_FREE = "Free"

export const BADGE_PRO = "Pro"

/** Bottom strip when tier is Pro (replaces upgrade CTA so the shell matches mockups). */
export const FOOTER_PRO_STATUS = "Pro · Unlimited inserts"

/** Opens the license / unlimited-inserts flow (same as footer CTA). */
export const BTN_UPGRADE = "Upgrade"

/** Alternative footer label if you prefer signup framing over “upgrade”. Same action as `BTN_UPGRADE`. */
export const BTN_ACCOUNT_SIGN_UP = "Account sign-up"

/**
 * Label for the pinned footer button on **every tab**. Switch between `BTN_UPGRADE` and
 * `BTN_ACCOUNT_SIGN_UP` without changing behavior (both open the upgrade dialog).
 */
export const BTN_FOOTER_PRIMARY = BTN_UPGRADE

export const UPGRADE_DIALOG_TITLE = "Stream Bunny Pro"

export const UPGRADE_DIALOG_BODY = "$49 once · lifetime updates"

export const UPGRADE_BULLETS = [
    "Every template, Pro-only included",
    "Unlimited inserts on every workspace",
    "Lifetime updates, no subscription",
] as const

export const LICENSE_LABEL = "License key"

export const LICENSE_PLACEHOLDER = "SB-XXXX-XXXX-XXXX"

export const BTN_UNLOCK = "Unlock"

export const LICENSE_INVALID = "That key doesn't match our format. Check your purchase email or paste again."

export const LICENSE_DEV_HINT = "Dev: enter DEV to unlock."

export const PURCHASE_CTA_NOTE =
    "Checkout runs on Polar (secure). After purchase, paste the license key emailed to you below."

export const BTN_BUY_POLAR = "Buy on Polar · $49"

export const PRO_PRICE_LINE = "$49 once · lifetime updates"

export const PLAN_LABEL = "Plan"

export const INSERTS_COUNT_LABEL = (used: number, max: number) => `${used} / ${max} inserts`

/** Dashboard + screen footers — primary conversion CTA */
export const BTN_FOOTER_PRIMARY_LONG = "Upgrade to Pro · unlimited"

export const FOOTER_PRO_STATUS_COMPACT = FOOTER_PRO_STATUS

/** Dashboard */
export const DASHBOARD_HERO_TITLE = "What will you build?"

export const DASHBOARD_HERO_SUBTITLE =
    "Drop a Bunny.net Stream player on the canvas. HLS, adaptive quality, native Framer controls."

export const DASHBOARD_TUTORIAL_TITLE = "Get started in 60 seconds"

export const DASHBOARD_TUTORIAL_SUBTITLE = "Watch the setup walkthrough"

export const TILE_COMPONENTS_TITLE = "Components"

export const TILE_COMPONENTS_SUB = "Player & controls"

export const TILE_TEMPLATES_TITLE = "Templates"

export const TILE_TEMPLATES_SUB = "Ready players"

export const TILE_QUICK_TITLE = "Quick Start"

export const TILE_QUICK_SUB = "6-step walkthrough"

export const TILE_HELP_TITLE = "Help"

export const TILE_ACCOUNT_TITLE = "Account"

export const TILE_ACCOUNT_SUB = "Plan & license"

export const LATEST_UPDATE_LABEL = "Latest update"

export const TAG_UNLOCK_PRO = "Unlock with Pro"

export const TAG_COMING_SOON = "Coming soon"

/** Components screen */
export const SCREEN_COMPONENTS_TITLE = "Components"

export const CODE_OVERRIDE_ADD_TO_PROJECT = "Add to project"
export const CODE_OVERRIDE_IN_PROJECT = "In project"
export const CODE_OVERRIDE_ADDING = "Adding…"
export const CODE_OVERRIDE_ADD_SUCCESS =
    "Added BunnyIdleFade.tsx (re-exports from the Stream Bunny library). Apply withBunnyIdleFade as a Code Override."
export const CODE_OVERRIDE_ALREADY_PRESENT = "BunnyIdleFade.tsx is already in this project."
export const CODE_OVERRIDE_NOT_CONFIGURED =
    "Publish BunnyIdleFade from the Stream Bunny library and set VITE_SB_MODULE_BunnyIdleFade in the plugin build."

export const SCREEN_COMPONENTS_SUB = "Drag any item onto the canvas."

export const SEARCH_PLACEHOLDER = "Search components"

export const TAB_LAYOUT = "Layout"

export const LAYOUT_TAB_EMPTY = "No layout-only pieces yet — use Recommended or Controls."

export const EMPTY_SEARCH_TITLE = (q: string) => `No components match “${q}”`

export const EMPTY_SEARCH_BODY =
    "Try another term or pick a suggestion below. Request a missing component from the link."

export const EMPTY_SEARCH_REQUEST = "Request →"

export const TOAST_INSERTED_TITLE = "Video Player added"

export const TOAST_INSERTED_SUB = "Selected on canvas"

export const TOAST_UNDO = "Undo"

/** Templates */
export const TEMPLATES_SCREEN_TITLE = "Templates"

export const TEMPLATES_SCREEN_SUB = "Drop a fully assembled player. 4 layouts."

export const TEMPLATES_PRO_TITLE = "Templates are a Pro feature"

export const TEMPLATES_PRO_SUB = "Unlock all 4 layouts · $49 once"

export const BTN_UNLOCK_TEMPLATES = "Unlock"

/** Account */
export const SCREEN_ACCOUNT_TITLE = "Account"

export const SCREEN_ACCOUNT_SUB = "Manage your plan and license."

export const CURRENT_PLAN_LABEL = "Current plan"

export const CANVAS_INSERTS_LABEL = "Canvas inserts"

export const ACCOUNT_RESET_NOTE = "Resets when you upgrade or buy a license."

export const STREAM_BUNNY_PRO_TITLE = "Stream Bunny Pro"

export const THANKS_PRO_TITLE = "Thanks for going Pro"

export const THANKS_PRO_SUB = "Everything below is unlocked"

export const UPGRADE_FEATURES = [
    "Unlimited canvas inserts",
    "All 4 templates and Pro components",
    "Priority email support",
] as const

export const BTN_UPGRADE_ACCOUNT = "Upgrade to Pro"

export const LICENSE_LOST = "Lost it?"

export const LICENSE_SIGN_OUT = "Sign out"

export const BTN_APPLY_LICENSE = "Apply"

export const ACCOUNT_PRIVACY = "Privacy"

export const ACCOUNT_TERMS = "Terms"

export const ACCOUNT_CONTACT = "Contact support"

export const LICENSE_ACTIVE_MANAGE = "Manage"

export const LICENSE_OFFLINE_WARNING =
    "Could not verify license online. You still have Pro until we can reconnect."

export const LICENSE_REVOKED =
    "Your license is no longer valid. Upgrade again or contact support."

/** Help list rows */
export const HELP_ROW_DOCS_TITLE = "Documentation"

export const HELP_ROW_DOCS_SUB = "Setup, props, FAQs"

export const HELP_ROW_QUICK_TITLE = "Quick start"

export const HELP_ROW_QUICK_SUB = "60-second walkthrough"

export const HELP_ROW_SUPPORT_TITLE = "Contact support"

export const HELP_ROW_SUPPORT_SUB = "Email Jay · 24h reply"

export const HELP_ROW_FEATURES_TITLE = "Feature requests"

export const HELP_ROW_FEATURES_SUB = "Vote on the roadmap"

export const HELP_ROW_OSS_TITLE = "Open source"

export const HELP_ROW_OSS_SUB = "Star, fork, contribute on GitHub"

export const HELP_STATUS_OK = "All systems operational"

export const HELP_STATUS_VERSION = "v1.4.0 · status"

/** Latest update card */
export const LATEST_UPDATE_VERSION = "v1.4.0"

export const LATEST_UPDATE_TITLE = "Quality picker respects HLS levels"

/** Tutorial modal */
export const TUTORIAL_DIALOG_TITLE = "Quick setup walkthrough"

export const TUTORIAL_DIALOG_EMPTY =
    "Set VITE_TUTORIAL_VIDEO_URL in your build to embed the walkthrough video."

/** Polar checkout — set at build time */
export const POLAR_CHECKOUT_FALLBACK = "https://polar.sh"

export const LICENSE_ERROR_GENERIC = "Could not unlock. Check your key or try again."

export const OSS_LINE = "Open source on GitHub"

export const OSS_CONTRIBUTE = "Contributions welcome"

export const HELP_DOCS = "Full documentation"

export const HELP_DASHBOARD = "bunny.net Stream dashboard"

export const HELP_ISSUES = "Report an issue"

export const TEMPLATES_EMPTY_TITLE = "Templates"

export const TEMPLATES_EMPTY_BODY =
    "Starter screen layouts are coming soon. For now, drag components from the library below."

export const TAB_LIBRARY = "Library"

export const TAB_GUIDE = "Guide"

export const TAB_HELP = "Help Center"

/** Referral entry point for Stream sign-up (Library / Video IDs + billing). */
export const URL_STREAM_REFERRAL = "https://bunny.net/stream/"

export const QUICK_START_TITLE = "Quick start"

export const QUICK_START_ACCOUNT_TRIGGER = "Create your Bunny.net account"

export const QUICK_START_ACCOUNT_LEAD =
    "Stream Bunny uses Bunny.net Stream. Sign up free — you'll copy Library ID and Video ID from the dashboard into the Video Player."

export const QUICK_START_ACCOUNT_AFTER_LINK =
    "When you're ready, come back here and continue with the steps below."

export const QUICK_START_INSTALL_BODY =
    "Drag published Stream Bunny components from the plugin — hosted modules are inserted on the canvas without adding source files to Code."

export const BTN_OPEN_BUNNY_STREAM = "Open bunny.net Stream"

export const HELP_CENTER_TITLE = "Help Center"

export const HELP_CENTER_INTRO =
    "These components play adaptive HLS from Bunny's CDN—not a one-off pasted video URL—so playback adapts to network conditions. Manage videos, encoding, and delivery in your Bunny dashboard."

export const BILLING_CARD_TITLE = "Account & bunny.net Stream"

export const BILLING_CARD_BODY =
    "Use the same Bunny.net account for Stream billing and API credentials. Open bunny.net Stream below to create an account or sign in."

export const LIBRARY_RECOMMENDED = "Recommended"

export const LIBRARY_CONTROLS = "Controls"

export const LOADING_LABEL = "Loading components…"

export const ERROR_RETRY = "Try again"

/** Shown when published Framer module URLs are missing (default production behavior). */
export const ERROR_MODULE_URLS_TITLE = "Hosted components not configured"

export const ERROR_MODULE_URLS_BODY =
    "This plugin inserts published Stream Bunny components only — it does not add source files to your project. The distributor must set Framer module URLs at build time (see plugin README)."

/** Appended in development when URL env vars are unset. */
export const ERROR_MODULE_URLS_DEV_HINT =
    "For local dev, add plugin/.env.local with each VITE_SB_MODULE_* set to that component’s Framer “Copy URL” (hosted modules — no .tsx in the project). Only set VITE_STREAM_BUNNY_EMBED_SOURCES=true if you deliberately need to inject sources."

/** Shown at top of UI when maintainer embed mode is on (injects .tsx into the open project). */
export const EMBED_SOURCE_MODE_TITLE = "Source inject mode"

export const EMBED_SOURCE_MODE_BODY =
    "This build adds editable .tsx files under Code. Remove VITE_STREAM_BUNNY_EMBED_SOURCES and use VITE_SB_MODULE_* URLs for hosted components only."

/** Accordion section: footer links in Help Center tab. */
export const HELP_LINKS_SECTION = "Documentation & links"

export const FOOTER_MADE_BY = "Made by"

export const URL_README =
    "https://github.com/wearestokt/bunny-stream-official/blob/main/README.md"

/** Hosted docs index (GitHub Pages when enabled, else repo `docs/` tree). */
export const URL_DOCS_DEFAULT =
    "https://github.com/wearestokt/bunny-stream-official/tree/main/docs"

export const URL_DOCS =
    (import.meta.env.VITE_DOCS_URL as string | undefined)?.trim() || URL_DOCS_DEFAULT

/** Bunny ID walkthrough — works on GitHub; Pages builds use `VITE_DOCS_URL` + `/bunny-stream-setup#ids`. */
export const URL_BUNNY_SETUP_IDS = (() => {
    const docs = URL_DOCS
    if (docs.includes("github.io")) {
        return `${docs.replace(/\/$/, "")}/bunny-stream-setup#ids`
    }
    if (docs.includes("/tree/") && docs.endsWith("/docs")) {
        return `${docs.replace("/tree/", "/blob/")}/bunny-stream-setup.md#ids`
    }
    return "https://github.com/wearestokt/bunny-stream-official/blob/main/docs/bunny-stream-setup.md#ids"
})()

export const URL_REPO = "https://github.com/wearestokt/bunny-stream-official"

export const URL_ISSUES = "https://github.com/wearestokt/bunny-stream-official/issues"

export const URL_CHANGELOG_DEFAULT =
    "https://github.com/wearestokt/bunny-stream-official/blob/main/CHANGELOG.md"

export const URL_CHANGELOG =
    (import.meta.env.VITE_CHANGELOG_URL as string | undefined)?.trim() ||
    URL_CHANGELOG_DEFAULT

export const URL_FEATURE_REQUEST =
    (import.meta.env.VITE_FEATURE_REQUEST_URL as string | undefined)?.trim() || URL_ISSUES

export const URL_SUPPORT_EMAIL = "mailto:hello@wearestokt.com?subject=Stream%20Bunny%20support"

/** Footer “dashboard” link — same bunny.net Stream entry as referral. */
export const URL_BUNNY_STREAM = URL_STREAM_REFERRAL

export const URL_STOKT = "https://wearestokt.com"

export const URL_BUNNY_REF = "https://bunny.net?ref=f9ztcmeo63"
