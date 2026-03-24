import { useEffect } from 'react'
import { navigate, useHashPath } from '../../router/hashRouter'
import OB1Welcome from './OB1Welcome'
import OB2Name from './OB2Name'
import OB3Goal from './OB3Goal'
import OB4NapTime from './OB4NapTime'
import OB5Sound from './OB5Sound'
import OB6Notifications from './OB6Notifications'
import OB7AllSet from './OB7AllSet'

function screenFor(path: string) {
  if (path.endsWith('/ob1')) return <OB1Welcome />
  if (path.endsWith('/ob2')) return <OB2Name />
  if (path.endsWith('/ob3')) return <OB3Goal />
  if (path.endsWith('/ob4')) return <OB4NapTime />
  if (path.endsWith('/ob5')) return <OB5Sound />
  if (path.endsWith('/ob6')) return <OB6Notifications />
  if (path.endsWith('/ob7')) return <OB7AllSet />
  return <OB1Welcome />
}

export default function OnboardingFlow() {
  const path = useHashPath()

  useEffect(() => {
    if (path === '/onboarding' || path === '/onboarding/') navigate('/onboarding/ob1')
  }, [path])

  return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>{screenFor(path)}</div>
}
