import type { Patient, Visit, MedicalRecord, Prescription, User, Medicine, DoctorSchedule, Transaction, ClinicInfo } from '../types';

const BASE_URL = 'http://localhost:3000';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Network response was not ok');
  }
  return response.json();
};

export const api = {
  // USERS
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${BASE_URL}/users`);
    return handleResponse(res);
  },
  getDoctors: async (): Promise<User[]> => {
    const res = await fetch(`${BASE_URL}/users?role=doctor`);
    return handleResponse(res);
  },
  addUser: async (user: Omit<User, 'id'>): Promise<User> => {
    const newUser = { ...user, id: 'u-' + Date.now() };
    const res = await fetch(`${BASE_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
    return handleResponse(res);
  },
  deleteUser: async (id: string): Promise<void> => {
    await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
  },

  // PATIENTS
  getPatients: async (): Promise<Patient[]> => {
    const res = await fetch(`${BASE_URL}/patients`);
    return handleResponse(res);
  },
  searchPatients: async (query: string): Promise<Patient[]> => {
    const res = await fetch(`${BASE_URL}/patients?q=${query}`);
    return handleResponse(res);
  },
  addPatient: async (patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
    const newPatient = { ...patient, id: 'p-' + Date.now(), createdAt: new Date().toISOString().split('T')[0] };
    const res = await fetch(`${BASE_URL}/patients`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPatient) });
    return handleResponse(res);
  },
  updatePatient: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const res = await fetch(`${BASE_URL}/patients/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return handleResponse(res);
  },
  deletePatient: async (id: string): Promise<void> => {
    await fetch(`${BASE_URL}/patients/${id}`, { method: 'DELETE' });
  },

  // VISITS
  getVisits: async (): Promise<Visit[]> => {
    const res = await fetch(`${BASE_URL}/visits?_expand=patient`);
    return handleResponse(res);
  },
  addVisit: async (visit: Omit<Visit, 'id'>): Promise<Visit> => {
    const newVisit = { ...visit, id: 'v-' + Date.now() };
    const res = await fetch(`${BASE_URL}/visits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newVisit) });
    return handleResponse(res);
  },
  updateVisitStatus: async (id: string, status: Visit['status']): Promise<Visit> => {
    const res = await fetch(`${BASE_URL}/visits/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    return handleResponse(res);
  },
  deleteVisit: async (id: string): Promise<void> => {
    await fetch(`${BASE_URL}/visits/${id}`, { method: 'DELETE' });
  },

  // DOCTOR SCHEDULES
  getDoctorSchedules: async (): Promise<DoctorSchedule[]> => {
    const res = await fetch(`${BASE_URL}/doctorSchedules`);
    return handleResponse(res);
  },
  addDoctorSchedule: async (schedule: Omit<DoctorSchedule, 'id'>): Promise<DoctorSchedule> => {
    const newSchedule = { ...schedule, id: 'ds-' + Date.now() };
    const res = await fetch(`${BASE_URL}/doctorSchedules`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSchedule) });
    return handleResponse(res);
  },
  updateDoctorSchedule: async (id: string, data: Partial<DoctorSchedule>): Promise<DoctorSchedule> => {
    const res = await fetch(`${BASE_URL}/doctorSchedules/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return handleResponse(res);
  },
  deleteDoctorSchedule: async (id: string): Promise<void> => {
    await fetch(`${BASE_URL}/doctorSchedules/${id}`, { method: 'DELETE' });
  },

  // MEDICINES
  getMedicines: async (): Promise<Medicine[]> => {
    const res = await fetch(`${BASE_URL}/medicines`);
    return handleResponse(res);
  },
  addMedicine: async (medicine: Omit<Medicine, 'id'>): Promise<Medicine> => {
    const newMed = { ...medicine, id: 'm-' + Date.now() };
    const res = await fetch(`${BASE_URL}/medicines`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMed) });
    return handleResponse(res);
  },
  deleteMedicine: async (id: string): Promise<void> => {
    await fetch(`${BASE_URL}/medicines/${id}`, { method: 'DELETE' });
  },

  // TRANSACTIONS
  getTransactions: async (): Promise<Transaction[]> => {
    const res = await fetch(`${BASE_URL}/transactions`);
    return handleResponse(res);
  },
  processPayment: async (id: string): Promise<Transaction> => {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid' }) });
    return handleResponse(res);
  },

  // CLINIC INFO
  getClinicInfo: async (): Promise<ClinicInfo> => {
    const res = await fetch(`${BASE_URL}/clinicInfo`);
    // Handle jika db.json belum ada clinicInfo (return default)
    if (res.status === 404) return { name: 'Klinik Sentosa', address: '-', phone: '-', email: '-' };
    return handleResponse(res);
  },
  updateClinicInfo: async (data: ClinicInfo): Promise<ClinicInfo> => {
    const res = await fetch(`${BASE_URL}/clinicInfo`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return handleResponse(res);
  }
};