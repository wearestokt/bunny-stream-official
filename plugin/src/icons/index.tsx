/**
 * Inline SVG icons. All paths use stroke="currentColor" so the rendering color is
 * controlled by the parent's `color`. Stroke width 1.5 matches Framer's inspector
 * iconography (CURSOR-framer-plugin.md §9). Default size 16x16.
 */
import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & { title?: string }

const baseProps = (title?: string) => ({
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": title ? undefined : true,
    role: title ? "img" : undefined,
})

function Svg({ title, children, ...rest }: IconProps & { children: React.ReactNode }) {
    return (
        <svg {...baseProps(title)} {...rest}>
            {title ? <title>{title}</title> : null}
            {children}
        </svg>
    )
}

export const PlayIcon = (p: IconProps) => (
    <Svg {...p}>
        <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
    </Svg>
)

export const VideoIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="m22 8-6 4 6 4V8Z" />
        <rect width="14" height="12" x="2" y="6" rx="2" />
    </Svg>
)

export const VolumeIcon = (p: IconProps) => (
    <Svg {...p}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </Svg>
)

export const GaugeIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="m12 14 4-4" />
        <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </Svg>
)

export const ClockIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
    </Svg>
)

export const SettingsIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M20 7h-9" />
        <path d="M14 17H5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="7" cy="7" r="3" />
    </Svg>
)

export const CogIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" />
        <circle cx="12" cy="12" r="3" />
    </Svg>
)

export const FullscreenIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </Svg>
)

export const SubtitlesIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M7 13h4" />
        <path d="M15 13h2" />
        <path d="M7 17h2" />
        <path d="M13 17h4" />
        <rect width="18" height="14" x="3" y="5" rx="2" />
    </Svg>
)

export const PictureInPictureIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M2 10V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3" />
        <rect width="10" height="7" x="12" y="13" rx="2" />
    </Svg>
)

export const SearchIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </Svg>
)

export const ChevronLeftIcon = (p: IconProps) => (
    <Svg {...p}>
        <polyline points="15 18 9 12 15 6" />
    </Svg>
)

export const ChevronRightIcon = (p: IconProps) => (
    <Svg {...p}>
        <polyline points="9 18 15 12 9 6" />
    </Svg>
)

export const ArrowRightIcon = (p: IconProps) => (
    <Svg {...p}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </Svg>
)

export const ArrowUpRightIcon = (p: IconProps) => (
    <Svg {...p}>
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
    </Svg>
)

export const ExternalLinkIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M14 5h5v5" />
        <path d="M10 14 19 5" />
        <path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    </Svg>
)

export const XIcon = (p: IconProps) => (
    <Svg {...p}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
)

export const CheckIcon = (p: IconProps) => (
    <Svg {...p}>
        <polyline points="20 6 9 17 4 12" />
    </Svg>
)

export const GripVerticalIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="9" cy="6" r="1" fill="currentColor" />
        <circle cx="9" cy="12" r="1" fill="currentColor" />
        <circle cx="9" cy="18" r="1" fill="currentColor" />
        <circle cx="15" cy="6" r="1" fill="currentColor" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
        <circle cx="15" cy="18" r="1" fill="currentColor" />
    </Svg>
)

export const LayoutGridIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
    </Svg>
)

export const MonitorPlayIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="m10 7 5 3-5 3z" fill="currentColor" stroke="none" />
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <path d="M12 17v4" />
        <path d="M8 21h8" />
    </Svg>
)

export const ZapIcon = (p: IconProps) => (
    <Svg {...p}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Svg>
)

export const HelpCircleIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </Svg>
)

export const UserIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </Svg>
)

export const FileTextIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
    </Svg>
)

export const GithubIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </Svg>
)

export const MessageCircleIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </Svg>
)

export const SparklesIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M12 3 9.91 8.09 5 10l4.91 1.91L12 17l1.91-4.91L19 10l-4.91-2.09L12 3z" fill="currentColor" stroke="none" />
        <path d="M5 17v3" />
        <path d="M19 17v3" />
        <path d="M3 19h4" />
        <path d="M17 19h4" />
    </Svg>
)

export const LockIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect width="14" height="10" x="5" y="11" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
)

export const CreditCardIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
    </Svg>
)

export const SignOutIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
    </Svg>
)

export const StarIcon = (p: IconProps) => (
    <Svg {...p}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none" />
    </Svg>
)

