import { matchTopRoute, navigate, useHashPath } from '../../router/hashRouter'

const items = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'sleep-data', label: 'Sleep', path: '/sleep-data' },
  { key: 'pal', label: 'PAL', path: '/pal' },
  { key: 'settings', label: 'Settings', path: '/settings' },
] as const

export function BottomNav() {
  const path = useHashPath()
  const active = matchTopRoute(path)

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {items.map((it) => (
        <div
          key={it.key}
          className={`nav-item ${active === it.key ? 'active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => navigate(it.path)}
          onKeyDown={(e) => (e.key === 'Enter' ? navigate(it.path) : null)}
        >
          <div style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>
            {it.key === 'home' ? '🏠' : it.key === 'sleep-data' ? '🌙' : it.key === 'pal' ? '✨' : '⚙️'}
          </div>
          <div>{it.label}</div>
        </div>
      ))}
    </nav>
  )
}
