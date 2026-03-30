import React, { useState, useEffect } from 'react'
import { tasksApi, eventsApi, usersApi } from '../../api/client'
import { Modal, ConfirmDialog, EmptyState, StatusBadge, SectionHeader, Field, Spinner } from '../ui'

const EMPTY_FORM = { title: '', description: '', deadline: '', priority: 'MEDIUM', status: 'TODO', event: { eventId: '' }, assignedTo: { userId: '' } }
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW']
const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE', 'REJECTED']
const EDITABLE_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']
const DEADLINE_WARNING_DAYS = 3

function normalizeStatus(status) {
  if (!status) return 'TODO'
  const s = status.toUpperCase()
  if (s === 'PENDING' || s === 'TODO') return 'TODO'
  if (s === 'ACCEPTED' || s === 'IN_PROGRESS') return 'IN_PROGRESS'
  if (s === 'COMPLETED' || s === 'DONE') return 'DONE'
  if (s === 'REJECTED') return 'REJECTED'
  return s
}

function deadlineInfo(deadline) {
  if (!deadline) return { label: null, warning: false }
  const due = new Date(deadline)
  const today = new Date()
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { label: 'Overdue', warning: true }
  if (diffDays <= DEADLINE_WARNING_DAYS) return { label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, warning: true }
  return { label: due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), warning: false }
}

export default function TasksTab({ showToast }) {
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tRes, eRes, uRes] = await Promise.all([
        tasksApi.getAll(),
        eventsApi.getAll(),
        usersApi.getByRole('TEAM_MEMBER'),
      ])
      setTasks(tRes.data)
      setEvents(eRes.data)
      const members = Array.isArray(uRes.data) ? uRes.data : []
      setTeamMembers(members.filter(u => u.isVerified !== false))
    } catch { showToast('Failed to load tasks', 'error') }
    finally { setLoading(false) }
  }

  const openCreate = () => { setEditingTask(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  const openEdit = (t) => {
    setEditingTask(t)
    setForm({
      title: t.title || '',
      description: t.description || '',
      deadline: t.deadline || '',
      priority: t.priority || 'MEDIUM',
      status: t.status || 'TODO',
      event: { eventId: t.event?.eventId || '' },
      assignedTo: { userId: t.assignedTo?.userId || '' },
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        event: form.event.eventId ? { eventId: parseInt(form.event.eventId) } : null,
        assignedTo: form.assignedTo.userId ? { userId: parseInt(form.assignedTo.userId) } : null,
      }
      if (editingTask) {
        await tasksApi.update(editingTask.taskId, payload)
        showToast('Task updated')
      } else {
        await tasksApi.create(payload)
        showToast('Task created')
      }
      setModalOpen(false)
      fetchData()
    } catch { showToast('Failed to save task', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await tasksApi.delete(deleteTarget.taskId)
      showToast('Task deleted')
      setDeleteTarget(null)
      fetchData()
    } catch { showToast('Failed to delete task', 'error') }
    finally { setDeleting(false) }
  }

  const quickStatus = async (task, newStatus) => {
    try {
      await tasksApi.update(task.taskId, { ...task, status: newStatus, event: task.event ? { eventId: task.event.eventId } : null })
      setTasks(tasks.map(t => t.taskId === task.taskId ? { ...t, status: newStatus } : t))
      showToast('Status updated')
    } catch { showToast('Failed to update status', 'error') }
  }

  const filtered = tasks.filter(t => {
    const matchStatus = !filterStatus || normalizeStatus(t.status) === filterStatus
    const matchPriority = !filterPriority || t.priority === filterPriority
    return matchStatus && matchPriority
  })

  const grouped = {
    TODO: filtered.filter(t => normalizeStatus(t.status) === 'TODO'),
    IN_PROGRESS: filtered.filter(t => normalizeStatus(t.status) === 'IN_PROGRESS'),
    DONE: filtered.filter(t => normalizeStatus(t.status) === 'DONE'),
    REJECTED: filtered.filter(t => normalizeStatus(t.status) === 'REJECTED'),
  }

  const priorityColors = { HIGH: 'border-l-red-400', MEDIUM: 'border-l-gold-400', LOW: 'border-l-green-400' }

  return (
    <div className="py-4">
      <SectionHeader
        title="Tasks"
        subtitle={`${tasks.length} total task${tasks.length !== 1 ? 's' : ''}`}
        action={<button className="btn-primary" onClick={openCreate}>+ New Task</button>}
      />

      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-40">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input-field w-40">
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-obsidian-400" /></div>
      ) : tasks.length === 0 ? (
        <EmptyState icon="◉" title="No tasks yet" description="Create tasks to track event preparation" action={<button className="btn-primary" onClick={openCreate}>Create Task</button>} />
      ) : (
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(grouped).map(([status, items]) => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs uppercase tracking-wider text-obsidian-500 font-medium">{status.replace('_', ' ')}</h3>
                <span className="bg-obsidian-100 text-obsidian-500 text-xs px-1.5 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(task => (
                  <div key={task.taskId} className={`card p-4 border-l-4 ${priorityColors[task.priority] || 'border-l-obsidian-200'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-obsidian-900 leading-snug">{task.title}</h4>
                      <StatusBadge status={task.priority} />
                    </div>
                    {task.description && <p className="text-xs text-obsidian-400 mt-1 line-clamp-2">{task.description}</p>}
                                        {task.deadline && (() => {
                      const info = deadlineInfo(task.deadline)
                      return (
                        <p className={`text-xs mt-2 ${info.warning ? 'text-red-600' : 'text-obsidian-400'}`}>
                          {info.warning ? 'Warning: ' : ''}{info.label}
                        </p>
                      )
                    })()}
                    {task.event && <p className="text-xs text-gold-600 mt-1 truncate">{task.event.eventName}</p>}
                    {task.status === 'REJECTED' && task.rejectionMessage && (
                      <p className="text-xs text-red-600 mt-1">Rejected: {task.rejectionMessage}</p>
                    )}
                    {task.assignedTo && (
                      <p className="text-xs text-obsidian-500 mt-1 truncate">
                        Assigned to: {task.assignedTo.name || task.assignedTo.email}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-obsidian-50">
                      {status !== 'TODO' && (
                        <button className="text-[10px] text-obsidian-400 hover:text-obsidian-700" onClick={() => quickStatus(task, 'TODO')}>← Todo</button>
                      )}
                      {status !== 'IN_PROGRESS' && (
                        <button className="text-[10px] text-blue-500 hover:text-blue-700" onClick={() => quickStatus(task, 'IN_PROGRESS')}>In Progress</button>
                      )}
                      {status !== 'DONE' && (
                        <button className="text-[10px] text-green-600 hover:text-green-800" onClick={() => quickStatus(task, 'DONE')}>✓ Done</button>
                      )}
                      <div className="ml-auto flex gap-2">
                        <button className="text-[10px] text-gold-600" onClick={() => openEdit(task)}>Edit</button>
                        <button className="text-[10px] text-red-400" onClick={() => setDeleteTarget(task)}>Del</button>
                      </div>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="border-2 border-dashed border-obsidian-200 rounded-lg p-4 text-center">
                    <p className="text-xs text-obsidian-300">No tasks here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editingTask ? 'Edit Task' : 'New Task'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Task Title" error={errors.title}>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Book the venue" className="input-field" />
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Additional details…" rows={3} className="input-field resize-none" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Deadline">
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-field" />
              </Field>
              <Field label="Priority">
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field">
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
                  {EDITABLE_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Linked Event">
              <select value={form.event.eventId} onChange={e => setForm({ ...form, event: { eventId: e.target.value } })} className="input-field">
                <option value="">No event linked</option>
                {events.map(ev => <option key={ev.eventId} value={ev.eventId}>{ev.eventName}</option>)}
              </select>
            </Field>
            <Field label="Assign To (Team Member)">
              <select
                value={form.assignedTo.userId}
                onChange={e => setForm({ ...form, assignedTo: { userId: e.target.value } })}
                className="input-field"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(u => (
                  <option key={u.userId} value={u.userId}>{u.name} ({u.email})</option>
                ))}
              </select>
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Spinner size="sm" /><span>Saving…</span></> : (editingTask ? 'Update' : 'Create Task')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Task"
          message={`Delete "${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}





