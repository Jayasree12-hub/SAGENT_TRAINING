import './Layout.css';
import Sidebar from './Sidebar';

export default function Layout({ user, currentPage, onNavigate, onLogout, children }) {
  return (
    <div className="layout">
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <main className="layout__main">
        <div className="layout__content">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <h1 className="page-header__title">{title}</h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
    </div>
  );
}
