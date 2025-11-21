export interface User {
  id: string;
  username: string;
  role: 'admin' | 'doctor' | 'pharmacist' | 'cashier';
  name: string;
  specialty?: string; // Optional: Hanya untuk dokter
  image?: string;     // Optional: URL Foto
}

export interface Patient {
  id: string;
  name: string;
  nik: string;
  birthDate: string;
  address: string;
  phone: string;
  createdAt: string;
  type: 'Umum' | 'BPJS'; 
  insuranceNumber?: string;
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

export interface DoctorSchedule {
  id: string;
  doctorId: string; // Link ke User ID
  name: string;
  specialty: string;
  day: string;
  time: string;
  status: 'Praktek' | 'Libur' | 'Cuti';
  quota: number;
  filled: number;
  image: string;
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
// UPDATE TIPE TRANSAKSI
export interface TransactionItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type: 'service' | 'medicine';
}

export interface Transaction {
  id: string; // Invoice Number
  patientName: string;
  description: string; 
  amount: number;
  status: 'pending' | 'paid';
  date: string;
  items?: TransactionItem[]; // Tambahan: Detail Item
}
export interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}