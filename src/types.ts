export interface User {
  id: string;
  username: string;
  role: 'admin' | 'doctor' | 'pharmacist' | 'cashier';
  name: string;
}

export interface Patient {
  id: string;
  name: string;
  nik: string;
  birthDate: string;
  address: string;
  phone: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export type VisitStatus = 'waiting' | 'examining' | 'pharmacy' | 'cashier' | 'done' | 'skipped';

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  queueNumber: string;
  isEmergency: boolean;
  status: VisitStatus;
  patient?: Patient; 
}

export interface MedicalRecord {
  id: string;
  visitId: string;
  complaints: string;
  vitalSigns: string;
  diagnosis: string;
}

export interface Prescription {
  id: string;
  visitId: string;
  items: {
    medicineId: string;
    medicineName: string;
    dosage: string;
    quantity: number;
    price: number;
  }[];
  status: 'pending' | 'processed' | 'completed';
}