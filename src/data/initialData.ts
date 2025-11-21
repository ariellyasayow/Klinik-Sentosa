import type { ClinicData } from '../types'

export const INITIAL_DATA: ClinicData = {
  users: [
    { id: 1, username: 'admin', role: 'admin' },
    { id: 2, username: 'dr.rani', role: 'dokter' },
    { id: 3, username: 'siska', role: 'apoteker' },
    { id: 4, username: 'kasir1', role: 'kasir' },
  ],
  patients: [
    {
      id: 1,
      name: 'Alya Pratama',
      address: 'Jl. Kenanga No. 12, Bandung',
      phone: '0812-1234-555',
      birthDate: '1992-07-15',
    },
    {
      id: 2,
      name: 'Rafi Nugraha',
      address: 'Jl. Merdeka No. 21, Bandung',
      phone: '0821-3322-778',
      birthDate: '1987-03-04',
    },
    {
      id: 3,
      name: 'Siti Rahma',
      address: 'Jl. Melati No. 8, Bandung',
      phone: '0857-8899-221',
      birthDate: '2001-11-23',
      isEmergency: true,
    },
  ],
  visits: [
    {
      id: 10,
      patientId: 1,
      visitDate: '2025-10-18',
      diagnosis: 'Gastritis ringan',
      notes: 'Pantau pola makan, hindari pedas',
      medicines: [
        { name: 'Omeprazole', dosage: '20 mg' },
        { name: 'Antasida', dosage: '3x sehari' },
      ],
    },
    {
      id: 11,
      patientId: 2,
      visitDate: '2025-09-02',
      diagnosis: 'Hipertensi tahap 1',
      notes: 'Kontrol tiap bulan',
      medicines: [
        { name: 'Captopril', dosage: '25 mg' },
        { name: 'Amlodipine', dosage: '5 mg' },
      ],
    },
  ],
  queue: [
    {
      id: 100,
      patientId: 2,
      status: 'Menunggu',
      priority: 'Normal',
      createdAt: '2025-11-20T08:00:00+07:00',
    },
    {
      id: 101,
      patientId: 3,
      status: 'Menunggu',
      priority: 'Darurat',
      createdAt: '2025-11-20T08:10:00+07:00',
    },
  ],
  prescriptions: [
    {
      id: 5001,
      patientId: 1,
      doctor: 'dr. Rani Kusuma',
      status: 'Baru',
      education: 'Minum setelah makan, habiskan obat antibiotik.',
      items: [
        {
          name: 'Paracetamol 500mg',
          dosage: '3x1 tablet',
          instructions: 'Minum setelah makan bila demam',
        },
        {
          name: 'Amoxicillin 500mg',
          dosage: '3x1 kapsul',
          instructions: 'Harus dihabiskan',
        },
      ],
    },
    {
      id: 5002,
      patientId: 3,
      doctor: 'dr. Rani Kusuma',
      status: 'Disiapkan',
      education: 'Pantau tanda-tanda alergi.',
      items: [
        {
          name: 'Salbutamol inhaler',
          dosage: '2 kali sehari',
          instructions: 'Kocok sebelum digunakan',
        },
      ],
    },
  ],
  bills: [
    {
      id: 9001,
      patientId: 1,
      doctorFee: 150000,
      pharmacyTotal: 120000,
      status: 'Menunggu',
    },
    {
      id: 9002,
      patientId: 3,
      doctorFee: 200000,
      pharmacyTotal: 180000,
      status: 'Menunggu',
    },
  ],
}

