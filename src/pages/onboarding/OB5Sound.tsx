import { useState } from 'react'
import { navigate } from '../../router/hashRouter'
import { OnboardingHeader } from '../../components/layout/OnboardingHeader'
import { loadUser, type SoundPref } from '../../store/userStore'
import { useAppState } from '../../store/appState'

const cards: Array<{ key: SoundPref; icon: string; title: string; sub: string }> = [
  { key: 'music', icon: '🎵', title: 'Music', sub: 'Lo-fi, ambient, classical' },
  { key: 'nature', icon: '🌿', title: 'Nature', sub: 'Rain, forest, ocean' },
  { key: 'white_noise', icon: '🌊', title: 'White Noise', sub: 'Fan, static, pink noise' },
  { key: 'silence', icon: '🔇', title: 'Silence', sub: 'No sound' },
]

export default function OB5Sound() {
  const { dispatch } = useAppState()
  const [selected, setSelected] = useState<SoundPref | null>(() => loadUser()?.soundPref ?? null)

  const next = () => {
    const u = loadUser()
    if (!u || !selected) return
    dispatch({
      type: 'SET_USER',
      user: { ...u, soundPref: selected, preferences: { ...u.preferences, defaultSoundType: selected } },
    })
    navigate('/onboarding/ob6')
  }

  return (
    <div className="screen no-nav" style={{ paddingTop: 'calc(var(--status-bar) + 12px)' }}>
      <OnboardingHeader step={4} total={6} backTo="/onboarding/ob4" />

      <div className="stepdots" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`stepdot ${i === 3 ? 'active' : ''}`} />
        ))}
      </div>

      <div style={{ height: 18 }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>What kind of sounds help you rest?</div>
        <div style={{ marginTop: 6, fontSize: 14, color: 'var(--text-muted)' }}>You can change this any time in settings.</div>
      </div>

      <div style={{ height: 18 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {cards.map((c) => (
          <div
            key={c.key}
            className="card shadow-1"
            style={{
              height: 120,
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              border: selected === c.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
              background: selected === c.key ? 'var(--accent-light)' : 'var(--bg-secondary)',
            }}
            onClick={() => setSelected(c.key)}
          >
            <div style={{ fontSize: 28 }}>{c.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 10 }}>{c.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{c.sub}</div>
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
