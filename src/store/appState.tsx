import React from 'react'
import { createBlankUser, loadUser, saveUser, type UserProfile } from './userStore'

export type AppState = { user: UserProfile | null }

type Action =
  | { type: 'BOOT' }
  | { type: 'SET_USER'; user: UserProfile }
  | { type: 'CLEAR_USER' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'BOOT':
      return { user: loadUser() }
    case 'SET_USER':
      saveUser(action.user)
      return { user: action.user }
    case 'CLEAR_USER':
      localStorage.removeItem('sleeppal:user')
      return { user: null }
    default:
      return state
  }
}

const Ctx = React.createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
  ensureDraftUser: () => UserProfile
} | null>(null)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { user: null })

  React.useEffect(() => {
    dispatch({ type: 'BOOT' })
  }, [])

  const ensureDraftUser = React.useCallback(() => {
    const existing = loadUser()
    if (existing) return existing
    const draft = createBlankUser()
    saveUser(draft)
    return draft
  }, [])

  return <Ctx.Provider value={{ state, dispatch, ensureDraftUser }}>{children}</Ctx.Provider>
}

export function useAppState() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
