import { navigate } from '../../router/hashRouter'
import { loadUser } from '../../store/userStore'

export default function OB7AllSet() {
  const name = loadUser()?.name || 'friend'

  return (
    <div className="screen no-nav" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', paddingTop: 'calc(var(--status-bar) + 40px)' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden>
        {[{ x: -60, y: -60, s: 220 }, { x: 240, y: -40, s: 180 }, { x: -40, y: 540, s: 200 }, { x: 250, y: 640, s: 240 }].map((o, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: o.x,
              top: o.y,
              width: o.s,
              height: o.s,
              borderRadius: 999,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0))',
              opacity: 0.3,
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>

      <div className="center" style={{ flexDirection: 'column', gap: 14, position: 'relative' }}>
        <div className="mascot" style={{ width: 200, height: 200, animation: 'fadeUp 600ms var(--ease-spring) both' }} aria-hidden>
          🎊
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-primary)' }}>You're all set, {name}! 🎉</div>
        <div style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 290 }}>Your rest journey starts now. I'll be here every step of the way.</div>
      </div>

      <div style={{ height: 40 }} />
      <button className="btn btn-primary shadow-1" onClick={() => navigate('/')}>Let's rest better</button>
    </div>
  )
}
