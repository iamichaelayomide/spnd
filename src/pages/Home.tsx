import { useAppState } from '../store/appState'

export default function Home() {
  const { state } = useAppState()
  const name = state.user?.name || 'friend'
  const now = new Date()
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const date = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>SleepPal</div>
        <div style={{ fontSize: 22 }} aria-hidden>
          ⚙️
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 800 }}>{time}</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{date}</div>
      </div>

      <div style={{ height: 28 }} />

      <div className="center" style={{ flexDirection: 'column', gap: 14 }}>
        <div className="mascot breathe" style={{ width: 160, height: 160 }} aria-hidden>
          😒
        </div>
        <div className="card shadow-1" style={{ maxWidth: 320, textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Good to see you, {name}. Ready for a session?</div>
        </div>
      </div>

      <div style={{ height: 22 }} />

      <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Choose nap type</div>
      <div style={{ height: 10 }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card shadow-1" style={{ borderRadius: 'var(--radius-xl)', height: 120 }}>
          <div style={{ fontSize: 36 }}>☁️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Nap</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Power rest</div>
        </div>
        <div className="card shadow-1" style={{ borderRadius: 'var(--radius-xl)', height: 120 }}>
          <div style={{ fontSize: 36 }}>🌙</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Sleep</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Full night rest</div>
        </div>
      </div>

      <div style={{ height: 18 }} />
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>No sessions yet — start your first rest!</div>
    </div>
  )
}
