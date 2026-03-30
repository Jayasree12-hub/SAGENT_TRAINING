import React, { useState, useEffect } from 'react'
import { vendorsApi } from '../../api/client'
import { EmptyState, SectionHeader, Spinner } from '../ui'

export default function VendorsTab({ showToast }) {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterService, setFilterService] = useState('')

  useEffect(() => { fetchVendors() }, [])

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const res = await vendorsApi.getAll()
      setVendors(res.data)
    } catch { showToast('Failed to load vendors', 'error') }
    finally { setLoading(false) }
  }

  const serviceTypes = [...new Set(vendors.map(v => v.serviceType).filter(Boolean))]

  const filtered = vendors.filter(v => {
    const matchSearch = v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      v.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.serviceType?.toLowerCase().includes(search.toLowerCase())
    const matchService = !filterService || v.serviceType === filterService
    return matchSearch && matchService
  })

  const renderStars = (rating) => {
    if (!rating) return <span className="text-obsidian-300 text-xs">No rating</span>
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-sm ${i < full ? 'text-gold-500' : i === full && half ? 'text-gold-300' : 'text-obsidian-200'}`}>★</span>
        ))}
        <span className="text-xs text-obsidian-400 ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="py-4">
      <SectionHeader
        title="Vendors"
        subtitle={`${vendors.length} registered vendor${vendors.length !== 1 ? 's' : ''}`}
      />

      <div className="flex gap-3 mb-6 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors…" className="input-field max-w-xs" />
        <select value={filterService} onChange={e => setFilterService(e.target.value)} className="input-field w-48">
          <option value="">All Services</option>
          {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-obsidian-400" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="◎" title="No vendors found" description="Vendors who register on the platform will appear here" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(v => (
            <div key={v.vendorId} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-base font-medium text-obsidian-900">{v.businessName}</h3>
                  {v.user?.name && <p className="text-xs text-obsidian-400 mt-0.5">{v.user.name}</p>}
                </div>
                {v.serviceType && (
                  <span className="badge-status bg-gold-50 text-gold-700 border border-gold-200 text-[10px]">{v.serviceType}</span>
                )}
              </div>

              <div className="mb-3">
                {renderStars(v.rating)}
              </div>

              <div className="space-y-1.5 text-xs text-obsidian-500">
                {v.startingPrice != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian-400">Starting from</span>
                    <span className="font-medium text-obsidian-900">₹{parseFloat(v.startingPrice).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {v.user?.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian-400">Contact</span>
                    <span className="text-obsidian-600 truncate max-w-[150px]">{v.user.email}</span>
                  </div>
                )}
                {v.user?.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian-400">Phone</span>
                    <span>{v.user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
