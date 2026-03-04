import { useState, useEffect } from 'react';
import { PageHeader } from '../components/Layout';
import { Button, EmptyState, LoadingCenter, FormGroup, Input, Select } from '../components/UI';
import Modal from '../components/Modal';
import { healthRecordService, patientService } from '../services/dataService';

export default function HealthRecordsPage({ user, showToast }) {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patientId: '', recordDate: '', bloodPressure: '', heartRate: '', temperature: '', oxygenLevel: '', weight: '', height: '' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        user.role === 'patient'
          ? healthRecordService.getByPatient(user.id)
          : healthRecordService.getAll(),
        patientService.getAll(),
      ]);
      setRecords(r); setPatients(p);
    } catch { showToast('Failed to load', 'error'); }
    setLoading(false);
  }

  async function handleCreate() {
    const pid = user.role === 'patient' ? user.id : form.patientId;
    if (!pid || !form.recordDate) { showToast('Patient and date are required.', 'error'); return; }
    setSaving(true);
    try {
      await healthRecordService.create(pid, {
        recordDate: form.recordDate,
        bloodPressure: form.bloodPressure,
        heartRate: form.heartRate ? Number(form.heartRate) : null,
        temperature: form.temperature ? Number(form.temperature) : null,
        oxygenLevel: form.oxygenLevel ? Number(form.oxygenLevel) : null,
        weight: form.weight ? Number(form.weight) : null,
        height: form.height ? Number(form.height) : null,
      });
      showToast('Health record added!', 'success');
      setShowModal(false);
      loadData();
    } catch { showToast('Failed.', 'error'); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try { await healthRecordService.delete(id); showToast('Deleted.', 'success'); loadData(); }
    catch { showToast('Failed.', 'error'); }
  }

  return (
    <>
      <PageHeader title="Health Records" subtitle="Vitals and health monitoring data" />

      <div className="data-table-wrap">
        <div className="data-table-header">
          <span className="data-table-title">Vitals Log</span>
          <Button variant="primary" size="sm" onClick={() => {
            setForm({ patientId: '', recordDate: '', bloodPressure: '', heartRate: '', temperature: '', oxygenLevel: '', weight: '', height: '' });
            setShowModal(true);
          }}>+ Add Record</Button>
        </div>

        {loading ? <LoadingCenter /> : records.length === 0 ? (
          <EmptyState icon="💊" text="No health records found" />
        ) : (
          <table>
            <thead>
              <tr><th>#</th><th>Patient</th><th>Date</th><th>BP</th><th>Heart Rate</th><th>Temp</th><th>O₂</th><th>Weight</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.healthRecordId}>
                  <td className="td-muted">{r.healthRecordId}</td>
                  <td className="td-name">{r.patient?.name || '—'}</td>
                  <td>{r.recordDate || '—'}</td>
                  <td>{r.bloodPressure || '—'}</td>
                  <td>{r.heartRate ? `${r.heartRate} bpm` : '—'}</td>
                  <td>{r.temperature ? `${r.temperature} °C` : '—'}</td>
                  <td>{r.oxygenLevel ? `${r.oxygenLevel}%` : '—'}</td>
                  <td>{r.weight ? `${r.weight} kg` : '—'}</td>
                  <td><Button variant="danger" size="sm" onClick={() => handleDelete(r.healthRecordId)}>Delete</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal
          title="Add Health Record"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </>
          }
        >
          {user.role === 'doctor' && (
            <FormGroup label="Patient *">
              <Select value={form.patientId} onChange={set('patientId')}>
                <option value="">Select patient</option>
                {patients.map((p) => <option key={p.patientId} value={p.patientId}>{p.name}</option>)}
              </Select>
            </FormGroup>
          )}
          <div className="form-grid">
            <FormGroup label="Record Date *" style={{ gridColumn: '1/-1' }}>
              <Input type="date" value={form.recordDate} onChange={set('recordDate')} />
            </FormGroup>
            <FormGroup label="Blood Pressure">
              <Input placeholder="120/80" value={form.bloodPressure} onChange={set('bloodPressure')} />
            </FormGroup>
            <FormGroup label="Heart Rate (bpm)">
              <Input type="number" placeholder="72" value={form.heartRate} onChange={set('heartRate')} />
            </FormGroup>
            <FormGroup label="Temperature (°C)">
              <Input type="number" placeholder="37.0" value={form.temperature} onChange={set('temperature')} />
            </FormGroup>
            <FormGroup label="Oxygen Level (%)">
              <Input type="number" placeholder="98" value={form.oxygenLevel} onChange={set('oxygenLevel')} />
            </FormGroup>
            <FormGroup label="Weight (kg)">
              <Input type="number" placeholder="70" value={form.weight} onChange={set('weight')} />
            </FormGroup>
            <FormGroup label="Height (cm)">
              <Input type="number" placeholder="170" value={form.height} onChange={set('height')} />
            </FormGroup>
          </div>
        </Modal>
      )}
    </>
  );
}
