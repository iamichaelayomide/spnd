import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRightLeft,
  BadgeDollarSign,
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  CreditCard,
  Delete,
  Eye,
  Landmark,
  PiggyBank,
  Plus,
  ReceiptText,
  ShieldCheck,
  UtensilsCrossed,
  WalletCards,
  CarFront,
  Wifi,
  X,
} from 'lucide-react'

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
  | 'allocation-review'
  | 'allocation-success'
  | 'bucket-detail'
  | 'bucket-transfer'
  | 'bucket-transfer-review'
  | 'bucket-transfer-success'
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
  allocationMode: 'amount' | 'percent'
  activeBucketId: string
  bucketTransferAmount: string
  bucketSequence: number
  buckets: Bucket[]
  fundsOtp: string
  fundsOtpTimer: number
  lastTransactionAmount: number
  lastTransactionAt: string
  lastTransactionTitle: string
  lastTransactionSource: string
  lastTransactionDestination: string
  totalBalance: number
  unallocatedBalance: number
  completed: boolean
}

const STORAGE_KEY = 'spnd:onboarding:v3'
const INTRO_SCREENS: Screen[] = ['intro-plan', 'intro-know', 'intro-purpose', 'intro-setup']

const INTRO_SLIDES = [
  { key: 'intro-plan' as const, eyebrow: 'Welcome to SPND', title: 'Plan your SPNDing', body: 'Decide where your money goes before you spend it.', image: '/spnd/image 5.png', imageClassName: 'intro-image intro-image-plan', button: 'Next', activeDot: 1 },
  { key: 'intro-know' as const, eyebrow: 'Welcome to SPND', title: 'Know your SPNDing', body: 'See your spending clearly, without guesswork.', image: '/spnd/image 4.png', imageClassName: 'intro-image intro-image-know', button: 'Next', activeDot: 2 },
  { key: 'intro-purpose' as const, eyebrow: 'Welcome to SPND', title: 'SPND on purpose', body: 'Give every dollar a role and spend with confidence.', image: '/spnd/image 6.svg', imageClassName: 'intro-image intro-image-purpose', button: 'Next', activeDot: 3 },
  { key: 'intro-setup' as const, eyebrow: 'Welcome to SPND', title: "Let's set this up properly", body: 'It only takes a moment to get your money organized.', image: '/spnd/image 10.svg', imageClassName: 'intro-image intro-image-setup', button: 'Get started', activeDot: 4 },
]

const COUNTRIES = [
  { name: 'Nigeria', code: '+234', phoneLength: 11, placeholder: '07032891651', flag: 'ng' },
  { name: 'United States', code: '+1', phoneLength: 10, placeholder: '2015550123', flag: 'us' },
  { name: 'United Kingdom', code: '+44', phoneLength: 11, placeholder: '07400123456', flag: 'uk' },
  { name: 'Canada', code: '+1', phoneLength: 10, placeholder: '4165550123', flag: 'ca' },
] as const

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
    allocationMode: 'amount',
    activeBucketId: '',
    bucketTransferAmount: '',
    bucketSequence: 0,
    buckets: [],
    fundsOtp: '',
    fundsOtpTimer: 14,
    lastTransactionAmount: 0,
    lastTransactionAt: '',
    lastTransactionTitle: '',
    lastTransactionSource: '',
    lastTransactionDestination: '',
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

function getBucketShare(amount: number, total: number) {
  if (!total) return 0
  return Math.round((amount / total) * 100)
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
      <ArrowLeft size={16} strokeWidth={1.9} aria-hidden="true" />
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
  return <CreditCard size={18} strokeWidth={1.8} aria-hidden="true" />
}

function IconAdd() {
  return <Plus size={18} strokeWidth={1.8} aria-hidden="true" />
}

function IconSwap() {
  return <ArrowRightLeft size={18} strokeWidth={1.8} aria-hidden="true" />
}

function IconEye() {
  return <Eye size={18} strokeWidth={1.8} aria-hidden="true" />
}

function IconWalletCard() {
  return <WalletCards size={22} strokeWidth={1.8} aria-hidden="true" />
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
            if (key === 'delete') return <button key="delete" className="passcode-key delete" type="button" onClick={onDelete} aria-label="Delete digit"><Delete size={18} strokeWidth={1.8} aria-hidden="true" /></button>
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

function BucketGlyph({ tone }: { tone: Bucket['tone'] }) {
  const iconProps = { size: 16, strokeWidth: 1.9, 'aria-hidden': true as const }

  if (tone === 'amber') return <Landmark {...iconProps} />
  if (tone === 'lilac') return <BadgeDollarSign {...iconProps} />
  if (tone === 'mint') return <WalletCards {...iconProps} />
  return <PiggyBank {...iconProps} />
}

function PurposeFlowHeader({ onRestart }: { onRestart?: () => void }) {
  return (
    <div className="purpose-flow-header">
      <div className="purpose-flow-chip">
        <span className="purpose-flow-chip-icon"><WalletCards size={12} strokeWidth={1.8} aria-hidden="true" /></span>
        <span>Purpose</span>
      </div>
      {onRestart ? <button className="purpose-flow-restart" type="button" onClick={onRestart}>Restart</button> : null}
    </div>
  )
}

function AllocationToneIcon({ tone }: { tone: Bucket['tone'] }) {
  const iconProps = { size: 11, strokeWidth: 1.9, 'aria-hidden': true as const }

  if (tone === 'amber') return <CarFront {...iconProps} />
  if (tone === 'lilac') return <Wifi {...iconProps} />
  if (tone === 'mint') return <Landmark {...iconProps} />
  return <UtensilsCrossed {...iconProps} />
}

function ReceiptCard({
  title,
  helper,
  amount,
  source,
  destination,
  timestamp,
}: {
  title: string
  helper: string
  amount: number
  source: string
  destination: string
  timestamp: string
}) {
  return (
    <>
      <div className="receipt-copy">
        <div className="receipt-badge"><ReceiptText size={16} strokeWidth={1.9} aria-hidden="true" /> Transaction receipt</div>
        <h1>{title}</h1>
        <p>{helper}</p>
      </div>
      <div className="receipt-card receipt-card-polished">
        <div className="receipt-status-row">
          <div className="receipt-status-copy">
            <span>Status</span>
            <strong>Successful</strong>
          </div>
          <div className="receipt-status-icon"><CircleCheckBig size={18} strokeWidth={2} aria-hidden="true" /></div>
        </div>
        <div className="receipt-amount-hero">
          <span>Total amount</span>
          <strong>{formatCurrency(amount)}</strong>
        </div>
        <div className="receipt-rows">
          <div className="receipt-row"><span>Source</span><strong>{source}</strong></div>
          <div className="receipt-row"><span>Destination</span><strong>{destination}</strong></div>
          <div className="receipt-row"><span>Date</span><strong>{formatTransactionTime(timestamp)}</strong></div>
        </div>
      </div>
    </>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    const initial = loadState()
    return initial.completed ? (initial.totalBalance > 0 ? 'home-funded' : 'home-empty') : 'splash'
  })
  const [form, setForm] = useState<FormState>(() => loadState())
  const selectedCountry = COUNTRIES.find((country) => country.name === form.country) ?? COUNTRIES[0]

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
  const activeBucket = form.buckets.find((bucket) => bucket.id === form.activeBucketId) ?? form.buckets[0] ?? null
  const allocationRawValue = Number(form.allocationAmount || 0)
  const allocationAmountValue = form.allocationMode === 'percent'
    ? Math.round((form.totalBalance * allocationRawValue) / 100)
    : allocationRawValue
  const bucketTransferAmountValue = Number(form.bucketTransferAmount || 0)
  const allocationIsValid = form.allocationName.trim().length >= 2
    && allocationAmountValue > 0
    && (form.allocationMode === 'amount' || allocationRawValue <= 100)
    && allocationAmountValue <= form.unallocatedBalance
  const bucketTransferIsValid = Boolean(activeBucket)
    && bucketTransferAmountValue > 0
    && bucketTransferAmountValue <= form.unallocatedBalance
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
    if (form.phone.length !== selectedCountry.phoneLength) return
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
      lastTransactionTitle: 'Wallet funding',
      lastTransactionSource: getSavedCardLabel(form.cardNumber),
      lastTransactionDestination: 'SPND Wallet',
    })
    setScreen('deposit-success')
  }

  const restartAllocationFlow = () => {
    updateForm({
      allocationName: '',
      allocationAmount: '',
      allocationMode: 'amount',
      activeBucketId: '',
      bucketTransferAmount: '',
      bucketSequence: 0,
      buckets: [],
      unallocatedBalance: form.totalBalance,
    })
    setScreen('allocate-buckets')
  }

  const addBucket = () => {
    if (!allocationIsValid) return
    const tones: Bucket['tone'][] = ['violet', 'amber', 'lilac', 'mint']
    const nextBucket: Bucket = {
      id: `bucket-${form.bucketSequence + 1}`,
      name: form.allocationName.trim(),
      amount: allocationAmountValue,
      tone: tones[form.buckets.length % tones.length],
    }

    updateForm({
      buckets: [...form.buckets, nextBucket],
      allocationName: '',
      allocationAmount: '',
      allocationMode: 'amount',
      bucketSequence: form.bucketSequence + 1,
      unallocatedBalance: Math.max(0, form.unallocatedBalance - allocationAmountValue),
    })
  }

  const openBucket = (bucketId: string) => {
    updateForm({ activeBucketId: bucketId, bucketTransferAmount: '' })
    setScreen('bucket-detail')
  }

  const submitBucketTransfer = () => {
    if (!activeBucket || !bucketTransferIsValid) return

    updateForm({
      buckets: form.buckets.map((bucket) => bucket.id === activeBucket.id
        ? { ...bucket, amount: bucket.amount + bucketTransferAmountValue }
        : bucket),
      unallocatedBalance: Math.max(0, form.unallocatedBalance - bucketTransferAmountValue),
      bucketTransferAmount: '',
      lastTransactionAmount: bucketTransferAmountValue,
      lastTransactionAt: new Date().toISOString(),
      lastTransactionTitle: `Transfer to ${activeBucket.name}`,
      lastTransactionSource: 'SPND Wallet',
      lastTransactionDestination: activeBucket.name,
    })
    setScreen('bucket-transfer-success')
  }

  if (screen === 'splash') {
    return (
      <main className="app-shell">
        <section className="phone-frame splash-frame">
          <button className="screen-content splash-screen" type="button" onClick={() => setScreen('intro-plan')} aria-label="Start onboarding">
            <StatusBar />
            <div className="splash-brandmark" aria-hidden="true">
              <span className="splash-symbol-wrap" data-node-id="685:4678">
                <img className="splash-symbol" src={splashVector} alt="" />
              </span>
              <span className="splash-wordmark" data-node-id="642:4411">SPND</span>
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
            <div className="bottom-action bottom-action-stack">
              <PrimaryButton onClick={() => setScreen(currentSlide.key === 'intro-setup' ? 'name' : INTRO_SCREENS[INTRO_SCREENS.indexOf(currentSlide.key) + 1])}>
                {currentSlide.button}
              </PrimaryButton>
              <button className="auth-entry-link" type="button" onClick={() => setScreen('phone')}>
                Already have an account? <span className="auth-link-accent">Log in</span>
              </button>
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
              <span className={`country-flag country-flag-${selectedCountry.flag}`} aria-hidden="true">
                <i className="band-1" />
                <i className="band-2" />
                <i className="band-3" />
              </span>
              <select className="country-select" value={form.country} onChange={(event) => {
                const selected = COUNTRIES.find((country) => country.name === event.target.value) ?? COUNTRIES[0]
                updateForm({ country: selected.name, countryCode: selected.code, phone: form.phone.slice(0, selected.phoneLength) })
              }}>{COUNTRIES.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}</select>
              <span className="country-meta">
                <span className="country-name">{selectedCountry.name}</span>
                <span className="country-code">{form.countryCode}</span>
              </span>
              <span className="country-chevron" aria-hidden="true">
                <ChevronDown size={12} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </label>
            <label className="field-card field-card-phone">
              <span className="field-label">Mobile number</span>
              <input
                className="field-input"
                value={form.phone}
                onChange={(event) => updateForm({ phone: event.target.value.replace(/\D/g, '').slice(0, selectedCountry.phoneLength) })}
                inputMode="numeric"
                placeholder={selectedCountry.placeholder}
                aria-describedby="phone-helper"
              />
            </label>
          </div>
          <p id="phone-helper" className="phone-helper">
            Use a valid {selectedCountry.name} mobile number with {selectedCountry.phoneLength} digits.
          </p>
          <button className="text-link auth-entry-link" type="button">Already have an account? <span className="auth-link-accent">Log in</span></button>
          <div className="form-action"><PrimaryButton onClick={submitPhone} disabled={form.phone.length !== selectedCountry.phoneLength}>Next</PrimaryButton></div>
        </FormScreen>
      )
    }

    if (screen === 'otp') {
      return (
        <FormScreen title="We just sent a code, tell us" description={`Code sent to ${form.countryCode}${form.phone}. Check your device for OTP.`} step={2} onBack={() => setScreen('phone')}>
          <OtpInput id="primary-otp" value={form.otp} onChange={(otp) => updateForm({ otp })} />
          <div className="otp-links">
            <button className="text-link" type="button" onClick={form.resendTimer === 0 ? () => updateForm({ otp: '', resendTimer: 14 }) : undefined}>{form.resendTimer === 0 ? 'Resend code now' : `Resend code in 00:${String(form.resendTimer).padStart(2, '0')}`}</button>
            <button className="text-link auth-entry-link" type="button">Already have an account? <span className="auth-link-accent">Log in</span></button>
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
      return (
        <div className="screen-content wallet-screen">
          <StatusBar />
          <div className={`wallet-card${hasMoney ? '' : ' wallet-card-empty'}`}>
            <div className="wallet-header-row">
              <div><span className="wallet-label">TOTAL BALANCE</span><h1>{formatCurrency(form.totalBalance)}</h1><p>{formatCurrency(form.unallocatedBalance)} unallocated</p></div>
              <button className="wallet-eye" type="button" aria-label="Show balance"><IconEye /></button>
            </div>
            <div className="wallet-actions-row">
              <button className="wallet-secondary" type="button" onClick={() => setScreen('select-source')}><span>Add funds</span><IconAdd /></button>
              <button
                className="wallet-secondary"
                type="button"
                disabled={!hasMoney || !hasBuckets}
                aria-disabled={!hasMoney || !hasBuckets}
                onClick={() => {
                  if (!hasBuckets) return
                  openBucket(form.buckets[0].id)
                }}
              >
                <span>Transfer</span>
                <IconSwap />
              </button>
            </div>
            <button className="wallet-primary" type="button" disabled={!hasMoney} aria-disabled={!hasMoney} onClick={() => setScreen(hasBuckets ? 'allocate-buckets' : 'allocate-empty')}>Allocate funds</button>
          </div>

          <section className="wallet-section">
            <div className="section-heading"><h2>Bucket Breakdown</h2>{hasMoney ? <button type="button" onClick={() => setScreen(hasBuckets ? 'allocate-buckets' : 'allocate-empty')}>Manage</button> : null}</div>
            {hasBuckets ? (
              <div className="bucket-grid live-bucket-grid">
                {form.buckets.map((bucket) => (
                  <button key={bucket.id} className={`bucket-card bucket-card-${bucket.tone} bucket-card-button`} type="button" onClick={() => openBucket(bucket.id)}>
                    <span className="bucket-icon"><BucketGlyph tone={bucket.tone} /></span>
                    <h3>{bucket.name}</h3>
                    <p>{formatBucketAmount(bucket.amount)}</p>
                    <div className="bucket-bar"><span style={{ width: `${Math.max(8, Math.round((bucket.amount / Math.max(1, form.totalBalance)) * 100))}%` }} /></div>
                    <span className="bucket-link-row">Open bucket <ChevronRight size={14} strokeWidth={1.9} aria-hidden="true" /></span>
                  </button>
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
        <div className="screen-content allocation-screen figma-allocation-screen">
          <StatusBar />
          <PurposeFlowHeader onRestart={hasBuckets ? restartAllocationFlow : undefined} />
          <div className="figma-allocation-intro">
            <div className="figma-allocation-copy">
              <span>STEP 3: MATH</span>
              <h1>Assign Value</h1>
            </div>
            <div className="figma-allocation-total">
              <span>TOTAL</span>
              <strong>{formatCurrency(form.totalBalance)}</strong>
            </div>
          </div>
          <div className="figma-allocation-card-list">
            <article className="figma-allocation-card figma-allocation-card-draft">
              <div className="figma-allocation-card-top">
                <label className="figma-allocation-name">
                  <AllocationToneIcon tone="violet" />
                  <input value={form.allocationName} onChange={(event) => updateForm({ allocationName: event.target.value })} placeholder="Bucket name" />
                </label>
                <span className="figma-allocation-pill">{formatCurrency(allocationAmountValue)}</span>
              </div>
              <div className="figma-allocation-card-bottom">
                <div className="figma-allocation-segmented" role="tablist" aria-label="Allocation input mode">
                  <button className={form.allocationMode === 'amount' ? 'active' : ''} type="button" onClick={() => updateForm({ allocationMode: 'amount', allocationAmount: '' })}>$</button>
                  <button className={form.allocationMode === 'percent' ? 'active' : ''} type="button" onClick={() => updateForm({ allocationMode: 'percent', allocationAmount: '' })}>%</button>
                </div>
                <label className="figma-allocation-input">
                  <input
                    value={form.allocationAmount}
                    onChange={(event) => updateForm({
                      allocationAmount: form.allocationMode === 'percent'
                        ? event.target.value.replace(/\D/g, '').slice(0, 3)
                        : formatMoneyInput(event.target.value),
                    })}
                    inputMode="numeric"
                    placeholder="0"
                  />
                </label>
              </div>
            </article>
            {form.buckets.map((bucket) => (
              <article key={bucket.id} className={`figma-allocation-card figma-allocation-card-${bucket.tone}`}>
                <div className="figma-allocation-card-top">
                  <div className="figma-allocation-name figma-allocation-name-static">
                    <AllocationToneIcon tone={bucket.tone} />
                    <span>{bucket.name}</span>
                  </div>
                  <span className="figma-allocation-pill">{formatBucketAmount(bucket.amount)}</span>
                </div>
                <div className="figma-allocation-card-bottom">
                  <div className="figma-allocation-segmented" aria-hidden="true">
                    <button className="active" type="button">$</button>
                    <button type="button">%</button>
                  </div>
                  <div className="figma-allocation-input figma-allocation-input-static">{bucket.amount}</div>
                </div>
              </article>
            ))}
          </div>
          <div className="figma-allocation-footer">
            <div className="figma-allocation-balance-row">
              <span>Unassigned Money</span>
              <strong>{formatCurrency(form.unallocatedBalance)}</strong>
            </div>
            <div className="figma-allocation-balance-bar" aria-hidden="true">
              <span style={{ width: `${Math.min(100, Math.max(0, form.totalBalance ? Math.round((form.unallocatedBalance / form.totalBalance) * 100) : 0))}%` }} />
            </div>
            <button className="figma-allocation-add-link" type="button" onClick={addBucket} disabled={!allocationIsValid}>Add current bucket</button>
          </div>
          <div className="bottom-action figma-allocation-action">
            <PrimaryButton onClick={() => setScreen('allocation-review')} disabled={!hasBuckets}>Review Plan</PrimaryButton>
          </div>
        </div>
      )
    }

    if (screen === 'allocation-review') {
      return (
        <div className="screen-content allocation-review-screen figma-review-screen">
          <StatusBar />
          <PurposeFlowHeader onRestart={restartAllocationFlow} />
          <div className="allocation-copy">
            <span className="figma-step-kicker">STEP 4: REVIEW</span>
            <h1>The Breakdown</h1>
          </div>
          <div className="allocation-review-card">
            <div className="allocation-review-row total">
              <span>Total inflow</span>
              <strong>{formatCurrency(form.totalBalance)}</strong>
            </div>
            <div className="allocation-review-list">
              {form.buckets.map((bucket) => (
                <div key={bucket.id} className="allocation-review-row">
                  <div className="allocation-review-bucket">
                    <span className={`allocation-review-icon allocation-review-icon-${bucket.tone}`}><AllocationToneIcon tone={bucket.tone} /></span>
                    <div>
                      <strong>{bucket.name}</strong>
                      <span>{getBucketShare(bucket.amount, form.totalBalance)}% of total</span>
                    </div>
                  </div>
                  <strong>{formatCurrency(bucket.amount)}</strong>
                </div>
              ))}
            </div>
            <div className="allocation-review-row total leftover">
              <span>Leftover</span>
              <strong>{formatCurrency(form.unallocatedBalance)}</strong>
            </div>
          </div>
          <button className="allocation-edit-link" type="button" onClick={() => setScreen('allocate-buckets')}>Go Back &amp; Edit</button>
          <div className="bottom-action figma-review-action">
            <PrimaryButton onClick={() => setScreen('allocation-success')}>Apply Allocation</PrimaryButton>
          </div>
        </div>
      )
    }

    if (screen === 'allocation-success') {
      return (
        <div className="screen-content allocation-success-screen figma-success-screen">
          <StatusBar />
          <div className="allocation-success-stage">
            <div className="allocation-success-art" aria-hidden="true">
              <img src="/spnd/image 16.svg" alt="" />
            </div>
            <h1>Money Allocated</h1>
            <p>Your intent has been translated into action. The Numbers are clear.</p>
            <PrimaryButton onClick={() => setScreen('home-funded')} className="deposit-primary">View Wallet</PrimaryButton>
          </div>
        </div>
      )
    }

    if (screen === 'bucket-detail' && activeBucket) {
      const bucketShare = getBucketShare(activeBucket.amount, form.totalBalance)

      return (
        <div className="screen-content bucket-detail-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen('home-funded')} />
          <div className="flow-kicker flow-kicker-centered">Bucket details</div>
          <div className={`bucket-detail-hero bucket-detail-hero-${activeBucket.tone}`}>
            <div className="bucket-detail-icon"><BucketGlyph tone={activeBucket.tone} /></div>
            <div className="bucket-detail-copy">
              <span>{bucketShare}% of wallet balance</span>
              <h1>{activeBucket.name}</h1>
              <strong>{formatBucketAmount(activeBucket.amount)}</strong>
            </div>
          </div>
          <div className="bucket-metrics">
            <div className="bucket-metric-card">
              <span>Available in wallet</span>
              <strong>{formatCurrency(form.unallocatedBalance)}</strong>
            </div>
            <div className="bucket-metric-card">
              <span>Latest movement</span>
              <strong>{form.lastTransactionDestination === activeBucket.name ? formatCurrency(form.lastTransactionAmount) : 'No transfer yet'}</strong>
            </div>
          </div>
          <div className="bucket-detail-actions">
            <button className="bucket-detail-action primary" type="button" onClick={() => setScreen('bucket-transfer')}>
              <span className="bucket-detail-action-icon"><Plus size={18} strokeWidth={1.9} aria-hidden="true" /></span>
              <span><strong>Move money in</strong><small>Transfer from your unallocated wallet balance</small></span>
            </button>
            <button className="bucket-detail-action" type="button" onClick={() => setScreen('allocate-buckets')}>
              <span className="bucket-detail-action-icon"><ShieldCheck size={18} strokeWidth={1.9} aria-hidden="true" /></span>
              <span><strong>Edit allocation</strong><small>Rename, remove, or rebalance this bucket</small></span>
            </button>
          </div>
          <div className="bucket-activity-panel">
            <div className="section-heading"><h2>Bucket activity</h2></div>
            {form.lastTransactionDestination === activeBucket.name ? (
              <div className="activity-row">
                <div className="activity-left">
                  <span className="activity-badge" />
                  <div>
                    <h3>{form.lastTransactionTitle}</h3>
                    <p>{formatTransactionTime(form.lastTransactionAt)}</p>
                  </div>
                </div>
                <span className="activity-amount activity-amount-positive">+{formatCurrency(form.lastTransactionAmount)}</span>
              </div>
            ) : (
              <div className="empty-panel compact">
                <h3>No transfers yet</h3>
                <p>This bucket is ready. Move money into it when you are ready to fund it.</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (screen === 'bucket-transfer' && activeBucket) {
      return (
        <div className="screen-content amount-screen bucket-transfer-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen('bucket-detail')} />
          <div className="flow-kicker flow-kicker-centered">Transfer - Step 1 of 2</div>
          <div className="amount-copy">
            <h1>How much should go into {activeBucket.name}?</h1>
            <p>Move only from your unallocated wallet balance so your plan stays accurate.</p>
          </div>
          <div className="source-summary source-summary-split">
            <div><span>From</span><strong>SPND Wallet</strong></div>
            <div><span>Available</span><strong>{formatCurrency(form.unallocatedBalance)}</strong></div>
          </div>
          <div className={`bucket-inline-card bucket-inline-card-${activeBucket.tone}`}>
            <span className="bucket-inline-icon"><BucketGlyph tone={activeBucket.tone} /></span>
            <div><span>Destination bucket</span><strong>{activeBucket.name}</strong></div>
          </div>
          <label className="amount-field">
            <span>$</span>
            <input value={form.bucketTransferAmount} onChange={(event) => updateForm({ bucketTransferAmount: formatMoneyInput(event.target.value) })} inputMode="numeric" placeholder="0" />
          </label>
          <div className="quick-amounts">{['100', '250', '500'].map((amount) => <button key={amount} className={form.bucketTransferAmount === amount ? 'active' : ''} type="button" onClick={() => updateForm({ bucketTransferAmount: amount })}>{formatCurrency(Number(amount))}</button>)}</div>
          <div className="bottom-action amount-action"><PrimaryButton onClick={() => setScreen('bucket-transfer-review')} disabled={!bucketTransferIsValid}>Review transfer</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'bucket-transfer-review' && activeBucket) {
      return (
        <div className="screen-content auth-screen bucket-review-screen">
          <StatusBar />
          <BackButton onClick={() => setScreen('bucket-transfer')} />
          <AuthProgress />
          <div className="flow-kicker flow-kicker-auth">Transfer - Step 2 of 2</div>
          <div className="auth-copy">
            <h1>Review transfer</h1>
            <p>Check the destination and amount before you finalize the movement.</p>
          </div>
          <div className="deposit-review-card transfer-review-card">
            <div><span>Amount</span><strong>{formatCurrency(bucketTransferAmountValue)}</strong></div>
            <div><span>From</span><strong>SPND Wallet</strong></div>
            <div><span>To</span><strong>{activeBucket.name}</strong></div>
          </div>
          <div className="transfer-review-note">
            <ShieldCheck size={18} strokeWidth={1.9} aria-hidden="true" />
            <p>This keeps your total balance unchanged and only moves money into the selected bucket.</p>
          </div>
          <div className="bottom-action auth-action"><PrimaryButton onClick={submitBucketTransfer} disabled={!bucketTransferIsValid} className="auth-button">Confirm transfer</PrimaryButton></div>
        </div>
      )
    }

    if (screen === 'bucket-transfer-success') {
      return (
        <div className="screen-content deposit-success-screen bucket-transfer-success-screen">
          <StatusBar />
          <button className="close-button close-button-corner" type="button" onClick={() => setScreen('home-funded')} aria-label="Close">
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
          <div className="deposit-success-stage">
            <div className="deposit-success-icon deposit-success-icon-lucide"><CircleCheckBig size={46} strokeWidth={1.9} aria-hidden="true" /></div>
            <h1>Transfer successful</h1>
            <p>{form.lastTransactionDestination} has been funded from your wallet.</p>
            <div className="deposit-amount-card"><span>Amount moved</span><strong>{formatCurrency(form.lastTransactionAmount)}</strong></div>
            <PrimaryButton onClick={() => setScreen('receipt')} className="deposit-primary">View receipt</PrimaryButton>
            <button className="deposit-secondary" type="button" onClick={() => setScreen('bucket-detail')}>Back to bucket</button>
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
        <div className="screen-content amount-screen figma-inflow-screen">
          <StatusBar />
          <PurposeFlowHeader />
          <div className="figma-inflow-copy">
            <span className="figma-step-kicker">STEP 1: INFLOW</span>
            <h1>How much do you want to allocate?</h1>
          </div>
          <label className="figma-inflow-field">
            <span>$</span>
            <input value={form.amountToAdd} onChange={(event) => updateForm({ amountToAdd: formatMoneyInput(event.target.value) })} inputMode="numeric" placeholder="" />
          </label>
          <p className="figma-inflow-helper">Enter your total income, deposit, or windfall.</p>
          <div className="bottom-action amount-action figma-inflow-action"><PrimaryButton onClick={() => {
            updateForm({ fundsOtp: '', fundsOtpTimer: 14 })
            setScreen('funds-otp')
          }} disabled={!form.amountToAdd}>Define Intent</PrimaryButton></div>
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
          <BackButton onClick={() => setScreen(form.lastTransactionDestination === 'SPND Wallet' ? 'deposit-success' : 'bucket-transfer-success')} />
          <ReceiptCard
            title={form.lastTransactionTitle || 'Transaction receipt'}
            helper={form.lastTransactionDestination === 'SPND Wallet'
              ? 'Your wallet has been funded successfully. Here is the transaction summary.'
              : 'Your bucket transfer is complete. Here is the transaction summary.'}
            amount={form.lastTransactionAmount}
            source={form.lastTransactionSource || getSavedCardLabel(form.cardNumber)}
            destination={form.lastTransactionDestination || 'SPND Wallet'}
            timestamp={form.lastTransactionAt}
          />
          <div className="bottom-action"><PrimaryButton onClick={() => setScreen('home-funded')}>Done</PrimaryButton></div>
        </div>
      )
    }

    return (
      <div className="screen-content deposit-success-screen">
        <StatusBar />
        <button className="close-button close-button-corner" type="button" onClick={() => setScreen('home-funded')} aria-label="Close">
          <X size={18} strokeWidth={2} aria-hidden="true" />
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

