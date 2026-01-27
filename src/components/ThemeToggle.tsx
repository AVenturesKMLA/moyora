"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-11 h-6" /> // Placeholder to prevent hydration mismatch
    }

    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    return (
        <div className="flex items-center space-x-2">
            <Switch
                id="theme-mode"
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
            />
            <span className="sr-only">Toggle theme</span>
            {isDark ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
            ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
            )}
        </div>
    )
}
