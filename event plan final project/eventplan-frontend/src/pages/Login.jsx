import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Spinner, Field } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [info] = useState(location.state?.message || '')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('All fields are required.'); return }
    setLoading(true)
    try {
      const res = await authApi.login(form)
      if (res.data?.isVerified === false) {
        setError('Please verify your email before logging in.')
        return
      }
      login(res.data)
      navigate(
        res.data.role === 'VENDOR'
          ? '/vendor/dashboard'
          : res.data.role === 'TEAM_MEMBER'
            ? '/team/dashboard'
            : '/dashboard'
      )
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the server. Please make sure the backend is running on port 8081.')
      } else {
        const message = err.response?.data?.message || 'Invalid credentials. Please try again.'
        if (/verify/i.test(message)) {
          setError('Please verify your email before logging in.')
        } else {
          setError(message)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-obsidian-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-80 h-80 border border-gold-500/20 rounded-full" />
          <div className="absolute bottom-1/4 right-10 w-48 h-48 border border-obsidian-700 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-40 bg-gradient-to-b from-transparent via-gold-500/40 to-transparent" />
        </div>
        <Link to="/" className="relative">
          <span className="font-display text-2xl text-cream tracking-wide">Soirée</span>
        </Link>
        <div className="relative">
          <blockquote className="font-display text-3xl font-light text-cream leading-snug mb-4">
            "Every great event<br />begins with a plan."
          </blockquote>
          <div className="w-12 h-px bg-gold-500 mb-3" />
          <p className="text-obsidian-400 text-sm font-sans">Sign in to continue managing your events</p>
        </div>
        <div className="relative flex items-center gap-4 text-obsidian-400 text-xs">
          <Link to="/vendor/login" className="hover:text-gold-400 transition-colors">Vendor Login →</Link>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <Link to="/" className="lg:hidden font-display text-xl text-obsidian-900 block mb-6">Soirée</Link>
            <h1 className="font-display text-3xl font-light text-obsidian-900 mb-1">Welcome back</h1>
            <p className="text-sm text-obsidian-400 font-sans">Sign in to your organizer account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {info && (
              <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-xs text-green-700 animate-fade-in">
                {info}
              </div>
            )}
            <Field label="Email Address">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
              />
            </Field>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-600 animate-fade-in">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <><Spinner size="sm" /><span>Signing in…</span></> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-obsidian-200" />
              <span className="text-xs text-obsidian-400">or</span>
              <div className="flex-1 h-px bg-obsidian-200" />
            </div>
            <p className="text-center text-sm text-obsidian-500 font-sans">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold-600 hover:text-gold-700 font-medium transition-colors">
                Create one
              </Link>
            </p>
            <p className="text-center text-sm text-obsidian-500 font-sans">
              Are you a vendor?{' '}
              <Link to="/vendor/login" className="text-gold-600 hover:text-gold-700 font-medium transition-colors">
                Vendor login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
