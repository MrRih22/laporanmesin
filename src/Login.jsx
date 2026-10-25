import { useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      setErrorMsg(error.message || 'Gagal masuk. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/20 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Card Wrapper Dual-Pane Modern */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-200/80 w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all duration-300">
        
        {/* Pane Kiri: Branding & Informasi Korporat */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Efek dekoratif latar belakang */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner backdrop-blur-md">
                <img src="/talo.png" alt="Logo" className="h-6 object-contain brightness-0 invert" onError={(e) => e.target.style.display='none'} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-blue-200 uppercase">PT Tatalogam Lestari</span>
                <h1 className="text-sm font-bold text-white">Maintenance Division</h1>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
             Selamat Datang Di Portal Dashboard Center MTC
            </h2>
            <p className="text-blue-100/80 text-xs sm:text-sm mt-3 leading-relaxed">
              Sistem pemantauan dan manajemen tiket kerusakan mesin pabrik secara real-time untuk efisiensi produksi maksimal.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-xs text-blue-200/70 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Secure Enterprise Gateway
          </div>
        </div>

        {/* Pane Kanan: Form Login Interaktif */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Masuk ke Akun</h3>
          </div>

          {errorMsg && (
            <div className="p-4 mb-6 text-xs sm:text-sm font-bold rounded-2xl bg-red-50 text-red-800 border border-red-200 flex items-center gap-3 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Email Karyawan</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-2xs"
                placeholder="mtc@tatalogam.com" 
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-2xs"
                placeholder="••••••••" 
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-slate-900/10 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 text-sm tracking-wide flex items-center justify-center gap-2.5 group">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Memproses Autentikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Dashboard</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
