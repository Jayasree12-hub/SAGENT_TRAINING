import { useState, useEffect } from 'react';
import './Profile.css';
import { PageHeader } from '../components/Layout';
import { Button, LoadingCenter, FormGroup, Input, Select } from '../components/UI';
import { doctorService, patientService } from '../services/dataService';

export default function ProfilePage({ user, showToast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const p = user.role === 'doctor'
        ? await doctorService.getById(user.id)
        : await patientService.getById(user.id);
      setProfile(p);
      setForm(p);
    } catch { showToast('Failed to load profile.', 'error'); }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (user.role === 'doctor') {
        await doctorService.update(user.id, form);
      } else {
        await patientService.update(user.id, form);
      }
      showToast('Profile updated!', 'success');
      setEditing(false);
      loadProfile();
    } catch { showToast('Failed to update.', 'error'); }
    setSaving(false);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading) return <LoadingCenter />;

  const isDoctor = user.role === 'doctor';

  return (
    <>
      <PageHeader title="My Profile" subtitle="View and manage your personal information" />

      <div className="profile-layout">
        {/* Left card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {isDoctor ? '👨‍⚕️' : '🧑'}
          </div>
          <div className="profile-name">{profile?.doctorName || profile?.name}</div>
          <div className="profile-role">{user.role}</div>

          <div className="profile-divider" />

          {isDoctor ? (
            <>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Specialization</span>
                <span className="profile-meta-value">{profile?.specialization || '—'}</span>
              </div>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Email</span>
                <span className="profile-meta-value" style={{ fontSize: '0.78rem' }}>{profile?.doctorEmail || '—'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Age</span>
                <span className="profile-meta-value">{profile?.age || '—'}</span>
              </div>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Gender</span>
                <span className="profile-meta-value">{profile?.gender || '—'}</span>
              </div>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Contact</span>
                <span className="profile-meta-value">{profile?.contactNo || '—'}</span>
              </div>
            </>
          )}
        </div>

        {/* Right details */}
        <div className="profile-details">
          <div className="profile-details__header">
            <h2 className="profile-details__title">Account Details</h2>
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setForm(profile); }}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
              </div>
            )}
          </div>

          {editing ? (
            isDoctor ? (
              <>
                <FormGroup label="Name"><Input value={form.doctorName || ''} onChange={set('doctorName')} /></FormGroup>
                <FormGroup label="Specialization"><Input value={form.specialization || ''} onChange={set('specialization')} /></FormGroup>
                <FormGroup label="Email"><Input type="email" value={form.doctorEmail || ''} onChange={set('doctorEmail')} /></FormGroup>
                <FormGroup label="New Password (optional)"><Input type="password" placeholder="Leave blank to keep current" value={form.doctorPassword || ''} onChange={set('doctorPassword')} /></FormGroup>
              </>
            ) : (
              <>
                <FormGroup label="Full Name"><Input value={form.name || ''} onChange={set('name')} /></FormGroup>
                <div className="form-grid">
                  <FormGroup label="Age"><Input type="number" value={form.age || ''} onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) }))} /></FormGroup>
                  <FormGroup label="Gender">
                    <Select value={form.gender || ''} onChange={set('gender')}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </Select>
                  </FormGroup>
                </div>
                <FormGroup label="Contact No."><Input value={form.contactNo || ''} onChange={set('contactNo')} /></FormGroup>
                <FormGroup label="Email"><Input type="email" value={form.email || ''} onChange={set('email')} /></FormGroup>
                <FormGroup label="New Password (optional)"><Input type="password" placeholder="Leave blank to keep current" value={form.password || ''} onChange={set('password')} /></FormGroup>
              </>
            )
          ) : (
            isDoctor ? (
              <>
                <div className="info-row"><span className="info-row__label">Full Name</span><span className="info-row__value">{profile?.doctorName}</span></div>
                <div className="info-row"><span className="info-row__label">Specialization</span><span className="info-row__value">{profile?.specialization}</span></div>
                <div className="info-row"><span className="info-row__label">Email Address</span><span className="info-row__value">{profile?.doctorEmail}</span></div>
                <div className="info-row"><span className="info-row__label">Doctor ID</span><span className="info-row__value">#{profile?.doctorId}</span></div>
              </>
            ) : (
              <>
                <div className="info-row"><span className="info-row__label">Full Name</span><span className="info-row__value">{profile?.name}</span></div>
                <div className="info-row"><span className="info-row__label">Age</span><span className="info-row__value">{profile?.age}</span></div>
                <div className="info-row"><span className="info-row__label">Gender</span><span className="info-row__value">{profile?.gender}</span></div>
                <div className="info-row"><span className="info-row__label">Email Address</span><span className="info-row__value">{profile?.email}</span></div>
                <div className="info-row"><span className="info-row__label">Contact No.</span><span className="info-row__value">{profile?.contactNo}</span></div>
                <div className="info-row"><span className="info-row__label">Patient ID</span><span className="info-row__value">#{profile?.patientId}</span></div>
              </>
            )
          )}
        </div>
      </div>
    </>
  );
}
