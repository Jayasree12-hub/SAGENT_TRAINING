import { useState, useEffect } from 'react';
import { PageHeader } from '../components/Layout';
import { Button, EmptyState, LoadingCenter, FormGroup, Input, Select, Textarea } from '../components/UI';
import Modal from '../components/Modal';
import { patientHistoryService, patientService } from '../services/dataService';

export default function PatientHistoryPage({ user, showToast }) {
  const [history, setHistory] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patientId: '', historyDate: '', diagnosis: '', treatment: '', medications: '', allergies: '' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [h, p] = await Promise.all([
        user.role === 'doctor'
          ? patientHistoryService.getByDoctor(user.id)
          : patientHistoryService.getByPatient(user.id),
        patientService.getAll(),
      ]);
      setHistory(h); setPatients(p);
    } catch { showToast('Failed to load', 'error'); }
    setLoading(false);
  }

  async function handleCreate() {
    const pid = form.patientId;
    if (!pid || !form.historyDate) { showToast('Patient and date are required.', 'error'); return; }
    setSaving(true);
    try {
      await patientHistoryService.create(pid, user.id, {
        historyDate: form.historyDate,
        diagnosis: form.diagnosis,
        treatment: form.treatment,
        medications: form.medications,
        allergies: form.allergies,
      });
      showToast('History added!', 'success');
      setShowModal(false);
      loadData();
    } catch { showToast('Failed.', 'error'); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try { await patientHistoryService.delete(id); showToast('Deleted.', 'success'); loadData(); }
    catch { showToast('Failed.', 'error'); }
  }

  return (
    <>
      <PageHeader title="Patient History" subtitle="Medical history, diagnoses and treatment records" />

      <div className="data-table-wrap">
        <div className="data-table-header">
          <span className="data-table-title">Medical History</span>
          {user.role === 'doctor' && (
            <Button variant="primary" size="sm" onClick={() => {
              setForm({ patientId: '', historyDate: '', diagnosis: '', treatment: '', medications: '', allergies: '' });
              setShowModal(true);
            }}>+ Add History</Button>
          )}
        </div>

        {loading ? <LoadingCenter /> : history.length === 0 ? (
          <EmptyState icon="📜" text="No medical history found" />
        ) : (
          <table>
            <thead>
              <tr><th>#</th><th>Patient</th><th>Date</th><th>Diagnosis</th><th>Treatment</th><th>Medications</th><th>Allergies</th>{user.role === 'doctor' && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.historyId}>
                  <td className="td-muted">{h.historyId}</td>
                  <td className="td-name">{h.patient?.name || '—'}</td>
                  <td>{h.historyDate || '—'}</td>
                  <td>{h.diagnosis || '—'}</td>
                  <td>{h.treatment || '—'}</td>
                  <td>{h.medications || '—'}</td>
                  <td>{h.allergies || '—'}</td>
                  {user.role === 'doctor' && (
                    <td><Button variant="danger" size="sm" onClick={() => handleDelete(h.historyId)}>Delete</Button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal
          title="Add Medical History"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </>
          }
        >
          <FormGroup label="Patient *">
            <Select value={form.patientId} onChange={set('patientId')}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.patientId} value={p.patientId}>{p.name}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Date *">
            <Input type="date" value={form.historyDate} onChange={set('historyDate')} />
          </FormGroup>
          <div className="form-grid">
            <FormGroup label="Diagnosis">
              <Input placeholder="Diagnosis" value={form.diagnosis} onChange={set('diagnosis')} />
            </FormGroup>
            <FormGroup label="Treatment">
              <Input placeholder="Treatment plan" value={form.treatment} onChange={set('treatment')} />
            </FormGroup>
            <FormGroup label="Medications">
              <Input placeholder="Medications" value={form.medications} onChange={set('medications')} />
            </FormGroup>
            <FormGroup label="Allergies">
              <Input placeholder="Known allergies" value={form.allergies} onChange={set('allergies')} />
            </FormGroup>
          </div>
        </Modal>
      )}
    </>
  );
}
