import { useState } from 'react'
import { navigate } from '../../router/hashRouter'
import { OnboardingHeader } from '../../components/layout/OnboardingHeader'
import { loadUser, type NapTimePref } from '../../store/userStore'
import { useAppState } from '../../store/appState'

const options: Array<{ key: NapTimePref; icon: string; title: string }> = [
  { key: 'morning', icon: '☀️', title: 'Morning  ·  Before noon' },
  { key: 'afternoon', icon: '🕐', title: 'Afternoon  ·  12pm – 4pm' },
  { key: 'evening', icon: '🌆', title: 'Evening  ·  4pm – 7pm' },
  { key: 'no_regular', icon: '🌙', title: "I don't nap regularly" },
]

export default function OB4NapTime() {
  const { dispatch } = useAppState()
  const [selected, setSelected] = useState<NapTimePref | null>(() => loadUser()?.napTime ?? null)

  const next = () => {
    const u = loadUser()
    if (!u || !selected) return
    dispatch({ type: 'SET_USER', user: { ...u, napTime: selected } })
    navigate('/onboarding/ob5')
  }

  return (
    <div className="screen no-nav" style={{ paddingTop: 'calc(var(--status-bar) + 12px)' }}>
      <OnboardingHeader step={3} total={6} backTo="/onboarding/ob3" />

      <div className="stepdots" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`stepdot ${i === 2 ? 'active' : ''}`} />
        ))}
      </div>

      <div style={{ height: 18 }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>When do you usually nap?</div>
        <div style={{ marginTop: 6, fontSize: 14, color: 'var(--text-muted)' }}>This helps me show up at the right moment.</div>
      </div>

      <div style={{ height: 18 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {options.map((o) => (
          <div key={o.key} className={`selection ${selected === o.key ? 'selected' : ''}`} onClick={() => setSelected(o.key)}>
            <div style={{ fontSize: 28, width: 32, textAlign: 'center' }}>{o.icon}</div>
            <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{o.title}</div>
            <div style={{ fontSize: 18, color: selected === o.key ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{selected === o.key ? '✓' : '○'}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 18 }} />
      <button className="btn btn-primary shadow-1" disabled={!selected} onClick={next}>
        Continue
      </button>
      <div style={{ height: 10 }} />
      <button className="btn-ghost" onClick={() => navigate('/onboarding/ob5')}>
        Skip for now
      </button>
    </div>
  )
}
