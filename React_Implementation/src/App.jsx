import { useState } from 'react';
import './styles/global.css';

import { useToast } from './hooks/useToast';
import ToastContainer from './components/Toast';
import Layout from './components/Layout';

import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AppointmentsPage from './pages/Appointments';
import ConsultationsPage from './pages/Consultations';
import HealthRecordsPage from './pages/HealthRecords';
import PatientHistoryPage from './pages/PatientHistory';
import FeedbackPage from './pages/Feedback';
import ProfilePage from './pages/Profile';
import { DoctorsPage, PatientsPage } from './pages/Directory';

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('login'); // 'login' | 'register' | 'app'
  const [page, setPage] = useState('appointments');
  const { toasts, showToast, removeToast } = useToast();

  function handleLogin(u) {
    setUser(u);
    setPage('appointments');
    setScreen('app');
  }

  function handleLogout() {
    setUser(null);
    setScreen('login');
  }

  function renderPage() {
    const props = { user, showToast };
    switch (page) {
      case 'appointments':   return <AppointmentsPage   {...props} />;
      case 'consultations':  return <ConsultationsPage  {...props} />;
      case 'health-records': return <HealthRecordsPage  {...props} />;
      case 'history':        return <PatientHistoryPage {...props} />;
      case 'feedback':       return <FeedbackPage       {...props} />;
      case 'profile':        return <ProfilePage        {...props} />;
      case 'doctors':        return <DoctorsPage showToast={showToast} />;
      case 'patients':       return <PatientsPage showToast={showToast} />;
      default:               return <AppointmentsPage   {...props} />;
    }
  }

  return (
    <>
      {screen === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onGoRegister={() => setScreen('register')}
        />
      )}

      {screen === 'register' && (
        <RegisterPage
          onBack={() => setScreen('login')}
          onRegistered={() => setScreen('login')}
          showToast={showToast}
        />
      )}

      {screen === 'app' && user && (
        <Layout
          user={user}
          currentPage={page}
          onNavigate={setPage}
          onLogout={handleLogout}
        >
          {renderPage()}
        </Layout>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
