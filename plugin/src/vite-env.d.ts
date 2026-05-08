/// <reference types="vite/client" />

interface ImportMetaEnv {
    /**
     * When `"true"`, the plugin injects local `.tsx` sources into the project (maintainers only).
     * Marketplace builds should omit this so only hosted module URLs are used.
     */
    readonly VITE_STREAM_BUNNY_EMBED_SOURCES?: string

    readonly VITE_SB_MODULE_BunnyVideoPlayer?: string
    readonly VITE_SB_MODULE_BunnyPlayPauseButton?: string
    readonly VITE_SB_MODULE_BunnyVolumeSlider?: string
    readonly VITE_SB_MODULE_BunnyProgressBar?: string
    readonly VITE_SB_MODULE_BunnyTimeDisplay?: string
    readonly VITE_SB_MODULE_BunnyQualityPickerButton?: string
    readonly VITE_SB_MODULE_BunnyFullscreenButton?: string

    /** Absolute URL of deployed `POST /api/license/validate` (Polar proxy). */
    readonly VITE_LICENSE_VALIDATE_URL?: string
    /** Polar product checkout URL for Pro tier */
    readonly VITE_POLAR_CHECKOUT_URL?: string
    /** MP4 or direct video URL for dashboard tutorial modal */
    readonly VITE_TUTORIAL_VIDEO_URL?: string
    /** Optional changelog link for Latest update card */
    readonly VITE_CHANGELOG_URL?: string
    /** Feature request / roadmap link (defaults to GitHub issues) */
    readonly VITE_FEATURE_REQUEST_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
