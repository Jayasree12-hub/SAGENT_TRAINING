import api from './api';

export const appointmentService = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByDoctor: (doctorId) => api.get(`/appointments/doctor/${doctorId}`),
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getByDate: (date) => api.get(`/appointments/date/${date}`),
  create: (doctorId, patientId, data) =>
    api.post(`/appointments/${doctorId}/${patientId}`, data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};

export const consultationService = {
  getAll: () => api.get('/consultations'),
  getByPatient: (id) => api.get(`/consultations/patient/${id}`),
  getByDoctor: (id) => api.get(`/consultations/doctor/${id}`),
  create: (patientId, doctorId, appointmentId, data) =>
    api.post(`/consultations/${patientId}/${doctorId}/${appointmentId}`, data),
  update: (id, data) => api.put(`/consultations/${id}`, data),
  delete: (id) => api.delete(`/consultations/${id}`),
};

export const healthRecordService = {
  getAll: () => api.get('/health-records'),
  getByPatient: (id) => api.get(`/health-records/patient/${id}`),
  create: (patientId, data) => api.post(`/health-records/${patientId}`, data),
  update: (id, data) => api.put(`/health-records/${id}`, data),
  delete: (id) => api.delete(`/health-records/${id}`),
};

export const patientHistoryService = {
  getAll: () => api.get('/patient-history'),
  getByPatient: (id) => api.get(`/patient-history/patient/${id}`),
  getByDoctor: (id) => api.get(`/patient-history/doctor/${id}`),
  create: (patientId, doctorId, data) =>
    api.post(`/patient-history/${patientId}/${doctorId}`, data),
  update: (id, data) => api.put(`/patient-history/${id}`, data),
  delete: (id) => api.delete(`/patient-history/${id}`),
};

export const feedbackService = {
  getAll: () => api.get('/feedback'),
  getByPatient: (id) => api.get(`/feedback/patient/${id}`),
  getByDoctor: (id) => api.get(`/feedback/doctor/${id}`),
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
