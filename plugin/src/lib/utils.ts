import { clsx, type ClassValue } from "clsx"

/** Compose CSS Module class names + conditional values. Tailwind's twMerge is no longer needed. */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}
