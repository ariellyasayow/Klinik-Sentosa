import React, { useState } from 'react';
import { api } from './services/api';
import type { User } from '../types';
import logo from '../assets/logo.png';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('Pilih peran Anda');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const users = await api.getUsers();
      const foundUser = users.find(
        (u) => u.username === username && u.role === role.toLowerCase()
      );

      if (foundUser) {
        onLoginSuccess(foundUser);
      } else {
        setError('Username atau Role tidak sesuai!');
      }
    } catch (err) {
      setError('Gagal terhubung ke server (Pastikan json-server menyala).');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // UBAH BACKGROUND: Menggunakan background yang sedikit lebih gelap di dark mode
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-[#0d171b] overflow-x-hidden font-display transition-colors duration-300">
      {/* Background Image dengan Opacity yang disesuaikan */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-center bg-no-repeat bg-cover opacity-5 dark:opacity-10" 
          style={{ backgroundImage: 'url("https://img.freepik.com/free-vector/clean-medical-background_53876-97927.jpg")' }}
        ></div>
        {/* Overlay gradient agar tulisan lebih terbaca */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-[#0d171b]/50 dark:to-[#0d171b]"></div>
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center justify-center px-6 py-8">
        
        {/* Header Section */}
        <div className="flex w-full flex-col items-center gap-2 pb-8">
          {/* Logo dengan efek shadow halus */}
          <div className="flex items-center justify-center p-3 bg-white/50 dark:bg-white/5 rounded-2xl backdrop-blur-sm shadow-sm">
            {logo ? (
              <img src={logo} alt="Logo" className="h-14 w-auto drop-shadow-sm" />
            ) : (
              <span className="material-symbols-outlined text-primary text-5xl">local_hospital</span>
            )}
          </div>
          {/* UBAH WARNA: Nama Klinik jadi warna Primary, Subtitle jadi lebih terang */}
          <div className="text-center mt-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-primary tracking-tight">Klinik Sentosa</h2>
            <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">Sistem Informasi Manajemen</p>
          </div>
        </div>

        {/* Main Title Section */}
        <div className="text-center pb-8">
          {/* UBAH WARNA: Judul utama jadi putih total di dark mode */}
          <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight mb-2">
            Selamat Datang
          </h1>
          {/* UBAH WARNA: Subjudul jadi abu-abu terang */}
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Silakan login untuk memulai sesi Anda
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="flex w-full flex-col gap-5">
          
          {/* Username Input */}
          <label className="flex flex-col flex-1 gap-2">
            {/* UBAH WARNA: Label jadi lebih terang */}
            <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold">Username</p>
            <div className="relative flex items-center group">
              {/* UBAH WARNA: Ikon jadi lebih terang di dark mode */}
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 dark:text-slate-400 group-focus-within:text-primary transition-colors">person</span>
              <input 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                // Style input diperhalus border dan backgroundnya di dark mode
                className="flex w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-12 pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm" 
                placeholder="Masukkan username" 
              />
            </div>
          </label>

          {/* Password Input */}
          <label className="flex flex-col flex-1 gap-2">
             {/* UBAH WARNA: Label jadi lebih terang */}
            <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold">Password</p>
            <div className="relative flex w-full flex-1 items-center group">
               {/* UBAH WARNA: Ikon jadi lebih terang */}
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 dark:text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
              <input 
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-12 pl-11 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm" 
                placeholder="Masukkan password" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                 // UBAH WARNA: Tombol mata jadi lebih terang
                className="text-slate-400 dark:text-slate-400 absolute right-1 flex items-center justify-center h-10 w-10 hover:text-primary dark:hover:text-primary rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </label>

          {/* Role Selection */}
          <label className="flex flex-col flex-1 gap-2">
             {/* UBAH WARNA: Label jadi lebih terang */}
            <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold">Pilih Role</p>
            <div className="relative flex items-center group">
               {/* UBAH WARNA: Ikon jadi lebih terang */}
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 dark:text-slate-400 group-focus-within:text-primary transition-colors">badge</span>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-12 pl-11 pr-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer transition-all shadow-sm"
              >
                <option disabled className="dark:bg-slate-800">Pilih peran Anda</option>
                <option value="admin" className="dark:bg-slate-800">Admin</option>
                <option value="doctor" className="dark:bg-slate-800">Dokter</option>
                <option value="pharmacist" className="dark:bg-slate-800">Apoteker</option>
                <option value="cashier" className="dark:bg-slate-800">Kasir</option>
              </select>
               {/* UBAH WARNA: Panah dropdown jadi lebih terang */}
              <span className="material-symbols-outlined absolute right-3.5 text-slate-400 dark:text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors">expand_more</span>
            </div>
          </label>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl relative text-sm flex items-center gap-2 animate-pulse">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Submit Button - Efek hover dan shadow dipercantik */}
          <button 
            type="submit"
            disabled={isLoading}
            className="h-12 px-6 rounded-xl w-full bg-primary text-white font-bold text-base hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 focus:ring-4 focus:ring-primary/30 transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memproses...
              </span>
            ) : 'Login Masuk'}
          </button>
        </form>
      </div>
      {/* UBAH WARNA: Footer jadi lebih terang */}
      <p className="text-slate-500 dark:text-slate-400 text-xs mt-4">© 2024 Klinik Sentosa. All rights reserved.</p>
    </div>
  );
};

export default Login;