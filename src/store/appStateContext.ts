import React from 'react'
import type { UserProfile } from './userStore'

export type AppState = { user: UserProfile | null }

export type AppStateAction =
  | { type: 'BOOT' }
  | { type: 'SET_USER'; user: UserProfile }
  | { type: 'CLEAR_USER' }

export type AppStateContextValue = {
  state: AppState
  dispatch: React.Dispatch<AppStateAction>
  ensureDraftUser: () => UserProfile
}

export const appStateContext = React.createContext<AppStateContextValue | null>(null)
