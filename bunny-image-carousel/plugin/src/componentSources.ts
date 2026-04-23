/**
 * Carousel component source — sibling file at repo `bunny-image-carousel/BunnyImageCarousel.tsx`.
 */
// @ts-expect-error - Vite ?raw import
import carouselSource from "../../BunnyImageCarousel.tsx?raw"

export const COMPONENT_FILES: { name: string; code: string }[] = [
    { name: "BunnyImageCarousel.tsx", code: carouselSource as string },
]
