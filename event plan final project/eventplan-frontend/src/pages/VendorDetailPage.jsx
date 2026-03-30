import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { vendorsApi } from '../api/client'
import Navbar from '../components/Navbar'
import { EmptyState, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import {
  formatVendorCurrency,
  vendorDetailSummary,
  vendorDisplayName,
  vendorImageSrc,
  vendorSummary,
} from '../utils/vendorHelpers'

function renderStars(rating) {
  if (!rating) {
    return <span className="text-sm text-obsidian-400">Not yet rated</span>
  }

  return (
    <div className="flex items-center gap-1.5">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={`text-lg ${index < Math.floor(rating) ? 'text-gold-500' : index < rating ? 'text-gold-300' : 'text-obsidian-200'}`}
        >
          *
        </span>
      ))}
      <span className="ml-1 text-sm text-obsidian-500">{Number(rating).toFixed(1)} / 5.0</span>
    </div>
  )
}

export default function VendorDetailPage() {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const { user, isTeamMember, isVendor } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVendor = async () => {
      setLoading(true)
      try {
        const response = await vendorsApi.getById(vendorId)
        setVendor(response.data || null)
      } catch {
        setVendor(null)
      } finally {
        setLoading(false)
      }
    }

    loadVendor()
  }, [vendorId])

  const canOpenChat = useMemo(() => {
    if (!vendor?.user?.userId || !user?.userId) return false
    if (Number(vendor.user.userId) === Number(user.userId)) return true
    return isTeamMember || isVendor
  }, [isTeamMember, isVendor, user?.userId, vendor?.user?.userId])

  const handleOpenChat = () => {
    if (!vendor?.user?.userId) return

    if (isVendor) {
      navigate('/vendor/dashboard/messages', {
        state: {
          chatTargetUserId: vendor.user.userId,
          chatTargetLabel: vendorDisplayName(vendor),
        },
      })
      return
    }

    if (isTeamMember) {
      navigate('/team/dashboard', {
        state: {
          chatTargetUserId: vendor.user.userId,
          chatTargetLabel: vendorDisplayName(vendor),
        },
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Spinner size="lg" className="text-obsidian-400" />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-parchment">
        <Navbar />
        <div className="pt-24 mx-auto max-w-4xl px-6">
          <EmptyState
            icon="V"
            title="Vendor not found"
            description="This vendor profile is no longer available."
            action={<Link to="/" className="btn-primary">Back to dashboard</Link>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />

      <div className="pt-14">
        <div className="border-b border-obsidian-100 bg-[linear-gradient(135deg,_#17130f_0%,_#8f571b_58%,_#f4d38d_100%)] text-cream">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-center">
              <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
                <img
                  src={vendorImageSrc(vendor)}
                  alt={vendorDisplayName(vendor)}
                  className="h-[320px] w-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cream/90">
                    Vendor Detail
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cream/90">
                    {vendor.serviceType || 'Service'}
                  </span>
                </div>

                <h1 className="mt-5 font-display text-4xl font-light leading-tight">
                  {vendorDisplayName(vendor)}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-cream/80">
                  {vendorSummary(vendor)}
                </p>

                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-cream/90">
                    {vendor.user?.name || 'Vendor contact'}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-cream/90">
                    {vendor.user?.email || 'Email not shared'}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-cream/90">
                    From {formatVendorCurrency(vendor.startingPrice)}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {canOpenChat && (
                    <button className="btn-secondary border-white/20 bg-white/10 text-cream hover:bg-white/20" onClick={handleOpenChat}>
                      {Number(vendor.user?.userId) === Number(user?.userId) ? 'Open my messages' : 'Contact vendor'}
                    </button>
                  )}
                  <button className="btn-ghost text-cream/80 hover:text-cream" onClick={() => navigate(-1)}>
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1.45fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
              <div className="text-xs uppercase tracking-[0.2em] text-gold-700">About The Business</div>
              <h2 className="mt-2 font-display text-3xl text-obsidian-900">Brand story and service promise</h2>
              <p className="mt-4 text-sm leading-8 text-obsidian-500">
                {vendor.aboutBusiness?.trim() || vendorSummary(vendor)}
              </p>
            </section>

            <section className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
              <div className="text-xs uppercase tracking-[0.2em] text-gold-700">Vendor Details</div>
              <h2 className="mt-2 font-display text-3xl text-obsidian-900">Packages, positioning, and workflow</h2>
              <p className="mt-4 text-sm leading-8 text-obsidian-500">
                {vendorDetailSummary(vendor)}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  ['Business Name', vendor.businessName],
                  ['Service Type', vendor.serviceType],
                  ['Starting Price', formatVendorCurrency(vendor.startingPrice)],
                  ['Contact Name', vendor.user?.name],
                  ['Email', vendor.user?.email],
                  ['Phone', vendor.user?.phone || 'Not shared'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-3xl border border-obsidian-100 bg-obsidian-50/70 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-obsidian-400">{label}</div>
                    <div className="mt-2 text-base font-medium text-obsidian-900">{value || 'Not set'}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
              <div className="text-xs uppercase tracking-[0.2em] text-gold-700">Quick Snapshot</div>
              <div className="mt-5">{renderStars(vendor.rating)}</div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl border border-gold-200 bg-gold-50 p-5">
                  <div className="text-xs uppercase tracking-[0.16em] text-gold-700">Price</div>
                  <div className="mt-2 font-display text-3xl text-obsidian-900">{formatVendorCurrency(vendor.startingPrice)}</div>
                </div>
                <div className="rounded-3xl border border-obsidian-100 bg-white p-5">
                  <div className="text-xs uppercase tracking-[0.16em] text-obsidian-400">Contact</div>
                  <div className="mt-2 text-sm leading-7 text-obsidian-500">
                    Organizers and team members can reach this vendor directly from the dashboard chat flow.
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
              <div className="text-xs uppercase tracking-[0.2em] text-gold-700">Why This Page</div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-obsidian-500">
                <li>Use this screen to review the vendor before sending a message.</li>
                <li>The photo area can use a real business image or an automatic placeholder.</li>
                <li>Profile, business details, and about sections now have their own dedicated detail views.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
