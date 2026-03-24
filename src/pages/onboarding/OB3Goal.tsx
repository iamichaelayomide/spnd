import { useState } from 'react'
import { navigate } from '../../router/hashRouter'
import { OnboardingHeader } from '../../components/layout/OnboardingHeader'
import { loadUser, type UserGoal } from '../../store/userStore'
import { useAppState } from '../../store/appState'

const options: Array<{ key: UserGoal; icon: string; title: string; sub: string }> = [
  { key: 'sleep_better', icon: '🌙', title: 'Sleep better at night', sub: 'Improve your nighttime sleep quality' },
  { key: 'power_nap', icon: '⚡', title: 'Power nap more effectively', sub: 'Quick recharges during the day' },
  { key: 'stress', icon: '😌', title: 'Reduce stress & wind down', sub: 'Use rest as a relaxation tool' },
  { key: 'track', icon: '📊', title: 'Track and understand my patterns', sub: 'Data-driven insights about my rest' },
]

export default function OB3Goal() {
  const { dispatch } = useAppState()
  const [selected, setSelected] = useState<UserGoal | null>(() => loadUser()?.goal ?? null)

  const next = () => {
    const u = loadUser()
    if (!u || !selected) return
    dispatch({ type: 'SET_USER', user: { ...u, goal: selected } })
    navigate('/onboarding/ob4')
  }

  return (
    <div className="screen no-nav" style={{ paddingTop: 'calc(var(--status-bar) + 12px)' }}>
      <OnboardingHeader step={2} total={6} backTo="/onboarding/ob2" />

      <div className="stepdots" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`stepdot ${i === 1 ? 'active' : ''}`} />
        ))}
      </div>

      <div style={{ height: 18 }} />
      <div className="center" style={{ flexDirection: 'column', gap: 10 }}>
        <div className="mascot" style={{ width: 100, height: 100 }} aria-hidden>
          😪
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>What's your main sleep goal?</div>
          <div style={{ marginTop: 6, fontSize: 14, color: 'var(--text-muted)' }}>We'll personalize your experience around this.</div>
        </div>
      </div>

      <div style={{ height: 18 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {options.map((o) => (
          <div key={o.key} className={`selection ${selected === o.key ? 'selected' : ''}`} onClick={() => setSelected(o.key)}>
            <div style={{ fontSize: 28, width: 32, textAlign: 'center' }}>{o.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{o.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{o.sub}</div>
            </div>
            <div style={{ fontSize: 18, color: selected === o.key ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{selected === o.key ? '✓' : '○'}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 18 }} />
      <button className="btn btn-primary shadow-1" disabled={!selected} onClick={next}>
        Continue
      </button>
    </div>
  )
}
