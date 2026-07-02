import { useEffect, useRef, useState } from 'react'
import { useSignIn, useSignUp } from '@clerk/clerk-react'
import { useWaitlist } from '../context/WaitlistContext'
import './WaitlistModal.css'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export function WaitlistModal() {
  const { isOpen, close } = useWaitlist()
  const { signUp, isLoaded: suLoaded } = useSignUp()
  const { signIn, isLoaded: siLoaded } = useSignIn()

  const [view, setView]   = useState('idle')  // idle | email | otp | success
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode]   = useState('')
  const [busy, setBusy]   = useState(false)
  const [err, setErr]     = useState('')

  const backdropRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => { setView('idle'); setName(''); setEmail(''); setCode(''); setErr('') }, 0)
    return () => clearTimeout(t)
  }, [isOpen])

  if (!isOpen) return null

  const onBackdrop = (e) => { if (e.target === backdropRef.current) close() }

  // ── Google OAuth ─────────────────────────────────────────
  const handleGoogle = async () => {
    if (!siLoaded) return
    try {
      sessionStorage.setItem('verbion_waitlist', '1')
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/`,
      })
    } catch {
      setErr('Google sign-in failed. Please try again.')
    }
  }

  // ── Email step 1: create + send OTP ──────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!suLoaded || busy) return
    setBusy(true); setErr('')
    try {
      await signUp.create({
        firstName:    name.trim().split(' ')[0],
        lastName:     name.trim().split(' ').slice(1).join(' ') || undefined,
        emailAddress: email.trim(),
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setView('otp')
    } catch (e) {
      const clerkErr = e?.errors?.[0]
      if (clerkErr?.code === 'form_identifier_exists') {
        setErr('This email is already registered — try Continue with Google above.')
      } else {
        setErr(clerkErr?.longMessage || 'Something went wrong. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  // ── Email step 2: verify OTP ──────────────────────────────
  const handleOtpVerify = async (e) => {
    e.preventDefault()
    if (!suLoaded || busy) return
    setBusy(true); setErr('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() })
      if (result.status === 'complete') setView('success')
    } catch (e) {
      setErr(e?.errors?.[0]?.longMessage || 'Incorrect code — please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={backdropRef} className="wm__backdrop" onClick={onBackdrop}>
      <div className="wm__panel" role="dialog" aria-modal="true" aria-label="Join the VERBION waitlist">

        {view !== 'success' && (
          <button className="wm__close" onClick={close} aria-label="Close">✕</button>
        )}

        {/* ── IDLE ─────────────────────────── */}
        {view === 'idle' && (
          <div className="wm__body">
            <p className="wm__brand-tag">VERBION</p>
            <h2 className="wm__title">Join the Waitlist</h2>
            <p className="wm__sub">Be first to know when V2.5 ships.</p>

            <div className="wm__actions">
              <button
                className="wm__btn wm__btn--google"
                onClick={handleGoogle}
                disabled={!siLoaded}
              >
                <GoogleIcon /> Continue with Google
              </button>

              <div className="wm__divider"><span>or</span></div>

              <button
                className="wm__btn wm__btn--ghost"
                onClick={() => setView('email')}
              >
                Continue with Email
              </button>
            </div>
          </div>
        )}

        {/* ── EMAIL FORM ────────────────────── */}
        {view === 'email' && (
          <form className="wm__body" onSubmit={handleEmailSubmit} noValidate>
            <button type="button" className="wm__back" onClick={() => { setView('idle'); setErr('') }}>
              ← Back
            </button>
            <h2 className="wm__title">Your details</h2>

            <label className="wm__field">
              <span className="wm__field-label">Name</span>
              <input
                className="wm__input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                autoFocus
              />
            </label>

            <label className="wm__field">
              <span className="wm__field-label">Email</span>
              <input
                className="wm__input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            {err && <p className="wm__error">{err}</p>}

            <button
              className="wm__btn wm__btn--primary"
              type="submit"
              disabled={busy || !name.trim() || !email.trim()}
            >
              {busy ? 'Sending…' : 'Get Verification Code →'}
            </button>
          </form>
        )}

        {/* ── OTP ──────────────────────────── */}
        {view === 'otp' && (
          <form className="wm__body" onSubmit={handleOtpVerify} noValidate>
            <button type="button" className="wm__back" onClick={() => { setView('email'); setCode(''); setErr('') }}>
              ← Back
            </button>
            <h2 className="wm__title">Check your inbox</h2>
            <p className="wm__sub">
              We sent a 6-digit code to&nbsp;<strong>{email}</strong>
            </p>

            <input
              className="wm__input wm__input--otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />

            {err && <p className="wm__error">{err}</p>}

            <button
              className="wm__btn wm__btn--primary"
              type="submit"
              disabled={busy || code.length !== 6}
            >
              {busy ? 'Verifying…' : 'Confirm →'}
            </button>
          </form>
        )}

        {/* ── SUCCESS ──────────────────────── */}
        {view === 'success' && (
          <div className="wm__body wm__body--success">
            <div className="wm__check-ring">✓</div>
            <h2 className="wm__title">You're on the list.</h2>
            <p className="wm__sub">
              We'll reach out when VERBION V2.5 is ready to ship.
            </p>
            <button className="wm__btn wm__btn--primary" onClick={close}>
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
