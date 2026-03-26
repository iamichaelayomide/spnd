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
  | 'allocate-empty'
  | 'allocate-buckets'
  | 'select-source'
  | 'add-card'
  | 'card-pin'
  | 'card-added'
  | 'amount'
  | 'funds-otp'
  | 'receipt'
  | 'deposit-success'
  | 'home-funded'

type Bucket = {
  id: string
  name: string
  amount: number
  tone: 'violet' | 'amber' | 'lilac' | 'mint'
}

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
  cardholderName: string
  cardNumber: string
  cardExpiry: string
  cardCvv: string
  cardPin: string
  amountToAdd: string
  allocationName: string
  allocationAmount: string
  buckets: Bucket[]
  fundsOtp: string
  fundsOtpTimer: number
  lastTransactionAmount: number
  lastTransactionAt: string
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
    cardholderName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardPin: '',
    amountToAdd: '',
    allocationName: '',
    allocationAmount: '',
    buckets: [],
    fundsOtp: '',
    fundsOtpTimer: 14,
    lastTransactionAmount: 0,
    lastTransactionAt: '',
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

function formatTransactionTime(value: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function formatOtpDisplay(otp: string) {
  if (otp.length <= 3) return otp
  return `${otp.slice(0, 3)}-${otp.slice(3, 6)}`
}

function formatCardNumberInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatCardExpiryInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function getCardLast4(value: string) {
  return value.replace(/\D/g, '').slice(-4)
}

function getSavedCardLabel(value: string) {
  const last4 = getCardLast4(value)
  return last4 ? `Debit card **** ${last4}` : 'Debit card'
}

function formatMoneyInput(value: string) {
  return value.replace(/\D/g, '').slice(0, 6)
}

function formatBucketAmount(amount: number) {
  return `$${amount.toLocaleString()}`
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

function IconWalletCard() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8.25A3.25 3.25 0 0 1 7.25 5h9.5A3.25 3.25 0 0 1 20 8.25v7.5A3.25 3.25 0 0 1 16.75 19h-9.5A3.25 3.25 0 0 1 4 15.75v-7.5Z" stroke="currentColor" strokeWidth="1.5" /><path d="M4 9.5h16" stroke="currentColor" strokeWidth="1.5" /><path d="M7.25 14.25h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
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
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = loadState()
    if (!saved.completed) return 'splash'
    return saved.totalBalance > 0 ? 'home-funded' : 'home-empty'
  })
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
  const hasSavedCard = form.cardLinked && getCardLast4(form.cardNumber).length === 4
  const hasBuckets = form.buckets.length > 0
  const allocationAmountValue = Number(form.allocationAmount || 0)
  const allocationIsValid = form.allocationName.trim().length >= 2
    && allocationAmountValue > 0
    && allocationAmountValue <= form.unallocatedBalance
  const cardIsValid = form.cardholderName.trim().length >= 3
    && form.cardNumber.replace(/\D/g, '').length === 16
    && form.cardExpiry.length === 5
    && form.cardCvv.length === 3

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
    if (!cardIsValid) return
    updateForm({ cardPin: '' })
    setScreen('card-pin')
  }

  const handleCardPinDigit = (digit: string) => {
    if (form.cardPin.length >= 4) return
    updateForm({ cardPin: `${form.cardPin}${digit}` })
  }

  const handleCardPinDelete = () => updateForm({ cardPin: form.cardPin.slice(0, -1) })

  const submitCardPin = () => {
    if (form.cardPin.length !== 4) return
    updateForm({ cardLinked: true, selectedSource: 'saved-card' })
    setScreen('card-added')
  }

  const submitFundsOtp = () => {
    if (form.fundsOtp.length !== 6 || !form.amountToAdd) return
    const amount = Number(form.amountToAdd)
    updateForm({
      totalBalance: form.totalBalance + amount,
      unallocatedBalance: form.unallocatedBalance + amount,
      lastTransactionAmount: amount,
      lastTransactionAt: new Date().toISOString(),
    })
    setScreen('deposit-success')
  }

  const addBucket = () => {
    if (!allocationIsValid) return
    const tones: Bucket['tone'][] = ['violet', 'amber', 'lilac', 'mint']
    const nextBucket: Bucket = {
      id: `${Date.now()}-${form.buckets.length}`,
      name: form.allocationName.trim(),
      amount: allocationAmountValue,
      tone: tones[form.buckets.length % tones.length],
    }

    updateForm({
      buckets: [...form.buckets, nextBucket],
      allocationName: '',
      allocationAmount: '',
      unallocatedBalance: Math.max(0, form.unallocatedBalance - allocationAmountValue),
    })
  }

  const removeBucket = (id: string) => {
    const bucket = form.buckets.find((entry) => entry.id === id)
    if (!bucket) return
    updateForm({
      buckets: form.buckets.filter((entry) => entry.id !== id),
      unallocatedBalance: form.unallocatedBalance + bucket.amount,
    })
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
            <div className="art-card intro-art-card">
              <img className={currentSlide.imageClassName} src={currentSlide.image} alt="" />
            </div>
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
        <FormScreen title="We just sent a code, tell us" description={`Code sent to ${form.countryCode}${form.phone}. Check your device for OTP.`} step={2} onBack={() => setScreen('phone')}>
          <OtpInput id="primary-otp" value={form.otp} onChange={(otp) => updateForm({ otp })} />
          <div className="otp-links">
            <button className="text-link" type="button" onClick={form.resendTimer === 0 ? () => updateForm({ otp: '', resendTimer: 14 }) : undefined}>{form.resendTimer === 0 ? 'Resend code now' : `Resend code in 00:${String(form.resendTimer).padStart(2, '0')}`}</button>
            <button className="text-link" type="button">Already have an account? Log in</button>
          </div>
          <div className="form-action"><PrimaryButton onClick={submitOtp} disabled={form.otp.length !== 6}>Next</PrimaryButton></div>
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
            <p>{form.passcodeConfirming ? 'Enter the same 4 digits again so we know you meant it.' : 'Passcode should be 4 digits'}</p>
          </div>
          <div className="passcode-stage passcode-stage-tight">
            <div className="passcode-dots">{[0, 1, 2, 3].map((index) => <span key={index} className={`passcode-dot${index < form.passcode.length ? ' filled' : ''}`} />)}</div>
            <PasscodeKeypad onDigit={handlePasscodeDigit} onDelete={handlePasscodeDelete} />
          </div>
          {form.passcodeError ? <p className="passcode-error">{form.passcodeError}</p> : null}
          <div className="bottom-action auth-action"><PrimaryButton onClick={submitPasscode} disabled={form.passcode.length !== 4} className="auth-button">Continue</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'all-set') {
      return (
        <div className="screen-content success-screen">
          <StatusBar />
          <div className="success-stage">
            <div className="art-card success-art-card"><img className="success-image" src="/spnd/image 15.svg" alt="" /></div>
            <div className="success-copy">
              <span className="success-chip">Setup complete</span>
              <h1>You're all set</h1>
              <p>Your account is ready. Let's get your money organized.</p>
            </div>
          </div>
          <div className="bottom-action"><PrimaryButton onClick={() => {
            updateForm({ completed: true })
            setScreen('home-empty')
          }}>Take me in</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'home-empty' || screen === 'home-funded') {
      const walletIntroTitle = hasMoney ? 'Your wallet is ready to organize.' : 'Your wallet is empty.'
      const walletIntroBody = hasMoney
        ? 'Your balance is live. Next, you can allocate money into buckets.'
        : 'Add funds to get started, then create buckets and track activity.'

      return (
        <div className="screen-content wallet-screen">
          <StatusBar />
          <div className="wallet-page-head">
            <span>SPND wallet</span>
            <p>{walletIntroTitle} {walletIntroBody}</p>
          </div>
          <div className={`wallet-card${hasMoney ? '' : ' wallet-card-empty'}`}>
            <div className="wallet-header-row">
              <div><span className="wallet-label">TOTAL BALANCE</span><h1>{formatCurrency(form.totalBalance)}</h1><p>{formatCurrency(form.unallocatedBalance)} unallocated</p></div>
              <button className="wallet-eye" type="button" aria-label="Show balance"><IconEye /></button>
            </div>
            <div className="wallet-actions-row">
              <button className="wallet-secondary" type="button" onClick={() => setScreen('select-source')}><span>Add funds</span><IconAdd /></button>
              <button className="wallet-secondary" type="button" disabled={!hasMoney} aria-disabled={!hasMoney}><span>Transfer</span><IconSwap /></button>
            </div>
            <button className="wallet-primary" type="button" disabled={!hasMoney} aria-disabled={!hasMoney} onClick={() => setScreen(hasBuckets ? 'allocate-buckets' : 'allocate-empty')}>Allocate funds</button>
          </div>

          <section className="wallet-section">
            <div className="section-heading"><h2>Bucket Breakdown</h2>{hasMoney ? <button type="button" onClick={() => setScreen(hasBuckets ? 'allocate-buckets' : 'allocate-empty')}>Manage</button> : null}</div>
            {hasBuckets ? (
              <div className="bucket-grid live-bucket-grid">
                {form.buckets.map((bucket) => (
                  <article key={bucket.id} className={`bucket-card bucket-card-${bucket.tone}`}>
                    <span className="bucket-icon" />
                    <h3>{bucket.name}</h3>
                    <p>{formatBucketAmount(bucket.amount)}</p>
                    <div className="bucket-bar"><span style={{ width: `${Math.max(8, Math.round((bucket.amount / Math.max(1, form.totalBalance)) * 100))}%` }} /></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                <h3>No buckets yet</h3>
                <p>{hasMoney ? 'Add your first bucket and start assigning money with purpose.' : 'Fund your wallet first, then create buckets and assign your money with purpose.'}</p>
                {!hasMoney ? <button className="inline-add-button" type="button" onClick={() => setScreen('select-source')}><span>Add funds</span><IconAdd /></button> : null}
              </div>
            )}
          </section>

          <section className="wallet-section wallet-section-activity">
            <div className="section-heading"><h2>Activity</h2></div>
            {hasMoney ? (
              <div className="activity-row">
                <div className="activity-left"><span className="activity-badge" /><div><h3>Wallet funding</h3><p>{formatTransactionTime(form.lastTransactionAt)}</p></div></div>
                <span className="activity-amount activity-amount-positive">+{formatCurrency(form.lastTransactionAmount)}</span>
              </div>
            ) : (
              <div className="empty-panel compact"><h3>No activity yet</h3><p>Your first wallet action will appear here as soon as you add money.</p></div>
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
            <div className="flow-kicker">Fund wallet - Step 1 of 3</div>
            <div className="sheet-header"><BackButton onClick={() => setScreen(homeScreen)} /><h1>Select source</h1></div>
            <p className="sheet-helper">Choose the card you want to charge before you continue.</p>
            {hasSavedCard ? (
              <>
                <div className="source-group">
                  <span className="source-group-title">Saved cards</span>
                  <button className={`source-item${form.selectedSource === 'saved-card' ? ' selected' : ''}`} type="button" onClick={() => updateForm({ selectedSource: 'saved-card' })}>
                    <span className="source-item-icon"><IconCard /></span>
                    <span className="source-item-copy"><strong>{form.cardholderName || 'Personal card'}</strong><small>{getSavedCardLabel(form.cardNumber)}</small></span>
                    <span className="source-radio" aria-hidden="true" />
                  </button>
                  <button className="source-item source-item-link" type="button" onClick={() => {
                    updateForm({ cardholderName: '', cardNumber: '', cardExpiry: '', cardCvv: '' })
                    setScreen('add-card')
                  }}>
                    <span className="source-item-icon"><IconAdd /></span>
                    <span className="source-item-copy"><strong>Add another card</strong><small>Use a different debit card</small></span>
                  </button>
                </div>
                <div className="sheet-action"><PrimaryButton onClick={() => setScreen('amount')} disabled={!form.selectedSource}>Continue</PrimaryButton></div>
              </>
            ) : (
              <div className="source-empty-state">
                <div className="source-empty-icon"><IconWalletCard /></div>
                <h2>No cards available</h2>
                <p>Add your first card to fund your wallet.</p>
                <button className="inline-add-button source-empty-button" type="button" onClick={() => setScreen('add-card')}><span>Add card</span><IconAdd /></button>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (screen === 'allocate-empty') {
      return (
        <div className="screen-content allocation-empty-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen('home-funded')} />
          <div className="flow-kicker flow-kicker-centered">Allocate funds</div>
          <div className="allocation-empty-copy">
            <h1>No buckets yet</h1>
            <p>Create buckets for the things you actually spend on, then move your wallet balance into them.</p>
          </div>
          <div className="allocation-empty-card">
            <strong>{formatCurrency(form.unallocatedBalance)}</strong>
            <span>Ready to allocate from your SPND wallet</span>
          </div>
          <div className="bottom-action">
            <PrimaryButton onClick={() => setScreen('allocate-buckets')}>Create first bucket</PrimaryButton>
          </div>
        </div>
      )
    }

    if (screen === 'allocate-buckets') {
      return (
        <div className="screen-content allocation-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen(hasBuckets ? 'home-funded' : 'allocate-empty')} />
          <div className="flow-kicker flow-kicker-centered">Allocate funds</div>
          <div className="allocation-copy">
            <h1>Bucket breakdown</h1>
            <p>{form.unallocatedBalance > 0 ? 'Add a bucket name and amount, then keep going until all your money has a role.' : 'Your wallet has been fully allocated. You can still remove a bucket and reassign the balance.'}</p>
          </div>
          <div className="allocation-balance-card">
            <span>Unallocated balance</span>
            <strong>{formatCurrency(form.unallocatedBalance)}</strong>
          </div>
          <div className="field-stack allocation-form-stack">
            <label className="field-card">
              <span className="field-label">Bucket name</span>
              <input className="field-input" value={form.allocationName} onChange={(event) => updateForm({ allocationName: event.target.value })} placeholder="e.g. Rent" />
            </label>
            <label className="field-card">
              <span className="field-label">Amount</span>
              <input className="field-input" value={form.allocationAmount} onChange={(event) => updateForm({ allocationAmount: formatMoneyInput(event.target.value) })} inputMode="numeric" placeholder="500" />
            </label>
          </div>
          <button className="inline-add-button allocation-add-button" type="button" onClick={addBucket} disabled={!allocationIsValid}>
            <span>Add bucket</span>
            <IconAdd />
          </button>
          <div className="allocation-list">
            {form.buckets.length === 0 ? (
              <div className="empty-panel compact">
                <h3>No allocations yet</h3>
                <p>Your first bucket will show up here.</p>
              </div>
            ) : (
              form.buckets.map((bucket) => (
                <article key={bucket.id} className={`allocation-item allocation-item-${bucket.tone}`}>
                  <div>
                    <h3>{bucket.name}</h3>
                    <p>{formatBucketAmount(bucket.amount)}</p>
                  </div>
                  <button type="button" onClick={() => removeBucket(bucket.id)}>Remove</button>
                </article>
              ))
            )}
          </div>
          <div className="bottom-action">
            <PrimaryButton onClick={() => setScreen('home-funded')} disabled={!hasBuckets}>Done</PrimaryButton>
          </div>
        </div>
      )
    }

    if (screen === 'add-card') {
      return (
        <div className="screen-content add-card-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen('select-source')} />
          <div className="flow-kicker flow-kicker-card-form">Fund wallet - Step 1 of 3</div>
          <div className="card-preview">
            <span className="card-preview-chip" />
            <span className="card-preview-brand">DEBIT</span>
            <strong>{form.cardNumber || '1234 3214 2134 2341'}</strong>
            <div className="card-preview-meta">
              <div><small>CARD HOLDER</small><span>{form.cardholderName || 'Your name'}</span></div>
              <div><small>EXPIRES</small><span>{form.cardExpiry || 'MM/YY'}</span></div>
            </div>
          </div>
          <div className="card-form-copy">
            <h1>Select source</h1>
            <p>Choose to add a debit card, then enter the details you want to use.</p>
          </div>
          <div className="field-stack card-form-stack">
            <label className="field-card">
              <span className="field-label">CARD NUMBER</span>
              <input className="field-input" value={form.cardNumber} onChange={(event) => updateForm({ cardNumber: formatCardNumberInput(event.target.value) })} inputMode="numeric" placeholder="1234 5678 9012 3456" />
            </label>
            <label className="field-card">
              <span className="field-label">CARDHOLDER NAME</span>
              <input className="field-input" value={form.cardholderName} onChange={(event) => updateForm({ cardholderName: event.target.value })} placeholder="e.g. Ruth Ade" />
            </label>
            <div className="card-form-row">
              <label className="field-card">
                <span className="field-label">EXPIRY DATE</span>
                <input className="field-input" value={form.cardExpiry} onChange={(event) => updateForm({ cardExpiry: formatCardExpiryInput(event.target.value) })} inputMode="numeric" placeholder="MM/YY" />
              </label>
              <label className="field-card">
                <span className="field-label">CCV / CVC</span>
                <input className="field-input" value={form.cardCvv} onChange={(event) => updateForm({ cardCvv: event.target.value.replace(/\D/g, '').slice(0, 3) })} inputMode="numeric" placeholder="123" />
              </label>
            </div>
          </div>
          <div className="bottom-action card-form-action"><PrimaryButton onClick={linkCard} disabled={!cardIsValid}>Save card</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'card-pin') {
      return (
        <div className="screen-content auth-screen card-pin-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen('add-card')} />
          <div className="flow-kicker flow-kicker-card-form">Fund wallet - Step 1 of 3</div>
          <div className="card-pin-copy">
            <img className="card-pin-illustration" src="/spnd/image 14.svg" alt="" />
            <h1>Enter PIN</h1>
            <p>To authorize this new card, please enter your 4-digit card PIN.</p>
          </div>
          <div className="passcode-stage passcode-stage-tight card-pin-stage">
            <div className="passcode-dots">{[0, 1, 2, 3].map((index) => <span key={index} className={`passcode-dot${index < form.cardPin.length ? ' filled' : ''}`} />)}</div>
            <PasscodeKeypad onDigit={handleCardPinDigit} onDelete={handleCardPinDelete} />
          </div>
          {form.cardPin.length === 4 ? <div className="card-pin-hint">Card PIN was correct</div> : null}
          <div className="bottom-action auth-action"><PrimaryButton onClick={submitCardPin} disabled={form.cardPin.length !== 4} className="auth-button">Save and continue</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'card-added') {
      return (
        <div className="screen-content card-success-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen('select-source')} />
          <div className="flow-kicker flow-kicker-card">Fund wallet - Step 1 of 3</div>
          <img className="card-added-image" src="/spnd/Gemini_Generated_Image_c6t1i2c6t1i2c6t1-removebg-preview 1.svg" alt="" />
          <div className="card-added-copy">
            <h1>Card successfully added</h1>
            <p>{`${getSavedCardLabel(form.cardNumber)} is ready. Next, choose how much you want to add to your wallet.`}</p>
          </div>
          <div className="bottom-action"><PrimaryButton onClick={() => setScreen('amount')}>Continue to add money</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'amount') {
      return (
        <div className="screen-content amount-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen('select-source')} />
          <div className="flow-kicker flow-kicker-centered">Fund wallet - Step 2 of 3</div>
          <div className="amount-copy"><h1>Enter amount to add</h1><p>Choose how much you want to move into your SPND wallet.</p></div>
          <div className="source-summary"><span>Funding source</span><strong>{getSavedCardLabel(form.cardNumber)}</strong></div>
          <label className="amount-field"><span>$</span><input value={form.amountToAdd} onChange={(event) => updateForm({ amountToAdd: formatMoneyInput(event.target.value) })} inputMode="numeric" placeholder="0" /></label>
          <div className="quick-amounts">{['500', '1000', '10000'].map((amount) => <button key={amount} className={form.amountToAdd === amount ? 'active' : ''} type="button" onClick={() => updateForm({ amountToAdd: amount })}>{formatCurrency(Number(amount))}</button>)}</div>
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
          <div className="flow-kicker flow-kicker-auth">Fund wallet - Step 3 of 3</div>
          <div className="auth-copy">
            <h1>We just want to be sure</h1>
            <p>OTP Code sent to email and number linked to your card. Check your device for OTP.</p>
          </div>
          <div className="deposit-review-card">
            <div><span>Amount</span><strong>{formatCurrency(Number(form.amountToAdd || 0))}</strong></div>
            <div><span>Source</span><strong>{getSavedCardLabel(form.cardNumber)}</strong></div>
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
            <p>Your wallet has been funded successfully. Here is the transaction summary.</p>
          </div>
          <div className="receipt-card">
            <div className="receipt-row"><span>Status</span><strong>Successful</strong></div>
            <div className="receipt-row"><span>Amount</span><strong>{formatCurrency(form.lastTransactionAmount)}</strong></div>
            <div className="receipt-row"><span>Source</span><strong>{getSavedCardLabel(form.cardNumber)}</strong></div>
            <div className="receipt-row"><span>Destination</span><strong>SPND Wallet</strong></div>
            <div className="receipt-row"><span>Date</span><strong>{formatTransactionTime(form.lastTransactionAt)}</strong></div>
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
          <PrimaryButton onClick={() => setScreen('receipt')} className="deposit-primary">View receipt</PrimaryButton>
          <button className="deposit-secondary" type="button" onClick={() => setScreen('home-funded')}>Go to wallet</button>
        </div>
      </div>
    )
  }

  return <main className="app-shell"><section className="phone-frame">{renderScreen()}</section></main>
}

