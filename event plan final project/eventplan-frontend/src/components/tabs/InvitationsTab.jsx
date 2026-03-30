import React, { useEffect, useState } from 'react'
import { eventsApi, guestsApi, invitationsApi, rsvpApi } from '../../api/client'
import { ConfirmDialog, EmptyState, Field, Modal, SectionHeader, Spinner, StatCard, StatusBadge } from '../ui'

const EMPTY_FORM = { templateName: '', customMessage: '', eventId: '', guestIds: [] }
const TEMPLATES = ['Formal Invite', 'Casual Invite', 'Wedding Invitation', 'Corporate Event', 'Birthday Party', 'Custom']

function normalizeEmail(email) {
  return email?.trim().toLowerCase() || ''
}

function toDashboardStatus(status) {
  const normalized = status?.trim().toUpperCase()
  if (!normalized) return 'PENDING'
  if (normalized === 'YES') return 'ACCEPTED'
  if (normalized === 'NO') return 'DECLINED'
  if (normalized === 'ACCEPTED' || normalized === 'DECLINED' || normalized === 'PENDING') return normalized
  return 'PENDING'
}

export default function InvitationsTab({ showToast }) {
  const [invitations, setInvitations] = useState([])
  const [events, setEvents] = useState([])
  const [guests, setGuests] = useState([])
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingInv, setEditingInv] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [filterEvent, setFilterEvent] = useState('')

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (!filterEvent) {
      setResponses([])
      setLoadingResponses(false)
      return
    }
    fetchResponses(filterEvent)
  }, [filterEvent])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [iRes, eRes, gRes] = await Promise.all([
        invitationsApi.getAll(),
        eventsApi.getAll(),
        guestsApi.getAll(),
      ])
      setInvitations(iRes.data)
      setEvents(eRes.data)
      setGuests(gRes.data)
    } catch {
      showToast('Failed to load invitations', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchResponses = async (eventId) => {
    if (!eventId) return
    setLoadingResponses(true)
    try {
      const res = await rsvpApi.getByEvent(eventId)
      setResponses(res.data)
    } catch {
      setResponses([])
    } finally {
      setLoadingResponses(false)
    }
  }

  const refreshCurrentView = async () => {
    await fetchData()
    if (filterEvent) {
      await fetchResponses(filterEvent)
    }
  }

  const openCreate = () => {
    setEditingInv(null)
    setForm({ ...EMPTY_FORM, eventId: filterEvent || '' })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (invitation) => {
    setEditingInv(invitation)
    setForm({
      templateName: invitation.templateName || '',
      customMessage: invitation.customMessage || '',
      eventId: invitation.event?.eventId?.toString() || '',
      guestIds: invitation.guest?.guestId ? [invitation.guest.guestId.toString()] : [],
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.eventId) nextErrors.event = 'Event is required'
    if (editingInv) {
      if (!form.guestIds[0]) nextErrors.guest = 'Guest is required'
    } else if (!form.guestIds.length) {
      nextErrors.guest = 'Select at least one guest'
    }
    return nextErrors
  }

  const handleSave = async () => {
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      if (editingInv) {
        await invitationsApi.update(editingInv.invitationId, {
          templateName: form.templateName,
          customMessage: form.customMessage,
          event: { eventId: parseInt(form.eventId, 10) },
          guest: { guestId: parseInt(form.guestIds[0], 10) },
        })
        showToast('Invitation updated')
      } else {
        const eventId = parseInt(form.eventId, 10)
        const guestIds = form.guestIds.map((id) => parseInt(id, 10))
        const results = await Promise.allSettled(
          guestIds.map((guestId) => invitationsApi.create({
            templateName: form.templateName,
            customMessage: form.customMessage,
            event: { eventId },
            guest: { guestId },
          }))
        )

        const successCount = results.filter((result) => result.status === 'fulfilled').length
        const failureCount = results.length - successCount

        if (successCount > 0) {
          showToast(`Invitation sent to ${successCount} guest${successCount > 1 ? 's' : ''}`)
        }
        if (failureCount > 0) {
          showToast(`${failureCount} invitation${failureCount > 1 ? 's' : ''} failed`, 'error')
        }
      }

      setModalOpen(false)
      await refreshCurrentView()
    } catch {
      showToast('Failed to save invitation', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      await invitationsApi.delete(deleteTarget.invitationId)
      showToast('Invitation deleted')
      setDeleteTarget(null)
      await refreshCurrentView()
    } catch {
      showToast('Failed to delete invitation', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const filteredInvitations = filterEvent
    ? invitations.filter((invitation) => invitation.event?.eventId?.toString() === filterEvent)
    : invitations

  const selectedEvent = filterEvent
    ? events.find((event) => event.eventId?.toString() === filterEvent)
    : null

  const availableGuests = form.eventId
    ? guests.filter((guest) => {
        const guestEventId = guest.event?.eventId?.toString()
        return !guestEventId || guestEventId === form.eventId
      })
    : guests

  const responsesByEmail = responses.reduce((map, response) => {
    const emailKey = normalizeEmail(response.guestEmail)
    if (emailKey) {
      map.set(emailKey, response)
    }
    return map
  }, new Map())

  const participantRows = Array.from(
    filteredInvitations.reduce((map, invitation) => {
      const guest = invitation.guest
      const emailKey = normalizeEmail(guest?.email)
      const participantKey = guest?.guestId || emailKey || invitation.invitationId
      if (map.has(participantKey)) {
        return map
      }

      const matchedResponse = emailKey ? responsesByEmail.get(emailKey) : null
      map.set(participantKey, {
        guestName: guest?.name || 'Guest',
        email: guest?.email || 'No email',
        responseStatus: matchedResponse
          ? toDashboardStatus(matchedResponse.response)
          : toDashboardStatus(guest?.rsvpStatus),
        responseTime: matchedResponse?.responseTime || null,
      })
      return map
    }, new Map()).values()
  ).sort((left, right) => left.guestName.localeCompare(right.guestName))

  const responseSummary = participantRows.reduce((summary, participant) => {
    const status = participant.responseStatus?.toUpperCase()
    if (status === 'ACCEPTED') summary.accepted += 1
    else if (status === 'DECLINED') summary.declined += 1
    else summary.pending += 1
    return summary
  }, { accepted: 0, declined: 0, pending: 0 })

  return (
    <div className="py-4">
      <SectionHeader
        title="Invitations"
        subtitle={`${invitations.length} invitation${invitations.length !== 1 ? 's' : ''} sent`}
        action={<button className="btn-primary" onClick={openCreate}>+ Send Invitation</button>}
      />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <label className="label">Filter by event</label>
          <select
            value={filterEvent}
            onChange={(event) => setFilterEvent(event.target.value)}
            className="input-field w-full md:w-72"
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
            ))}
          </select>
        </div>
        {selectedEvent && (
          <div className="rounded-2xl border border-gold-200 bg-parchment px-5 py-4 text-sm text-obsidian-600">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-700">Response dashboard</div>
            <div className="mt-1 font-display text-xl text-obsidian-900">{selectedEvent.eventName}</div>
            <div className="mt-1 text-xs text-obsidian-400">
              {participantRows.length} invited participant{participantRows.length !== 1 ? 's' : ''} in view
            </div>
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="mb-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Accepted" value={responseSummary.accepted} icon={'\u2705'} color="green" />
            <StatCard label="Declined" value={responseSummary.declined} icon={'\u274C'} color="red" />
            <StatCard label="Pending" value={responseSummary.pending} icon={'\u23F3'} color="gold" />
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-obsidian-100 px-5 py-4">
              <h3 className="font-display text-xl text-obsidian-900">Participant Responses</h3>
              <p className="mt-1 text-sm text-obsidian-400">
                Live RSVP tracking for guests invited to this event.
              </p>
            </div>

            {loadingResponses ? (
              <div className="flex justify-center py-14">
                <Spinner size="lg" className="text-obsidian-400" />
              </div>
            ) : participantRows.length === 0 ? (
              <EmptyState
                icon={'\u2709'}
                title="No invited participants yet"
                description="Send invitations for this event to start tracking responses."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-obsidian-100 bg-obsidian-50/50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-obsidian-500">Participant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-obsidian-500">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-obsidian-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-obsidian-500">Responded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-obsidian-50">
                    {participantRows.map((participant) => (
                      <tr key={`${participant.email || participant.guestName}-${participant.responseStatus}`} className="hover:bg-obsidian-50/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-obsidian-900">{participant.guestName || 'Guest'}</td>
                        <td className="px-4 py-3 text-obsidian-500">{participant.email || 'No email'}</td>
                        <td className="px-4 py-3"><StatusBadge status={participant.responseStatus || 'PENDING'} /></td>
                        <td className="px-4 py-3 text-obsidian-500">
                          {participant.responseTime
                            ? new Date(participant.responseTime).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : 'Awaiting response'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-obsidian-400" /></div>
      ) : filteredInvitations.length === 0 ? (
        <EmptyState
          icon={'\u25C8'}
          title="No invitations yet"
          description="Send invitations to your event guests."
          action={<button className="btn-primary" onClick={openCreate}>Send Invitation</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-obsidian-100 bg-obsidian-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-obsidian-500">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-obsidian-500">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-obsidian-500">Template</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-obsidian-500">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-obsidian-500">Sent At</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-50">
                {filteredInvitations.map((invitation) => (
                  <tr key={invitation.invitationId} className="hover:bg-obsidian-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-obsidian-900">{invitation.guest?.name || '-'}</div>
                      <div className="text-xs text-obsidian-400">{invitation.guest?.email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-obsidian-600">{invitation.event?.eventName || '-'}</td>
                    <td className="px-4 py-3">
                      {invitation.templateName ? (
                        <span className="badge-status border border-obsidian-200 bg-obsidian-50 text-obsidian-600">
                          {invitation.templateName}
                        </span>
                      ) : (
                        <span className="text-xs text-obsidian-300">-</span>
                      )}
                    </td>
                    <td className="max-w-[240px] px-4 py-3 text-xs text-obsidian-400">
                      <div className="truncate">{invitation.customMessage || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-obsidian-400">
                      {invitation.sentAt
                        ? new Date(invitation.sentAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs font-medium text-gold-600 hover:text-gold-700" onClick={() => openEdit(invitation)}>
                          Edit
                        </button>
                        <button className="text-xs text-red-400 hover:text-red-600" onClick={() => setDeleteTarget(invitation)}>
                          Delete
                        </button>
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
        <Modal title={editingInv ? 'Edit Invitation' : 'Send Invitation'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Event" error={errors.event}>
              <select
                value={form.eventId}
                onChange={(event) => setForm({ ...form, eventId: event.target.value, guestIds: [] })}
                className="input-field"
              >
                <option value="">Select event...</option>
                {events.map((event) => (
                  <option key={event.eventId} value={event.eventId}>{event.eventName}</option>
                ))}
              </select>
            </Field>

            <Field label={editingInv ? 'Guest' : 'Guests'} error={errors.guest}>
              {editingInv ? (
                <select
                  value={form.guestIds[0] || ''}
                  onChange={(event) => setForm({ ...form, guestIds: [event.target.value] })}
                  className="input-field"
                >
                  <option value="">Select guest...</option>
                  {availableGuests.map((guest) => (
                    <option key={guest.guestId} value={guest.guestId}>
                      {guest.name} ({guest.email})
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <select
                    multiple
                    size={Math.min(6, Math.max(3, availableGuests.length || 3))}
                    value={form.guestIds}
                    onChange={(event) => setForm({ ...form, guestIds: Array.from(event.target.selectedOptions, (option) => option.value) })}
                    className="input-field h-36"
                  >
                    {availableGuests.map((guest) => (
                      <option key={guest.guestId} value={guest.guestId}>
                        {guest.name} ({guest.email})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-obsidian-400">
                    Tip: hold Ctrl on Windows or Cmd on Mac to select multiple guests.
                  </p>
                </>
              )}
            </Field>

            <Field label="Template">
              <select
                value={form.templateName}
                onChange={(event) => setForm({ ...form, templateName: event.target.value })}
                className="input-field"
              >
                <option value="">No template</option>
                {TEMPLATES.map((template) => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>
            </Field>

            <Field label="Custom Message">
              <textarea
                value={form.customMessage}
                onChange={(event) => setForm({ ...form, customMessage: event.target.value })}
                placeholder="Share a warm note with your guest before they RSVP."
                rows={4}
                className="input-field resize-none"
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Spinner size="sm" /><span>Saving...</span></> : (editingInv ? 'Update Invitation' : 'Send Invitation')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Invitation"
          message="Delete this invitation? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
