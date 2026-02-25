import { useState, useEffect } from 'react';
import './Appointments.css';
import { PageHeader } from '../components/Layout';
import { Button, StatCard, EmptyState, LoadingCenter, StatusBadge, FormGroup, Input, Select } from '../components/UI';
import Modal from '../components/Modal';
import { appointmentService, doctorService, patientService } from '../services/dataService';

const FILTERS = ['All', 'Scheduled', 'Completed', 'Cancelled', 'Pending'];

export default function AppointmentsPage({ user, showToast }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ doctorId: '', patientId: '', appointmentDate: '', appointmentTime: '', appointmentStatus: 'Scheduled' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [appts, docs, pats] = await Promise.all([
        user.role === 'doctor'
          ? appointmentService.getByDoctor(user.id)
          : appointmentService.getByPatient(user.id),
        doctorService.getAll(),
        patientService.getAll(),
      ]);
      setAppointments(appts);
      setDoctors(docs);
      setPatients(pats);
    } catch { showToast('Failed to load appointments', 'error'); }
    setLoading(false);
  }

  const displayed = appointments.filter((a) =>
    filter === 'All' || (a.appointmentStatus || '').toLowerCase() === filter.toLowerCase()
  );

  const counts = {
    total: appointments.length,
    scheduled: appointments.filter((a) => (a.appointmentStatus || '').toLowerCase().includes('schedul')).length,
    completed: appointments.filter((a) => (a.appointmentStatus || '').toLowerCase().includes('complet')).length,
    cancelled: appointments.filter((a) => (a.appointmentStatus || '').toLowerCase().includes('cancel')).length,
  };

  function openCreate() {
    setForm({
      doctorId: user.role === 'doctor' ? String(user.id) : '',
      patientId: user.role === 'patient' ? String(user.id) : '',
      appointmentDate: '',
      appointmentTime: '',
      appointmentStatus: 'Scheduled',
    });
    setEditTarget(null);
    setShowCreate(true);
  }

  function openEdit(a) {
    setForm({
      doctorId: String(a.doctor?.doctorId || ''),
      patientId: String(a.patient?.patientId || ''),
      appointmentDate: a.appointmentDate || '',
      appointmentTime: a.appointmentTime || '',
      appointmentStatus: a.appointmentStatus || 'Scheduled',
    });
    setEditTarget(a);
    setShowCreate(true);
  }

  async function handleSave() {
    if (!form.doctorId || !form.patientId || !form.appointmentDate || !form.appointmentTime) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await appointmentService.update(editTarget.appointmentId, {
          appointmentDate: form.appointmentDate,
          appointmentTime: form.appointmentTime,
          appointmentStatus: form.appointmentStatus,
        });
        showToast('Appointment updated!', 'success');
      } else {
        await appointmentService.create(form.doctorId, form.patientId, {
          appointmentDate: form.appointmentDate,
          appointmentTime: form.appointmentTime,
          appointmentStatus: form.appointmentStatus,
        });
        showToast('Appointment created!', 'success');
      }
      setShowCreate(false);
      loadAll();
    } catch { showToast('Failed to save appointment.', 'error'); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await appointmentService.delete(id);
      showToast('Appointment deleted.', 'success');
      loadAll();
    } catch { showToast('Failed to delete.', 'error'); }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle={`Manage all your ${user.role === 'doctor' ? "patient" : "doctor"} appointments`}
      />

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total" value={counts.total} icon="📋" />
        <StatCard label="Scheduled" value={counts.scheduled} icon="🕐" variant="accent" />
        <StatCard label="Completed" value={counts.completed} icon="✓" variant="green" />
        <StatCard label="Cancelled" value={counts.cancelled} icon="✕" variant="red" />
      </div>

      {/* Table */}
      <div className="data-table-wrap">
        <div className="data-table-header">
          <span className="data-table-title">All Appointments</span>
          <div className="data-table-actions">
            <div className="appt-filter">
              {FILTERS.map((f) => (
                <button key={f} className={`filter-chip ${filter === f ? 'filter-chip--active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <Button variant="primary" size="sm" onClick={openCreate}>+ New</Button>
          </div>
        </div>

        {loading ? <LoadingCenter /> : displayed.length === 0 ? (
          <EmptyState icon="📅" text="No appointments found" />
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((a) => (
                <tr key={a.appointmentId}>
                  <td className="td-muted">{a.appointmentId}</td>
                  <td>
                    <div className="td-name">{a.doctor?.doctorName || '—'}</div>
                    <div className="td-sub">{a.doctor?.specialization}</div>
                  </td>
                  <td className="td-name">{a.patient?.name || '—'}</td>
                  <td>{a.appointmentDate || '—'}</td>
                  <td>{a.appointmentTime || '—'}</td>
                  <td><StatusBadge status={a.appointmentStatus} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(a.appointmentId)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showCreate && (
        <Modal
          title={editTarget ? 'Edit Appointment' : 'New Appointment'}
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create'}</Button>
            </>
          }
        >
          <div className="form-grid">
            {user.role !== 'doctor' && (
              <FormGroup label="Doctor *">
                <Select value={form.doctorId} onChange={set('doctorId')}>
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d.doctorId} value={d.doctorId}>{d.doctorName} — {d.specialization}</option>
                  ))}
                </Select>
              </FormGroup>
            )}
            {user.role !== 'patient' && (
              <FormGroup label="Patient *">
                <Select value={form.patientId} onChange={set('patientId')}>
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>{p.name}</option>
                  ))}
                </Select>
              </FormGroup>
            )}
            <FormGroup label="Date *">
              <Input type="date" value={form.appointmentDate} onChange={set('appointmentDate')} />
            </FormGroup>
            <FormGroup label="Time *">
              <Input type="time" value={form.appointmentTime} onChange={set('appointmentTime')} />
            </FormGroup>
            <FormGroup label="Status" style={{ gridColumn: '1/-1' }}>
              <Select value={form.appointmentStatus} onChange={set('appointmentStatus')}>
                <option>Scheduled</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </Select>
            </FormGroup>
          </div>
        </Modal>
      )}
    </>
  );
}
