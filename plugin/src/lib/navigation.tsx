import React, { createContext, useCallback, useContext, useMemo, useState } from "react"

export type ScreenId =
    | "dashboard"
    | "components"
    | "templates"
    | "quickstart"
    | "help"
    | "account"

type NavigationContextValue = {
    screen: ScreenId
    push: (s: ScreenId) => void
    back: () => void
    replace: (s: ScreenId) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
    const [stack, setStack] = useState<ScreenId[]>(["dashboard"])

    const push = useCallback((s: ScreenId) => {
        setStack((prev) => [...prev, s])
    }, [])

    const back = useCallback(() => {
        setStack((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)))
    }, [])

    const replace = useCallback((s: ScreenId) => {
        setStack((prev) => [...prev.slice(0, -1), s])
    }, [])

    const value = useMemo<NavigationContextValue>(
        () => ({
            screen: stack[stack.length - 1] ?? "dashboard",
            push,
            back,
            replace,
        }),
        [stack, push, back, replace]
    )

    return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation(): NavigationContextValue {
    const ctx = useContext(NavigationContext)
    if (!ctx) throw new Error("useNavigation must be used within NavigationProvider")
    return ctx
}
