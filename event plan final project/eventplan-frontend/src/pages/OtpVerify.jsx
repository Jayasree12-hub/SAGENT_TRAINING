import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { Spinner, Field } from '../components/ui'

const OTP_TTL_SECONDS = 5 * 60

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function OtpVerify() {
  const navigate = useNavigate()
  const location = useLocation()
  const accountType = location.state?.accountType || 'user'
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState(location.state?.message || 'We sent a 6-digit code to your email.')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!otp.trim()) {
      setError('OTP is required')
      return
    }
    setLoading(true)
    try {
      await authApi.verifyOtp({ email, otp })
      if (accountType === 'vendor') {
        navigate('/vendor/login', {
          state: {
            email,
            message: 'Email verified. Sign in to complete your vendor profile.',
          },
        })
      } else {
        navigate('/login', { state: { message: 'Email verified. Please sign in.' } })
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid OTP'
      if (/invalid|otp/i.test(message)) {
        setError('Invalid OTP')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    setResendLoading(true)
    try {
      await authApi.resendOtp({ email })
      setInfo('A new OTP has been sent to your email.')
      setSecondsLeft(OTP_TTL_SECONDS)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      <div className="hidden lg:flex w-1/2 bg-obsidian-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-16 w-72 h-72 border border-gold-500/20 rounded-full" />
          <div className="absolute bottom-1/4 right-10 w-52 h-52 border border-obsidian-700 rounded-full" />
        </div>
        <Link to="/" className="relative">
          <span className="font-display text-2xl text-cream tracking-wide">SoirÃ©e</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-3xl font-light text-cream leading-snug mb-3">
            Verify your<br />email address
          </h2>
          <div className="w-12 h-px bg-gold-500 mb-3" />
          <p className="text-obsidian-400 text-sm font-sans leading-relaxed">
            Enter the one-time password sent to your email to activate your account.
          </p>
        </div>
        <p className="relative text-obsidian-500 text-xs font-sans">
          Already verified?{' '}
          <Link to="/login" className="text-gold-400 hover:text-gold-300">Sign in â†’</Link>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-6">
            <Link to="/" className="lg:hidden font-display text-xl text-obsidian-900 block mb-4">SoirÃ©e</Link>
            <h1 className="font-display text-3xl font-light text-obsidian-900 mb-1">Verify OTP</h1>
            <p className="text-sm text-obsidian-400 font-sans">OTP expires in 5 minutes</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            {info && (
              <div className="bg-obsidian-50 border border-obsidian-200 rounded px-3 py-2 text-xs text-obsidian-600 animate-fade-in">
                {info}
              </div>
            )}

            <Field label="Email Address">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
            </Field>

            <Field label="One-Time Password">
              <input
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="input-field"
                inputMode="numeric"
                maxLength={6}
              />
            </Field>

            <div className="flex items-center justify-between text-xs text-obsidian-400">
              {secondsLeft > 0 ? (
                <span>Expires in {formatTime(secondsLeft)}</span>
              ) : (
                <span>OTP expired. Please resend.</span>
              )}
              <button
                type="button"
                className="text-gold-600 hover:text-gold-700 font-medium"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? 'Resendingâ€¦' : 'Resend OTP'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-600 animate-fade-in">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <><Spinner size="sm" /><span>Verifyingâ€¦</span></> : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-obsidian-500">
              Need to change email?{' '}
              <Link to="/register" className="text-gold-600 hover:text-gold-700 font-medium">Register again</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
