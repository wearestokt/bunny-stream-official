/**
 * Stream Bunny plugin component sources — imported at build time for createCodeFile.
 * Paths are relative to plugin/ (parent of src/).
 */
// @ts-expect-error - Vite ?raw import
import storeSource from "../../components/BunnyVideoStore.tsx?raw"
// @ts-expect-error - Vite ?raw import
import playerSource from "../../components/BunnyVideoPlayer.tsx?raw"
// @ts-expect-error - Vite ?raw import
import playPauseSource from "../../components/BunnyPlayPauseButton.tsx?raw"
// @ts-expect-error - Vite ?raw import
import volumeSource from "../../components/BunnyVolumeSlider.tsx?raw"
// @ts-expect-error - Vite ?raw import
import progressSource from "../../components/BunnyProgressBar.tsx?raw"
// @ts-expect-error - Vite ?raw import
import timeDisplaySource from "../../components/BunnyTimeDisplay.tsx?raw"
// @ts-expect-error - Vite ?raw import
import qualityPickerSource from "../../components/BunnyQualityPickerButton.tsx?raw"
// @ts-expect-error - Vite ?raw import
import fullscreenSource from "../../components/BunnyFullscreenButton.tsx?raw"
// @ts-expect-error - Vite ?raw import
import idleFadeSource from "../../components/BunnyIdleFade.tsx?raw"

/** Maintainer embed only — standalone idle override (never marketplace). */
export const BUNNY_IDLE_FADE_EMBED_FILES: { name: string; code: string }[] = [
    { name: "BunnyIdleFade.tsx", code: idleFadeSource as string },
]

export const COMPONENT_FILES: { name: string; code: string }[] = [
    { name: "BunnyVideoStore.tsx", code: storeSource as string },
    { name: "BunnyVideoPlayer.tsx", code: playerSource as string },
    { name: "BunnyPlayPauseButton.tsx", code: playPauseSource as string },
    { name: "BunnyVolumeSlider.tsx", code: volumeSource as string },
    { name: "BunnyProgressBar.tsx", code: progressSource as string },
    { name: "BunnyTimeDisplay.tsx", code: timeDisplaySource as string },
    { name: "BunnyQualityPickerButton.tsx", code: qualityPickerSource as string },
    { name: "BunnyFullscreenButton.tsx", code: fullscreenSource as string },
    { name: "BunnyIdleFade.tsx", code: idleFadeSource as string },
]
