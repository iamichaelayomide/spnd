import { navigate } from '../../router/hashRouter'

export function OnboardingHeader({ step, total, backTo }: { step: number; total: number; backTo: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--status-bar)',
        padding: '0 var(--screen-h-pad)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        background: 'transparent',
      }}
    >
      <button className="icon-btn" aria-label="Back" onClick={() => navigate(backTo)}>
        ←
      </button>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{step} of {total}</div>
      <div style={{ width: 44 }} />
    </div>
  )
}
