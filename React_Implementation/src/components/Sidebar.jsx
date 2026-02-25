import './Sidebar.css';

const NAV = {
  doctor: [
    {
      section: 'Core',
      items: [
        { id: 'appointments', icon: '📅', label: 'Appointments' },
        { id: 'consultations', icon: '🩺', label: 'Consultations' },
        { id: 'history',       icon: '📜', label: 'Patient History' },
      ],
    },
    {
      section: 'Records',
      items: [
        { id: 'health-records', icon: '💊', label: 'Health Records' },
        { id: 'patients',       icon: '👥', label: 'Patients' },
      ],
    },
    {
      section: 'Account',
      items: [
        { id: 'feedback', icon: '⭐', label: 'Feedback' },
        { id: 'profile',  icon: '👤', label: 'My Profile' },
      ],
    },
  ],
  patient: [
    {
      section: 'Core',
      items: [
        { id: 'appointments',   icon: '📅', label: 'Appointments' },
        { id: 'consultations',  icon: '🩺', label: 'Consultations' },
        { id: 'health-records', icon: '💊', label: 'Health Records' },
        { id: 'history',        icon: '📜', label: 'My History' },
      ],
    },
    {
      section: 'Account',
      items: [
        { id: 'feedback', icon: '⭐', label: 'Feedback' },
        { id: 'doctors',  icon: '👨‍⚕️', label: 'Doctors' },
        { id: 'profile',  icon: '👤', label: 'My Profile' },
      ],
    },
  ],
};

export default function Sidebar({ user, currentPage, onNavigate, onLogout }) {
  const sections = NAV[user.role] || [];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">Medi<span>Track</span></div>
        <div className="sidebar__tagline">Patient Monitoring System</div>
      </div>

      {/* User */}
      <div className="sidebar__user">
        <div className="sidebar__user-avatar">
          {user.role === 'doctor' ? '👨‍⚕️' : '🧑'}
        </div>
        <div className="sidebar__user-name">{user.name}</div>
        <div className="sidebar__user-role">{user.role}</div>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {sections.map((sec) => (
          <div key={sec.section}>
            <div className="nav-section-label">{sec.section}</div>
            {sec.items.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'nav-item--active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav-item__icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={onLogout}>
          <span>↩</span> Sign out
        </button>
      </div>
    </aside>
  );
}
