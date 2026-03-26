import { navigate } from '../../router/hashRouter'
import { useAppState } from '../../store/useAppState'

export default function OB1Welcome() {
  const { ensureDraftUser } = useAppState()

  // Create a draft localStorage record so the next screens can patch it.
  ensureDraftUser()

  return (
    <div className="screen no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ height: '40vh' }} className="center">
        <div className="mascot breathe" style={{ width: 200, height: 200 }} aria-hidden>
          🛌
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 800, animation: 'fadeUp 500ms var(--ease-decel) both' }}>Good to meet you.</div>
        <div
          style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            margin: '10px auto 0',
            maxWidth: 280,
            animation: 'fadeUp 500ms var(--ease-decel) both',
            animationDelay: '200ms',
          }}
        >
          I'm SleepPal — your personal rest companion.
        </div>
      </div>

      <div>
        <button className="btn btn-primary shadow-1" onClick={() => navigate('/onboarding/ob2')}>
          Get Started
        </button>
        <div style={{ height: 12 }} />
        <button className="btn-ghost" onClick={() => alert('Auth comes later')}>Already have an account? Sign in</button>
      </div>
    </div>
  )
}
