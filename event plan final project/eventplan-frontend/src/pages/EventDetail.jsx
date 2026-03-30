import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsApi, guestsApi, tasksApi, budgetsApi, invitationsApi } from '../api/client'
import Navbar from '../components/Navbar'
import { StatusBadge, StatCard, Toast, Spinner } from '../components/ui'
import { useToast } from '../hooks/useToast'

const TABS = ['Overview', 'Guests', 'Tasks', 'Budget', 'Invitations']

export default function EventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { toast, showToast, clearToast } = useToast()
  const [event, setEvent] = useState(null)
  const [guests, setGuests] = useState([])
  const [tasks, setTasks] = useState([])
  const [budgets, setBudgets] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')

  useEffect(() => { fetchAll() }, [eventId])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [eRes, gRes, tRes, bRes, iRes] = await Promise.allSettled([
        eventsApi.getById(eventId),
        guestsApi.getByEvent(eventId),
        tasksApi.getByEvent(eventId),
        budgetsApi.getByEvent(eventId),
        invitationsApi.getByEvent(eventId),
      ])
      if (eRes.status === 'fulfilled') setEvent(eRes.value.data)
      setGuests(gRes.status === 'fulfilled' ? gRes.value.data : [])
      setTasks(tRes.status === 'fulfilled' ? tRes.value.data : [])
      setBudgets(bRes.status === 'fulfilled' ? bRes.value.data : [])
      setInvitations(iRes.status === 'fulfilled' ? iRes.value.data : [])
    } catch { showToast('Failed to load event details', 'error') }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-parchment flex items-center justify-center">
      <Spinner size="lg" className="text-obsidian-400" />
    </div>
  )

  if (!event) return (
    <div className="min-h-screen bg-parchment flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-xl text-obsidian-600 mb-3">Event not found</p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  )

  const totalBudget = budgets.reduce((s, b) => s + (parseFloat(b.estimatedAmount) || 0), 0)
  const totalSpent = budgets.reduce((s, b) => s + (parseFloat(b.actualAmount) || 0), 0)
  const rsvpYes = guests.filter(g => g.rsvpStatus === 'YES').length
  const tasksDone = tasks.filter(t => t.status === 'DONE').length

  const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN')}`

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <div className="pt-14">
        {/* Hero header */}
        <div className="bg-obsidian-900 text-cream">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-obsidian-400 hover:text-cream text-sm mb-4 flex items-center gap-1 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-4xl font-light text-cream mb-2">{event.eventName}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={event.status} />
                  {event.eventType && <span className="text-obsidian-400 text-sm">{event.eventType}</span>}
                  {event.eventDate && (
                    <span className="text-obsidian-400 text-sm">
                      📅 {new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                  {event.venue && <span className="text-obsidian-400 text-sm">📍 {event.venue}</span>}
                </div>
                {event.description && <p className="text-obsidian-300 text-sm mt-3 max-w-2xl leading-relaxed">{event.description}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard label="Guests Confirmed" value={`${rsvpYes}/${guests.length}`} icon="◎" color="gold" />
            <StatCard label="Tasks Done" value={`${tasksDone}/${tasks.length}`} icon="◉" color="green" />
            <StatCard label="Budget Est." value={fmt(totalBudget)} icon="◇" color="obsidian" />
            <StatCard label="Spent" value={fmt(totalSpent)} icon="◈" color="blue" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white border border-obsidian-100 rounded-lg p-1 w-fit overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded text-sm font-sans whitespace-nowrap transition-all ${
                  activeTab === tab ? 'bg-obsidian-900 text-cream font-medium' : 'text-obsidian-500 hover:text-obsidian-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="animate-fade-in" key={activeTab}>

            {/* Overview */}
            {activeTab === 'Overview' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="card p-5">
                  <h3 className="font-display text-lg mb-4">Event Information</h3>
                  <dl className="space-y-3 text-sm">
                    {[
                      ['Event Name', event.eventName],
                      ['Type', event.eventType],
                      ['Date', event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                      ['Venue', event.venue],
                      ['Status', event.status],
                      ['Organizer', event.organizer?.name || event.organizer?.email || '—'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-3">
                        <dt className="text-obsidian-400 w-28 shrink-0">{k}</dt>
                        <dd className="text-obsidian-900 font-medium">{v || '—'}</dd>
                      </div>
                    ))}
                    {event.description && (
                      <div className="flex gap-3">
                        <dt className="text-obsidian-400 w-28 shrink-0">Description</dt>
                        <dd className="text-obsidian-700 leading-relaxed">{event.description}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="space-y-4">
                  {/* RSVP summary */}
                  <div className="card p-5">
                    <h3 className="font-display text-lg mb-3">Guest RSVP Summary</h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: 'Yes', count: guests.filter(g => g.rsvpStatus === 'YES').length, color: 'text-green-600' },
                        { label: 'No', count: guests.filter(g => g.rsvpStatus === 'NO').length, color: 'text-red-500' },
                        { label: 'Pending', count: guests.filter(g => g.rsvpStatus === 'PENDING').length, color: 'text-obsidian-400' },
                      ].map(({ label, count, color }) => (
                        <div key={label}>
                          <div className={`font-display text-2xl ${color}`}>{count}</div>
                          <div className="text-xs text-obsidian-400">{label}</div>
                        </div>
                      ))}
                    </div>
                    {guests.length > 0 && (
                      <div className="mt-3">
                        <div className="flex h-2 rounded-full overflow-hidden bg-obsidian-100">
                          <div className="bg-green-500 h-full" style={{ width: `${guests.filter(g => g.rsvpStatus === 'YES').length / guests.length * 100}%` }} />
                          <div className="bg-red-400 h-full" style={{ width: `${guests.filter(g => g.rsvpStatus === 'NO').length / guests.length * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Task summary */}
                  <div className="card p-5">
                    <h3 className="font-display text-lg mb-3">Task Progress</h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: 'To Do', count: tasks.filter(t => t.status === 'TODO').length, color: 'text-obsidian-600' },
                        { label: 'In Progress', count: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
                        { label: 'Done', count: tasks.filter(t => t.status === 'DONE').length, color: 'text-green-600' },
                      ].map(({ label, count, color }) => (
                        <div key={label}>
                          <div className={`font-display text-2xl ${color}`}>{count}</div>
                          <div className="text-xs text-obsidian-400">{label}</div>
                        </div>
                      ))}
                    </div>
                    {tasks.length > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-obsidian-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${tasksDone / tasks.length * 100}%` }} />
                        </div>
                        <p className="text-xs text-obsidian-400 mt-1">{Math.round(tasksDone / tasks.length * 100)}% complete</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Guests */}
            {activeTab === 'Guests' && (
              <div className="card overflow-hidden">
                {guests.length === 0 ? (
                  <div className="p-8 text-center text-obsidian-400 text-sm">No guests for this event yet.</div>
                ) : (
                  <table className="w-full text-sm font-sans">
                    <thead>
                      <tr className="border-b border-obsidian-100 bg-obsidian-50/50">
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Name</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Email</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Phone</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">RSVP</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Attended</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-obsidian-50">
                      {guests.map(g => (
                        <tr key={g.guestId} className="hover:bg-obsidian-50/30">
                          <td className="px-4 py-3 font-medium text-obsidian-900">{g.name}</td>
                          <td className="px-4 py-3 text-obsidian-500">{g.email}</td>
                          <td className="px-4 py-3 text-obsidian-400 text-xs">{g.phone || '—'}</td>
                          <td className="px-4 py-3"><StatusBadge status={g.rsvpStatus} /></td>
                          <td className="px-4 py-3"><StatusBadge status={g.attendanceStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tasks */}
            {activeTab === 'Tasks' && (
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <div className="card p-8 text-center text-obsidian-400 text-sm">No tasks for this event yet.</div>
                ) : tasks.map(t => (
                  <div key={t.taskId} className="card p-4 flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === 'DONE' ? 'bg-green-500' : t.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-obsidian-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-obsidian-900 text-sm">{t.title}</div>
                      {t.description && <div className="text-xs text-obsidian-400 truncate">{t.description}</div>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {t.deadline && <span className="text-xs text-obsidian-400">{new Date(t.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                      <StatusBadge status={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Budget */}
            {activeTab === 'Budget' && (
              <div>
                {budgets.length === 0 ? (
                  <div className="card p-8 text-center text-obsidian-400 text-sm">No budget entries for this event yet.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="card p-4">
                        <div className="text-xs text-obsidian-400 mb-1">Estimated</div>
                        <div className="font-display text-xl">{fmt(totalBudget)}</div>
                      </div>
                      <div className="card p-4">
                        <div className="text-xs text-obsidian-400 mb-1">Actual Spent</div>
                        <div className="font-display text-xl">{fmt(totalSpent)}</div>
                      </div>
                      <div className="card p-4">
                        <div className="text-xs text-obsidian-400 mb-1">Variance</div>
                        <div className={`font-display text-xl ${totalSpent > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                          {fmt(totalSpent - totalBudget)}
                        </div>
                      </div>
                    </div>
                    <div className="card overflow-hidden">
                      <table className="w-full text-sm font-sans">
                        <thead>
                          <tr className="border-b border-obsidian-100 bg-obsidian-50/50">
                            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Category</th>
                            <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Estimated</th>
                            <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Actual</th>
                            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-obsidian-50">
                          {budgets.map(b => (
                            <tr key={b.budgetId} className="hover:bg-obsidian-50/30">
                              <td className="px-4 py-3 font-medium text-obsidian-900">{b.category}</td>
                              <td className="px-4 py-3 text-right text-obsidian-700">{fmt(b.estimatedAmount)}</td>
                              <td className="px-4 py-3 text-right text-obsidian-700">{b.actualAmount != null ? fmt(b.actualAmount) : '—'}</td>
                              <td className="px-4 py-3 text-xs text-obsidian-400">{b.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Invitations */}
            {activeTab === 'Invitations' && (
              <div className="card overflow-hidden">
                {invitations.length === 0 ? (
                  <div className="p-8 text-center text-obsidian-400 text-sm">No invitations sent for this event yet.</div>
                ) : (
                  <table className="w-full text-sm font-sans">
                    <thead>
                      <tr className="border-b border-obsidian-100 bg-obsidian-50/50">
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Guest</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Template</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Message</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-obsidian-500 font-medium">Sent At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-obsidian-50">
                      {invitations.map(inv => (
                        <tr key={inv.invitationId} className="hover:bg-obsidian-50/30">
                          <td className="px-4 py-3">
                            <div className="font-medium text-obsidian-900">{inv.guest?.name || '—'}</div>
                            <div className="text-xs text-obsidian-400">{inv.guest?.email}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-obsidian-600">{inv.templateName || '—'}</td>
                          <td className="px-4 py-3 text-xs text-obsidian-400 max-w-xs truncate">{inv.customMessage || '—'}</td>
                          <td className="px-4 py-3 text-xs text-obsidian-400">
                            {inv.sentAt ? new Date(inv.sentAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}
