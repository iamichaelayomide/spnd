import React from 'react'

export type RouteKey = 'home' | 'sleep-data' | 'pal' | 'settings' | 'onboarding'
export type Path = string

function getHashPath(): Path {
  const h = window.location.hash || '#/'
  return h.startsWith('#') ? h.slice(1) : h
}

export function navigate(path: Path) {
  window.location.hash = '#' + path
}

export function useHashPath(): Path {
  const [path, setPath] = React.useState<Path>(() => getHashPath())
  React.useEffect(() => {
    const onChange = () => setPath(getHashPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}

export function matchTopRoute(path: Path): RouteKey {
  if (path.startsWith('/onboarding')) return 'onboarding'
  if (path.startsWith('/sleep-data')) return 'sleep-data'
  if (path.startsWith('/pal')) return 'pal'
  if (path.startsWith('/settings')) return 'settings'
  return 'home'
}
