import { useState } from 'react';
import './Login.css';
import { Button, Spinner, FormGroup, Input } from '../components/UI';
import { loginUser } from '../services/authService';

export default function LoginPage({ onLogin, onGoRegister }) {
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await loginUser(role, email.trim(), password);
      onLogin(user);
    } catch (e) {
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left decorative panel */}
      <div className="login-panel">
        <div>
          <div className="login-panel__logo">
            Medi<span>Track</span>
          </div>
          <div className="login-panel__tagline">Patient Monitoring System</div>
        </div>

        <div className="login-panel__content">
          <h2 className="login-panel__heading">
            Your health,<br />well managed.
          </h2>
          <p className="login-panel__desc">
            A unified platform for doctors and patients to manage appointments,
            health records, and consultations seamlessly.
          </p>
          <ul className="login-panel__features">
            <li>Smart appointment scheduling</li>
            <li>Complete health record tracking</li>
            <li>Consultation & prescription history</li>
            <li>Secure patient–doctor communication</li>
          </ul>
        </div>

        <div className="login-panel__copy">© 2025 MediTrack. All rights reserved.</div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-wrap">
          <h1 className="login-form-wrap__title">Welcome back</h1>
          <p className="login-form-wrap__subtitle">Sign in to your account to continue</p>

          {/* Role toggle */}
          <div className="role-toggle">
            <button
              className={`role-btn ${role === 'patient' ? 'role-btn--active' : ''}`}
              onClick={() => setRole('patient')}
            >
              🧑 Patient
            </button>
            <button
              className={`role-btn ${role === 'doctor' ? 'role-btn--active' : ''}`}
              onClick={() => setRole('doctor')}
            >
              👨‍⚕️ Doctor
            </button>
          </div>

          {/* Error */}
          {error && <div className="form-error">{error}</div>}

          {/* Form fields */}
          <FormGroup label="Email address">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Password">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              style={{ marginBottom: 6 }}
            />
          </FormGroup>

          <Button
            variant="primary"
            size="lg"
            full
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? <Spinner /> : `Sign in as ${role === 'doctor' ? 'Doctor' : 'Patient'}`}
          </Button>

          <div className="login-link" style={{ marginTop: 20 }}>
            Don't have an account?{' '}
            <button onClick={onGoRegister}>Create one</button>
          </div>
        </div>
      </div>
    </div>
  );
}
