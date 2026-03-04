import { useState, useEffect } from 'react';
import './Consultations.css';
import { PageHeader } from '../components/Layout';
import { Button, EmptyState, LoadingCenter, FormGroup, Input, Select, Textarea } from '../components/UI';
import Modal from '../components/Modal';
import { consultationService, appointmentService } from '../services/dataService';

export default function ConsultationsPage({ user, showToast }) {
  const [consultations, setConsultations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ appointmentId: '', patientId: '', doctorId: '', consultationDate: '', consultationNotes: '', prescription: '', followUpDate: '' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([
        user.role === 'doctor'
          ? consultationService.getByDoctor(user.id)
          : consultationService.getByPatient(user.id),
        appointmentService.getAll(),
      ]);
      setConsultations(c);
      setAppointments(a);
    } catch { showToast('Failed to load', 'error'); }
    setLoading(false);
  }

  const myAppts = appointments.filter((a) =>
    user.role === 'doctor'
      ? a.doctor?.doctorId === user.id
      : a.patient?.patientId === user.id
  );

  async function handleCreate() {
    if (!form.appointmentId || !form.consultationDate) {
      showToast('Please select an appointment and date.', 'error');
      return;
    }
    setSaving(true);
    try {
      await consultationService.create(form.patientId, form.doctorId, form.appointmentId, {
        consultationDate: form.consultationDate,
        consultationNotes: form.consultationNotes,
        prescription: form.prescription,
        followUpDate: form.followUpDate || null,
      });
      showToast('Consultation added!', 'success');
      setShowModal(false);
      loadData();
    } catch { showToast('Failed to save.', 'error'); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this consultation?')) return;
    try {
      await consultationService.delete(id);
      showToast('Deleted.', 'success');
      loadData();
    } catch { showToast('Failed.', 'error'); }
  }

  function onApptSelect(e) {
    const id = e.target.value;
    const appt = appointments.find((a) => String(a.appointmentId) === id);
    setForm((f) => ({
      ...f,
      appointmentId: id,
      doctorId: String(appt?.doctor?.doctorId || user.id),
      patientId: String(appt?.patient?.patientId || ''),
    }));
  }

  return (
    <>
      <PageHeader title="Consultations" subtitle="Medical consultation records and prescriptions" />

      <div className="data-table-wrap">
        <div className="data-table-header">
          <span className="data-table-title">Consultation Records</span>
          <div className="data-table-actions">
            {user.role === 'doctor' && (
              <Button variant="primary" size="sm" onClick={() => {
                setForm({ appointmentId: '', patientId: '', doctorId: String(user.id), consultationDate: '', consultationNotes: '', prescription: '', followUpDate: '' });
                setShowModal(true);
              }}>+ Add</Button>
            )}
          </div>
        </div>

        {loading ? <LoadingCenter /> : consultations.length === 0 ? (
          <EmptyState icon="🩺" text="No consultations found" />
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Prescription</th>
                <th>Follow-up</th>
                {user.role === 'doctor' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c.consultationId}>
                  <td className="td-muted">{c.consultationId}</td>
                  <td className="td-name">{c.patient?.name || '—'}</td>
                  <td>{c.doctor?.doctorName || '—'}</td>
                  <td>{c.consultationDate || '—'}</td>
                  <td><div className="consultation-notes">{c.consultationNotes || '—'}</div></td>
                  <td>{c.prescription || '—'}</td>
                  <td>{c.followUpDate || '—'}</td>
                  {user.role === 'doctor' && (
                    <td>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(c.consultationId)}>Delete</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal
          title="Add Consultation"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </>
          }
        >
          <FormGroup label="Appointment *">
            <Select value={form.appointmentId} onChange={onApptSelect}>
              <option value="">Select appointment</option>
              {myAppts.map((a) => (
                <option key={a.appointmentId} value={a.appointmentId}>
                  #{a.appointmentId} — {a.patient?.name} on {a.appointmentDate}
                </option>
              ))}
            </Select>
          </FormGroup>
          <div className="form-grid">
            <FormGroup label="Consultation Date *">
              <Input type="date" value={form.consultationDate} onChange={set('consultationDate')} />
            </FormGroup>
            <FormGroup label="Follow-up Date">
              <Input type="date" value={form.followUpDate} onChange={set('followUpDate')} />
            </FormGroup>
          </div>
          <FormGroup label="Notes">
            <Textarea placeholder="Consultation notes…" rows={3} value={form.consultationNotes} onChange={set('consultationNotes')} />
          </FormGroup>
          <FormGroup label="Prescription">
            <Input placeholder="Medications prescribed…" value={form.prescription} onChange={set('prescription')} />
          </FormGroup>
        </Modal>
      )}
    </>
  );
}
