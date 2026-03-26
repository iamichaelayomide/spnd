import { useAppState } from '../store/useAppState'

export default function Settings() {
  const { state, dispatch } = useAppState()

  return (
    <div className="screen">
      <div style={{ fontSize: 26, fontWeight: 800 }}>Settings</div>
      <div style={{ height: 12 }} />
      <div className="card shadow-1">
        <div style={{ fontWeight: 700 }}>Profile</div>
        <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{state.user?.name || '—'}</div>
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-primary shadow-1" onClick={() => dispatch({ type: 'CLEAR_USER' })}>
            Reset app data
          </button>
        </div>
      </div>
    </div>
  )
}
