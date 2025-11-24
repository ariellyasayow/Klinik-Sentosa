import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { DoctorSchedule, User } from '../../types';

const DoctorSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [doctorsList, setDoctorsList] = useState<User[]>([]); 
  const [loading, setLoading] = useState(false);
  
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(null);
  
  const initialForm = {
    doctorId: '', name: '', specialty: '', day: 'Senin', time: '08:00 - 14:00', 
    status: 'Praktek' as 'Praktek' | 'Libur' | 'Cuti', quota: 20, filled: 0, image: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedData, docData] = await Promise.all([api.getDoctorSchedules(), api.getDoctors()]);
      setSchedules(schedData);
      setDoctorsList(docData);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value; setSelectedDate(dateVal);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    setSelectedDay(dayNames[new Date(dateVal).getDay()]);
  };

  const handleDoctorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDocId = e.target.value;
    const selectedDoc = doctorsList.find(d => d.id === selectedDocId);
    if (selectedDoc) {
      setFormData({
        ...formData, doctorId: selectedDoc.id, name: selectedDoc.name,
        specialty: selectedDoc.specialty || 'Dokter Umum', image: selectedDoc.image || 'https://via.placeholder.com/150'
      });
    } else { setFormData({ ...formData, doctorId: '', name: '', specialty: '', image: '' }); }
  };

  const toggleStatus = async (schedule: DoctorSchedule) => {
    const newStatus = schedule.status === 'Praktek' ? 'Libur' : 'Praktek';
    if(confirm(`Ubah status ${schedule.name} menjadi ${newStatus}?`)) {
      await api.updateDoctorSchedule(schedule.id, { status: newStatus });
      const newSchedules = await api.getDoctorSchedules(); setSchedules(newSchedules);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Hapus jadwal permanen?")) {
      await api.deleteDoctorSchedule(id);
      const newSchedules = await api.getDoctorSchedules(); setSchedules(newSchedules);
    }
  };

  const openModal = (schedule?: DoctorSchedule) => {
    if (schedule) { setEditingSchedule(schedule); setFormData({ ...schedule }); } 
    else { setEditingSchedule(null); setFormData({ ...initialForm, day: selectedDay }); }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchedule) { await api.updateDoctorSchedule(editingSchedule.id, formData); } 
      else { await api.addDoctorSchedule(formData); }
      setIsModalOpen(false); 
      const newSchedules = await api.getDoctorSchedules(); setSchedules(newSchedules);
      alert("Berhasil disimpan!");
    } catch (error) { alert("Gagal menyimpan."); }
  };

  const getStatusColors = (status: string) => {
    switch(status) {
      case 'Praktek': return { bg: 'bg-[#D6F3F4]', header: 'bg-[#74B3CE]', badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' };
      case 'Libur': return { bg: 'bg-red-50', header: 'bg-red-200', badge: 'bg-red-100 text-red-800', dot: 'bg-red-500' };
      case 'Cuti': return { bg: 'bg-yellow-50', header: 'bg-yellow-200', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' };
      default: return { bg: 'bg-gray-50', header: 'bg-gray-200', badge: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' };
    }
  };

  const filteredSchedules = schedules.filter(s => s.day === selectedDay);

  return (
    <div className="p-6 md:p-8 font-display text-[#0d151c]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-3xl font-bold tracking-tight">Jadwal Praktek Dokter</p><p className="text-sm text-gray-500">Atur ketersediaan dokter.</p></div>
          <div className="flex gap-3">
             <div className="relative"><input className="pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 shadow-sm outline-none" type="date" value={selectedDate} onChange={handleDateChange} /><span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">calendar_today</span></div>
             <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-bold text-sm transition-all"><span className="material-symbols-outlined text-[20px]">add</span> Tambah Jadwal</button>
          </div>
        </div>
        <div className="mb-8 overflow-x-auto pb-2"><div className="flex items-center rounded-lg bg-white p-1 shadow-sm w-max border border-gray-100">{days.map(day => (<button key={day} onClick={() => setSelectedDay(day)} className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${selectedDay === day ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>{day}</button>))}</div></div>
        {loading ? <p className="text-center py-10">Memuat...</p> : filteredSchedules.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300"><span className="material-symbols-outlined text-4xl text-gray-300 mb-2">event_busy</span><p className="text-gray-500">Tidak ada jadwal.</p><button onClick={() => openModal()} className="mt-4 text-blue-600 font-bold hover:underline text-sm">+ Tambah</button></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSchedules.map((schedule) => {
              const colors = getStatusColors(schedule.status);
              return (
                <div key={schedule.id} className={`${colors.bg} rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all group relative`}>
                  <div className={`${colors.header} p-4 flex items-center gap-4`}><img alt={schedule.name} className="w-14 h-14 rounded-full border-2 border-white bg-white object-cover" src={schedule.image} /><div><h3 className="font-bold text-slate-900 text-sm">{schedule.name}</h3><p className="text-xs text-slate-700 opacity-80">{schedule.specialty}</p></div></div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between"><button onClick={() => toggleStatus(schedule)} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${colors.badge} hover:brightness-95`}><span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>{schedule.status}</button><div className="flex gap-1"><button onClick={() => openModal(schedule)} className="p-1 rounded hover:bg-black/10"><span className="material-symbols-outlined text-[18px]">edit</span></button><button onClick={() => handleDelete(schedule.id)} className="p-1 rounded hover:bg-red-100 text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button></div></div>
                    <div className="flex items-center gap-3 text-slate-700"><span className="material-symbols-outlined text-[20px] opacity-60">schedule</span><span className="text-sm font-semibold">{schedule.time}</span></div>
                    <div className="flex items-center gap-3 text-slate-700"><span className="material-symbols-outlined text-[20px] opacity-60">groups</span><div className="flex-1"><div className="flex justify-between text-xs mb-1 font-medium"><span>Terisi</span><span>{schedule.filled}/{schedule.quota}</span></div><div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden"><div className={`h-full rounded-full ${schedule.status === 'Praktek' ? 'bg-blue-600' : 'bg-gray-400'}`} style={{ width: schedule.quota > 0 ? `${(schedule.filled / schedule.quota) * 100}%` : '0%' }}></div></div></div></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50"><h3 className="text-lg font-bold text-slate-800">{editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button></div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Dokter</label><select required value={formData.doctorId} onChange={handleDoctorSelect} className="w-full border rounded p-2 text-sm bg-white" disabled={!!editingSchedule}><option value="" disabled>-- Pilih --</option>{doctorsList.map(doc => (<option key={doc.id} value={doc.id}>{doc.name}</option>))}</select></div>
                 <div className="bg-gray-50 p-3 rounded border"><p className="text-sm font-bold">{formData.name || "-"}</p><p className="text-xs text-slate-500">{formData.specialty || "-"}</p></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hari</label><select value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} className="w-full border rounded p-2 text-sm bg-white">{days.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jam</label><input required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="08:00 - 14:00" /></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kuota</label><input type="number" required value={formData.quota} onChange={e => setFormData({...formData, quota: parseInt(e.target.value)})} className="w-full border rounded p-2 text-sm" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border rounded p-2 text-sm bg-white"><option value="Praktek">Praktek</option><option value="Libur">Libur</option><option value="Cuti">Cuti</option></select></div>
                 </div>
                 <div className="flex justify-end gap-3 pt-4 border-t mt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Batal</button><button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded hover:bg-blue-700">Simpan</button></div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedulePage;