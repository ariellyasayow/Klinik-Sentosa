import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Patient } from '../../types';

const PatientDatabase: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'Semua' | 'BPJS' | 'Umum'>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    name: '', nik: '', birthDate: '', phone: '', address: '', type: 'Umum' as 'Umum' | 'BPJS', insuranceNumber: ''
  });

  useEffect(() => { loadPatients(); }, []);

  useEffect(() => {
    let result = patients;
    if (filterType !== 'Semua') result = result.filter(p => p.type === filterType);
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(lower) || p.nik.includes(lower) || (p.insuranceNumber && p.insuranceNumber.includes(lower)));
    }
    setFilteredPatients(result);
  }, [patients, searchQuery, filterType]);

  const loadPatients = async () => {
    setIsLoading(true);
    try { const data = await api.getPatients(); setPatients(data.reverse()); } 
    catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const calculateAge = (birthDateString: string) => {
    if (!birthDateString || birthDateString === '1900-01-01') return '-';
    const today = new Date(), birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus permanen?")) { await api.deletePatient(id); loadPatients(); }
  };

  const openModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name, nik: patient.nik.startsWith("DARURAT") ? "" : patient.nik,
        birthDate: patient.birthDate === "1900-01-01" ? "" : patient.birthDate,
        phone: patient.phone === "-" ? "" : patient.phone,
        address: patient.address === "Data Menyusul (IGD)" ? "" : patient.address,
        type: patient.type || 'Umum', insuranceNumber: patient.insuranceNumber || ''
      });
    } else {
      setEditingPatient(null);
      setFormData({ name: '', nik: '', birthDate: '', phone: '', address: '', type: 'Umum', insuranceNumber: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPatient) { await api.updatePatient(editingPatient.id, formData); } 
      else { await api.addPatient(formData); }
      setIsModalOpen(false); loadPatients(); alert("Berhasil!");
    } catch (error) { alert("Gagal."); }
  };

  return (
    <div className="p-6 md:p-8 font-body text-[#0d151c]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div><h1 className="text-3xl font-bold tracking-tight text-dark-elements">Database Pasien</h1><p className="text-sm text-slate-500">Kelola data pasien.</p></div>
        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-blue-600 text-white text-sm font-bold shadow-sm hover:bg-blue-700"><span className="material-symbols-outlined text-[20px]">add</span><span>Tambah Pasien</span></button>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2"><div className="flex w-full items-center rounded-lg h-10 bg-gray-50 border border-gray-200 px-3"><span className="material-symbols-outlined text-gray-400">search</span><input className="flex-1 bg-transparent border-none outline-none text-sm ml-2 placeholder:text-gray-400" placeholder="Cari Nama, NIK, BPJS..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/></div></div>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">{['Semua', 'BPJS', 'Umum'].map((type: any) => (<button key={type} onClick={() => setFilterType(type)} className={`flex-1 text-xs font-bold rounded py-1 ${filterType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>{type}</button>))}</div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Nama</th><th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tipe</th><th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">NIK/BPJS</th><th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Usia</th><th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Aksi</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? <tr><td colSpan={5} className="text-center py-8 text-gray-500">Memuat...</td></tr> : filteredPatients.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-500 italic">Data kosong.</td></tr> : filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3"><p className="text-sm font-bold text-slate-800">{p.name}</p>{p.nik.startsWith("DARURAT") && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1 rounded">*Data Belum Lengkap</span>}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${p.type === 'BPJS' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{p.type}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-600"><div className="flex flex-col"><span>{p.nik}</span>{p.type === 'BPJS' && <span className="text-xs text-green-600">No: {p.insuranceNumber}</span>}</div></td>
                    <td className="px-4 py-3 text-sm text-slate-600">{calculateAge(p.birthDate)}</td>
                    <td className="px-4 py-3 text-center"><div className="flex gap-2"><button onClick={() => openModal(p)} className="p-1.5 rounded-md bg-amber-50 text-amber-600"><span className="material-symbols-outlined text-[18px]">edit</span></button><button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md bg-red-50 text-red-600"><span className="material-symbols-outlined text-[18px]">delete</span></button></div></td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50"><h3 className="text-lg font-bold text-slate-800">{editingPatient ? 'Edit Pasien' : 'Tambah Pasien'}</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4"><label className={`cursor-pointer border rounded-lg p-3 flex items-center gap-2 ${formData.type === 'Umum' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}><input type="radio" name="ptype" className="accent-blue-600" checked={formData.type === 'Umum'} onChange={() => setFormData({...formData, type: 'Umum'})} /><span className="font-bold text-sm">Umum</span></label><label className={`cursor-pointer border rounded-lg p-3 flex items-center gap-2 ${formData.type === 'BPJS' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}><input type="radio" name="ptype" className="accent-green-600" checked={formData.type === 'BPJS'} onChange={() => setFormData({...formData, type: 'BPJS'})} /><span className="font-bold text-sm">BPJS</span></label></div>
              {formData.type === 'BPJS' && (<div><label className="block text-sm font-bold text-green-700 mb-1">No. BPJS</label><input required value={formData.insuranceNumber} onChange={e => setFormData({...formData, insuranceNumber: e.target.value})} className="w-full border border-green-300 bg-green-50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 outline-none" /></div>)}
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Nama</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">NIK</label><input required value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">Tgl Lahir</label><input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">HP</label><input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none" /></div></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Alamat</label><textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none"></textarea></div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg">Batal</button><button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Simpan</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDatabase;