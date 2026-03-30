import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { Spinner, Field } from '../components/ui'

const SERVICE_TYPES = ['Catering', 'Photography', 'Videography', 'Decoration', 'Music & DJ', 'Venue', 'Florist', 'Transport', 'Security', 'Other']

export default function VendorRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    businessName: '', serviceType: '', startingPrice: '',
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
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    if (!form.businessName.trim()) errs.businessName = 'Business name is required'
    if (!form.serviceType) errs.serviceType = 'Service type is required'
    if (!form.startingPrice || isNaN(+form.startingPrice) || +form.startingPrice < 0) errs.startingPrice = 'Valid price required'
    if (!form.password || form.password.length < 6) errs.password = 'Min 6 characters'
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
      await authApi.vendorRegister({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        businessName: form.businessName,
        serviceType: form.serviceType,
        startingPrice: parseFloat(form.startingPrice),
      })
      navigate('/vendor/login', {
        state: {
          email: form.email,
          message: 'Vendor account created successfully. Please sign in.',
        },
      })
    } catch (err) {
      const responseData = err.response?.data
      const message = typeof responseData === 'string'
        ? responseData
        : responseData?.message || 'Registration failed. Please try again.'
      if (/already exists/i.test(message)) {
        setServerError('This email is already used. Please use a different email for your vendor account.')
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
      <div className="hidden lg:flex w-1/2 bg-gold-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-72 h-72 border border-gold-500/30 rounded-full" />
          <div className="absolute bottom-20 -left-10 w-56 h-56 border border-gold-600/20 rounded-full" />
        </div>
        <Link to="/" className="relative">
          <span className="font-display text-2xl text-cream tracking-wide">Soirée</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-3xl font-light text-cream leading-snug mb-3">
            Grow your event<br />business with us
          </h2>
          <div className="w-12 h-px bg-cream/40 mb-3" />
          <p className="text-gold-100 text-sm font-sans leading-relaxed">
            List your services, connect with event organizers, and build your reputation through verified reviews.
          </p>
        </div>
        <p className="relative text-gold-200 text-xs font-sans">
          Already a vendor?{' '}
          <Link to="/vendor/login" className="text-cream hover:underline">Sign in →</Link>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-8 animate-slide-up">
          <div className="mb-6">
            <Link to="/" className="lg:hidden font-display text-xl text-obsidian-900 block mb-4">Soirée</Link>
            <h1 className="font-display text-3xl font-light text-obsidian-900 mb-1">Vendor signup</h1>
            <p className="text-sm text-obsidian-400 font-sans">Create your vendor business profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Your Full Name" error={errors.name}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="input-field" />
            </Field>

            <Field label="Business Name" error={errors.businessName}>
              <input name="businessName" value={form.businessName} onChange={handleChange} placeholder="Doe's Catering Co." className="input-field" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Service Type" error={errors.serviceType}>
                <select name="serviceType" value={form.serviceType} onChange={handleChange} className="input-field">
                  <option value="">Select…</option>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Starting Price (₹)" error={errors.startingPrice}>
                <input type="number" name="startingPrice" value={form.startingPrice} onChange={handleChange} placeholder="5000" className="input-field" min="0" />
              </Field>
            </div>

            <Field label="Email Address" error={errors.email}>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="vendor@example.com" className="input-field" />
            </Field>

            <Field label="Phone Number" error={errors.phone}>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="input-field" />
            </Field>

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

            <button type="submit" className="btn-gold w-full py-3" disabled={loading}>
              {loading ? <><Spinner size="sm" /><span>Creating profile…</span></> : 'Create Vendor Account'}
            </button>
          </form>

          <div className="mt-5 text-center space-y-2">
            <p className="text-sm text-obsidian-500">
              Already registered?{' '}
              <Link to="/vendor/login" className="text-gold-600 hover:text-gold-700 font-medium">Vendor sign in</Link>
            </p>
            <p className="text-sm text-obsidian-500">
              Planning an event?{' '}
              <Link to="/register" className="text-gold-600 hover:text-gold-700 font-medium">Organizer signup</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
