import { useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

export default function FormOperator() {
  const [formData, setFormData] = useState({
    nama_operator: '',
    nama_mesin: '',
    tanggal_rusak: new Date().toISOString().split('T')[0],
    jam_rusak: '',
    detail_kerusakan: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.from('laporan_mesin').insert([formData]);
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Tiket berhasil dikirim ke Divisi MTC!' });
      setFormData({
        nama_operator: '',
        nama_mesin: '',
        tanggal_rusak: new Date().toISOString().split('T')[0],
        jam_rusak: '',
        detail_kerusakan: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengirim tiket: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30 flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Container Utama */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 w-full max-w-xl overflow-hidden transition-all duration-300">
        
        {/* Header Responsif dengan Tombol Login */}
        <div className="px-5 sm:px-8 py-5 sm:py-7 bg-white border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-14 sm:h-14 bg-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md shadow-slate-900/10 shrink-0">
              <img src="/talo.png" alt="Logo" className="h-6 sm:h-8 object-contain brightness-0 invert" onError={(e) => e.target.style.display='none'} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-blue-600 uppercase">PT Tatalogam Lestari</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-tight">Maintenance Ticket System</h2>
            </div>
          </div>

          {/* Tombol Akses Login / Command Center untuk Tim MTC */}
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0"
            title="Masuk ke Dashboard MTC"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="hidden xs:inline">Login MTC</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-8 lg:p-10">
          
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Formulir Laporan Kerusakan Mesin</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">Laporkan kendala unit mesin dengan cepat dan akurat untuk penanganan langsung.</p>
          </div>

          {message.text && (
            <div className={`p-3.5 sm:p-4 mb-5 sm:mb-6 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl flex items-center gap-3 border animate-fadeIn ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${message.type === 'success' ? 'bg-emerald-600 animate-bounce' : 'bg-red-600'}`}></span>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Nama Operator */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Nama Pelapor / Operator</label>
                <div className={`relative rounded-xl transition-all ${activeCard === 'nama_operator' ? 'ring-2 ring-blue-600/20 border-blue-600' : 'border-slate-200'}`}>
                  <input 
                    type="text" 
                    name="nama_operator" 
                    value={formData.nama_operator} 
                    onChange={handleChange} 
                    onFocus={() => setActiveCard('nama_operator')}
                    onBlur={() => setActiveCard(null)}
                    autoComplete="off"
                    required
                    className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-3.5 sm:px-4 py-3 sm:py-3.5 text-slate-800 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none transition-all" 
                    placeholder="Contoh: Budi Santoso" 
                  />
                </div>
              </div>

              {/* Nama Mesin */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Identitas Mesin / Unit</label>
                <div className={`relative rounded-xl transition-all ${activeCard === 'nama_mesin' ? 'ring-2 ring-blue-600/20 border-blue-600' : 'border-slate-200'}`}>
                  <input 
                    type="text" 
                    name="nama_mesin" 
                    value={formData.nama_mesin} 
                    onChange={handleChange} 
                    onFocus={() => setActiveCard('nama_mesin')}
                    onBlur={() => setActiveCard(null)}
                    autoComplete="off"
                    required
                    className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-3.5 sm:px-4 py-3 sm:py-3.5 text-slate-800 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none transition-all" 
                    placeholder="Contoh: Roll Forming A" 
                  />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Tanggal */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Tanggal Kejadian</label>
                <input 
                  type="date" 
                  name="tanggal_rusak" 
                  value={formData.tanggal_rusak} 
                  onChange={handleChange} 
                  autoComplete="off"
                  required
                  className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-3.5 sm:px-4 py-3 sm:py-3.5 text-slate-800 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" 
                />
              </div>

              {/* Jam / Waktu Manual (--:--) */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Jam Kejadian (--:--)</label>
                <input 
                  type="time" 
                  name="jam_rusak" 
                  value={formData.jam_rusak} 
                  onChange={handleChange} 
                  autoComplete="off"
                  required
                  className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-3.5 sm:px-4 py-3 sm:py-3.5 text-slate-800 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400" 
                />
              </div>

            </div>

            {/* Detail Kerusakan */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Deskripsi Indikasi Kendala / Kerusakan</label>
              <textarea 
                name="detail_kerusakan" 
                value={formData.detail_kerusakan} 
                onChange={handleChange} 
                autoComplete="off"
                required 
                rows="3.5"
                className="w-full bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 sm:p-4 text-slate-800 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-none" 
                placeholder="Jelaskan kendala secara spesifik (contoh: Suara berdecit abnormal pada bagian gir transmisi)..."
              ></textarea>
            </div>
            
            {/* Submit Button */}
            <div className="pt-2 sm:pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-blue-600 active:bg-blue-700 text-white font-black py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl shadow-lg shadow-slate-900/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2.5 sm:gap-3 group">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Mengirim Tiket ke Sistem...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Laporan Kerusakan Mesin</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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
