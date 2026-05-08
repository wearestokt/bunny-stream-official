import type { LibraryModuleKey } from "@/component-modules"

export type ComponentSectionId = "player" | "controls" | "soon"

export type CatalogEntry =
    | {
          kind: "module"
          baseName: LibraryModuleKey
          section: ComponentSectionId
          subtitle: string
          pro?: boolean
      }
      | {
            kind: "soon"
            id: "captions-soon" | "chapters-soon"
            displayName: string
            subtitle: string
      }

/** Single ordered list — filter by tab + search in UI */
export const COMPONENT_CATALOG: CatalogEntry[] = [
    {
        kind: "module",
        baseName: "BunnyVideoPlayer",
        section: "player",
        subtitle: "HLS · adaptive quality",
    },
    {
        kind: "module",
        baseName: "BunnyPlayPauseButton",
        section: "controls",
        subtitle: "Toggle button",
    },
    {
        kind: "module",
        baseName: "BunnyProgressBar",
        section: "controls",
        subtitle: "Seekable scrubber",
    },
    {
        kind: "module",
        baseName: "BunnyTimeDisplay",
        section: "controls",
        subtitle: "00:00 / 00:00",
    },
    {
        kind: "module",
        baseName: "BunnyVolumeSlider",
        section: "controls",
        subtitle: "Mute · slider",
    },
    {
        kind: "module",
        baseName: "BunnyQualityPickerButton",
        section: "controls",
        subtitle: "Renditions · adaptive",
        pro: true,
    },
    {
        kind: "module",
        baseName: "BunnyFullscreenButton",
        section: "controls",
        subtitle: "Toggle button",
    },
    {
        kind: "soon",
        id: "captions-soon",
        displayName: "Captions",
        subtitle: "Subtitle tracks",
    },
    {
        kind: "soon",
        id: "chapters-soon",
        displayName: "Chapter markers",
        subtitle: "Skip around",
    },
]

export function catalogRowKey(entry: CatalogEntry): string {
    if (entry.kind === "module") return entry.baseName
    return entry.id
}
