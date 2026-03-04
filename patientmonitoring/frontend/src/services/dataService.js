import api from './api';

function toNum(v) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function matchId(candidate, id) {
  const a = toNum(candidate);
  const b = toNum(id);
  if (a !== null && b !== null) return a === b;
  return String(candidate) === String(id);
}

function extractDoctorId(item) {
  return item?.doctor?.doctorId ?? item?.doctorId;
}

function extractPatientId(item) {
  return item?.patient?.patientId ?? item?.patientId;
}

async function safeGetByRole(path, fallbackGetAll, idExtractor, id) {
  try {
    return await api.get(path);
  } catch {
    const all = await fallbackGetAll();
    return all.filter((item) => matchId(idExtractor(item), id));
  }
}

export const appointmentService = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByDoctor: (doctorId) =>
    safeGetByRole(
      `/appointments/doctor/${doctorId}`,
      appointmentService.getAll,
      extractDoctorId,
      doctorId
    ),
  getByPatient: (patientId) =>
    safeGetByRole(
      `/appointments/patient/${patientId}`,
      appointmentService.getAll,
      extractPatientId,
      patientId
    ),
  getByDate: (date) => api.get(`/appointments/date/${date}`),
  create: (doctorId, patientId, data) =>
    api.post(`/appointments/${doctorId}/${patientId}`, data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};

export const consultationService = {
  getAll: () => api.get('/consultations'),
  getByPatient: (id) =>
    safeGetByRole(
      `/consultations/patient/${id}`,
      consultationService.getAll,
      extractPatientId,
      id
    ),
  getByDoctor: (id) =>
    safeGetByRole(
      `/consultations/doctor/${id}`,
      consultationService.getAll,
      extractDoctorId,
      id
    ),
  create: (patientId, doctorId, appointmentId, data) =>
    api.post(`/consultations/${patientId}/${doctorId}/${appointmentId}`, data),
  update: (id, data) => api.put(`/consultations/${id}`, data),
  delete: (id) => api.delete(`/consultations/${id}`),
};

export const healthRecordService = {
  getAll: () => api.get('/health-records'),
  getByPatient: (id) =>
    safeGetByRole(
      `/health-records/patient/${id}`,
      healthRecordService.getAll,
      extractPatientId,
      id
    ),
  create: (patientId, data) => api.post(`/health-records/${patientId}`, data),
  update: (id, data) => api.put(`/health-records/${id}`, data),
  delete: (id) => api.delete(`/health-records/${id}`),
};

export const patientHistoryService = {
  getAll: () => api.get('/patient-history'),
  getByPatient: (id) =>
    safeGetByRole(
      `/patient-history/patient/${id}`,
      patientHistoryService.getAll,
      extractPatientId,
      id
    ),
  getByDoctor: (id) =>
    safeGetByRole(
      `/patient-history/doctor/${id}`,
      patientHistoryService.getAll,
      extractDoctorId,
      id
    ),
  create: (patientId, doctorId, data) =>
    api.post(`/patient-history/${patientId}/${doctorId}`, data),
  update: (id, data) => api.put(`/patient-history/${id}`, data),
  delete: (id) => api.delete(`/patient-history/${id}`),
};

export const feedbackService = {
  getAll: () => api.get('/feedback'),
  getByPatient: (id) =>
    safeGetByRole(
      `/feedback/patient/${id}`,
      feedbackService.getAll,
      extractPatientId,
      id
    ),
  getByDoctor: (id) =>
    safeGetByRole(
      `/feedback/doctor/${id}`,
      feedbackService.getAll,
      extractDoctorId,
      id
    ),
  create: (patientId, doctorId, consultationId, data) =>
    api.post(`/feedback/${patientId}/${doctorId}/${consultationId}`, data),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  delete: (id) => api.delete(`/feedback/${id}`),
};

export const doctorService = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

export const patientService = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};
