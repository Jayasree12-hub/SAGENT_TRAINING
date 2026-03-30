import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Field, Spinner } from '../components/ui'

export default function VendorLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' })
  const [error, setError] = useState('')
  const [info] = useState(location.state?.message || '')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('All fields are required.')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.vendorLogin(form)
      if (res.data?.isVerified === false) {
        setError('Please verify your email before logging in.')
        return
      }

      login(res.data)
      navigate('/vendor/dashboard')
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      <div className="hidden lg:flex w-1/2 bg-gold-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-10 w-64 h-64 border border-gold-500/25 rounded-full" />
          <div className="absolute bottom-1/4 left-5 w-40 h-40 border border-cream/10 rounded-full" />
        </div>
        <Link to="/" className="relative">
          <span className="font-display text-2xl text-cream tracking-wide">Soiree</span>
        </Link>
        <div className="relative">
          <blockquote className="font-display text-3xl font-light text-cream leading-snug mb-4">
            "Your next client
            <br />
            is waiting."
          </blockquote>
          <div className="w-12 h-px bg-cream/40 mb-3" />
          <p className="text-gold-100 text-sm font-sans">Sign in to manage your vendor profile and bookings</p>
        </div>
        <div className="relative text-gold-200 text-xs">
          <Link to="/vendor/register" className="hover:text-cream transition-colors">New vendor? Register here -&gt;</Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <Link to="/" className="lg:hidden font-display text-xl text-obsidian-900 block mb-6">Soiree</Link>
            <h1 className="font-display text-3xl font-light text-obsidian-900 mb-1">Vendor sign in</h1>
            <p className="text-sm text-obsidian-400 font-sans">Access your vendor dashboard</p>
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
                placeholder="vendor@example.com"
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
                placeholder="........"
                className="input-field"
                autoComplete="current-password"
              />
            </Field>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-600 animate-fade-in">
                {error}
              </div>
            )}

            <button type="submit" className="btn-gold w-full py-3" disabled={loading}>
              {loading ? <><Spinner size="sm" /><span>Signing in...</span></> : 'Sign In as Vendor'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-obsidian-500">
              New vendor?{' '}
              <Link to="/vendor/register" className="text-gold-600 hover:text-gold-700 font-medium">Create account</Link>
            </p>
            <p className="text-sm text-obsidian-500">
              Organizer?{' '}
              <Link to="/login" className="text-gold-600 hover:text-gold-700 font-medium">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
