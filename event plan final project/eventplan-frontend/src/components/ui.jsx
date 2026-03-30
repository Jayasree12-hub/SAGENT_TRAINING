// Spinner
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className={`${sizes[size]} border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
  )
}

// Toast notification
export function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'bg-obsidian-900 text-cream',
    error: 'bg-red-600 text-white',
    info: 'bg-gold-600 text-cream',
  }
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded shadow-lg ${colors[type]} animate-slide-up text-sm font-sans max-w-sm`}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-current/60 hover:text-current ml-2 text-lg leading-none">×</button>
    </div>
  )
}

// Modal
export function Modal({ title, children, onClose, size = 'md' }) {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-obsidian-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} bg-cream rounded-lg shadow-2xl animate-slide-up border border-obsidian-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-100">
          <h2 className="font-display text-lg font-medium text-obsidian-900">{title}</h2>
          <button onClick={onClose} className="text-obsidian-400 hover:text-obsidian-900 transition-colors text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// Empty state
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3 opacity-30">{icon}</div>
      <h3 className="font-display text-lg text-obsidian-700 mb-1">{title}</h3>
      <p className="text-sm text-obsidian-400 font-sans mb-4">{description}</p>
      {action}
    </div>
  )
}

// Status badge
export function StatusBadge({ status }) {
  const map = {
    PLANNED:    'bg-blue-50 text-blue-700 border-blue-200',
    ONGOING:    'bg-gold-50 text-gold-700 border-gold-200',
    COMPLETED:  'bg-green-50 text-green-700 border-green-200',
    CANCELLED:  'bg-red-50 text-red-600 border-red-200',
    PENDING:    'bg-obsidian-50 text-obsidian-600 border-obsidian-200',
    YES:        'bg-green-50 text-green-700 border-green-200',
    NO:         'bg-red-50 text-red-600 border-red-200',
    ACCEPTED:   'bg-green-50 text-green-700 border-green-200',
    DECLINED:   'bg-red-50 text-red-600 border-red-200',
    MAYBE:      'bg-gold-50 text-gold-700 border-gold-200',
    HIGH:       'bg-red-50 text-red-600 border-red-200',
    MEDIUM:     'bg-gold-50 text-gold-700 border-gold-200',
    LOW:        'bg-green-50 text-green-700 border-green-200',
    TODO:       'bg-obsidian-50 text-obsidian-600 border-obsidian-200',
    'IN_PROGRESS': 'bg-blue-50 text-blue-700 border-blue-200',
    DONE:       'bg-green-50 text-green-700 border-green-200',
    ATTENDED:   'bg-green-50 text-green-700 border-green-200',
    ABSENT:     'bg-red-50 text-red-600 border-red-200',
  }
  const cls = map[status] || 'bg-obsidian-50 text-obsidian-500 border-obsidian-200'
  return (
    <span className={`badge-status border ${cls}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}

// Confirm dialog
export function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-obsidian-950/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-cream rounded-lg shadow-2xl border border-obsidian-200 animate-slide-up p-6">
        <h3 className="font-display text-lg font-medium text-obsidian-900 mb-2">{title}</h3>
        <p className="text-sm text-obsidian-500 font-sans mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Section header
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display text-2xl font-medium text-obsidian-900">{title}</h2>
        {subtitle && <p className="text-sm text-obsidian-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// Form field wrapper
export function Field({ label, error, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// Stats card
export function StatCard({ label, value, icon, color = 'obsidian' }) {
  const colors = {
    obsidian: 'bg-obsidian-900 text-cream',
    gold: 'bg-gold-600 text-cream',
    green: 'bg-green-700 text-white',
    blue: 'bg-blue-700 text-white',
    red: 'bg-red-600 text-white',
  }
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded flex items-center justify-center text-lg ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-display font-medium text-obsidian-900">{value}</div>
        <div className="text-xs text-obsidian-400 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  )
}
