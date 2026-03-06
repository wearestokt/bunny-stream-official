declare module "framer" {
    import type { CSSProperties } from "react"

    export enum ControlType {
        String = "string",
        Boolean = "boolean",
        Number = "number",
        Enum = "enum",
        Color = "color",
        Font = "font",
        Object = "object",
        Image = "image",
        File = "file",
        Array = "array",
        ComponentInstance = "componentinstance",
        EventHandler = "eventhandler",
        Transition = "transition",
        Link = "link",
        Date = "date",
        ResponsiveImage = "responsiveimage",
        SegmentedEnum = "segmentedenum",
        PageScope = "pagescope",
        BoxShadow = "boxshadow",
        Padding = "padding",
    }

    export function addPropertyControls<P>(
        component: React.ComponentType<P>,
        propertyControls: Record<string, unknown>
    ): void

    export function getPropertyControls(component: React.ComponentType<unknown>): unknown

    export const RenderTarget: {
        current: () => "canvas" | "preview" | "export"
        canvas: "canvas"
        preview: "preview"
        export: "export"
    }
}
