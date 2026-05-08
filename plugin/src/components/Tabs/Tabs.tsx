import * as React from "react"
import { Tabs as BaseTabs } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

import styles from "./Tabs.module.css"

export const TabsRoot = BaseTabs.Root

export function TabsList({
    className,
    ...rest
}: React.ComponentProps<typeof BaseTabs.List>) {
    return <BaseTabs.List className={cn(styles.list, className)} {...rest} />
}

export function TabsTrigger({
    className,
    ...rest
}: React.ComponentProps<typeof BaseTabs.Tab>) {
    return <BaseTabs.Tab className={cn(styles.trigger, className)} {...rest} />
}

export function TabsPanel({
    className,
    ...rest
}: React.ComponentProps<typeof BaseTabs.Panel>) {
    return <BaseTabs.Panel className={cn(styles.panel, className)} {...rest} />
}
