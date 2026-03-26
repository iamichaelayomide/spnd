import React from 'react'
import { appStateContext } from './appStateContext'

export function useAppState() {
  const ctx = React.useContext(appStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
