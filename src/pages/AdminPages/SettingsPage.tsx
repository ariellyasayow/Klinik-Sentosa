import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User, Medicine, ClinicInfo } from '../../types';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'medicines' | 'clinic'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({ name: '', address: '', phone: '', email: '' });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', username: '', role: 'doctor' as const });
  const [medForm, setMedForm] = useState({ name: '', price: 0, stock: 0 });

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'users') { const data = await api.getUsers(); setUsers(data); }
      else if (activeTab === 'medicines') { const data = await api.getMedicines(); setMedicines(data); }
      else if (activeTab === 'clinic') { 
         try { const data = await api.getClinicInfo(); setClinicInfo(data); } 
         catch { setClinicInfo({ name: "Klinik Sentosa", address: "", phone: "", email: "" }); }
      }
    } catch (error) { console.error(error); }
  };

  const handleAddUser = async (e: React.FormEvent) => { e.preventDefault(); await api.addUser(userForm); setIsUserModalOpen(false); loadData(); alert("User added!"); };
  const handleDeleteUser = async (id: string) => { if(confirm("Delete?")) { await api.deleteUser(id); loadData(); } };
  const handleAddMedicine = async (e: React.FormEvent) => { e.preventDefault(); await api.addMedicine(medForm); setIsMedModalOpen(false); loadData(); alert("Medicine added!"); };
  const handleDeleteMedicine = async (id: string) => { if(confirm("Delete?")) { await api.deleteMedicine(id); loadData(); } };
  const handleSaveClinic = async (e: React.FormEvent) => { e.preventDefault(); await api.updateClinicInfo(clinicInfo); alert("Saved!"); };

  return (
    <div className="p-8 font-display text-gray-600">
      <div className="mb-6"><h1 className="text-3xl font-bold text-[#004346]">Pengaturan Sistem</h1><p className="text-gray-500">Kelola data master klinik.</p></div>
      <div className="flex border-b border-gray-200 mb-6">
        {['users', 'medicines', 'clinic'].map((tab) => (
           <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 text-sm font-bold border-b-2 capitalize ${activeTab === tab ? 'border-[#74B3CE] text-[#74B3CE]' : 'border-transparent text-gray-500'}`}>
             {tab === 'users' ? 'Manajemen User' : tab === 'medicines' ? 'Master Obat' : 'Profil Klinik'}
           </button>
        ))}
      </div>

      {/* USERS */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-end mb-4"><button onClick={() => setIsUserModalOpen(true)} className="bg-[#74B3CE] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined">add</span> Tambah User</button></div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-gray-50"><tr><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4">Role</th><th className="p-4">Aksi</th></tr></thead><tbody className="divide-y">{users.map(u => (<tr key={u.id}><td className="p-4 font-bold">{u.name}</td><td className="p-4">@{u.username}</td><td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold uppercase">{u.role}</span></td><td className="p-4">{u.username !== 'admin' && <button onClick={() => handleDeleteUser(u.id)} className="text-red-500"><span className="material-symbols-outlined">delete</span></button>}</td></tr>))}</tbody></table></div>
        </div>
      )}

      {/* MEDICINES */}
      {activeTab === 'medicines' && (
        <div>
          <div className="flex justify-end mb-4"><button onClick={() => setIsMedModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined">add</span> Tambah Obat</button></div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-gray-50"><tr><th className="p-4">Nama</th><th className="p-4">Stok</th><th className="p-4">Harga</th><th className="p-4">Aksi</th></tr></thead><tbody className="divide-y">{medicines.map(m => (<tr key={m.id}><td className="p-4 font-bold">{m.name}</td><td className="p-4">{m.stock}</td><td className="p-4">Rp {m.price.toLocaleString()}</td><td className="p-4"><button onClick={() => handleDeleteMedicine(m.id)} className="text-red-500"><span className="material-symbols-outlined">delete</span></button></td></tr>))}</tbody></table></div>
        </div>
      )}

      {/* CLINIC */}
      {activeTab === 'clinic' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border max-w-2xl">
           <form onSubmit={handleSaveClinic} className="space-y-4">
              <div><label className="block text-sm font-bold mb-1">Nama Klinik</label><input className="w-full border p-2 rounded" value={clinicInfo.name} onChange={e=>setClinicInfo({...clinicInfo, name: e.target.value})}/></div>
              <div><label className="block text-sm font-bold mb-1">Alamat</label><textarea className="w-full border p-2 rounded" rows={3} value={clinicInfo.address} onChange={e=>setClinicInfo({...clinicInfo, address: e.target.value})}></textarea></div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-sm font-bold mb-1">Telepon</label><input className="w-full border p-2 rounded" value={clinicInfo.phone} onChange={e=>setClinicInfo({...clinicInfo, phone: e.target.value})}/></div>
                 <div><label className="block text-sm font-bold mb-1">Email</label><input className="w-full border p-2 rounded" value={clinicInfo.email} onChange={e=>setClinicInfo({...clinicInfo, email: e.target.value})}/></div>
              </div>
              <button type="submit" className="bg-[#004346] text-white px-6 py-2 rounded font-bold">Simpan</button>
           </form>
        </div>
      )}

      {/* MODALS */}
      {isUserModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white p-6 rounded-xl w-full max-w-md"><h3 className="font-bold text-lg mb-4">Tambah User</h3><form onSubmit={handleAddUser} className="space-y-3"><input className="w-full border p-2 rounded" placeholder="Nama" value={userForm.name} onChange={e=>setUserForm({...userForm, name: e.target.value})}/><input className="w-full border p-2 rounded" placeholder="Username" value={userForm.username} onChange={e=>setUserForm({...userForm, username: e.target.value})}/><select className="w-full border p-2 rounded" value={userForm.role} onChange={e=>setUserForm({...userForm, role: e.target.value as any})}><option value="doctor">Dokter</option><option value="pharmacist">Apoteker</option><option value="cashier">Kasir</option><option value="admin">Admin</option></select><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={()=>setIsUserModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Batal</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button></div></form></div></div>)}
      {isMedModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white p-6 rounded-xl w-full max-w-md"><h3 className="font-bold text-lg mb-4">Tambah Obat</h3><form onSubmit={handleAddMedicine} className="space-y-3"><input className="w-full border p-2 rounded" placeholder="Nama Obat" value={medForm.name} onChange={e=>setMedForm({...medForm, name: e.target.value})}/><div className="grid grid-cols-2 gap-3"><input type="number" className="w-full border p-2 rounded" placeholder="Harga" value={medForm.price || ''} onChange={e=>setMedForm({...medForm, price: parseInt(e.target.value)})}/><input type="number" className="w-full border p-2 rounded" placeholder="Stok" value={medForm.stock || ''} onChange={e=>setMedForm({...medForm, stock: parseInt(e.target.value)})}/></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={()=>setIsMedModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Batal</button><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Simpan</button></div></form></div></div>)}
    </div>
  );
};

export default SettingsPage;