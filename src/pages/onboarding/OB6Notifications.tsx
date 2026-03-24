import { useState } from 'react'
import { navigate } from '../../router/hashRouter'
import { OnboardingHeader } from '../../components/layout/OnboardingHeader'
import { loadUser } from '../../store/userStore'
import { useAppState } from '../../store/appState'

export default function OB6Notifications() {
  const { dispatch } = useAppState()
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle')

  const goNext = (enabled: boolean) => {
    const u = loadUser()
    if (!u) return
    dispatch({
      type: 'SET_USER',
      user: {
        ...u,
        notifications: {
          ...u.notifications,
          nap: { ...u.notifications.nap, enabled },
          sleep: { ...u.notifications.sleep, enabled },
        },
      },
    })
    navigate('/onboarding/ob7')
  }

  const request = async () => {
    if (!('Notification' in window)) {
      goNext(false)
      return
    }
    try {
      const res = await Notification.requestPermission()
      setStatus(res === 'granted' ? 'granted' : 'denied')
      goNext(res === 'granted')
    } catch {
      goNext(false)
    }
  }

  return (
    <div className="screen no-nav" style={{ paddingTop: 'calc(var(--status-bar) + 12px)', textAlign: 'center' }}>
      <OnboardingHeader step={5} total={6} backTo="/onboarding/ob5" />

      <div className="stepdots" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`stepdot ${i === 4 ? 'active' : ''}`} />
        ))}
      </div>

      <div style={{ height: 22 }} />
      <div className="mascot" style={{ width: 120, height: 120, margin: '0 auto' }} aria-hidden>
        😊
      </div>

      <div style={{ height: 14 }} />
      <div style={{ fontSize: 26, fontWeight: 800 }}>Stay on track with gentle reminders</div>
      <div style={{ margin: '10px auto 0', fontSize: 16, color: 'var(--text-secondary)', maxWidth: 300, whiteSpace: 'pre-line' }}>
        I'll send a nudge when it's a good time to rest,\n based on your schedule. No spam, promise.
      </div>

      <div style={{ height: 18 }} />
      <div className="card shadow-2" style={{ borderRadius: 'var(--radius-lg)', maxWidth: 340, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 28 }}>🌙</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nap reminders</div>
          </div>
          <div>
            <div style={{ fontSize: 28 }}>⚡</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Streak alerts</div>
          </div>
          <div>
            <div style={{ fontSize: 28 }}>🌟</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PAL tips</div>
          </div>
        </div>
      </div>

      <div style={{ height: 22 }} />
      <button className="btn btn-primary shadow-1" onClick={request}>
        Allow Notifications
      </button>
      <div style={{ height: 12 }} />
      <button className="btn-ghost" onClick={() => goNext(false)}>
        Maybe later
      </button>

      {status !== 'idle' ? (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>{status === 'granted' ? 'Notifications enabled.' : 'Notifications not enabled.'}</div>
      ) : null}
    </div>
  )
}
