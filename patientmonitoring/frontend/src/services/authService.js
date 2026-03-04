import api from './api';

export async function loginUser(role, email, password) {
  if (role === 'doctor') {
    const doctors = await api.get('/doctors');
    const found = doctors.find(
      (d) => d.doctorEmail === email && d.doctorPassword === password
    );
    if (!found) throw new Error('Invalid email or password.');
    return {
      role: 'doctor',
      id: found.doctorId,
      name: found.doctorName,
      email: found.doctorEmail,
      specialization: found.specialization,
    };
  } else {
    const patients = await api.get('/patients');
    const found = patients.find(
      (p) => p.email === email && p.password === password
    );
    if (!found) throw new Error('Invalid email or password.');
    return {
      role: 'patient',
      id: found.patientId,
      name: found.name,
      email: found.email,
      age: found.age,
      gender: found.gender,
      contactNo: found.contactNo,
    };
  }
}

export async function registerDoctor(data) {
  return api.post('/doctors', data);
}

export async function registerPatient(data) {
  return api.post('/patients', data);
}
