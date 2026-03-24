import { navigate } from '../../router/hashRouter'
import { OnboardingHeader } from '../../components/layout/OnboardingHeader'
import { useAppState } from '../../store/appState'
import { loadUser } from '../../store/userStore'
import { useMemo, useState } from 'react'

export default function OB2Name() {
  const { dispatch } = useAppState()
  const [name, setName] = useState(() => loadUser()?.name ?? '')
  const canContinue = useMemo(() => name.trim().length >= 2, [name])

  const saveAndNext = () => {
    const u = loadUser()
    if (!u) return
    dispatch({ type: 'SET_USER', user: { ...u, name: name.trim() } })
    navigate('/onboarding/ob3')
  }

  return (
    <div className="screen no-nav" style={{ paddingTop: 'calc(var(--status-bar) + 12px)' }}>
      <OnboardingHeader step={1} total={6} backTo="/onboarding/ob1" />

      <div className="stepdots" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`stepdot ${i === 0 ? 'active' : ''}`} />
        ))}
      </div>

      <div style={{ height: 22 }} />

      <div className="center" style={{ flexDirection: 'column', gap: 14 }}>
        <div className="mascot breathe" style={{ width: 120, height: 120 }} aria-hidden>
          👋
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>What should I call you?</div>
          <div style={{ marginTop: 6, fontSize: 14, color: 'var(--text-muted)' }}>I'll use this to greet you every session.</div>
        </div>

        <div style={{ width: '100%', maxWidth: 342, marginTop: 10 }}>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name..." />
        </div>
      </div>

      <div style={{ height: 26 }} />
      <button className="btn btn-primary shadow-1" disabled={!canContinue} onClick={saveAndNext}>
        Continue
      </button>
    </div>
  )
}
