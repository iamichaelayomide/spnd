import React from 'react'
import { appStateContext, type AppState, type AppStateAction } from './appStateContext'
import { createBlankUser, loadUser, saveUser } from './userStore'

function reducer(state: AppState, action: AppStateAction): AppState {
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

  return <appStateContext.Provider value={{ state, dispatch, ensureDraftUser }}>{children}</appStateContext.Provider>
}
