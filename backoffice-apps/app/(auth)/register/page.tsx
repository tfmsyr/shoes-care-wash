"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { signUpSchema } from "@/schemas/auth/authSchema";
import Input from "@/components/ui/Input";
import { register } from "@/services/auth";
import { Eye, EyeOff } from "lucide-react";

type SignUpData = z.infer<typeof signUpSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk Pop-up Sukses (Green Alert)
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    business_address: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.business_name.trim()) newErrors.business_name = "Business name is required";
    if (!formData.business_address.trim()) newErrors.business_address = "Address is required";
    
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d+$/.test(formData.phone)) newErrors.phone = "Phone must handle numbers only";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setShowSuccess(false);

    try {
      await register(formData);
      
      // Tampilkan Alert Hijau
      setShowSuccess(true);
      
      // Redirect ke login setelah 1.5 detik
      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (error: any) {
      setLoading(false); // Stop loading jika error
      const msg = error.response?.data?.message || 'Gagal mendaftar.';
      if (msg.toLowerCase().includes('phone')) setErrors(prev => ({ ...prev, phone: msg }));
      else alert(msg);
    } 
  };

  const getInputClass = (fieldName: string) => `
    w-full px-5 py-3.5 text-gray-600 rounded-xl border outline-none transition-all duration-200
    ${errors[fieldName] 
      ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-200' 
      : 'border-gray-300 bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100'}
  `;

  return (
    <>
      {/* Style untuk menyembunyikan icon mata bawaan browser agar tidak double */}
      <style jsx>{`
        .no-eye::-ms-reveal,
        .no-eye::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Alert Success Box (Hijau - Sesuai Gambar) */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex justify-between items-center animate-pulse">
          <span className="font-medium text-sm">Pendaftaran berhasil! Mengarahkan...</span>
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

      <h1 className="text-4xl font-bold text-[#0A2686] mb-8">Daftar</h1>
      
      <form onSubmit={handleRegister} className="space-y-4">
         {/* Name */}
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama</label>
            <input name="name" type="text" onChange={handleChange} className={getInputClass('name')} placeholder="Masukkan nama Anda" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
         </div>

         {/* Business Name */}
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Usaha</label>
            <input name="business_name" type="text" onChange={handleChange} className={getInputClass('business_name')} placeholder="Masukkan nama usaha" />
            {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
         </div>

         {/* Address */}
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Usaha</label>
            <input name="business_address" type="text" onChange={handleChange} className={getInputClass('business_address')} placeholder="Masukkan alamat usaha" />
            {errors.business_address && <p className="text-red-500 text-xs mt-1">{errors.business_address}</p>}
         </div>

         {/* Phone */}
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">No. HP</label>
            <input name="phone" type="tel" onChange={handleChange} className={getInputClass('phone')} placeholder="Masukkan no. HP" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
         </div>

         {/* Password */}
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kata Sandi</label>
            <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  onChange={handleChange} 
                  className={`${getInputClass('password')} pr-12 no-eye`} // Tambahkan class 'no-eye'
                  placeholder="Buat kata sandi" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 outline-none"
                >
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    )}
                </button>
            </div>
            {errors.password ? (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            ) : (
                <p className="text-gray-400 text-xs mt-1">Kata sandi minimal 8 karakter</p>
            )}
         </div>

         <button type="submit" disabled={loading} className="w-full bg-[#0A2686] text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition mt-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none">
            {loading ? 'Memproses...' : 'Daftar'}
         </button>

         <div className="text-center text-sm text-gray-500 mt-4">
            Sudah punya akun? <Link href="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
         </div>
      </form>
    </>
  );
}
