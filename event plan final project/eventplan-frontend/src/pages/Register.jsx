import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { Spinner, Field } from '../components/ui'

const ROLES = ['ORGANIZER', 'TEAM_MEMBER']

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    role: 'ORGANIZER',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      await authApi.register(payload)
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      if (err.response?.status === 409 || /exists/i.test(message)) {
        setServerError('Account already exists')
      } else {
        setServerError(message)
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
          <div className="absolute top-1/3 -right-16 w-64 h-64 border border-gold-500/15 rounded-full" />
          <div className="absolute bottom-1/3 left-8 w-96 h-px bg-gradient-to-r from-gold-500/30 to-transparent" />
        </div>
        <Link to="/" className="relative">
          <span className="font-display text-2xl text-cream tracking-wide">Soirée</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-3xl font-light text-cream leading-snug mb-3">
            Start planning<br />extraordinary events
          </h2>
          <div className="w-12 h-px bg-gold-500 mb-3" />
          <p className="text-obsidian-400 text-sm font-sans leading-relaxed">
            Create your organizer account and get access to full event management — guests, tasks, budgets, and more.
          </p>
        </div>
        <p className="relative text-obsidian-500 text-xs font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-400 hover:text-gold-300">Sign in →</Link>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-8 animate-slide-up">
          <div className="mb-6">
            <Link to="/" className="lg:hidden font-display text-xl text-obsidian-900 block mb-4">Soirée</Link>
            <h1 className="font-display text-3xl font-light text-obsidian-900 mb-1">Create account</h1>
            <p className="text-sm text-obsidian-400 font-sans">Organizer / Admin registration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" error={errors.name}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" className="input-field" />
            </Field>

            <Field label="Email Address" error={errors.email}>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" className="input-field" />
            </Field>

            <Field label="Phone Number" error={errors.phone}>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="input-field" />
            </Field>

            <div className="grid grid-cols-1 gap-3">
              <Field label="Role">
                <select name="role" value={form.role} onChange={handleChange} className="input-field">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Password" error={errors.password}>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="input-field" />
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword}>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className="input-field" />
            </Field>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-600 animate-fade-in">
                {serverError}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <><Spinner size="sm" /><span>Creating account…</span></> : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center">
            <p className="text-sm text-obsidian-500">
              Already registered?{' '}
              <Link to="/login" className="text-gold-600 hover:text-gold-700 font-medium">Sign in</Link>
            </p>
            <p className="text-sm text-obsidian-500">
              Joining as a vendor?{' '}
              <Link to="/vendor/register" className="text-gold-600 hover:text-gold-700 font-medium">Vendor signup</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
