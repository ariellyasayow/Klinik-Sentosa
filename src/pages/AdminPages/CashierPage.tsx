import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Transaction } from '../../types';

const CashierPage: React.FC = () => {
  // State Data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State UI
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Modal Pembayaran
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'nontunai'>('tunai');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [change, setChange] = useState<number>(0);

  // Load Data
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // Hitung Kembalian
  const handleCashInput = (val: string) => {
    // Hapus karakter non-digit
    const cleanVal = val.replace(/\D/g, '');
    setCashReceived(cleanVal);
    
    if (selectedTx && cleanVal) {
      const cash = parseInt(cleanVal);
      setChange(cash - selectedTx.amount);
    } else {
      setChange(0);
    }
  };

  // Format Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const openPaymentModal = (tx: Transaction) => {
    setSelectedTx(tx);
    setPaymentMethod('tunai');
    setCashReceived('');
    setChange(-tx.amount); // Awalnya minus (kurang bayar)
    setIsModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedTx) return;
    
    if (paymentMethod === 'tunai' && change < 0) {
      alert("Uang pembayaran kurang!");
      return;
    }

    if (confirm("Konfirmasi pembayaran dan cetak struk?")) {
      try {
        await api.processPayment(selectedTx.id);
        alert("Pembayaran Berhasil! Struk dicetak.");
        setIsModalOpen(false);
        loadTransactions();
      } catch (error) {
        alert("Gagal memproses pembayaran.");
      }
    }
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(t => {
    const matchTab = t.status === activeTab;
    const matchSearch = t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="p-6 md:p-8 font-display text-[#004346]">
      
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172A3A] mb-2">Kasir / Pembayaran</h1>
        <p className="text-[#508991]">Proses pembayaran dan lihat riwayat transaksi.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-[#74B3CE] text-[#74B3CE]' : 'border-transparent text-gray-500 hover:text-[#004346]'}`}
        >
          Belum Bayar
        </button>
        <button 
          onClick={() => setActiveTab('paid')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'paid' ? 'border-[#74B3CE] text-[#74B3CE]' : 'border-transparent text-gray-500 hover:text-[#004346]'}`}
        >
          Riwayat Transaksi
        </button>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
           <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#74B3CE] outline-none" 
                placeholder="Cari No. Invoice atau Nama Pasien..." 
              />
           </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-[#004346]/80">
              <tr>
                <th className="px-6 py-3 font-semibold">No. Invoice</th>
                <th className="px-6 py-3 font-semibold">Nama Pasien</th>
                <th className="px-6 py-3 font-semibold">Keterangan</th>
                <th className="px-6 py-3 font-semibold">Total Tagihan</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={6} className="text-center py-8 text-gray-500">Memuat data...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                 <tr><td colSpan={6} className="text-center py-8 text-gray-500 italic">Data tidak ditemukan.</td></tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#D6F3F4]/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#172A3A]">{tx.id}</td>
                    <td className="px-6 py-4 font-bold">{tx.patientName}</td>
                    <td className="px-6 py-4 text-gray-600">{tx.description}</td>
                    <td className="px-6 py-4 font-bold text-[#172A3A]">{formatRupiah(tx.amount)}</td>
                    <td className="px-6 py-4">
                      {tx.status === 'pending' ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">Belum Lunas</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Lunas</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tx.status === 'pending' ? (
                        <button 
                          onClick={() => openPaymentModal(tx)}
                          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#74B3CE] px-4 py-2 text-xs font-bold text-white hover:bg-[#5f9cb8] transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">payment</span> Proses Bayar
                        </button>
                      ) : (
                        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                          <span className="material-symbols-outlined text-[16px]">print</span> Cetak
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL PEMBAYARAN (SESUAI DESAIN HTML) --- */}
      {isModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-2xl rounded-xl bg-[#F0FAFB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 bg-white">
              <h2 className="text-xl font-bold text-[#172A3A]">Proses Pembayaran</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Rincian Jasa */}
              <div>
                <h3 className="font-semibold text-[#172A3A] mb-2 flex items-center gap-2">
                   <span className="material-symbols-outlined text-[#74B3CE]">medical_services</span> Rincian Jasa & Tindakan
                </h3>
                <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white p-4">
                   {/* Dummy Items jika data items kosong */}
                   {(selectedTx.items?.filter(i => i.type === 'service') || [{name: selectedTx.description, price: selectedTx.amount}]).map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2 text-sm">
                         <p>{item.name || "Jasa Medis"}</p>
                         <p className="font-bold text-[#172A3A]">{formatRupiah(item.price)}</p>
                      </div>
                   ))}
                </div>
              </div>

              {/* Rincian Obat (Tampilkan jika ada) */}
              {(selectedTx.items?.some(i => i.type === 'medicine')) && (
                <div>
                  <h3 className="font-semibold text-[#172A3A] mb-2 flex items-center gap-2">
                     <span className="material-symbols-outlined text-[#74B3CE]">pill</span> Rincian Obat
                  </h3>
                  <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white p-4">
                     {selectedTx.items?.filter(i => i.type === 'medicine').map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2 text-sm">
                           <p>{item.name} <span className="text-xs text-gray-500">x{item.quantity}</span></p>
                           <p className="font-bold text-[#172A3A]">{formatRupiah(item.price * item.quantity)}</p>
                        </div>
                     ))}
                  </div>
                </div>
              )}

              {/* Total & Metode */}
              <div className="pt-4 border-t border-gray-300 space-y-6">
                 <div className="flex justify-between items-center">
                    <p className="font-bold text-[#172A3A] text-lg">Total Akhir</p>
                    <p className="font-black text-3xl text-[#172A3A]">{formatRupiah(selectedTx.amount)}</p>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-[#004346] mb-2">Metode Pembayaran</label>
                    <div className="grid grid-cols-2 gap-3">
                       <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${paymentMethod === 'tunai' ? 'border-[#74B3CE] bg-[#74B3CE]/10 ring-1 ring-[#74B3CE]' : 'border-gray-300 bg-white'}`}>
                          <input type="radio" name="method" className="accent-[#74B3CE]" checked={paymentMethod === 'tunai'} onChange={() => setPaymentMethod('tunai')} />
                          <span className="font-bold text-sm">Tunai</span>
                       </label>
                       <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${paymentMethod === 'nontunai' ? 'border-[#74B3CE] bg-[#74B3CE]/10 ring-1 ring-[#74B3CE]' : 'border-gray-300 bg-white'}`}>
                          <input type="radio" name="method" className="accent-[#74B3CE]" checked={paymentMethod === 'nontunai'} onChange={() => setPaymentMethod('nontunai')} />
                          <span className="font-bold text-sm">Non-Tunai (QRIS/Debit)</span>
                       </label>
                    </div>
                 </div>

                 {paymentMethod === 'tunai' ? (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                       <div>
                          <label className="block text-sm font-medium text-[#004346] mb-1">Uang Tunai (Rp)</label>
                          <input 
                             autoFocus
                             type="text" 
                             value={cashReceived ? parseInt(cashReceived).toLocaleString('id-ID') : ''}
                             onChange={(e) => handleCashInput(e.target.value)}
                             className="w-full rounded-lg border-gray-300 text-right text-lg font-bold text-[#172A3A] focus:border-[#74B3CE] focus:ring-2 focus:ring-[#74B3CE]/20 outline-none py-2 px-3"
                             placeholder="0"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-[#004346] mb-1">Kembalian (Rp)</label>
                          <div className={`w-full rounded-lg border border-gray-300 py-2 px-3 text-right text-lg font-bold ${change < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                             {formatRupiah(change)}
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="animate-in fade-in slide-in-from-top-2">
                       <label className="block text-sm font-medium text-[#004346] mb-1">Nomor Referensi / ID Transaksi</label>
                       <input className="w-full rounded-lg border-gray-300 p-2.5 text-sm focus:border-[#74B3CE] outline-none" placeholder="Masukkan 4 digit terakhir kartu / No Ref QRIS" />
                    </div>
                 )}
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex justify-end p-6 bg-white rounded-b-xl border-t border-gray-200 gap-3">
               <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
               <button 
                  onClick={handleProcessPayment}
                  disabled={paymentMethod === 'tunai' && change < 0}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#508991] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#406c73] shadow-lg shadow-[#508991]/20 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <span className="material-symbols-outlined text-xl">print</span>
                  <span>Bayar & Cetak Struk</span>
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CashierPage;