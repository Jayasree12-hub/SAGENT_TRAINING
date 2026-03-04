import { useState } from 'react';
import './Register.css';
import '../pages/Login.css';
import { Button, Spinner, FormGroup, Input, Select } from '../components/UI';
import { registerDoctor, registerPatient } from '../services/authService';

export default function RegisterPage({ onBack, onRegistered, showToast }) {
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', gender: '', contactNo: '',
    doctorName: '', specialization: '', doctorEmail: '', doctorPassword: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleRegister = async () => {
    setLoading(true);
    try {
      if (role === 'patient') {
        await registerPatient({
          name: form.name, email: form.email, password: form.password,
          age: Number(form.age), gender: form.gender, contactNo: form.contactNo,
        });
      } else {
        await registerDoctor({
          doctorName: form.doctorName, specialization: form.specialization,
          doctorEmail: form.doctorEmail, doctorPassword: form.doctorPassword,
        });
      }
      showToast('Account created! Please sign in.', 'success');
      onRegistered();
    } catch (e) {
      showToast(e.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-card__header">
          <div className="register-card__logo">Medi<span>Track</span></div>
          <h1 className="register-card__title">Create an account</h1>
          <p className="register-card__subtitle">Join MediTrack as a patient or doctor</p>
        </div>

        {/* Role toggle */}
        <div className="role-toggle" style={{ marginBottom: 24 }}>
          <button className={`role-btn ${role === 'patient' ? 'role-btn--active' : ''}`} onClick={() => setRole('patient')}>🧑 Patient</button>
          <button className={`role-btn ${role === 'doctor' ? 'role-btn--active' : ''}`} onClick={() => setRole('doctor')}>👨‍⚕️ Doctor</button>
        </div>

        {role === 'patient' ? (
          <div className="form-grid">
            <FormGroup label="Full Name">
              <Input placeholder="Jane Doe" value={form.name} onChange={set('name')} />
            </FormGroup>
            <FormGroup label="Age">
              <Input type="number" placeholder="28" value={form.age} onChange={set('age')} />
            </FormGroup>
            <FormGroup label="Email Address" style={{ gridColumn: '1/-1' }}>
              <Input type="email" placeholder="jane@email.com" value={form.email} onChange={set('email')} />
            </FormGroup>
            <FormGroup label="Password" style={{ gridColumn: '1/-1' }}>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
            </FormGroup>
            <FormGroup label="Gender">
              <Select value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </Select>
            </FormGroup>
            <FormGroup label="Contact No.">
              <Input placeholder="+91 9876543210" value={form.contactNo} onChange={set('contactNo')} />
            </FormGroup>
          </div>
        ) : (
          <>
            <FormGroup label="Full Name">
              <Input placeholder="Dr. Smith" value={form.doctorName} onChange={set('doctorName')} />
            </FormGroup>
            <FormGroup label="Specialization">
              <Input placeholder="e.g. Cardiology" value={form.specialization} onChange={set('specialization')} />
            </FormGroup>
            <FormGroup label="Email Address">
              <Input type="email" placeholder="doctor@hospital.com" value={form.doctorEmail} onChange={set('doctorEmail')} />
            </FormGroup>
            <FormGroup label="Password">
              <Input type="password" placeholder="••••••••" value={form.doctorPassword} onChange={set('doctorPassword')} />
            </FormGroup>
          </>
        )}

        <div className="register-actions">
          <Button variant="secondary" onClick={onBack} style={{ flex: 1 }}>← Back to login</Button>
          <Button variant="primary" onClick={handleRegister} disabled={loading} style={{ flex: 1 }}>
            {loading ? <Spinner /> : 'Create Account'}
          </Button>
        </div>
      </div>
    </div>
  );
}
