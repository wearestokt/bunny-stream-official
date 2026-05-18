import type { LibraryModuleKey } from "@/component-modules"

export type ComponentSectionId = "player" | "controls" | "codeOverride"

/** Sections where draggable modules and upcoming rows can appear (not code overrides). */
export type CatalogContentSectionId = "player" | "controls"

export type CodeOverrideHandlerId = "bunny-idle-fade"

export type CatalogEntry =
    | {
          kind: "module"
          baseName: LibraryModuleKey
          section: CatalogContentSectionId
          subtitle: string
          pro?: boolean
      }
      | {
            kind: "code-override"
            id: string
            handlerId: CodeOverrideHandlerId
            title: string
            subtitle: string
            pro?: boolean
      }
      | {
            kind: "soon"
            id: "captions-soon" | "chapters-soon"
            section: CatalogContentSectionId
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
        section: "controls",
        displayName: "Captions",
        subtitle: "Subtitle tracks",
    },
    {
        kind: "soon",
        id: "chapters-soon",
        section: "controls",
        displayName: "Chapter markers",
        subtitle: "Skip around",
    },
    {
        kind: "code-override",
        id: "bunny-idle-fade",
        handlerId: "bunny-idle-fade",
        title: "Idle Fade",
        subtitle:
            "Pro · Fades the layer after pointer idle. Edit delay in code.",
        pro: true,
    },
]

export function catalogRowKey(entry: CatalogEntry): string {
    if (entry.kind === "module") return entry.baseName
    if (entry.kind === "code-override") return entry.id
    return entry.id
}
