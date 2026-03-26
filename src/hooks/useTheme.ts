import React from 'react'
import { getTimeTheme, type TimeTheme } from '../utils/timeTheme'
import { useAppState } from '../store/useAppState'

export function useThemeClass(isOnboarding: boolean): TimeTheme {
  const { state } = useAppState()
  const override = state.user?.preferences?.themeOverride ?? null
  const [theme, setTheme] = React.useState<TimeTheme>(() => (override ?? getTimeTheme()))

  React.useEffect(() => {
    if (isOnboarding) return
    const tick = () => setTheme(override ?? getTimeTheme())
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [override, isOnboarding])

  return isOnboarding ? 'night' : theme
}
