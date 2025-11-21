import type { Patient, Visit, MedicalRecord, Prescription, User, Medicine } from '../types';

const BASE_URL = 'http://localhost:3000';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Network response was not ok');
  }
  return response.json();
};

export const api = {
  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${BASE_URL}/users`);
    return handleResponse(res);
  },

  // --- PATIENTS ---
  getPatients: async (): Promise<Patient[]> => {
    const res = await fetch(`${BASE_URL}/patients`);
    return handleResponse(res);
  },
  
  searchPatients: async (query: string): Promise<Patient[]> => {
    const res = await fetch(`${BASE_URL}/patients?q=${query}`);
    return handleResponse(res);
  },

  addPatient: async (patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
    const newPatient = {
      ...patient,
      id: 'p-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    const res = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPatient),
    });
    return handleResponse(res);
  },

  // --- VISITS (ANTRIAN) ---
  getVisits: async (): Promise<Visit[]> => {
    // _expand=patient PENTING agar nama pasien muncul
    const res = await fetch(`${BASE_URL}/visits?_expand=patient`);
    return handleResponse(res);
  },

  addVisit: async (visit: Omit<Visit, 'id'>): Promise<Visit> => {
    const newVisit = { ...visit, id: 'v-' + Date.now() };
    const res = await fetch(`${BASE_URL}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVisit),
    });
    return handleResponse(res);
  },

  // UPDATE STATUS (Contoh: Ubah jadi 'done')
  updateVisitStatus: async (id: string, status: Visit['status']): Promise<Visit> => {
    const res = await fetch(`${BASE_URL}/visits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // DELETE (Hapus Antrian)
  deleteVisit: async (id: string): Promise<void> => {
    await fetch(`${BASE_URL}/visits/${id}`, {
      method: 'DELETE',
    });
  },

  // --- MEDICINES ---
  getMedicines: async (): Promise<Medicine[]> => {
    const res = await fetch(`${BASE_URL}/medicines`);
    return handleResponse(res);
  }
};