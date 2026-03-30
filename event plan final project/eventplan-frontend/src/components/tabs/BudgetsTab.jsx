import React, { useState, useEffect } from 'react'
import { budgetsApi, eventsApi } from '../../api/client'
import { Modal, ConfirmDialog, EmptyState, SectionHeader, Field, Spinner } from '../ui'

const EMPTY_FORM = { category: '', estimatedAmount: '', actualAmount: '', notes: '', event: { eventId: '' } }
const CATEGORIES = ['Venue', 'Catering', 'Decoration', 'Photography', 'Music & Entertainment', 'Transport', 'Invitations', 'Attire', 'Security', 'Miscellaneous']

export default function BudgetsTab({ showToast }) {
  const [budgets, setBudgets] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [filterEvent, setFilterEvent] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [bRes, eRes] = await Promise.all([budgetsApi.getAll(), eventsApi.getAll()])
      setBudgets(bRes.data)
      setEvents(eRes.data)
    } catch { showToast('Failed to load budgets', 'error') }
    finally { setLoading(false) }
  }

  const openCreate = () => { setEditingBudget(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  const openEdit = (b) => {
    setEditingBudget(b)
    setForm({
      category: b.category || '',
      estimatedAmount: b.estimatedAmount?.toString() || '',
      actualAmount: b.actualAmount?.toString() || '',
      notes: b.notes || '',
      event: { eventId: b.event?.eventId || '' },
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.category) errs.category = 'Category is required'
    if (!form.estimatedAmount || isNaN(+form.estimatedAmount)) errs.estimatedAmount = 'Valid amount required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        estimatedAmount: parseFloat(form.estimatedAmount),
        actualAmount: form.actualAmount ? parseFloat(form.actualAmount) : null,
        event: form.event.eventId ? { eventId: parseInt(form.event.eventId) } : null,
      }
      if (editingBudget) {
        await budgetsApi.update(editingBudget.budgetId, payload)
        showToast('Budget updated')
      } else {
        await budgetsApi.create(payload)
        showToast('Budget entry created')
      }
      setModalOpen(false)
      fetchData()
    } catch { showToast('Failed to save budget', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await budgetsApi.delete(deleteTarget.budgetId)
      showToast('Budget entry deleted')
      setDeleteTarget(null)
      fetchData()
    } catch { showToast('Failed to delete', 'error') }
    finally { setDeleting(false) }
  }

  const fmt = (n) => n != null ? `₹${parseFloat(n).toLocaleString('en-IN')}` : '—'

  const filtered = filterEvent ? budgets.filter(b => b.event?.eventId?.toString() === filterEvent) : budgets

  const totalEst = filtered.reduce((s, b) => s + (parseFloat(b.estimatedAmount) || 0), 0)
  const totalAct = filtered.reduce((s, b) => s + (parseFloat(b.actualAmount) || 0), 0)
  const variance = totalAct - totalEst

  return (
    <div className="py-4">
      <SectionHeader
        title="Budgets"
        subtitle="Track estimated vs actual spend"
        action={<button className="btn-primary" onClick={openCreate}>+ Add Entry</button>}
      />

      {/* Summary cards */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4">
            <div className="text-xs uppercase tracking-wider text-obsidian-400 mb-1">Total Estimated</div>
            <div className="font-display text-xl text-obsidian-900">{fmt(totalEst)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs uppercase tracking-wider text-obsidian-400 mb-1">Total Actual</div>
            <div className="font-display text-xl text-obsidian-900">{fmt(totalAct)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs uppercase tracking-wider text-obsidian-400 mb-1">Variance</div>
            <div className={`font-display text-xl ${variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-obsidian-900'}`}>
              {variance > 0 ? '+' : ''}{fmt(variance)}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)} className="input-field w-56">
          <option value="">All Events</option>
          {events.map(ev => <option key={ev.eventId} value={ev.eventId}>{ev.eventName}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-obsidian-400" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="◇" title="No budget entries" description="Start tracking your event expenses" action={<button className="btn-primary" onClick={openCreate}>Add Entry</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-obsidian-100 bg-obsidian-50/50">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Event</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Estimated</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Actual</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Variance</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Notes</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-50">
                {filtered.map(b => {
                  const est = parseFloat(b.estimatedAmount) || 0
                  const act = parseFloat(b.actualAmount) || 0
                  const diff = act - est
                  return (
                    <tr key={b.budgetId} className="hover:bg-obsidian-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-obsidian-900">{b.category}</td>
                      <td className="px-4 py-3 text-obsidian-500 text-xs">{b.event?.eventName || '—'}</td>
                      <td className="px-4 py-3 text-right text-obsidian-700">{fmt(est)}</td>
                      <td className="px-4 py-3 text-right text-obsidian-700">{b.actualAmount != null ? fmt(act) : '—'}</td>
                      <td className={`px-4 py-3 text-right font-medium ${b.actualAmount != null ? (diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-600' : 'text-obsidian-400') : 'text-obsidian-300'}`}>
                        {b.actualAmount != null ? `${diff > 0 ? '+' : ''}${fmt(diff)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-obsidian-400 max-w-[140px] truncate">{b.notes || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button className="text-xs text-gold-600 hover:text-gold-700 font-medium" onClick={() => openEdit(b)}>Edit</button>
                          <button className="text-xs text-red-400 hover:text-red-600" onClick={() => setDeleteTarget(b)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal title={editingBudget ? 'Edit Budget Entry' : 'New Budget Entry'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Category" error={errors.category}>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Linked Event">
              <select value={form.event.eventId} onChange={e => setForm({ ...form, event: { eventId: e.target.value } })} className="input-field">
                <option value="">No event linked</option>
                {events.map(ev => <option key={ev.eventId} value={ev.eventId}>{ev.eventName}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Estimated Amount (₹)" error={errors.estimatedAmount}>
                <input type="number" value={form.estimatedAmount} onChange={e => setForm({ ...form, estimatedAmount: e.target.value })} placeholder="50000" className="input-field" min="0" />
              </Field>
              <Field label="Actual Amount (₹)">
                <input type="number" value={form.actualAmount} onChange={e => setForm({ ...form, actualAmount: e.target.value })} placeholder="Leave blank if unknown" className="input-field" min="0" />
              </Field>
            </div>
            <Field label="Notes">
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes…" rows={2} className="input-field resize-none" />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Spinner size="sm" /><span>Saving…</span></> : (editingBudget ? 'Update' : 'Add Entry')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Budget Entry"
          message={`Delete "${deleteTarget.category}" budget entry?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
