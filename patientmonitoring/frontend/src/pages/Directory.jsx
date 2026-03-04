import { useState, useEffect } from 'react';
import { PageHeader } from '../components/Layout';
import { EmptyState, LoadingCenter, Badge } from '../components/UI';
import { doctorService, patientService } from '../services/dataService';

export function DoctorsPage({ showToast }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorService.getAll()
      .then((d) => { setDoctors(d); setLoading(false); })
      .catch(() => { showToast('Failed to load.', 'error'); setLoading(false); });
  }, []);

  return (
    <>
      <PageHeader title="Doctors" subtitle="All registered doctors in the system" />
      <div className="data-table-wrap">
        <div className="data-table-header">
          <span className="data-table-title">Doctor Directory</span>
        </div>
        {loading ? <LoadingCenter /> : doctors.length === 0 ? (
          <EmptyState icon="👨‍⚕️" text="No doctors found" />
        ) : (
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Specialization</th><th>Email</th></tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.doctorId}>
                  <td className="td-muted">{d.doctorId}</td>
                  <td>
                    <div className="td-name">{d.doctorName}</div>
                  </td>
                  <td><Badge variant="info">{d.specialization}</Badge></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{d.doctorEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export function PatientsPage({ showToast }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientService.getAll()
      .then((p) => { setPatients(p); setLoading(false); })
      .catch(() => { showToast('Failed to load.', 'error'); setLoading(false); });
  }, []);

  return (
    <>
      <PageHeader title="Patients" subtitle="All registered patients in the system" />
      <div className="data-table-wrap">
        <div className="data-table-header">
          <span className="data-table-title">Patient Directory</span>
        </div>
        {loading ? <LoadingCenter /> : patients.length === 0 ? (
          <EmptyState icon="👥" text="No patients found" />
        ) : (
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Age</th><th>Gender</th><th>Contact</th><th>Email</th></tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.patientId}>
                  <td className="td-muted">{p.patientId}</td>
                  <td className="td-name">{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{p.contactNo}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{p.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
