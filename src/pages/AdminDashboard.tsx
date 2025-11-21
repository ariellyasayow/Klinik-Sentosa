import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Visit, Patient, VisitStatus } from '../types';
import logo from '../assets/logo.png'; 

const AdminDashboard: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'doctors'>('dashboard');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  
  // Loading States
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [isLoadingEmergency, setIsLoadingEmergency] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '', nik: '', address: '', birthDate: '', phone: ''
  });

  // --- LOAD DATA ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allVisits, allPatients] = await Promise.all([
        api.getVisits(),
        api.getPatients()
      ]);

      const visitsWithPatient = allVisits.map(visit => {
        const foundPatient = allPatients.find(p => p.id === visit.patientId);
        return { 
          ...visit, 
          patient: visit.patient || foundPatient 
        };
      });

      const activeVisits = visitsWithPatient.filter(v => v.status !== 'done');
      
      // SORTING: 
      // 1. Emergency paling atas
      // 2. Skipped (Dilewati) paling bawah (supaya tidak menghalangi yg nunggu)
      const sortedVisits = activeVisits.sort((a, b) => {
        if (a.status === 'skipped' && b.status !== 'skipped') return 1; // Skipped ke bawah
        if (a.status !== 'skipped' && b.status === 'skipped') return -1;
        
        if (a.isEmergency && !b.isEmergency) return -1; // Emergency ke atas
        if (!a.isEmergency && b.isEmergency) return 1;
        
        return 0; 
      });

      setVisits(sortedVisits);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  };

  // --- LOGIC UTAMA (CRUD & STATUS) ---

  // 1. Generic Status Updater
  const handleUpdateStatus = async (visitId: string, newStatus: VisitStatus) => {
    // Konfirmasi khusus jika ingin melewati pasien
    if (newStatus === 'skipped' && !confirm("Pasien tidak merespon? Tandai sebagai dilewati?")) return;
    
    // Konfirmasi jika selesai
    if (newStatus === 'done' && !confirm("Pasien selesai diperiksa?")) return;

    try {
      await api.updateVisitStatus(visitId, newStatus);
      loadData(); // Refresh otomatis
    } catch (error) {
      alert("Gagal update status.");
    }
  };

  // 2. Hapus Antrian
  const handleCancelQueue = async (visitId: string) => {
    if (confirm("Yakin ingin MENGHAPUS antrian ini secara permanen?")) {
      try {
        await api.deleteVisit(visitId);
        loadData();
      } catch (error) {
        alert("Gagal menghapus data.");
      }
    }
  };

  // 3. Tambah Antrian
  const createVisit = async (patientId: string, isEmergency: boolean) => {
    const queueCode = isEmergency ? 'E-' : 'A-';
    const count = visits.filter(v => v.isEmergency === isEmergency).length + 1;
    const queueNumber = queueCode + count.toString().padStart(3, '0');
    
    await api.addVisit({
      patientId,
      doctorId: 'u2', 
      date: new Date().toISOString().split('T')[0],
      queueNumber,
      isEmergency,
      status: 'waiting'
    });
    loadData();
  };

  // --- HANDLERS LAINNYA (Search, Forms) ---
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await api.searchPatients(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddToQueue = async (patientId: string, isEmergency: boolean = false) => {
    if (!confirm(isEmergency ? "DAFTARKAN DARURAT?" : "Tambahkan ke antrian?")) return;
    await createVisit(patientId, isEmergency);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingRegister(true);
    try {
      const newPatient = await api.addPatient(formData);
      await createVisit(newPatient.id, false);
      setIsModalOpen(false);
      setFormData({ name: '', nik: '', address: '', birthDate: '', phone: '' });
      alert("Pasien Reguler Berhasil Didaftar");
    } catch (error) {
      alert("Gagal mendaftarkan pasien.");
    } finally {
      setIsLoadingRegister(false);
    }
  };

  const handleEmergencySubmit = async () => {
    setIsLoadingEmergency(true);
    try {
      const tempName = emergencyName.trim() === '' ? 'Pasien Darurat' : emergencyName;
      const newPatient = await api.addPatient({
        name: tempName, nik: "DARURAT-" + Date.now(), address: "Data Menyusul (IGD)", birthDate: "1900-01-01", phone: "-"
      });
      await createVisit(newPatient.id, true);
      setIsEmergencyModalOpen(false);
      setEmergencyName('');
      alert("PASIEN DARURAT MASUK PRIORITAS!");
    } catch (error) {
      alert("Gagal proses darurat.");
    } finally {
      setIsLoadingEmergency(false);
    }
  };

  const handleLogout = () => window.location.reload();

  return (
    <div className="flex min-h-screen w-full bg-bg-primary font-body text-text-main relative">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col bg-white shadow-sm z-10 border-r border-gray-100">
        <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-gray-100">
          <img alt="Logo" className="h-8 w-auto" src={logo} />
          <span className="font-bold text-lg text-dark-elements">Klinik Sentosa</span>
        </div>
        <nav className="flex flex-1 flex-col justify-between p-4">
          <div className="flex flex-col gap-2">
            <NavItem icon="dashboard" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon="groups" label="Data Pasien" onClick={() => setActiveTab('patients')} />
            <NavItem icon="calendar_month" label="Jadwal Dokter" />
            <NavItem icon="payments" label="Kasir/Pembayaran" />
          </div>
          <div className="flex flex-col"><NavItem icon="settings" label="Pengaturan" /></div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between md:justify-end gap-6 border-b border-gray-200/80 bg-white/50 backdrop-blur-sm px-6 shadow-sm z-10">
          <div className="md:hidden font-bold text-dark-elements">Klinik Sentosa</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">A</div>
              <div className="hidden sm:flex flex-col text-right"><p className="text-sm font-semibold text-dark-elements leading-tight">Admin Rina</p><p className="text-xs text-gray-500">Resepsionis</p></div>
            </div>
            <button onClick={handleLogout} className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-2 text-text-main hover:bg-red-50 hover:text-red-600"><span className="material-symbols-outlined text-base">logout</span></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {/* QUICK ACTIONS (Cari, Pasien Baru, Darurat) */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-dark-elements mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-accent-cta">bolt</span> Aksi Cepat</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm border border-transparent hover:border-blue-200 transition-colors relative z-20">
                <p className="text-base font-bold text-dark-elements">Cari Pasien Lama</p>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60 text-[20px]">search</span>
                  <input className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
                    placeholder="Ketik Nama / NIK..." value={searchQuery} onChange={handleSearch} />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-100 mt-2 max-h-60 overflow-y-auto z-50">
                      {searchResults.map(p => (
                        <div key={p.id} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 flex justify-between items-center group">
                          <div><p className="font-bold text-sm">{p.name}</p><p className="text-xs text-gray-500">{p.nik}</p></div>
                          <button onClick={() => handleAddToQueue(p.id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100">Pilih</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm border border-transparent hover:border-blue-200 transition-colors">
                <p className="text-base font-bold text-dark-elements">Pasien Baru</p>
                <button onClick={() => setIsModalOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white active:scale-95 hover:bg-blue-700 shadow-md hover:shadow-lg shadow-blue-200 transition-all">
                  <span className="material-symbols-outlined text-[20px]">person_add</span><span>Registrasi Baru</span>
                </button>
              </div>
              <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm border border-red-100 hover:border-red-300 transition-colors">
                <p className="text-base font-bold text-red-600 flex items-center gap-2">Pasien Darurat <span className="animate-pulse h-2 w-2 rounded-full bg-red-600"></span></p>
                <button onClick={() => setIsEmergencyModalOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white active:scale-95 hover:bg-red-700 shadow-md hover:shadow-lg ring-2 ring-white ring-offset-2 ring-offset-red-50 transition-all">
                  <span className="material-symbols-outlined text-[20px]">e911_emergency</span><span>Daftarkan Darurat</span>
                </button>
              </div>
            </div>
          </div>

          {/* TABLE & STATS */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-dark-elements mb-4 flex items-center justify-between">
                <span>Antrian Langsung</span><span className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-500">Realtime</span>
              </h2>
              <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                <table className="w-full text-left text-sm text-text-main">
                  <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                    <tr><th className="px-6 py-4">No.</th><th className="px-6 py-4">Pasien</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visits.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">Belum ada antrian.</td></tr>
                    ) : (
                      visits.map((visit) => (
                        <tr key={visit.id} className={`hover:bg-gray-50 transition-colors ${visit.isEmergency ? 'bg-red-50/30 border-l-4 border-red-500' : ''} ${visit.status === 'skipped' ? 'bg-gray-50 opacity-60' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`font-bold text-base ${visit.isEmergency ? 'text-red-700' : 'text-dark-elements'}`}>{visit.queueNumber}</span>
                          </td>
                          <td className="px-6 py-4 font-medium text-dark-elements">
                             {visit.patient?.name || 'Tanpa Nama'}
                             {visit.patient?.address?.includes("Menyusul") && <span className="block text-[10px] text-red-500 font-normal">*Data belum lengkap</span>}
                          </td>
                          <td className="px-6 py-4"><StatusBadge status={visit.status} /></td>
                          
                          {/* --- TOMBOL AKSI YANG DIPERBARUI --- */}
                          <td className="px-6 py-4 text-center flex justify-center gap-1">
                            
                            {/* 1. PROSES (Mulai Periksa) */}
                            {(visit.status === 'waiting' || visit.status === 'skipped') && (
                                <button onClick={() => handleUpdateStatus(visit.id, 'examining')} className="h-8 w-8 rounded-lg flex items-center justify-center text-white bg-green-500 hover:bg-green-600 shadow-sm transition-all" title="Panggil Masuk / Proses">
                                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                </button>
                            )}

                            {/* 2. LEWATI (Orangnya tidak ada) */}
                            {visit.status === 'waiting' && (
                                <button onClick={() => handleUpdateStatus(visit.id, 'skipped')} className="h-8 w-8 rounded-lg flex items-center justify-center text-white bg-amber-400 hover:bg-amber-500 shadow-sm transition-all" title="Pasien Tidak Ada (Lewati)">
                                    <span className="material-symbols-outlined text-[18px]">person_off</span>
                                </button>
                            )}

                            {/* 3. SELESAI */}
                            {visit.status === 'examining' && (
                                <button onClick={() => handleUpdateStatus(visit.id, 'done')} className="h-8 w-8 rounded-lg flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all" title="Selesai">
                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                </button>
                            )}

                            {/* 4. HAPUS (Batal) */}
                            <button onClick={() => handleCancelQueue(visit.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus Antrian">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>

                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* STATISTIK & JADWAL DOKTER */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-dark-elements mb-4">Statistik</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm border border-transparent">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-primary text-blue-600"><span className="material-symbols-outlined text-3xl">groups</span></div>
                  <div><p className="text-3xl font-bold text-dark-elements">{visits.length}</p><p className="text-sm text-gray-500">Pasien Aktif</p></div>
                </div>
                <div className="rounded-xl bg-slate-800 text-white shadow-sm mt-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 opacity-5"><span className="material-symbols-outlined text-6xl">calendar_month</span></div>
                  <div className="relative z-10 p-6">
                     <h3 className="font-bold text-base text-slate-100 mb-1">Jadwal Dokter</h3>
                     <p className="text-slate-400 text-xs mb-5 border-b border-slate-700 pb-3">Hari Ini</p>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm"><span className="text-slate-200">dr. Budi (Umum)</span><span className="text-xs text-slate-300 bg-slate-700 px-2 py-1 rounded border border-slate-600">08:00 - 14:00</span></div>
                        <div className="flex items-center justify-between text-sm"><span className="text-slate-200">dr. Susi (Gigi)</span><span className="text-xs text-slate-300 bg-slate-700 px-2 py-1 rounded border border-slate-600">10:00 - 16:00</span></div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL REGISTRASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 mx-4">
             <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-800">Registrasi Reguler</h3><button onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined text-gray-400">close</span></button></div>
             <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                <input required className="w-full rounded-lg border-gray-300 p-3 text-sm" placeholder="Nama Lengkap" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required className="w-full rounded-lg border-gray-300 p-3 text-sm" placeholder="NIK" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} />
                <textarea required className="w-full rounded-lg border-gray-300 p-3 text-sm" placeholder="Alamat Lengkap" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                <div className="grid grid-cols-2 gap-4">
                   <input required type="date" className="w-full rounded-lg border-gray-300 p-3 text-sm" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                   <input required className="w-full rounded-lg border-gray-300 p-3 text-sm" placeholder="No HP" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-300 transition-colors">Batal</button>
                    <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">{isLoadingRegister ? 'Menyimpan...' : 'Simpan & Daftar'}</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL DARURAT */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEmergencyModalOpen(false)}></div>
           <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                 <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 animate-bounce"><span className="material-symbols-outlined text-4xl">emergency</span></div>
                 <h2 className="mb-2 text-2xl font-bold text-slate-900">Pendaftaran Darurat</h2>
                 <p className="mb-6 text-sm text-slate-500">Input nama untuk antrian prioritas. Data lain menyusul.</p>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="patient-name">Nama Pasien (Opsional)</label>
                    <input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="w-full rounded-lg border-gray-300 py-3 px-4 text-slate-800 placeholder:text-gray-400 border focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none" id="patient-name" placeholder="cth: John Doe" type="text" autoFocus />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setIsEmergencyModalOpen(false)} className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-300"><span>Batal</span></button>
                    <button onClick={handleEmergencySubmit} disabled={isLoadingEmergency} className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-lg shadow-red-200 disabled:opacity-70">{isLoadingEmergency ? <span>Memproses...</span> : ( <> <span className="material-symbols-outlined text-base">priority_high</span><span>Prioritas Utama</span> </> )}</button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

// --- SUB COMPONENTS ---
const NavItem = ({ icon, label, active = false, onClick }: { icon: string, label: string, active?: boolean, onClick?: () => void }) => (<button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-text-main hover:bg-gray-100'}`}><span className="material-symbols-outlined">{icon}</span><span className="text-sm">{label}</span></button>);

// --- UPDATE BADGE UNTUK SKIPPED & EXAMINING ---
const StatusBadge = ({ status }: { status: string }) => { 
  const s:any = {
    waiting: "bg-yellow-100 text-yellow-800",
    examining: "bg-blue-100 text-blue-800",
    done: "bg-green-100 text-green-800",
    skipped: "bg-gray-200 text-gray-500 line-through" // Style untuk dilewati
  }; 
  const labels:any = {
    waiting: "Menunggu", 
    examining: "Diperiksa", 
    done: "Selesai",
    skipped: "Dilewati"
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-bold ${s[status] || "bg-gray-100"}`}>{labels[status] || status}</span> 
};

export default AdminDashboard;