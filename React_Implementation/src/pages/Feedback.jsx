import { useState, useEffect } from 'react';
import './Feedback.css';
import { PageHeader } from '../components/Layout';
import { Button, EmptyState, LoadingCenter, FormGroup, Select, Textarea } from '../components/UI';
import Modal from '../components/Modal';
import { feedbackService, consultationService } from '../services/dataService';

function Stars({ value }) {
  return (
    <span className="stars-display">
      {'★'.repeat(value)}{'☆'.repeat(5 - value)}
    </span>
  );
}

export default function FeedbackPage({ user, showToast }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(5);
  const [form, setForm] = useState({ consultationId: '', doctorId: '', comments: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [f, c] = await Promise.all([
        user.role === 'patient'
          ? feedbackService.getByPatient(user.id)
          : feedbackService.getByDoctor(user.id),
        consultationService.getAll(),
      ]);
      setFeedbacks(f); setConsultations(c);
    } catch { showToast('Failed to load', 'error'); }
    setLoading(false);
  }

  const myConsults = consultations.filter((c) =>
    c.patient?.patientId === user.id
  );

  function onConsultSelect(e) {
    const id = e.target.value;
    const c = consultations.find((x) => String(x.consultationId) === id);
    setForm((f) => ({ ...f, consultationId: id, doctorId: String(c?.doctor?.doctorId || '') }));
  }

  async function handleCreate() {
    if (!form.consultationId) { showToast('Please select a consultation.', 'error'); return; }
    setSaving(true);
    try {
      await feedbackService.create(user.id, form.doctorId, form.consultationId, {
        rating,
        comments: form.comments,
      });
      showToast('Feedback submitted!', 'success');
      setShowModal(false);
      loadData();
    } catch { showToast('Failed.', 'error'); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this feedback?')) return;
    try { await feedbackService.delete(id); showToast('Deleted.', 'success'); loadData(); }
    catch { showToast('Failed.', 'error'); }
  }

  return (
    <>
      <PageHeader title="Feedback" subtitle="Patient reviews and doctor ratings" />

      <div className="data-table-wrap">
        <div className="data-table-header">
          <span className="data-table-title">Reviews</span>
          {user.role === 'patient' && (
            <Button variant="primary" size="sm" onClick={() => {
              setRating(5);
              setForm({ consultationId: '', doctorId: '', comments: '' });
              setShowModal(true);
            }}>+ Give Feedback</Button>
          )}
        </div>

        {loading ? <LoadingCenter /> : feedbacks.length === 0 ? (
          <EmptyState icon="⭐" text="No feedback yet" />
        ) : (
          <table>
            <thead>
              <tr><th>#</th><th>Patient</th><th>Doctor</th><th>Rating</th><th>Comments</th>{user.role === 'patient' && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {feedbacks.map((f) => (
                <tr key={f.feedbackId}>
                  <td className="td-muted">{f.feedbackId}</td>
                  <td className="td-name">{f.patient?.name || '—'}</td>
                  <td>{f.doctor?.doctorName || '—'}</td>
                  <td><Stars value={f.rating || 0} /></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 260 }}>{f.comments || '—'}</td>
                  {user.role === 'patient' && (
                    <td><Button variant="danger" size="sm" onClick={() => handleDelete(f.feedbackId)}>Delete</Button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal
          title="Submit Feedback"
          onClose={() => setShowModal(false)}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Sending…' : 'Submit'}</Button>
            </>
          }
        >
          <FormGroup label="Consultation *">
            <Select value={form.consultationId} onChange={onConsultSelect}>
              <option value="">Select consultation</option>
              {myConsults.map((c) => (
                <option key={c.consultationId} value={c.consultationId}>
                  #{c.consultationId} — Dr. {c.doctor?.doctorName} on {c.consultationDate}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup label="Rating">
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`star-btn ${n <= rating ? 'star-btn--active' : ''}`}
                  onClick={() => setRating(n)}
                >
                  {n <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </FormGroup>

          <FormGroup label="Comments">
            <Textarea
              placeholder="Share your experience…"
              rows={4}
              value={form.comments}
              onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
            />
          </FormGroup>
        </Modal>
      )}
    </>
  );
}
