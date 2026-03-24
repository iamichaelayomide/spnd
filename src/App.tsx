import { useEffect, useMemo, useState } from 'react'

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

type FormState = {
  firstName: string
  lastName: string
  country: string
  countryCode: string
  phone: string
  otp: string
  resendTimer: number
  passcodeFirstEntry: string
  passcode: string
  passcodeError: string
  passcodeSaved: boolean
  completed: boolean
}

const STORAGE_KEY = 'spnd:onboarding'
const SCREEN_ORDER: Screen[] = [
  'splash',
  'intro-plan',
  'intro-know',
  'intro-purpose',
  'intro-setup',
  'name',
  'phone',
  'otp',
  'passcode',
  'all-set',
]

const FORM_STEP_META: Record<'name' | 'phone' | 'otp' | 'passcode', { step: 1 | 2 | 3; label: string }> = {
  name: { step: 1, label: 'Your identity' },
  phone: { step: 2, label: 'Verify phone' },
  otp: { step: 2, label: 'Verify phone' },
  passcode: { step: 3, label: 'Set your passcode' },
}

const COUNTRIES = [
  { name: 'Nigeria', code: '+234', flag: 'NG' },
  { name: 'United States', code: '+1', flag: 'US' },
  { name: 'United Kingdom', code: '+44', flag: 'UK' },
  { name: 'Canada', code: '+1', flag: 'CA' },
]

const INTRO_SLIDES = [
  {
    key: 'intro-plan' as const,
    eyebrow: 'Welcome to SPND',
    title: 'Plan your SPNDing',
    body: 'Decide where your money goes before you spend it.',
    image: '/spnd/image 5.png',
    imageClassName: 'intro-image intro-image-plan',
    button: 'Next',
    activeDot: 1,
  },
  {
    key: 'intro-know' as const,
    eyebrow: 'Welcome to SPND',
    title: 'Know your SPNDing',
    body: 'See your spending clearly, without guesswork.',
    image: '/spnd/image 4.png',
    imageClassName: 'intro-image intro-image-know',
    button: 'Next',
    activeDot: 2,
  },
  {
    key: 'intro-purpose' as const,
    eyebrow: 'Welcome to SPND',
    title: 'SPND on purpose',
    body: 'Give every dollar a role and spend with confidence.',
    image: '/spnd/image 6.svg',
    imageClassName: 'intro-image intro-image-purpose',
    button: 'Next',
    activeDot: 3,
  },
  {
    key: 'intro-setup' as const,
    eyebrow: 'Welcome to SPND',
    title: 'Let’s set this up properly',
    body: 'It only takes a moment to get your money organized.',
    image: '/spnd/image 10.svg',
    imageClassName: 'intro-image intro-image-setup',
    button: 'Get started',
    activeDot: 4,
  },
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
    passcodeFirstEntry: '',
    passcode: '',
    passcodeError: '',
    passcodeSaved: false,
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

function saveState(state: FormState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function formatDisplayOtp(otp: string) {
  if (otp.length <= 3) return otp
  return `${otp.slice(0, 3)}-${otp.slice(3, 6)}`
}

function StatusBar() {
  const [time, setTime] = useState(() =>
    new Intl.DateTimeFormat([], {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date()),
  )

  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat([], {
          hour: 'numeric',
          minute: '2-digit',
        }).format(new Date()),
      )

    update()
    const intervalId = window.setInterval(update, 1000 * 30)
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="status-bar">
      <span className="status-time">{time}</span>
      <div className="status-icons" aria-hidden="true">
        <span className="status-signal">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="status-wifi" />
        <span className="status-battery">
          <span className="status-battery-level" />
        </span>
      </div>
    </div>
  )
}

function SlideProgress({ activeDot }: { activeDot: number }) {
  return (
    <div className="slide-progress" aria-label="Onboarding progress">
      {[1, 2, 3, 4].map((dot) => (
        <span key={dot} className={`slide-progress-dot${dot === activeDot ? ' active' : ''}`} />
      ))}
    </div>
  )
}

function PasscodeProgress() {
  return (
    <div className="passcode-progress" aria-label="Setup progress">
      <span className="passcode-progress-dot" />
      <span className="passcode-progress-dot" />
      <span className="passcode-progress-dot" />
      <span className="passcode-progress-pill active" />
    </div>
  )
}

function SetupProgress({ activeStep, label }: { activeStep: 1 | 2 | 3; label: string }) {
  return (
    <div className="setup-progress" aria-label={`Setup progress: step ${activeStep} of 3`}>
      <div className="setup-progress-copy">
        <span className="setup-progress-step">Step {activeStep} of 3</span>
        <span className="setup-progress-label">{label}</span>
      </div>
      <div className="setup-progress-bars" aria-hidden="true">
        {[1, 2, 3].map((step) => (
          <span key={step} className={`setup-progress-bar${step <= activeStep ? ' active' : ''}`} />
        ))}
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

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button className="primary-button" type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function PasscodeKeypad({
  onDigit,
  onDelete,
}: {
  onDigit: (digit: string) => void
  onDelete: () => void
}) {
  return (
    <div className="passcode-keypad" aria-label="Passcode keypad">
      {[
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['', '0', 'delete'],
      ].map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="passcode-keypad-row">
          {row.map((key) => {
            if (key === '') {
              return <span key={`empty-${rowIndex}`} className="passcode-key empty" aria-hidden="true" />
            }

            if (key === 'delete') {
              return (
                <button
                  key="delete"
                  className="passcode-key"
                  type="button"
                  onClick={onDelete}
                  aria-label="Delete last digit"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M9.5 7.5H18a2.5 2.5 0 0 1 2.5 2.5v4A2.5 2.5 0 0 1 18 16.5H9.5L4.5 12l5-4.5Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path d="m11 10 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </button>
              )
            }

            return (
              <button key={key} className="passcode-key" type="button" onClick={() => onDigit(key)}>
                {key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function FormLayout({
  title,
  description,
  step,
  stepLabel,
  onBack,
  children,
}: {
  title: string
  description: string
  step: 1 | 2 | 3
  stepLabel: string
  onBack: () => void
  children: React.ReactNode
}) {
  return (
    <div className="screen-content">
      <StatusBar />
      <div className="setup-header">
        <BackButton onClick={onBack} />
        <SetupProgress activeStep={step} label={stepLabel} />
      </div>
      <div className="form-copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [form, setForm] = useState<FormState>(() => loadState())

  useEffect(() => {
    saveState(form)
  }, [form])

  useEffect(() => {
    if (screen !== 'otp' || form.resendTimer <= 0) return undefined

    const intervalId = window.setInterval(() => {
      setForm((current) => ({
        ...current,
        resendTimer: Math.max(0, current.resendTimer - 1),
      }))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [screen, form.resendTimer])

  const currentSlide = useMemo(
    () => INTRO_SLIDES.find((slide) => slide.key === screen),
    [screen],
  )

  const goNext = () => {
    const index = SCREEN_ORDER.indexOf(screen)
    if (index >= 0 && index < SCREEN_ORDER.length - 1) {
      setScreen(SCREEN_ORDER[index + 1])
    }
  }

  const goBack = () => {
    const index = SCREEN_ORDER.indexOf(screen)
    if (index > 1) setScreen(SCREEN_ORDER[index - 1])
  }

  const updateForm = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }))
  }

  const submitName = () => {
    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) return
    goNext()
  }

  const submitPhone = () => {
    if (form.phone.length !== 11) return
    updateForm({
      otp: '',
      resendTimer: 14,
    })
    setScreen('otp')
  }

  const resendOtp = () => {
    updateForm({
      otp: '',
      resendTimer: 14,
    })
  }

  const submitOtp = () => {
    if (form.otp.length !== 6) return
    updateForm({
      passcodeFirstEntry: '',
      passcode: '',
      passcodeError: '',
      passcodeSaved: false,
    })
    setScreen('passcode')
  }

  const submitPasscode = () => {
    if (form.passcode.length !== 4) return
    if (!form.passcodeSaved) {
      updateForm({
        passcodeFirstEntry: form.passcode,
        passcode: '',
        passcodeError: '',
        passcodeSaved: true,
      })
      return
    }
    if (form.passcode !== form.passcodeFirstEntry) {
      updateForm({
        passcode: '',
        passcodeError: 'Passcodes did not match. Try again.',
      })
      return
    }
    updateForm({ completed: true })
    setScreen('all-set')
  }

  const renderScreen = () => {
    if (screen === 'splash') {
      return (
        <button
          className="screen-content splash-screen splash-button"
          type="button"
          onClick={() => setScreen('intro-plan')}
          aria-label="Start onboarding"
        >
          <StatusBar />
          <div className="splash-brandmark" aria-hidden="true">
            <img className="splash-symbol" src={splashVector} alt="" />
            <h1 className="splash-wordmark">SPND</h1>
          </div>
        </button>
      )
    }

    if (currentSlide) {
      return (
        <div className="screen-content intro-screen">
          <StatusBar />
          <BackButton onClick={goBack} />
          <SlideProgress activeDot={currentSlide.activeDot} />
          <div className="intro-copy">
            <span>{currentSlide.eyebrow}</span>
            <h1>{currentSlide.title}</h1>
            <p>{currentSlide.body}</p>
          </div>
          <img className={currentSlide.imageClassName} src={currentSlide.image} alt="" />
          <div className="intro-footer">
            <PrimaryButton onClick={goNext}>{currentSlide.button}</PrimaryButton>
          </div>
        </div>
      )
    }

    if (screen === 'name') {
      return (
        <FormLayout
          title="What is your name?"
          description="Please enter your full name as they appear in your government documents"
          step={FORM_STEP_META.name.step}
          stepLabel={FORM_STEP_META.name.label}
          onBack={goBack}
        >
          <div className="name-fields">
            <label className="field-card">
              <span className="field-label">First name</span>
              <input
                className="field-input"
                value={form.firstName}
                onChange={(event) => updateForm({ firstName: event.target.value })}
                placeholder="First name"
              />
            </label>
            <label className="field-card">
              <span className="field-label">Last name</span>
              <input
                className="field-input"
                value={form.lastName}
                onChange={(event) => updateForm({ lastName: event.target.value })}
                placeholder="Last name"
              />
            </label>
          </div>
          <PrimaryButton
            onClick={submitName}
            disabled={form.firstName.trim().length < 2 || form.lastName.trim().length < 2}
          >
            Next
          </PrimaryButton>
        </FormLayout>
      )
    }

    if (screen === 'phone') {
      return (
        <FormLayout
          title="What's your phone number?"
          description="Enter your phone number. We will send you a confirmation code there."
          step={FORM_STEP_META.phone.step}
          stepLabel={FORM_STEP_META.phone.label}
          onBack={goBack}
        >
          <div className="phone-row">
            <label className="country-card country-select-card">
              <span className={`country-flag flag-${form.country === 'Nigeria' ? 'ng' : 'neutral'}`} aria-hidden="true">
                {form.country === 'Nigeria' ? (
                  <>
                    <i className="green" />
                    <i className="white" />
                    <i className="green" />
                  </>
                ) : (
                  <>
                    <i className="dark" />
                    <i className="light" />
                    <i className="dark" />
                  </>
                )}
              </span>
              <select
                className="country-select"
                value={form.country}
                onChange={(event) => {
                  const selected = COUNTRIES.find((country) => country.name === event.target.value) ?? COUNTRIES[0]
                  updateForm({ country: selected.name, countryCode: selected.code })
                }}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              <span className="country-code">{form.countryCode}</span>
            </label>
            <label className="field-card phone-field">
              <span className="field-label">Mobile number</span>
              <input
                className="field-input"
                value={form.phone}
                onChange={(event) => updateForm({ phone: event.target.value.replace(/\D/g, '').slice(0, 11) })}
                placeholder="07032891651"
                inputMode="numeric"
              />
            </label>
          </div>
          <button className="secondary-link" type="button">
            Already have an account? Log in
          </button>
          <PrimaryButton onClick={submitPhone} disabled={form.phone.length !== 11}>
            Next
          </PrimaryButton>
        </FormLayout>
      )
    }

    if (screen === 'otp') {
      const otpFilled = form.otp.length === 6
      const otpDisplay = formatDisplayOtp(form.otp.padEnd(6, ' '))
      const [left = '', right = ''] = otpDisplay.split('-')

      return (
        <FormLayout
          title="We just sent a code, tell us"
          description={`Code sent to ${form.countryCode}${form.phone}. Check your device for OTP.`}
          step={FORM_STEP_META.otp.step}
          stepLabel={FORM_STEP_META.otp.label}
          onBack={goBack}
        >
          <label className="otp-entry" onClick={() => document.getElementById('spnd-otp-input')?.focus()}>
            <div className="otp-inputs">
            {left.split('').map((char, index) => (
              <span key={`left-${index}`} className="otp-box">
                {char === ' ' ? '' : char}
              </span>
            ))}
            <span className="otp-divider">-</span>
            {right.split('').map((char, index) => (
              <span key={`right-${index}`} className="otp-box">
                {char === ' ' ? '' : char}
              </span>
            ))}
            </div>
            <input
              id="spnd-otp-input"
              className="otp-hidden-input"
              value={form.otp}
              onChange={(event) => updateForm({ otp: event.target.value.replace(/\D/g, '').slice(0, 6) })}
              inputMode="numeric"
            />
          </label>
          <div className="otp-actions">
            <button className="secondary-link" type="button" onClick={form.resendTimer === 0 ? resendOtp : undefined}>
              {form.resendTimer === 0 ? 'Resend code now' : `Resend code in 00:${String(form.resendTimer).padStart(2, '0')}`}
            </button>
            <button className="secondary-link" type="button">
              Already have an account? Log in
            </button>
          </div>
          <PrimaryButton onClick={submitOtp} disabled={!otpFilled}>
            {otpFilled ? 'Next' : 'Send OTP to verify number'}
          </PrimaryButton>
        </FormLayout>
      )
    }

    if (screen === 'passcode') {
      const handlePasscodeBack = () => {
        if (form.passcodeSaved) {
          updateForm({
            passcodeSaved: false,
            passcode: form.passcodeFirstEntry,
            passcodeFirstEntry: '',
            passcodeError: '',
          })
          return
        }
        goBack()
      }

      return (
        <div className="screen-content passcode-screen">
          <StatusBar />
          <BackButton onClick={handlePasscodeBack} />
          <PasscodeProgress />
          <div className="passcode-copy">
            <h1>{form.passcodeSaved ? 'Confirm passcode' : 'Create passcode'}</h1>
            <p>{form.passcodeSaved ? 'Enter your passcode again to confirm it.' : 'Passcode should be 4 digits'}</p>
          </div>
          <div className="passcode-state passcode-state-minimal">
            <div className="passcode-dots passcode-dots-minimal">
              {[0, 1, 2, 3].map((index) => (
                <span key={index} className={`passcode-dot${index < form.passcode.length ? ' filled' : ''}`} />
              ))}
            </div>
            <PasscodeKeypad
              onDigit={(digit) => {
                if (form.passcode.length >= 4) return
                updateForm({
                  passcode: `${form.passcode}${digit}`,
                  passcodeError: '',
                })
              }}
              onDelete={() =>
                updateForm({
                  passcode: form.passcode.slice(0, -1),
                  passcodeError: '',
                })}
            />
          </div>
          {form.passcodeError ? <p className="passcode-error">{form.passcodeError}</p> : null}
          <div className="passcode-footer">
            <button
              className="passcode-continue"
              type="button"
              onClick={submitPasscode}
              disabled={form.passcode.length !== 4}
            >
              {form.passcodeSaved ? 'Confirm passcode' : 'Continue'}
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="screen-content success-screen">
        <StatusBar />
        <div className="success-stage">
          <div className="success-orb success-orb-left" aria-hidden="true" />
          <div className="success-orb success-orb-right" aria-hidden="true" />
          <div className="success-art-card">
            <img className="success-image" src="/spnd/image 15.svg" alt="" />
          </div>
          <div className="success-copy">
            <span className="success-eyebrow">Setup complete</span>
            <h1>You're all set</h1>
            <p>Your account is ready. Let's get your money organized.</p>
          </div>
        </div>
        <div className="success-footer">
          <PrimaryButton
            onClick={() => {
              updateForm({ completed: true })
            }}
          >
            Take me in
          </PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <main className="app-shell">
      <section className={`phone-frame${screen === 'splash' ? ' splash' : ''}`}>
        {renderScreen()}
      </section>
    </main>
  )
}
