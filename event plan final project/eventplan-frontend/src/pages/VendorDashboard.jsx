import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { vendorEventVendorsApi, vendorProfileApi } from '../api/client'
import ChatTab from '../components/tabs/ChatTab'
import Navbar from '../components/Navbar'
import { EmptyState, Field, Modal, Spinner, StatCard, Toast } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import {
  formatVendorCurrency,
  formatVendorDate,
  vendorDetailSummary,
  vendorDisplayName,
  vendorImageSrc,
  vendorSummary,
} from '../utils/vendorHelpers'

const SERVICE_TYPES = ['Catering', 'Photography', 'Videography', 'Decoration', 'Music & DJ', 'Venue', 'Florist', 'Transport', 'Security', 'Other']
const DASHBOARD_SECTIONS = [
  { id: 'overview', label: 'Overview', eyebrow: 'Dashboard Home', title: 'Profile, orders, and business story', description: 'Jump into the section you want to manage and open the detailed view instantly.' },
  { id: 'profile', label: 'Profile', eyebrow: 'Profile Detail', title: 'Business profile and contact identity', description: 'Keep the main vendor profile polished so people trust you before they contact you.' },
  { id: 'orders', label: 'Orders', eyebrow: 'Order Detail', title: 'Bookings, payments, and event work', description: 'Track every event assignment, contract stage, and payment status in one place.' },
  { id: 'details', label: 'Vendor Details', eyebrow: 'Business Detail', title: 'Service details and offer snapshot', description: 'Describe how you work, what you provide, and how you price your services.' },
  { id: 'about', label: 'About Business', eyebrow: 'About Detail', title: 'Photo, brand story, and strengths', description: 'Show the business image and the message you want planners to remember.' },
  { id: 'network', label: 'Vendor Network', eyebrow: 'Vendor Detail', title: 'Browse vendors and open full detail pages', description: 'Compare other businesses, view their details, and message them from the dashboard.' },
  { id: 'messages', label: 'Messages', eyebrow: 'Chat Detail', title: 'Private conversations with platform contacts', description: 'Use chat to reach vendors and anyone you already know in the workspace.' },
]

function renderStars(rating) {
  if (!rating) {
    return <span className="text-sm text-obsidian-300">Not yet rated</span>
  }

  return (
    <div className="flex items-center gap-1.5">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={`text-xl ${index < Math.floor(rating) ? 'text-gold-500' : index < rating ? 'text-gold-300' : 'text-obsidian-200'}`}
        >
          *
        </span>
      ))}
      <span className="ml-1 text-sm text-obsidian-500">{Number(rating).toFixed(1)} / 5.0</span>
    </div>
  )
}

function getStatusClass(status) {
  const normalized = (status || 'PENDING').trim().toUpperCase()
  if (['SIGNED', 'CONFIRMED', 'APPROVED', 'PAID', 'COMPLETED', 'SETTLED'].includes(normalized)) {
    return 'border-green-200 bg-green-50 text-green-700'
  }
  if (['CANCELLED', 'REJECTED', 'FAILED', 'OVERDUE'].includes(normalized)) {
    return 'border-red-200 bg-red-50 text-red-600'
  }
  if (['PARTIAL', 'PARTIALLY_PAID', 'IN_PROGRESS'].includes(normalized)) {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  return 'border-gold-200 bg-gold-50 text-gold-700'
}

function StatusPill({ value }) {
  const label = value || 'Pending'
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${getStatusClass(label)}`}>
      {label.replace('_', ' ')}
    </span>
  )
}

function DashboardActionCard({ section, value, accent, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[2rem] border border-obsidian-200 bg-white p-6 text-left shadow-[0_18px_50px_rgba(27,23,16,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(27,23,16,0.10)]"
    >
      <div className={`absolute right-4 top-4 h-24 w-24 rounded-full opacity-70 blur-2xl ${accent}`} />
      <div className="relative">
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold-700">{section.eyebrow}</div>
        <h3 className="mt-3 font-display text-2xl text-obsidian-900">{section.label}</h3>
        <p className="mt-2 text-sm leading-7 text-obsidian-500">{section.description}</p>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-obsidian-400">At a glance</div>
            <div className="mt-2 font-display text-3xl text-obsidian-900">{value}</div>
          </div>
          <span className="rounded-full border border-obsidian-200 px-4 py-2 text-xs uppercase tracking-[0.18em] text-obsidian-600 transition-all group-hover:border-gold-300 group-hover:text-gold-700">
            Open detail
          </span>
        </div>
      </div>
    </button>
  )
}

function DirectoryCard({ vendor, onView, onChat }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-obsidian-200 bg-white shadow-[0_18px_50px_rgba(27,23,16,0.06)]">
      <img
        src={vendorImageSrc(vendor)}
        alt={vendorDisplayName(vendor)}
        className="h-48 w-full object-cover"
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl text-obsidian-900">{vendorDisplayName(vendor)}</h3>
            <p className="mt-1 text-sm text-obsidian-400">{vendor.user?.name || 'Vendor contact'}</p>
          </div>
          <span className="rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold-700">
            {vendor.serviceType || 'Service'}
          </span>
        </div>

        <div className="mt-4">{renderStars(vendor.rating)}</div>
        <p className="mt-4 text-sm leading-7 text-obsidian-500">{vendorSummary(vendor)}</p>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className="text-obsidian-400">Starting from</span>
          <span className="font-medium text-obsidian-900">{formatVendorCurrency(vendor.startingPrice)}</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={onView}>View detail</button>
          <button className="btn-primary" onClick={onChat}>Chat now</button>
        </div>
      </div>
    </div>
  )
}

export default function VendorDashboard() {
  const { user, logout } = useAuth()
  const { section } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast, showToast, clearToast } = useToast()
  const [vendor, setVendor] = useState(null)
  const [directory, setDirectory] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [preferredChatUserId, setPreferredChatUserId] = useState(null)

  const currentSection = useMemo(() => {
    const match = DASHBOARD_SECTIONS.find(item => item.id === section)
    return match ? match.id : 'overview'
  }, [section])

  useEffect(() => {
    fetchDashboard()
  }, [user?.email])

  useEffect(() => {
    if (location.state?.chatTargetUserId) {
      setPreferredChatUserId(location.state.chatTargetUserId)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const goToSection = (nextSection, state) => {
    navigate(nextSection === 'overview' ? '/vendor/dashboard' : `/vendor/dashboard/${nextSection}`, state ? { state } : undefined)
  }

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const response = await vendorProfileApi.getAll()
      const vendors = response.data || []
      setDirectory(vendors)

      const currentVendor = vendors.find(item => item.user?.email === user?.email)
        || (user?.vendor ? vendors.find(item => item.vendorId === user.vendor.vendorId) : null)

      setVendor(currentVendor || null)

      if (currentVendor) {
        setForm({
          businessName: currentVendor.businessName || '',
          serviceType: currentVendor.serviceType || '',
          startingPrice: currentVendor.startingPrice?.toString() || '',
          aboutBusiness: currentVendor.aboutBusiness || '',
          businessDetails: currentVendor.businessDetails || '',
          photoUrl: currentVendor.photoUrl || '',
        })
        await fetchOrders(currentVendor.vendorId)
      } else {
        setOrders([])
      }
    } catch {
      showToast('Failed to load vendor dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async (vendorId) => {
    if (!vendorId) return
    setLoadingOrders(true)
    try {
      const response = await vendorEventVendorsApi.getByVendor(vendorId)
      setOrders(response.data || [])
    } catch {
      setOrders([])
      showToast('Failed to load vendor orders', 'error')
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleSave = async () => {
    if (!vendor) return
    setSaving(true)
    try {
      const startingPrice = form.startingPrice === '' ? null : Number(form.startingPrice)
      const payload = {
        ...vendor,
        businessName: form.businessName.trim(),
        serviceType: form.serviceType,
        startingPrice: Number.isFinite(startingPrice) ? startingPrice : null,
        aboutBusiness: form.aboutBusiness.trim(),
        businessDetails: form.businessDetails.trim(),
        photoUrl: form.photoUrl.trim(),
      }
      const response = await vendorProfileApi.update(vendor.vendorId, payload)
      setVendor(response.data)
      setDirectory(current => current.map(item => (item.vendorId === response.data.vendorId ? response.data : item)))
      setEditModalOpen(false)
      showToast('Vendor profile updated successfully')
    } catch {
      showToast('Failed to update vendor profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenVendorChat = (targetVendor) => {
    if (!targetVendor?.user?.userId) return
    goToSection('messages', {
      chatTargetUserId: targetVendor.user.userId,
      chatTargetLabel: vendorDisplayName(targetVendor),
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const peerVendors = directory.filter(item => item.vendorId !== vendor?.vendorId)
  const availableServices = [...new Set(peerVendors.map(item => item.serviceType).filter(Boolean))]
  const filteredPeers = peerVendors.filter((item) => {
    const matchesSearch = !search
      || item.businessName?.toLowerCase().includes(search.toLowerCase())
      || item.user?.name?.toLowerCase().includes(search.toLowerCase())
      || item.serviceType?.toLowerCase().includes(search.toLowerCase())
    const matchesService = !serviceFilter || item.serviceType === serviceFilter
    return matchesSearch && matchesService
  })

  const totalBookedValue = orders.reduce((sum, item) => sum + Number(item.agreedPrice || 0), 0)
  const activeOrders = orders.filter((item) => !['CANCELLED', 'COMPLETED'].includes((item.contractStatus || '').toUpperCase())).length
  const paidOrders = orders.filter((item) => ['PAID', 'SETTLED'].includes((item.paymentStatus || '').toUpperCase())).length
  const pendingPayments = orders.filter((item) => !['PAID', 'SETTLED'].includes((item.paymentStatus || '').toUpperCase())).length
  const completedProfileFields = [
    vendor?.businessName,
    vendor?.serviceType,
    vendor?.startingPrice,
    vendor?.user?.name,
    vendor?.user?.email,
    vendor?.user?.phone,
    vendor?.aboutBusiness,
    vendor?.photoUrl,
  ].filter(Boolean).length
  const profileCompletion = Math.round((completedProfileFields / 8) * 100)
  const sectionLookup = Object.fromEntries(DASHBOARD_SECTIONS.map(item => [item.id, item]))
  const sectionStats = {
    overview: `${profileCompletion}%`,
    profile: `${profileCompletion}%`,
    orders: orders.length,
    details: vendor?.serviceType || 'Service',
    about: vendor?.photoUrl ? 'Photo set' : 'Add photo',
    network: peerVendors.length,
    messages: directory.length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Spinner size="lg" className="text-obsidian-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />

      <div className="pt-14">
        <div className="border-b border-gold-200 bg-[linear-gradient(135deg,_#15120e_0%,_#5f3b15_48%,_#c57d2b_100%)] text-cream">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
              <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
                <img
                  src={vendorImageSrc(vendor)}
                  alt={vendorDisplayName(vendor)}
                  className="h-[240px] w-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cream/90">
                    Vendor Dashboard
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cream/90">
                    {vendor?.serviceType || 'Service not selected'}
                  </span>
                </div>

                <h1 className="mt-4 font-display text-4xl font-light leading-tight">
                  {vendor?.businessName || 'Vendor Dashboard'}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-cream/80">
                  {vendor ? vendorSummary(vendor) : 'Manage your profile, bookings, vendor details, about section, and business conversations.'}
                </p>

                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-cream/90">
                    {vendor?.user?.name || user?.email}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-cream/90">
                    {vendor?.user?.email || user?.email}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-cream/90">
                    From {formatVendorCurrency(vendor?.startingPrice)}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="btn-secondary border-white/20 bg-white/10 text-cream hover:bg-white/20" onClick={() => setEditModalOpen(true)}>
                    Edit profile
                  </button>
                  <button className="btn-ghost text-cream/80 hover:text-cream" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Profile Ready" value={`${profileCompletion}%`} icon="P" color="obsidian" />
              <StatCard label="Orders" value={orders.length} icon="O" color="gold" />
              <StatCard label="Vendor Network" value={peerVendors.length} icon="V" color="blue" />
              <StatCard label="Paid Orders" value={paidOrders} icon="$" color="green" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-8">
          {!vendor ? (
            <div className="card p-10 text-center">
              <div className="mb-3 text-4xl opacity-30">O</div>
              <h3 className="font-display text-xl text-obsidian-700">Profile not found</h3>
              <p className="mt-2 text-sm text-obsidian-400">
                We could not locate your vendor profile yet. Try refreshing your session.
              </p>
              <button className="btn-primary mt-5" onClick={fetchDashboard}>Retry</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {DASHBOARD_SECTIONS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => goToSection(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      currentSection === item.id
                        ? 'bg-obsidian-900 text-cream shadow-lg'
                        : 'border border-obsidian-200 bg-white text-obsidian-500 hover:border-gold-300 hover:text-obsidian-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {currentSection === 'overview' && (
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                    <div className="text-xs uppercase tracking-[0.22em] text-gold-700">{sectionLookup.overview.eyebrow}</div>
                    <h2 className="mt-2 font-display text-3xl text-obsidian-900">{sectionLookup.overview.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-obsidian-500">{sectionLookup.overview.description}</p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {DASHBOARD_SECTIONS.filter(item => item.id !== 'overview').map((item, index) => (
                      <DashboardActionCard
                        key={item.id}
                        section={item}
                        value={sectionStats[item.id]}
                        accent={['bg-gold-200', 'bg-blue-200', 'bg-green-200', 'bg-red-200', 'bg-amber-200', 'bg-violet-200'][index % 6]}
                        onClick={() => goToSection(item.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {currentSection === 'profile' && (
                <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                  <div className="space-y-6">
                    <div className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                      <div className="text-xs uppercase tracking-[0.22em] text-gold-700">{sectionLookup.profile.eyebrow}</div>
                      <h2 className="mt-2 font-display text-3xl text-obsidian-900">{sectionLookup.profile.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-obsidian-500">{sectionLookup.profile.description}</p>

                      <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <div className="rounded-3xl bg-parchment p-5">
                          <div className="text-xs uppercase tracking-[0.18em] text-obsidian-400">Business Information</div>
                          <dl className="mt-4 space-y-4 text-sm">
                            {[
                              ['Business Name', vendor.businessName],
                              ['Service Type', vendor.serviceType],
                              ['Starting Price', formatVendorCurrency(vendor.startingPrice)],
                              ['Profile Completion', `${profileCompletion}%`],
                            ].map(([label, value]) => (
                              <div key={label} className="flex items-start justify-between gap-4">
                                <dt className="text-obsidian-400">{label}</dt>
                                <dd className="text-right font-medium text-obsidian-900">{value || 'Not set'}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>

                        <div className="rounded-3xl bg-parchment p-5">
                          <div className="text-xs uppercase tracking-[0.18em] text-obsidian-400">Contact Details</div>
                          <dl className="mt-4 space-y-4 text-sm">
                            {[
                              ['Contact Name', vendor.user?.name],
                              ['Email', vendor.user?.email],
                              ['Phone', vendor.user?.phone],
                              ['Vendor ID', `#${vendor.vendorId}`],
                            ].map(([label, value]) => (
                              <div key={label} className="flex items-start justify-between gap-4">
                                <dt className="text-obsidian-400">{label}</dt>
                                <dd className="text-right font-medium text-obsidian-900">{value || 'Not set'}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                      <div className="text-xs uppercase tracking-[0.22em] text-gold-700">About Preview</div>
                      <p className="mt-4 text-sm leading-8 text-obsidian-500">
                        {vendor.aboutBusiness?.trim() || 'Add an about section so people understand your style, experience, and service promise at a glance.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="overflow-hidden rounded-[2rem] border border-obsidian-200 bg-white shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                      <img
                        src={vendorImageSrc(vendor)}
                        alt={vendorDisplayName(vendor)}
                        className="h-72 w-full object-cover"
                      />
                      <div className="p-6">
                        <div className="text-xs uppercase tracking-[0.18em] text-gold-700">Business Photo</div>
                        <p className="mt-2 text-sm leading-7 text-obsidian-500">
                          This image appears in your detailed vendor views and helps your business feel complete.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-gold-200 bg-gold-50 p-7 shadow-[0_24px_60px_rgba(188,138,55,0.10)]">
                      <div className="text-xs uppercase tracking-[0.18em] text-gold-700">Pricing Snapshot</div>
                      <div className="mt-4 font-display text-4xl text-obsidian-900">{formatVendorCurrency(vendor.startingPrice)}</div>
                      <p className="mt-2 text-sm text-gold-900/75">
                        Keep this realistic so planners and team members can compare you quickly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentSection === 'orders' && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total Orders" value={orders.length} icon="O" color="obsidian" />
                    <StatCard label="Active Contracts" value={activeOrders} icon="A" color="gold" />
                    <StatCard label="Pending Payments" value={pendingPayments} icon="P" color="red" />
                    <StatCard label="Booked Value" value={formatVendorCurrency(totalBookedValue)} icon="$" color="green" />
                  </div>

                  <div className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                    <div className="text-xs uppercase tracking-[0.22em] text-gold-700">{sectionLookup.orders.eyebrow}</div>
                    <h2 className="mt-2 font-display text-3xl text-obsidian-900">{sectionLookup.orders.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-obsidian-500">{sectionLookup.orders.description}</p>

                    {loadingOrders ? (
                      <div className="flex justify-center py-16">
                        <Spinner size="lg" className="text-obsidian-400" />
                      </div>
                    ) : orders.length === 0 ? (
                      <EmptyState
                        icon="O"
                        title="No orders yet"
                        description="When an organizer assigns your business to an event, the booking will appear here."
                      />
                    ) : (
                      <div className="mt-8 overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                          <thead>
                            <tr className="border-b border-obsidian-100 text-left text-xs uppercase tracking-[0.18em] text-obsidian-400">
                              <th className="pb-4 pr-4 font-medium">Event</th>
                              <th className="pb-4 pr-4 font-medium">Date</th>
                              <th className="pb-4 pr-4 font-medium">Venue</th>
                              <th className="pb-4 pr-4 font-medium">Contract</th>
                              <th className="pb-4 pr-4 font-medium">Payment</th>
                              <th className="pb-4 font-medium">Agreed Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-obsidian-50">
                            {orders.map(order => (
                              <tr key={order.eventVendorId}>
                                <td className="py-4 pr-4">
                                  <div className="font-medium text-obsidian-900">{order.event?.eventName || 'Untitled event'}</div>
                                  <div className="mt-1 text-xs text-obsidian-400">Order #{order.eventVendorId}</div>
                                </td>
                                <td className="py-4 pr-4 text-obsidian-500">{formatVendorDate(order.event?.eventDate)}</td>
                                <td className="py-4 pr-4 text-obsidian-500">{order.event?.venue || 'Venue not set'}</td>
                                <td className="py-4 pr-4"><StatusPill value={order.contractStatus || 'Pending'} /></td>
                                <td className="py-4 pr-4"><StatusPill value={order.paymentStatus || 'Pending'} /></td>
                                <td className="py-4 font-medium text-obsidian-900">{formatVendorCurrency(order.agreedPrice)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentSection === 'details' && (
                <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
                  <div className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                    <div className="text-xs uppercase tracking-[0.22em] text-gold-700">{sectionLookup.details.eyebrow}</div>
                    <h2 className="mt-2 font-display text-3xl text-obsidian-900">{sectionLookup.details.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-obsidian-500">{sectionLookup.details.description}</p>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                      {[
                        ['Service Type', vendor.serviceType || 'Not set'],
                        ['Starting Price', formatVendorCurrency(vendor.startingPrice)],
                        ['Rating', vendor.rating ? `${Number(vendor.rating).toFixed(1)} / 5.0` : 'Not rated yet'],
                        ['Orders linked', `${orders.length}`],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-3xl border border-obsidian-100 bg-obsidian-50/60 p-5">
                          <div className="text-xs uppercase tracking-[0.16em] text-obsidian-400">{label}</div>
                          <div className="mt-2 text-lg font-medium text-obsidian-900">{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 rounded-3xl border border-gold-200 bg-gold-50 p-6">
                      <div className="text-xs uppercase tracking-[0.18em] text-gold-700">Business Details</div>
                      <p className="mt-3 text-sm leading-8 text-gold-900/80">
                        {vendorDetailSummary(vendor)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                      <div className="text-xs uppercase tracking-[0.18em] text-gold-700">Service Rating</div>
                      <div className="mt-5">{renderStars(vendor.rating)}</div>
                      <p className="mt-3 text-sm text-obsidian-400">
                        Ratings become more useful as event work gets completed and reviewed.
                      </p>
                    </div>

                    <div className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                      <div className="text-xs uppercase tracking-[0.18em] text-gold-700">Positioning Notes</div>
                      <ul className="mt-4 space-y-3 text-sm leading-7 text-obsidian-500">
                        <li>Use the business details field for packages, deliverables, and service area.</li>
                        <li>Keep pricing aligned with the value you show in the photo and about section.</li>
                        <li>Open vendor detail pages to compare how other businesses present themselves.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentSection === 'about' && (
                <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
                  <div className="overflow-hidden rounded-[2rem] border border-obsidian-200 bg-white shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                    <img
                      src={vendorImageSrc(vendor)}
                      alt={vendorDisplayName(vendor)}
                      className="h-[420px] w-full object-cover"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                      <div className="text-xs uppercase tracking-[0.22em] text-gold-700">{sectionLookup.about.eyebrow}</div>
                      <h2 className="mt-2 font-display text-3xl text-obsidian-900">{sectionLookup.about.title}</h2>
                      <p className="mt-4 text-sm leading-8 text-obsidian-500">
                        {vendor.aboutBusiness?.trim() || 'Add your business story, signature style, customer promise, and what makes your work memorable.'}
                      </p>
                    </div>

                    <div className="rounded-[2rem] border border-gold-200 bg-gold-50 p-7 shadow-[0_24px_60px_rgba(188,138,55,0.10)]">
                      <div className="text-xs uppercase tracking-[0.18em] text-gold-700">Photo Guidance</div>
                      <ul className="mt-4 space-y-3 text-sm leading-7 text-gold-900/80">
                        <li>Use a business photo or portfolio image that feels authentic to your work.</li>
                        <li>If no photo URL is added yet, the dashboard creates a branded placeholder automatically.</li>
                        <li>Pair the image with a clear about message so the detail page feels complete.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentSection === 'network' && (
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-gold-700">{sectionLookup.network.eyebrow}</div>
                        <h2 className="mt-2 font-display text-3xl text-obsidian-900">{sectionLookup.network.title}</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-obsidian-500">{sectionLookup.network.description}</p>
                      </div>
                      <div className="rounded-2xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-800">
                        {filteredPeers.length} vendor{filteredPeers.length !== 1 ? 's' : ''} visible
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search business, owner, or service"
                        className="input-field w-full max-w-sm"
                      />
                      <select
                        value={serviceFilter}
                        onChange={(event) => setServiceFilter(event.target.value)}
                        className="input-field w-full max-w-xs"
                      >
                        <option value="">All services</option>
                        {availableServices.map(service => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filteredPeers.length === 0 ? (
                    <EmptyState
                      icon="V"
                      title="No other vendors found"
                      description="Try changing the service filter or search query."
                    />
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {filteredPeers.map(item => (
                        <DirectoryCard
                          key={item.vendorId}
                          vendor={item}
                          onView={() => navigate(`/vendors/${item.vendorId}`)}
                          onChat={() => handleOpenVendorChat(item)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentSection === 'messages' && (
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-obsidian-200 bg-white p-7 shadow-[0_24px_60px_rgba(27,23,16,0.06)]">
                    <div className="text-xs uppercase tracking-[0.22em] text-gold-700">{sectionLookup.messages.eyebrow}</div>
                    <h2 className="mt-2 font-display text-3xl text-obsidian-900">{sectionLookup.messages.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-obsidian-500">{sectionLookup.messages.description}</p>
                  </div>
                  <ChatTab
                    showToast={showToast}
                    preferredUserId={preferredChatUserId}
                    onPreferredUserHandled={() => setPreferredChatUserId(null)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {editModalOpen && (
        <Modal title="Edit Vendor Profile" onClose={() => setEditModalOpen(false)} size="lg">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Business Name">
                <input
                  value={form.businessName}
                  onChange={(event) => setForm({ ...form, businessName: event.target.value })}
                  placeholder="Your business name"
                  className="input-field"
                />
              </Field>
              <Field label="Service Type">
                <select
                  value={form.serviceType}
                  onChange={(event) => setForm({ ...form, serviceType: event.target.value })}
                  className="input-field"
                >
                  <option value="">Select...</option>
                  {SERVICE_TYPES.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Starting Price">
                <input
                  type="number"
                  value={form.startingPrice}
                  onChange={(event) => setForm({ ...form, startingPrice: event.target.value })}
                  placeholder="5000"
                  className="input-field"
                  min="0"
                />
              </Field>
              <Field label="Photo URL">
                <input
                  value={form.photoUrl}
                  onChange={(event) => setForm({ ...form, photoUrl: event.target.value })}
                  placeholder="https://your-business-image"
                  className="input-field"
                />
              </Field>
            </div>

            <Field label="About Business">
              <textarea
                value={form.aboutBusiness}
                onChange={(event) => setForm({ ...form, aboutBusiness: event.target.value })}
                rows={4}
                placeholder="Tell people about your style, service promise, and what makes your business memorable."
                className="input-field resize-none"
              />
            </Field>

            <Field label="Vendor Details">
              <textarea
                value={form.businessDetails}
                onChange={(event) => setForm({ ...form, businessDetails: event.target.value })}
                rows={4}
                placeholder="Mention packages, deliverables, event coverage, timing, and service workflow."
                className="input-field resize-none"
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button className="btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
              <button className="btn-gold" onClick={handleSave} disabled={saving}>
                {saving ? <><Spinner size="sm" /><span>Saving...</span></> : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}
