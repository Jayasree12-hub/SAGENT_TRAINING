import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { eventsApi, guestsApi, tasksApi, budgetsApi, vendorsApi } from '../api/client'
import Navbar from '../components/Navbar'
import { Toast, StatCard } from '../components/ui'
import { useToast } from '../hooks/useToast'
import EventsTab from '../components/tabs/EventsTab'
import GuestsTab from '../components/tabs/GuestsTab'
import TasksTab from '../components/tabs/TasksTab'
import BudgetsTab from '../components/tabs/BudgetsTab'
import InvitationsTab from '../components/tabs/InvitationsTab'
import VendorsTab from '../components/tabs/VendorsTab'
import ChatTab from '../components/tabs/ChatTab'

const TABS = [
  { id: 'events', label: 'Events', icon: 'E' },
  { id: 'guests', label: 'Guests', icon: 'G' },
  { id: 'tasks', label: 'Tasks', icon: 'T' },
  { id: 'chat', label: 'Chat', icon: 'C' },
  { id: 'budgets', label: 'Budgets', icon: 'B' },
  { id: 'invitations', label: 'Invitations', icon: 'I' },
  { id: 'vendors', label: 'Vendors', icon: 'V' },
]

export default function OrganizerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toast, showToast, clearToast } = useToast()
  const [activeTab, setActiveTab] = useState('events')
  const [stats, setStats] = useState({ events: 0, guests: 0, tasks: 0, vendors: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [evRes, gRes, tRes, vRes] = await Promise.allSettled([
          eventsApi.getAll(),
          guestsApi.getAll(),
          tasksApi.getAll(),
          vendorsApi.getAll(),
        ])
        setStats({
          events: evRes.value?.data?.length ?? 0,
          guests: gRes.value?.data?.length ?? 0,
          tasks: tRes.value?.data?.length ?? 0,
          vendors: vRes.value?.data?.length ?? 0,
        })
      } catch {}
    }
    fetchStats()
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const tabComponents = {
    events: <EventsTab showToast={showToast} />,
    guests: <GuestsTab showToast={showToast} />,
    tasks: <TasksTab showToast={showToast} />,
    chat: <ChatTab showToast={showToast} />,
    budgets: <BudgetsTab showToast={showToast} />,
    invitations: <InvitationsTab showToast={showToast} />,
    vendors: <VendorsTab showToast={showToast} />,
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-56 bg-obsidian-900 flex flex-col pt-14 lg:pt-0
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* User info */}
          <div className="p-5 border-b border-obsidian-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-600 text-cream flex items-center justify-center text-sm font-medium font-sans">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs text-cream font-medium truncate">{user?.email}</div>
                <div className="text-[10px] text-obsidian-400 uppercase tracking-wider">{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-sans text-left transition-all
                  ${activeTab === tab.id
                    ? 'bg-gold-600 text-cream font-medium'
                    : 'text-obsidian-300 hover:bg-obsidian-800 hover:text-cream'}
                `}
              >
                <span className="text-base leading-none opacity-70">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-obsidian-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-sans text-obsidian-400 hover:text-cream hover:bg-obsidian-800 transition-all">
              <span className="text-base">→</span> Sign Out
            </button>
          </div>
        </aside>

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-obsidian-950/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {/* Top bar */}
          <div className="bg-cream border-b border-obsidian-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-1.5 rounded hover:bg-obsidian-100 transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="block w-4 h-0.5 bg-obsidian-700 mb-1" />
                <span className="block w-4 h-0.5 bg-obsidian-700 mb-1" />
                <span className="block w-3 h-0.5 bg-obsidian-700" />
              </button>
              <div>
                <h1 className="font-display text-lg text-obsidian-900">
                  {TABS.find(t => t.id === activeTab)?.label}
                </h1>
              </div>
            </div>
            <div className="text-xs text-obsidian-400 font-sans hidden sm:block">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Stats row */}
          {activeTab === 'events' && (
            <div className="px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total Events" value={stats.events} icon="◈" color="obsidian" />
              <StatCard label="Total Guests" value={stats.guests} icon="◎" color="gold" />
              <StatCard label="Tasks" value={stats.tasks} icon="◉" color="green" />
              <StatCard label="Vendors" value={stats.vendors} icon="◇" color="blue" />
            </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-auto px-6 pb-6">
            <div className="page-enter" key={activeTab}>
              {tabComponents[activeTab]}
            </div>
          </div>
        </main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}
