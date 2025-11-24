import { useState } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminPages/AdminDashboard'; 
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  // 1. Jika belum login, tampilkan halaman Login
  if (!user) {
    return <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // 2. LOGIC ROUTING: Tentukan tampilan berdasarkan Role user
  
  // --- A. Jika Role = ADMIN ---
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  // --- B. Jika Role = DOKTER (Nanti kita buat) ---
  if (user.role === 'doctor') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">Halo, Dokter {user.name}</h1>
          <p className="mb-4">Modul Dokter sedang dalam pengembangan.</p>
          <button onClick={() => setUser(null)} className="text-red-500 underline">Logout</button>
        </div>
      </div>
    );
  }

  // --- C. Jika Role = LAINNYA (Apoteker/Kasir) ---
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-700">Halo, {user.name}</h1>
        <p className="mb-4">Anda login sebagai {user.role}. Modul belum tersedia.</p>
        <button onClick={() => setUser(null)} className="text-red-500 underline">Logout</button>
      </div>
    </div>
  );
}

export default App;