import './UI.css';

export function Button({ variant = 'primary', size = '', full, icon, children, className = '', ...props }) {
  const cls = [
    'btn',
    `btn--${variant}`,
    size ? `btn--${size}` : '',
    full ? 'btn--full' : '',
    icon && !children ? 'btn--icon' : '',
    className,
  ].filter(Boolean).join(' ');
  return <button className={cls} {...props}>{children}</button>;
}

export function Spinner({ dark }) {
  return <span className={`spinner${dark ? ' spinner--dark' : ''}`} />;
}

export function FormGroup({ label, children }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
    </div>
  );
}

export function Input(props) {
  return <input className="form-input" {...props} />;
}

export function Select({ children, ...props }) {
  return <select className="form-select" {...props}>{children}</select>;
}

export function Textarea(props) {
  return <textarea className="form-textarea" {...props} />;
}

export function Badge({ variant = 'neutral', children }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

export function StatusBadge({ status = '' }) {
  const s = status.toLowerCase();
  const variant =
    s.includes('complet') ? 'success' :
    s.includes('cancel')  ? 'danger'  :
    s.includes('pending') ? 'warning' : 'info';
  return <Badge variant={variant}>{status || '—'}</Badge>;
}

export function StatCard({ label, value, icon, variant = '', style }) {
  return (
    <div className={`stat-card ${variant ? `stat-card--${variant}` : ''}`} style={style}>
      {icon && <div className="stat-card__icon">{icon}</div>}
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

export function EmptyState({ icon = '📭', text = 'No data found' }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div className="empty-state__text">{text}</div>
    </div>
  );
}

export function LoadingCenter() {
  return (
    <div className="loading-center">
      <Spinner dark />
    </div>
  );
}
