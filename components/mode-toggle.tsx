"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // or a placeholder to prevent hydration mismatch
  }

  return (
    <ThemeSwitcher 
      value={theme as "light" | "dark" | "system"} 
      onChange={(v) => setTheme(v)} 
    />
  )
}
