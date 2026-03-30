import React, { useState, useEffect } from 'react'
import { guestsApi, eventsApi } from '../../api/client'
import { Modal, ConfirmDialog, EmptyState, StatusBadge, SectionHeader, Field, Spinner } from '../ui'

const EMPTY_FORM = { name: '', email: '', phone: '', rsvpStatus: 'PENDING', attendanceStatus: 'PENDING', event: { eventId: '' } }
const RSVP_STATUSES = ['PENDING', 'YES', 'NO', 'MAYBE']
const ATTENDANCE_STATUSES = ['PENDING', 'ATTENDED', 'ABSENT']

export default function GuestsTab({ showToast }) {
  const [guests, setGuests] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRsvp, setFilterRsvp] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [gRes, eRes] = await Promise.all([guestsApi.getAll(), eventsApi.getAll()])
      setGuests(gRes.data)
      setEvents(eRes.data)
    } catch { showToast('Failed to load guests', 'error') }
    finally { setLoading(false) }
  }

  const openCreate = () => { setEditingGuest(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  const openEdit = (g) => {
    setEditingGuest(g)
    setForm({
      name: g.name || '',
      email: g.email || '',
      phone: g.phone || '',
      rsvpStatus: g.rsvpStatus || 'PENDING',
      attendanceStatus: g.attendanceStatus || 'PENDING',
      event: { eventId: g.event?.eventId || '' },
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = { ...form, event: form.event.eventId ? { eventId: parseInt(form.event.eventId) } : null }
      if (editingGuest) {
        await guestsApi.update(editingGuest.guestId, payload)
        showToast('Guest updated')
      } else {
        await guestsApi.create(payload)
        showToast('Guest added')
      }
      setModalOpen(false)
      fetchData()
    } catch { showToast('Failed to save guest', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await guestsApi.delete(deleteTarget.guestId)
      showToast('Guest removed')
      setDeleteTarget(null)
      fetchData()
    } catch { showToast('Failed to delete guest', 'error') }
    finally { setDeleting(false) }
  }

  const filtered = guests.filter(g => {
    const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase())
    const matchRsvp = !filterRsvp || g.rsvpStatus === filterRsvp
    return matchSearch && matchRsvp
  })

  return (
    <div className="py-4">
      <SectionHeader
        title="Guests"
        subtitle={`${guests.length} total guest${guests.length !== 1 ? 's' : ''}`}
        action={<button className="btn-primary" onClick={openCreate}>+ Add Guest</button>}
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guests…" className="input-field max-w-xs" />
        <select value={filterRsvp} onChange={e => setFilterRsvp(e.target.value)} className="input-field w-40">
          <option value="">All RSVP</option>
          {RSVP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-obsidian-400" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="◎" title="No guests found" description="Add guests to your events" action={<button className="btn-primary" onClick={openCreate}>Add Guest</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-obsidian-100 bg-obsidian-50/50">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Contact</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Event</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">RSVP</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Attendance</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-50">
                {filtered.map(g => (
                  <tr key={g.guestId} className="hover:bg-obsidian-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-obsidian-900">{g.name}</td>
                    <td className="px-4 py-3">
                      <div className="text-obsidian-600">{g.email}</div>
                      {g.phone && <div className="text-obsidian-400 text-xs">{g.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-obsidian-500 text-xs">{g.event?.eventName || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={g.rsvpStatus} /></td>
                    <td className="px-4 py-3"><StatusBadge status={g.attendanceStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="text-xs text-gold-600 hover:text-gold-700 font-medium" onClick={() => openEdit(g)}>Edit</button>
                        <button className="text-xs text-red-400 hover:text-red-600" onClick={() => setDeleteTarget(g)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal title={editingGuest ? 'Edit Guest' : 'Add Guest'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Full Name" error={errors.name}>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" className="input-field" />
            </Field>
            <Field label="Email Address" error={errors.email}>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" className="input-field" />
            </Field>
            <Field label="Phone Number">
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="input-field" />
            </Field>
            <Field label="Linked Event">
              <select value={form.event.eventId} onChange={e => setForm({ ...form, event: { eventId: e.target.value } })} className="input-field">
                <option value="">No event linked</option>
                {events.map(ev => <option key={ev.eventId} value={ev.eventId}>{ev.eventName}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="RSVP Status">
                <select value={form.rsvpStatus} onChange={e => setForm({ ...form, rsvpStatus: e.target.value })} className="input-field">
                  {RSVP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Attendance">
                <select value={form.attendanceStatus} onChange={e => setForm({ ...form, attendanceStatus: e.target.value })} className="input-field">
                  {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Spinner size="sm" /><span>Saving…</span></> : (editingGuest ? 'Update' : 'Add Guest')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove Guest"
          message={`Remove "${deleteTarget.name}" from the guest list?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
