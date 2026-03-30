import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '../../api/client'
import { Modal, ConfirmDialog, EmptyState, StatusBadge, SectionHeader, Field, Spinner } from '../ui'

const EMPTY_FORM = { eventName: '', eventType: '', eventDate: '', venue: '', description: '', status: 'PLANNED' }
const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Conference', 'Concert', 'Festival', 'Seminar', 'Other']
const STATUSES = ['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED']

export default function EventsTab({ showToast }) {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res = await eventsApi.getAll()
      setEvents(res.data)
    } catch { showToast('Failed to load events', 'error') }
    finally { setLoading(false) }
  }

  const openCreate = () => { setEditingEvent(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  const openEdit = (ev) => {
    setEditingEvent(ev)
    setForm({
      eventName: ev.eventName || '',
      eventType: ev.eventType || '',
      eventDate: ev.eventDate || '',
      venue: ev.venue || '',
      description: ev.description || '',
      status: ev.status || 'PLANNED',
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.eventName.trim()) errs.eventName = 'Event name is required'
    if (!form.eventType) errs.eventType = 'Event type is required'
    if (!form.eventDate) errs.eventDate = 'Date is required'
    if (!form.venue.trim()) errs.venue = 'Venue is required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.eventId, form)
        showToast('Event updated successfully')
      } else {
        await eventsApi.create(form)
        showToast('Event created successfully')
      }
      setModalOpen(false)
      fetchEvents()
    } catch { showToast('Failed to save event', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await eventsApi.delete(deleteTarget.eventId)
      showToast('Event deleted')
      setDeleteTarget(null)
      fetchEvents()
    } catch { showToast('Failed to delete event', 'error') }
    finally { setDeleting(false) }
  }

  const filtered = events.filter(ev =>
    ev.eventName?.toLowerCase().includes(search.toLowerCase()) ||
    ev.eventType?.toLowerCase().includes(search.toLowerCase()) ||
    ev.venue?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="py-4">
      <SectionHeader
        title="Events"
        subtitle={`${events.length} total event${events.length !== 1 ? 's' : ''}`}
        action={<button className="btn-primary" onClick={openCreate}>+ New Event</button>}
      />

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search events…"
          className="input-field max-w-xs"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-obsidian-400" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No events yet"
          description="Create your first event to get started"
          action={<button className="btn-primary" onClick={openCreate}>Create Event</button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(ev => (
            <div key={ev.eventId} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-display text-base font-medium text-obsidian-900 truncate">{ev.eventName}</h3>
                  <p className="text-xs text-obsidian-400 mt-0.5">{ev.eventType}</p>
                </div>
                <StatusBadge status={ev.status} />
              </div>

              <div className="space-y-1.5 mb-4 text-xs text-obsidian-500">
                {ev.eventDate && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-obsidian-300">📅</span>
                    <span>{new Date(ev.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
                {ev.venue && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-obsidian-300">📍</span>
                    <span className="truncate">{ev.venue}</span>
                  </div>
                )}
                {ev.organizer && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-obsidian-300">👤</span>
                    <span>{ev.organizer.name || ev.organizer.email}</span>
                  </div>
                )}
              </div>

              {ev.description && (
                <p className="text-xs text-obsidian-400 mb-3 line-clamp-2 leading-relaxed">{ev.description}</p>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-obsidian-100">
                <button
                  className="btn-ghost text-xs py-1.5 px-3"
                  onClick={() => navigate(`/dashboard/events/${ev.eventId}`)}
                >
                  View Details
                </button>
                <button className="btn-secondary text-xs py-1.5 px-3" onClick={() => openEdit(ev)}>Edit</button>
                <button
                  className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1.5"
                  onClick={() => setDeleteTarget(ev)}
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <Modal title={editingEvent ? 'Edit Event' : 'New Event'} onClose={() => setModalOpen(false)} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Event Name" error={errors.eventName}>
                <input value={form.eventName} onChange={e => setForm({ ...form, eventName: e.target.value })} placeholder="Summer Gala 2025" className="input-field" />
              </Field>
              <Field label="Event Type" error={errors.eventType}>
                <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })} className="input-field">
                  <option value="">Select type…</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Event Date" error={errors.eventDate}>
                <input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} className="input-field" />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Venue" error={errors.venue}>
              <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Grand Ballroom, Hotel XYZ" className="input-field" />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the event…"
                rows={3}
                className="input-field resize-none"
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Spinner size="sm" /><span>Saving…</span></> : (editingEvent ? 'Update Event' : 'Create Event')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Event"
          message={`Are you sure you want to delete "${deleteTarget.eventName}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
