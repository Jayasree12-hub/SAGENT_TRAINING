import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { notificationsApi, tasksApi, vendorsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Modal, SectionHeader, Spinner, StatCard, Toast } from '../components/ui'
import { useToast } from '../hooks/useToast'
import ChatTab from '../components/tabs/ChatTab'
import {
  formatVendorCurrency,
  vendorDisplayName,
  vendorImageSrc,
  vendorSummary,
} from '../utils/vendorHelpers'

const STATUS_FLOW = ['PENDING', 'ACCEPTED', 'COMPLETED']
const PRIORITY_COLORS = { HIGH: 'border-l-red-400', MEDIUM: 'border-l-gold-400', LOW: 'border-l-green-400' }
const DEADLINE_WARNING_DAYS = 3

function normalizeStatus(status) {
  if (!status) return 'PENDING'
  const s = status.toUpperCase()
  if (s === 'TODO' || s === 'PENDING') return 'PENDING'
  if (s === 'IN_PROGRESS' || s === 'ACCEPTED') return 'ACCEPTED'
  if (s === 'DONE' || s === 'COMPLETED') return 'COMPLETED'
  if (s === 'REJECTED') return 'REJECTED'
  return s
}

function deadlineInfo(deadline) {
  if (!deadline) return { label: null, warning: false, overdue: false }
  const due = new Date(deadline)
  const today = new Date()
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) {
    return { label: 'Overdue', warning: true, overdue: true }
  }
  if (diffDays <= DEADLINE_WARNING_DAYS) {
    return { label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, warning: true, overdue: false }
  }
  return { label: due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), warning: false, overdue: false }
}

export default function TeamMemberDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast, showToast, clearToast } = useToast()
  const [activeTab, setActiveTab] = useState('tasks')
  const [tasks, setTasks] = useState([])
  const [counts, setCounts] = useState({ assigned: 0, completed: 0, pending: 0 })
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [rejectingTask, setRejectingTask] = useState(null)
  const [rejectMessage, setRejectMessage] = useState('')
  const [preferredChatUserId, setPreferredChatUserId] = useState(null)

  const unreadCount = notifications.length

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [taskRes, countRes, notifRes, vendorRes] = await Promise.all([
        tasksApi.getAssignedMe(),
        tasksApi.teamMemberDashboard(),
        notificationsApi.getMyUnread(),
        vendorsApi.getAll(),
      ])
      setTasks(taskRes.data || [])
      setCounts(countRes.data || { assigned: 0, completed: 0, pending: 0 })
      setNotifications(notifRes.data || [])
      setVendors(vendorRes.data || [])
    } catch {
      showToast('Failed to load dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [user?.email])

  useEffect(() => {
    if (location.state?.chatTargetUserId) {
      setActiveTab('chat')
      setPreferredChatUserId(location.state.chatTargetUserId)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const handleLogout = () => { logout(); navigate('/') }

  const handleAccept = async (taskId) => {
    setActionLoading(true)
    try {
      await tasksApi.accept(taskId)
      showToast('Task accepted')
      fetchData()
    } catch {
      showToast('Unable to accept task', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async (taskId) => {
    setActionLoading(true)
    try {
      await tasksApi.complete(taskId)
      showToast('Task completed')
      fetchData()
    } catch {
      showToast('Unable to complete task', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const openReject = (task) => {
    setRejectingTask(task)
    setRejectMessage('')
  }

  const submitReject = async () => {
    if (!rejectMessage.trim()) {
      showToast('Reason required', 'error')
      return
    }
    setActionLoading(true)
    try {
      await tasksApi.reject(rejectingTask.taskId, { message: rejectMessage.trim() })
      showToast('Task rejected')
      setRejectingTask(null)
      fetchData()
    } catch {
      showToast('Unable to reject task', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const markNotificationRead = async (id) => {
    try {
      await notificationsApi.markRead(id)
      fetchData()
    } catch {
      showToast('Failed to mark read', 'error')
    }
  }

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aDue = a.deadline ? new Date(a.deadline).getTime() : 0
      const bDue = b.deadline ? new Date(b.deadline).getTime() : 0
      return aDue - bDue
    })
  }, [tasks])

  const tabMeta = {
    tasks: {
      title: 'Team Member Dashboard',
      subtitle: 'Manage assigned tasks',
    },
    chat: {
      title: 'Chat',
      subtitle: 'Direct messages and event group chats',
    },
    vendors: {
      title: 'Vendors',
      subtitle: 'Registered vendors you can review and contact',
    },
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <aside className="w-56 bg-obsidian-900 flex flex-col">
          <div className="p-5 border-b border-obsidian-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-600 text-cream flex items-center justify-center text-sm font-medium font-sans">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs text-cream font-medium truncate">{user?.email}</div>
                <div className="text-[10px] text-obsidian-400 uppercase tracking-wider">TEAM_MEMBER</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-sans transition-all ${activeTab === 'tasks' ? 'text-cream bg-gold-600' : 'text-obsidian-300 hover:bg-obsidian-800 hover:text-cream'}`}
              >
                <span className="text-base leading-none opacity-70">T</span>
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-sans transition-all ${activeTab === 'chat' ? 'text-cream bg-gold-600' : 'text-obsidian-300 hover:bg-obsidian-800 hover:text-cream'}`}
              >
                <span className="text-base leading-none opacity-70">C</span>
                Chat
              </button>
              <button
                onClick={() => setActiveTab('vendors')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-sans transition-all ${activeTab === 'vendors' ? 'text-cream bg-gold-600' : 'text-obsidian-300 hover:bg-obsidian-800 hover:text-cream'}`}
              >
                <span className="text-base leading-none opacity-70">V</span>
                Vendors
              </button>
            </div>
          </nav>

          <div className="p-3 border-t border-obsidian-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-sans text-obsidian-400 hover:text-cream hover:bg-obsidian-800 transition-all">
              <span className="text-base">-&gt;</span> Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {/* Top bar */}
          <div className="bg-cream border-b border-obsidian-100 px-6 py-3 flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg text-obsidian-900">{tabMeta[activeTab].title}</h1>
              <p className="text-xs text-obsidian-400">{tabMeta[activeTab].subtitle}</p>
            </div>
            <div className="relative">
              <button
                className="relative w-9 h-9 rounded-full border border-obsidian-200 flex items-center justify-center hover:bg-obsidian-50"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="text-sm">N</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-cream border border-obsidian-200 rounded shadow-lg p-3 z-20">
                  <div className="text-xs text-obsidian-500 mb-2">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="text-xs text-obsidian-400">No new notifications</div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {notifications.map(n => (
                        <div key={n.notificationId} className="border border-obsidian-100 rounded p-2 text-xs">
                          <div className="text-obsidian-800">{n.message}</div>
                          <button className="text-gold-600 mt-1" onClick={() => markNotificationRead(n.notificationId)}>Mark as read</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {activeTab === 'tasks' && (
            <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard label="Assigned Tasks" value={counts.assigned} icon="T" color="obsidian" />
              <StatCard label="Completed" value={counts.completed} icon="C" color="green" />
              <StatCard label="Pending" value={counts.pending} icon="P" color="gold" />
            </div>
          )}

          {/* Tasks */}
          <div className="flex-1 overflow-auto px-6 pb-6">
            {activeTab === 'tasks' ? (
              <>
                <SectionHeader title="My Tasks" subtitle={`${tasks.length} assigned task${tasks.length !== 1 ? 's' : ''}`} />

                {loading ? (
                  <div className="flex justify-center py-16"><Spinner size="lg" className="text-obsidian-400" /></div>
                ) : tasks.length === 0 ? (
                  <div className="text-center text-sm text-obsidian-400 py-12">No tasks assigned yet</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {sortedTasks.map(task => {
                      const status = normalizeStatus(task.status)
                      const deadline = deadlineInfo(task.deadline)
                      const showAccept = status === 'PENDING'
                      const showComplete = status === 'ACCEPTED'
                      const showReject = status === 'PENDING' || status === 'ACCEPTED'
                      return (
                        <div key={task.taskId} className={`card p-4 border-l-4 ${PRIORITY_COLORS[task.priority] || 'border-l-obsidian-200'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-medium text-obsidian-900">{task.title}</h3>
                            <span className="text-xs uppercase tracking-wide text-obsidian-500">{task.priority}</span>
                          </div>
                          <p className="text-xs text-obsidian-400 mt-0.5">Task ID: {task.taskId}</p>
                          {task.description && <p className="text-xs text-obsidian-400 mt-1">{task.description}</p>}

                          <div className={`text-xs mt-2 ${deadline.warning ? 'text-red-600' : 'text-obsidian-500'}`}>
                            {deadline.label && (deadline.warning ? `Warning: ${deadline.label}` : `Deadline: ${deadline.label}`)}
                          </div>

                          {task.status === 'REJECTED' && task.rejectionMessage && (
                            <div className="mt-2 text-xs text-red-600">
                              Rejected: {task.rejectionMessage}
                            </div>
                          )}

                          {status === 'REJECTED' ? (
                            <div className="text-[10px] uppercase tracking-wider text-red-600 mt-3">Status: Rejected</div>
                          ) : (
                            <div className="flex items-center gap-2 mt-3 text-[10px] uppercase tracking-wider text-obsidian-400">
                              {STATUS_FLOW.map((step, idx) => {
                                const active = STATUS_FLOW.indexOf(status) >= idx
                                return (
                                  <span key={step} className={active ? 'text-gold-600' : ''}>
                                    {step}{idx < STATUS_FLOW.length - 1 ? ' -> ' : ''}
                                  </span>
                                )
                              })}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-4">
                            {showAccept && (
                              <button className="btn-secondary text-xs" onClick={() => handleAccept(task.taskId)} disabled={actionLoading}>Accept</button>
                            )}
                            {showReject && (
                              <button className="btn-danger text-xs" onClick={() => openReject(task)} disabled={actionLoading}>Reject</button>
                            )}
                            {showComplete && (
                              <button className="btn-primary text-xs" onClick={() => handleComplete(task.taskId)} disabled={actionLoading}>Complete</button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : activeTab === 'vendors' ? (
              <>
                <SectionHeader title="Registered Vendors" subtitle={`${vendors.length} vendor${vendors.length !== 1 ? 's' : ''} available`} />

                {loading ? (
                  <div className="flex justify-center py-16"><Spinner size="lg" className="text-obsidian-400" /></div>
                ) : vendors.length === 0 ? (
                  <div className="text-center text-sm text-obsidian-400 py-12">No vendors registered yet</div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {vendors.map(vendor => (
                      <div key={vendor.vendorId} className="overflow-hidden rounded-[1.75rem] border border-obsidian-200 bg-white shadow-[0_18px_50px_rgba(27,23,16,0.06)]">
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

                          <p className="mt-4 text-sm leading-7 text-obsidian-500">{vendorSummary(vendor)}</p>

                          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                            <span className="text-obsidian-400">Starting from</span>
                            <span className="font-medium text-obsidian-900">{formatVendorCurrency(vendor.startingPrice)}</span>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button className="btn-secondary" onClick={() => navigate(`/vendors/${vendor.vendorId}`)}>View detail</button>
                            <button
                              className="btn-primary"
                              onClick={() => {
                                setActiveTab('chat')
                                setPreferredChatUserId(vendor.user?.userId || null)
                              }}
                              disabled={!vendor.user?.userId}
                            >
                              Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <ChatTab
                showToast={showToast}
                preferredUserId={preferredChatUserId}
                onPreferredUserHandled={() => setPreferredChatUserId(null)}
              />
            )}
          </div>
        </main>
      </div>

      {rejectingTask && (
        <Modal title="Reject Task" onClose={() => setRejectingTask(null)} size="sm">
          <div className="space-y-3">
            <p className="text-xs text-obsidian-500">Please provide a reason for rejecting this task.</p>
            <textarea
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="Reason required"
            />
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setRejectingTask(null)}>Cancel</button>
              <button className="btn-danger" onClick={submitReject} disabled={actionLoading}>Submit</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}
