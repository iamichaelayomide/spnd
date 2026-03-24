export type UserGoal = 'sleep_better' | 'power_nap' | 'stress' | 'track'
export type NapTimePref = 'morning' | 'afternoon' | 'evening' | 'no_regular'
export type SoundPref = 'music' | 'nature' | 'white_noise' | 'silence'

export type UserProfile = {
  id: string
  name: string
  goal: UserGoal
  napTime: NapTimePref
  soundPref: SoundPref
  createdAt: string
  notifications: {
    nap: { enabled: boolean; time: string }
    sleep: { enabled: boolean; time: string }
    streak: boolean
    pal: boolean
  }
  preferences: {
    defaultNapDuration: number
    defaultSoundType: SoundPref
    themeOverride: null | 'morning' | 'afternoon' | 'evening' | 'night'
    reduceMotion: boolean
  }
}

const KEY = 'sleeppal:user'

function uuid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)
}

export function loadUser(): UserProfile | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function createBlankUser(): UserProfile {
  const now = new Date().toISOString()
  return {
    id: uuid(),
    name: '',
    goal: 'sleep_better',
    napTime: 'no_regular',
    soundPref: 'silence',
    createdAt: now,
    notifications: {
      nap: { enabled: false, time: '14:00' },
      sleep: { enabled: false, time: '22:00' },
      streak: true,
      pal: true,
    },
    preferences: {
      defaultNapDuration: 15,
      defaultSoundType: 'silence',
      themeOverride: null,
      reduceMotion: false,
    },
  }
}
