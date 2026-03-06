import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

interface TabsContextValue {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ defaultValue, value: controlledValue, onValueChange, className, children, ...props }, ref) => {
        const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? "")
        const isControlled = controlledValue !== undefined
        const value = isControlled ? controlledValue : uncontrolledValue

        const handleValueChange = React.useCallback(
            (newValue: string) => {
                if (!isControlled) setUncontrolledValue(newValue)
                onValueChange?.(newValue)
            },
            [isControlled, onValueChange]
        )

        const contextValue = React.useMemo(
            () => ({ value, onValueChange: handleValueChange }),
            [value, handleValueChange]
        )

        return (
            <TabsContext.Provider value={contextValue}>
                <div ref={ref} className={cn("flex flex-col flex-1 min-h-0", className)} {...props}>
                    {children}
                </div>
            </TabsContext.Provider>
        )
    }
)
Tabs.displayName = "Tabs"

const tabsListVariants = cva("flex flex-row w-full min-w-0 gap-1", {
    variants: {
        variant: {
            default: "",
            line: "",
        },
    },
    defaultVariants: {
        variant: "default",
    },
})

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof tabsListVariants>
>(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        role="tablist"
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
    />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext)
        if (!context) throw new Error("TabsTrigger must be used within Tabs")

        const isSelected = context.value === value

        return (
            <button
                ref={ref}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-state={isSelected ? "active" : "inactive"}
                data-selected={isSelected ? "" : undefined}
                onClick={() => context.onValueChange(value)}
                className={cn(
                    "flex-1 min-w-0 inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium",
                    "font-[var(--font-geist-mono)] truncate rounded-md",
                    "text-[var(--plugin-text-muted,#999)] cursor-pointer transition-colors",
                    "hover:text-[var(--plugin-orange,#FF4D1D)] hover:bg-[rgba(255,77,29,0.15)]",
                    "data-[selected]:text-[var(--plugin-orange,#FF4D1D)] data-[selected]:bg-[rgba(255,77,29,0.15)]",
                    "disabled:opacity-50 disabled:cursor-default disabled:pointer-events-none",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext)
        if (!context) throw new Error("TabsContent must be used within Tabs")

        if (context.value !== value) return null

        return (
            <div
                ref={ref}
                role="tabpanel"
                className={cn("flex-1 overflow-auto outline-none", className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
