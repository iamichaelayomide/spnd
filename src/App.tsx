import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const splashVector = 'http://localhost:3845/assets/df675de77f2fa6b6e87fa3126accb46efdf5ebcb.svg'

type Screen =
  | 'splash'
  | 'intro-plan'
  | 'intro-know'
  | 'intro-purpose'
  | 'intro-setup'
  | 'name'
  | 'phone'
  | 'otp'
  | 'passcode'
  | 'all-set'
  | 'home-empty'
  | 'select-source'
  | 'card-added'
  | 'amount'
  | 'funds-otp'
  | 'receipt'
  | 'deposit-success'
  | 'home-funded'

type FormState = {
  firstName: string
  lastName: string
  country: string
  countryCode: string
  phone: string
  otp: string
  resendTimer: number
  passcode: string
  passcodeFirstEntry: string
  passcodeConfirming: boolean
  passcodeError: string
  cardLinked: boolean
  selectedSource: string
  amountToAdd: string
  fundsOtp: string
  fundsOtpTimer: number
  lastTransactionAmount: number
  totalBalance: number
  unallocatedBalance: number
  completed: boolean
}

const STORAGE_KEY = 'spnd:onboarding'
const INTRO_SCREENS: Screen[] = ['intro-plan', 'intro-know', 'intro-purpose', 'intro-setup']

const INTRO_SLIDES = [
  { key: 'intro-plan' as const, eyebrow: 'Welcome to SPND', title: 'Plan your SPNDing', body: 'Decide where your money goes before you spend it.', image: '/spnd/image 5.png', imageClassName: 'intro-image intro-image-plan', button: 'Next', activeDot: 1 },
  { key: 'intro-know' as const, eyebrow: 'Welcome to SPND', title: 'Know your SPNDing', body: 'See your spending clearly, without guesswork.', image: '/spnd/image 4.png', imageClassName: 'intro-image intro-image-know', button: 'Next', activeDot: 2 },
  { key: 'intro-purpose' as const, eyebrow: 'Welcome to SPND', title: 'SPND on purpose', body: 'Give every dollar a role and spend with confidence.', image: '/spnd/image 6.svg', imageClassName: 'intro-image intro-image-purpose', button: 'Next', activeDot: 3 },
  { key: 'intro-setup' as const, eyebrow: 'Welcome to SPND', title: "Let's set this up properly", body: 'It only takes a moment to get your money organized.', image: '/spnd/image 10.svg', imageClassName: 'intro-image intro-image-setup', button: 'Get started', activeDot: 4 },
]

const COUNTRIES = [
  { name: 'Nigeria', code: '+234' },
  { name: 'United States', code: '+1' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'Canada', code: '+1' },
]

function loadState(): FormState {
  const fallback: FormState = {
    firstName: '',
    lastName: '',
    country: 'Nigeria',
    countryCode: '+234',
    phone: '',
    otp: '',
    resendTimer: 14,
    passcode: '',
    passcodeFirstEntry: '',
    passcodeConfirming: false,
    passcodeError: '',
    cardLinked: false,
    selectedSource: '',
    amountToAdd: '',
    fundsOtp: '',
    fundsOtpTimer: 14,
    lastTransactionAmount: 0,
    totalBalance: 0,
    unallocatedBalance: 0,
    completed: false,
  }

  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    return { ...fallback, ...(JSON.parse(raw) as Partial<FormState>) }
  } catch {
    return fallback
  }
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString()}`
}

function formatOtpDisplay(otp: string) {
  if (otp.length <= 3) return otp
  return `${otp.slice(0, 3)}-${otp.slice(3, 6)}`
}

function StatusBar() {
  const [time, setTime] = useState(() => new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date()))
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date()))
    update()
    const intervalId = window.setInterval(update, 30_000)
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="status-bar">
      <span className="status-time">{time}</span>
      <div className="status-icons" aria-hidden="true">
        <span className="status-signal"><i /><i /><i /><i /></span>
        <span className="status-wifi" />
        <span className="status-battery"><span className="status-battery-level" /></span>
      </div>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="back-button" type="button" onClick={onClick} aria-label="Go back">
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M9.5 3.5L5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function SlideProgress({ active }: { active: number }) {
  return <div className="slide-progress" aria-label="Onboarding progress">{[1, 2, 3, 4].map((step) => <span key={step} className={`slide-progress-dot${step === active ? ' active' : ''}`} />)}</div>
}

function MiniProgress({ active }: { active: 1 | 2 | 3 }) {
  return <div className="mini-progress" aria-label={`Step ${active} of 3`}>{[1, 2, 3].map((step) => <span key={step} className={`mini-progress-segment${step === active ? ' active' : ''}`} />)}</div>
}

function AuthProgress() {
  return <div className="auth-progress" aria-label="Security step"><span className="auth-progress-dot" /><span className="auth-progress-dot" /><span className="auth-progress-dot" /><span className="auth-progress-pill active" /></div>
}

function PrimaryButton({ children, onClick, disabled, className = '' }: { children: ReactNode; onClick: () => void; disabled?: boolean; className?: string }) {
  return <button className={`primary-button ${className}`.trim()} type="button" onClick={onClick} disabled={disabled}>{children}</button>
}

function IconCard() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="3" stroke="currentColor" strokeWidth="1.4" /><path d="M3.5 9.5H20.5" stroke="currentColor" strokeWidth="1.4" /><path d="M7 14.5H10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
}

function IconAdd() {
  return <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3.25v9.5M3.25 8h9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
}

function IconSwap() {
  return <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 5.25h8.25m0 0L9.75 3.5m2 1.75L9.75 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M12.5 10.75H4.25m0 0 2 1.75m-2-1.75L6.25 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function IconEye() {
  return <svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2.1 9s2.5-4.05 6.9-4.05S15.9 9 15.9 9s-2.5 4.05-6.9 4.05S2.1 9 2.1 9Z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /></svg>
}

function OtpInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState(false)
  const display = formatOtpDisplay(value.padEnd(6, ' '))
  const [left = '', right = ''] = display.split('-')
  const activeIndex = Math.min(value.length, 5)

  const renderBox = (char: string, index: number) => (
    <span key={index} className={`otp-box${focused && index === activeIndex && value.length < 6 ? ' active' : ''}`}>
      {char === ' ' ? '' : char}
      {focused && index === activeIndex && value.length < 6 ? <span className="otp-caret" aria-hidden="true" /> : null}
    </span>
  )

  return (
    <label className="otp-entry" htmlFor={id} onClick={() => inputRef.current?.focus()}>
      <div className="otp-grid">
        {left.split('').map((char, index) => renderBox(char, index))}
        <span className="otp-divider">-</span>
        {right.split('').map((char, index) => renderBox(char, index + 3))}
      </div>
      <input ref={inputRef} id={id} className="otp-hidden-input" value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} inputMode="numeric" autoComplete="one-time-code" />
    </label>
  )
}

function PasscodeKeypad({ onDigit, onDelete }: { onDigit: (digit: string) => void; onDelete: () => void }) {
  return (
    <div className="passcode-keypad" aria-label="Passcode keypad">
      {[
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['', '0', 'delete'],
      ].map((row, rowIndex) => (
        <div key={rowIndex} className="passcode-row">
          {row.map((key) => {
            if (key === '') return <span key={`empty-${rowIndex}`} className="passcode-key empty" aria-hidden="true" />
            if (key === 'delete') return <button key="delete" className="passcode-key delete" type="button" onClick={onDelete} aria-label="Delete digit"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.5 7.5H18a2.5 2.5 0 0 1 2.5 2.5v4A2.5 2.5 0 0 1 18 16.5H9.5L4.5 12l5-4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="m11 10 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></button>
            return <button key={key} className="passcode-key" type="button" onClick={() => onDigit(key)}>{key}</button>
          })}
        </div>
      ))}
    </div>
  )
}

function FormScreen({ title, description, step, onBack, children }: { title: string; description: string; step: 1 | 2 | 3; onBack: () => void; children: ReactNode }) {
  return <div className="screen-content form-screen"><StatusBar /><BackButton onClick={onBack} /><MiniProgress active={step} /><div className="form-copy"><h1>{title}</h1><p>{description}</p></div>{children}</div>
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [form, setForm] = useState<FormState>(() => loadState())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form])

  useEffect(() => {
    if (screen !== 'otp' || form.resendTimer <= 0) return undefined
    const intervalId = window.setInterval(() => setForm((current) => ({ ...current, resendTimer: Math.max(0, current.resendTimer - 1) })), 1000)
    return () => window.clearInterval(intervalId)
  }, [screen, form.resendTimer])

  useEffect(() => {
    if (screen !== 'funds-otp' || form.fundsOtpTimer <= 0) return undefined
    const intervalId = window.setInterval(() => setForm((current) => ({ ...current, fundsOtpTimer: Math.max(0, current.fundsOtpTimer - 1) })), 1000)
    return () => window.clearInterval(intervalId)
  }, [screen, form.fundsOtpTimer])

  const currentSlide = useMemo(() => INTRO_SLIDES.find((slide) => slide.key === screen), [screen])
  const homeScreen = screen === 'home-funded' ? 'home-funded' : 'home-empty'
  const hasMoney = form.totalBalance > 0

  const updateForm = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }))

  const goBack = () => {
    if (screen === 'intro-plan') return setScreen('splash')
    const sequence: Screen[] = ['intro-plan', 'intro-know', 'intro-purpose', 'intro-setup', 'name', 'phone', 'otp', 'passcode', 'all-set']
    const index = sequence.indexOf(screen)
    if (index > 0) setScreen(sequence[index - 1])
  }

  const submitName = () => {
    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) return
    setScreen('phone')
  }

  const submitPhone = () => {
    if (form.phone.length !== 11) return
    updateForm({ otp: '', resendTimer: 14 })
    setScreen('otp')
  }

  const submitOtp = () => {
    if (form.otp.length !== 6) return
    updateForm({ passcode: '', passcodeFirstEntry: '', passcodeConfirming: false, passcodeError: '' })
    setScreen('passcode')
  }

  const handlePasscodeDigit = (digit: string) => {
    if (form.passcode.length >= 4) return
    updateForm({ passcode: `${form.passcode}${digit}`, passcodeError: '' })
  }

  const handlePasscodeDelete = () => updateForm({ passcode: form.passcode.slice(0, -1), passcodeError: '' })

  const submitPasscode = () => {
    if (form.passcode.length !== 4) return
    if (!form.passcodeConfirming) {
      updateForm({ passcodeFirstEntry: form.passcode, passcode: '', passcodeConfirming: true, passcodeError: '' })
      return
    }
    if (form.passcode !== form.passcodeFirstEntry) {
      updateForm({ passcode: '', passcodeError: 'Passcodes did not match. Try again.' })
      return
    }
    updateForm({ completed: true })
    setScreen('all-set')
  }

  const linkCard = () => {
    updateForm({ cardLinked: true, selectedSource: 'gtbank' })
    setScreen('card-added')
  }

  const submitFundsOtp = () => {
    if (form.fundsOtp.length !== 6 || !form.amountToAdd) return
    const amount = Number(form.amountToAdd)
    updateForm({
      totalBalance: form.totalBalance + amount,
      unallocatedBalance: form.unallocatedBalance + amount,
      lastTransactionAmount: amount,
    })
    setScreen('deposit-success')
  }

  if (screen === 'splash') {
    return (
      <main className="app-shell">
        <section className="phone-frame splash-frame">
          <button className="screen-content splash-screen" type="button" onClick={() => setScreen('intro-plan')} aria-label="Start onboarding">
            <StatusBar />
            <div className="splash-brandmark" aria-hidden="true">
              <img className="splash-symbol" src={splashVector} alt="" />
              <h1 className="splash-wordmark">SPND</h1>
            </div>
          </button>
        </section>
      </main>
    )
  }

  if (currentSlide) {
    return (
      <main className="app-shell">
        <section className="phone-frame">
          <div className="screen-content intro-screen">
            <StatusBar />
            <BackButton onClick={goBack} />
            <SlideProgress active={currentSlide.activeDot} />
            <div className="intro-copy">
              <span>{currentSlide.eyebrow}</span>
              <h1>{currentSlide.title}</h1>
              <p>{currentSlide.body}</p>
            </div>
            <img className={currentSlide.imageClassName} src={currentSlide.image} alt="" />
            <div className="bottom-action">
              <PrimaryButton onClick={() => setScreen(currentSlide.key === 'intro-setup' ? 'name' : INTRO_SCREENS[INTRO_SCREENS.indexOf(currentSlide.key) + 1])}>
                {currentSlide.button}
              </PrimaryButton>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const renderScreen = () => {
    if (screen === 'name') {
      return (
        <FormScreen title="What is your name?" description="Please enter your full name as they appear in your government documents" step={1} onBack={goBack}>
          <div className="field-stack">
            <label className="field-card"><span className="field-label">First name</span><input className="field-input" value={form.firstName} onChange={(event) => updateForm({ firstName: event.target.value })} placeholder="First name" /></label>
            <label className="field-card"><span className="field-label">Last name</span><input className="field-input" value={form.lastName} onChange={(event) => updateForm({ lastName: event.target.value })} placeholder="Last name" /></label>
          </div>
          <div className="form-action"><PrimaryButton onClick={submitName} disabled={form.firstName.trim().length < 2 || form.lastName.trim().length < 2}>Next</PrimaryButton></div>
        </FormScreen>
      )
    }

    if (screen === 'phone') {
      return (
        <FormScreen title="What's your phone number?" description="Enter your phone number. We will send you a confirmation code there." step={2} onBack={() => setScreen('name')}>
          <div className="phone-row">
            <label className="country-card">
              <span className="country-flag" aria-hidden="true">{form.country === 'Nigeria' ? <><i className="green" /><i className="white" /><i className="green" /></> : <><i className="grey" /><i className="white" /><i className="grey" /></>}</span>
              <select className="country-select" value={form.country} onChange={(event) => {
                const selected = COUNTRIES.find((country) => country.name === event.target.value) ?? COUNTRIES[0]
                updateForm({ country: selected.name, countryCode: selected.code })
              }}>{COUNTRIES.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}</select>
              <span className="country-code">{form.countryCode}</span>
            </label>
            <label className="field-card field-card-phone"><span className="field-label">Mobile number</span><input className="field-input" value={form.phone} onChange={(event) => updateForm({ phone: event.target.value.replace(/\D/g, '').slice(0, 11) })} inputMode="numeric" placeholder="07032891651" /></label>
          </div>
          <button className="text-link" type="button">Already have an account? Log in</button>
          <div className="form-action"><PrimaryButton onClick={submitPhone} disabled={form.phone.length !== 11}>Continue</PrimaryButton></div>
        </FormScreen>
      )
    }

    if (screen === 'otp') {
      return (
        <FormScreen title="Verify your phone" description={`Code sent to ${form.countryCode}${form.phone}. Check your device for OTP.`} step={2} onBack={() => setScreen('phone')}>
          <OtpInput id="primary-otp" value={form.otp} onChange={(otp) => updateForm({ otp })} />
          <div className="otp-links">
            <button className="text-link" type="button" onClick={form.resendTimer === 0 ? () => updateForm({ otp: '', resendTimer: 14 }) : undefined}>{form.resendTimer === 0 ? 'Resend code now' : `Resend code in 00:${String(form.resendTimer).padStart(2, '0')}`}</button>
            <button className="text-link" type="button">Already have an account? Log in</button>
          </div>
          <div className="form-action"><PrimaryButton onClick={submitOtp} disabled={form.otp.length !== 6}>Verify phone</PrimaryButton></div>
        </FormScreen>
      )
    }

    if (screen === 'passcode') {
      return (
        <div className="screen-content auth-screen">
          <StatusBar />
          <BackButton onClick={() => {
            if (form.passcodeConfirming) {
              updateForm({ passcodeConfirming: false, passcode: form.passcodeFirstEntry, passcodeFirstEntry: '', passcodeError: '' })
              return
            }
            setScreen('otp')
          }} />
          <AuthProgress />
          <div className="auth-copy">
            <h1>{form.passcodeConfirming ? 'Confirm passcode' : 'Create passcode'}</h1>
            <p>{form.passcodeConfirming ? 'Enter the same 4 digits again so we know you meant it.' : 'Choose a 4-digit passcode you can remember easily.'}</p>
          </div>
          <div className="passcode-stage">
            <div className="passcode-dots">{[0, 1, 2, 3].map((index) => <span key={index} className={`passcode-dot${index < form.passcode.length ? ' filled' : ''}`} />)}</div>
            <PasscodeKeypad onDigit={handlePasscodeDigit} onDelete={handlePasscodeDelete} />
          </div>
          {form.passcodeError ? <p className="passcode-error">{form.passcodeError}</p> : null}
          <div className="bottom-action auth-action"><PrimaryButton onClick={submitPasscode} disabled={form.passcode.length !== 4} className="auth-button">{form.passcodeConfirming ? 'Save passcode' : 'Continue'}</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'all-set') {
      return (
        <div className="screen-content success-screen">
          <StatusBar />
          <div className="success-stage">
            <div className="success-art"><img className="success-image" src="/spnd/image 15.svg" alt="" /></div>
            <div className="success-copy">
              <span className="success-chip">Setup complete</span>
              <h1>You're all set</h1>
              <p>Your account is ready. Let's get your money organized.</p>
            </div>
          </div>
          <div className="bottom-action"><PrimaryButton onClick={() => {
            updateForm({ completed: true })
            setScreen('home-empty')
          }}>Go to wallet</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'home-empty' || screen === 'home-funded') {
      const buckets = [
        { label: 'Rent', amount: '$500', pct: '7.7%', fill: '56%' },
        { label: 'Transport', amount: '$1,000', pct: '10%', fill: '64%' },
        { label: 'Data & Airtime', amount: '$100', pct: '1%', fill: '18%' },
        { label: 'Food & Drinks', amount: '$2,000', pct: '10%', fill: '64%' },
      ]

      return (
        <div className="screen-content wallet-screen">
          <StatusBar />
          <div className="wallet-card">
            <div className="wallet-header-row">
              <div><span className="wallet-label">TOTAL BALANCE</span><h1>{formatCurrency(form.totalBalance)}</h1><p>{formatCurrency(form.unallocatedBalance)} unallocated</p></div>
              <button className="wallet-eye" type="button" aria-label="Show balance"><IconEye /></button>
            </div>
            <div className="wallet-actions-row">
              <button className="wallet-secondary" type="button" onClick={() => setScreen('select-source')}><span>Add funds</span><IconAdd /></button>
              <button className="wallet-secondary" type="button"><span>Transfer</span><IconSwap /></button>
            </div>
            <button className="wallet-primary" type="button">Allocate funds</button>
          </div>

          <section className="wallet-section">
            <div className="section-heading"><h2>Bucket Breakdown</h2>{hasMoney ? <button type="button">Manage</button> : null}</div>
            {hasMoney ? (
              <div className="bucket-grid">
                {buckets.map((bucket) => (
                  <article key={bucket.label} className="bucket-card">
                    <span className="bucket-chip">{bucket.pct}</span>
                    <span className="bucket-icon" />
                    <h3>{bucket.label}</h3>
                    <p>{bucket.amount}</p>
                    <span className="bucket-track"><span style={{ width: bucket.fill }} /></span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                <h3>No buckets yet</h3>
                <p>Add funds to wallet to enable you allocate funds to buckets</p>
                <button className="inline-add-button" type="button" onClick={() => setScreen('select-source')}><span>Add funds</span><IconAdd /></button>
              </div>
            )}
          </section>

          <section className="wallet-section wallet-section-activity">
            <div className="section-heading"><h2>Activity</h2></div>
            {hasMoney ? (
              <div className="activity-row">
                <div className="activity-left"><span className="activity-badge" /><div><h3>Transfer to Michael Ayo...</h3><p>31 Jan, 21:57</p></div></div>
                <span className="activity-amount">-$3500</span>
              </div>
            ) : (
              <div className="empty-panel compact"><h3>No activity yet</h3><p>Add funds or make your first transfer to get started.</p></div>
            )}
          </section>
        </div>
      )
    }

    if (screen === 'select-source') {
      return (
        <div className="screen-content source-screen">
          <StatusBar />
          <div className="sheet">
            <div className="sheet-header"><BackButton onClick={() => setScreen(homeScreen)} /><h1>Select source</h1></div>
            <p className="sheet-helper">Choose where the money should come from before you continue.</p>
            <div className="source-group">
              <span className="source-group-title">SAVED CARDS</span>
              {form.cardLinked ? (
                <button className={`source-item${form.selectedSource === 'gtbank' ? ' selected' : ''}`} type="button" onClick={() => updateForm({ selectedSource: 'gtbank' })}>
                  <span className="source-item-icon"><IconCard /></span>
                  <span className="source-item-copy"><strong>GTBank</strong><small>**** 2341</small></span>
                  <span className="source-radio" aria-hidden="true" />
                </button>
              ) : null}
              <button className="source-item source-item-link" type="button" onClick={linkCard}>
                <span className="source-item-icon"><IconCard /></span>
                <span className="source-item-copy"><strong>Link new card</strong><small>Securely add a debit or credit card</small></span>
              </button>
            </div>
            {form.cardLinked ? <div className="sheet-action"><PrimaryButton onClick={() => setScreen('amount')} disabled={!form.selectedSource}>Continue</PrimaryButton></div> : null}
          </div>
        </div>
      )
    }

    if (screen === 'card-added') {
      return (
        <div className="screen-content card-success-screen">
          <StatusBar />
          <button className="close-button close-button-corner" type="button" onClick={() => setScreen('select-source')} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <img className="card-added-image" src="/spnd/Gemini_Generated_Image_c6t1i2c6t1i2c6t1-removebg-preview 1.svg" alt="" />
          <div className="card-added-copy">
            <h1>Card successfully added</h1>
            <p>Your card GTBank (**** 2341) was successfully added. You can now choose how much to deposit.</p>
          </div>
          <div className="bottom-action"><PrimaryButton onClick={() => setScreen('amount')}>Continue to add money</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'amount') {
      return (
        <div className="screen-content amount-screen">
          <StatusBar />
          <button className="close-button" type="button" onClick={() => setScreen('select-source')} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <div className="amount-copy"><h1>Enter amount to add</h1><p>Choose how much you want to move into your SPND wallet.</p></div>
          <label className="amount-field"><span>$</span><input value={form.amountToAdd} onChange={(event) => updateForm({ amountToAdd: event.target.value.replace(/\D/g, '').slice(0, 6) })} inputMode="numeric" placeholder="0" /></label>
          <div className="quick-amounts">{['500', '1000', '10000'].map((amount) => <button key={amount} type="button" onClick={() => updateForm({ amountToAdd: amount })}>{formatCurrency(Number(amount))}</button>)}</div>
          <div className="bottom-action amount-action"><PrimaryButton onClick={() => {
            updateForm({ fundsOtp: '', fundsOtpTimer: 14 })
            setScreen('funds-otp')
          }} disabled={!form.amountToAdd}>Continue</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'funds-otp') {
      return (
        <div className="screen-content auth-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen('amount')} />
          <AuthProgress />
          <div className="auth-copy">
            <h1>Confirm this deposit</h1>
            <p>{`Enter the 6-digit code sent to the phone and email linked to your card to approve ${formatCurrency(Number(form.amountToAdd || 0))}.`}</p>
          </div>
          <OtpInput id="funds-otp" value={form.fundsOtp} onChange={(fundsOtp) => updateForm({ fundsOtp })} />
          <button className="text-link otp-resend-link" type="button" onClick={form.fundsOtpTimer === 0 ? () => updateForm({ fundsOtp: '', fundsOtpTimer: 14 }) : undefined}>{form.fundsOtpTimer === 0 ? 'Resend code now' : `Resend code in 00:${String(form.fundsOtpTimer).padStart(2, '0')}`}</button>
          <div className="bottom-action auth-action"><PrimaryButton onClick={submitFundsOtp} disabled={form.fundsOtp.length !== 6} className="auth-button">Confirm deposit</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'receipt') {
      return (
        <div className="screen-content receipt-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen('deposit-success')} />
          <div className="receipt-copy">
            <h1>Transaction receipt</h1>
            <p>Your deposit has been completed successfully.</p>
          </div>
          <div className="receipt-card">
            <div className="receipt-row"><span>Status</span><strong>Successful</strong></div>
            <div className="receipt-row"><span>Amount</span><strong>{formatCurrency(form.lastTransactionAmount)}</strong></div>
            <div className="receipt-row"><span>Source</span><strong>GTBank •••• 2341</strong></div>
            <div className="receipt-row"><span>Destination</span><strong>SPND Wallet</strong></div>
            <div className="receipt-row"><span>Date</span><strong>{new Intl.DateTimeFormat([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date())}</strong></div>
          </div>
          <div className="bottom-action"><PrimaryButton onClick={() => setScreen('home-funded')}>Done</PrimaryButton></div>
        </div>
      )
    }

    return (
      <div className="screen-content deposit-success-screen">
        <StatusBar />
        <button className="close-button close-button-corner" type="button" onClick={() => setScreen('home-funded')} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
        <div className="deposit-success-stage">
          <img className="deposit-success-icon" src="/spnd/image 16.svg" alt="" />
          <h1>Deposit successful</h1>
          <div className="deposit-amount-card"><span>Amount added</span><strong>{formatCurrency(Number(form.amountToAdd || 0))}</strong></div>
          <PrimaryButton onClick={() => setScreen('receipt')} className="deposit-primary">View transaction receipt</PrimaryButton>
          <button className="deposit-secondary" type="button" onClick={() => setScreen('home-funded')}>Return home</button>
        </div>
      </div>
    )
  }

  return <main className="app-shell"><section className="phone-frame">{renderScreen()}</section></main>
}
