"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// --- TETAP PAKAI IMPORT DARI CLONE ---
import { loginSchema } from "@/schemas/auth/authSchema";
import { login } from "@/services/auth"; 
import Cookies from "js-cookie"; 

export default function LoginPage() {
  const router = useRouter();
  
  // State dasar
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk Error (Merah)
  const [alertError, setAlertError] = useState('');
  
  // State BARU untuk Pop-up Sukses (Hijau)
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlertError('');
    setShowSuccess(false); // Reset success alert saat submit ulang

    try {
      const res = await login(formData);
      
      // Simpan token
      localStorage.setItem('token', res.data.token);
      
      // --- PERUBAHAN DI SINI ---
      // Tampilkan Pop-up Hijau
      setShowSuccess(true);
      
      // Beri jeda sedikit agar user melihat pesan sukses sebelum redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error(error);
      setAlertError(error.response?.data?.message || 'Akun tidak ditemukan atau kata sandi salah.');
      setLoading(false); // Matikan loading jika error (jika sukses biarkan loading agar user tidak klik 2x)
    }
  };

  return (
    <>
      {/* === POP-UP SUKSES (SESUAI GAMBAR) === */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex justify-between items-center animate-fade-in-down">
          <span className="font-medium text-sm">Login berhasil.</span>
          <button 
            onClick={() => setShowSuccess(false)}
            className="text-green-600 hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <h1 className="text-4xl font-bold text-[#0A2686] mb-2">Login</h1>
      <p className="text-gray-500 mb-8">Selamat datang kembali! Silakan masukkan data Anda.</p>

      {/* Alert Error Box (Merah - Existing) */}
      {alertError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          {alertError}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Phone Input */}
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">No. HP <span className="text-red-500">*</span></label>
           <input 
             type="tel" 
             required
             className="w-full px-5 py-3.5 text-gray-600 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
             placeholder="Masukkan no. HP Anda"
             onChange={(e) => setFormData({...formData, phone: e.target.value})}
           />
        </div>
        
        {/* Password Input */}
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
           <div className="relative">
             <input 
               type={showPassword ? "text" : "password"}
               required
               className="w-full px-5 py-3.5 text-gray-600 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all pr-12"
               placeholder="Masukkan kata sandi Anda"
               onChange={(e) => setFormData({...formData, password: e.target.value})}
             />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-700"
             >
                {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                )}
             </button>
           </div>
        </div>

        <div className="flex items-center justify-between text-sm">
           <label className="flex items-center text-gray-500 cursor-pointer">
              <input type="checkbox" className=" mr-2 rounded text-blue-600 focus:ring-blue-500" />
              Ingat saya
           </label>
           <Link href="/forgot-password" className="text-blue-600 font-bold hover:underline">
              Lupa Kata Sandi?
           </Link>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#0A2686] text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none">
           {loading ? 'Sedang masuk...' : 'Login'}
        </button>
        
        <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t border-gray-100">
           Belum punya akun?{' '}
           <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Daftar sekarang
           </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">
            © 2025 Shoes Care - Semua Hak Dilindungi
        </p>
      </form>
    </>
  );
}
