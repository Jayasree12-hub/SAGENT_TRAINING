import './Toast.css';

const ICONS = { success: '✓', error: '✕', warning: '!' };

function ToastItem({ toast, onRemove }) {
  return (
    <div className={`toast toast--${toast.type}`}>
      <span className="toast__icon">{ICONS[toast.type] || '•'}</span>
      <span className="toast__msg">{toast.message}</span>
      <button className="toast__close" onClick={() => onRemove(toast.id)}>×</button>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
