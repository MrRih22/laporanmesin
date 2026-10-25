import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

export default function DashboardMTC() {
  const [laporan, setLaporan] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua'); // 'Semua', 'Baru', 'Selesai'
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLaporan();

    const channel = supabase.channel('tabel-laporan-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'laporan_mesin' },
        (payload) => {
          setLaporan((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'laporan_mesin' },
        (payload) => {
          setLaporan((prev) =>
            prev.map((item) => (item.id === payload.new.id ? { ...item, ...payload.new } : item))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const jumlahBaru = laporan.filter((item) => item.status === 'Baru').length;
    if (jumlahBaru > 0) {
      document.title = `(${jumlahBaru}) Laporan Baru - MTC Command`;
    } else {
      document.title = 'MTC Dashboard Center | PT.Tatalogam Lestari';
    }
  }, [laporan]);

  const fetchLaporan = async () => {
    const { data } = await supabase
      .from('laporan_mesin')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLaporan(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSelesai = async (id) => {
    setLoadingId(id);
    // Optimistic UI Update agar instan
    setLaporan((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Selesai' } : item))
    );

    const { error } = await supabase
      .from('laporan_mesin')
      .update({ status: 'Selesai' })
      .eq('id', id);

    if (error) {
      alert('Gagal mengubah status: ' + error.message);
      setLaporan((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'Baru' } : item))
      );
    }
    setLoadingId(null);
  };

  const handleBroadcastWA = (item) => {
    const pesan = `* LAPORAN KERUSAKAN MESIN *%0A%0A*Mesin:* ${item.nama_mesin}%0A*Operator:* ${item.nama_operator}%0A*Waktu:* ${item.tanggal_rusak} | ${item.jam_rusak}%0A*Detail:* ${item.detail_kerusakan}%0A%0AMohon tim MTC segera merapat ke lokasi.`;
    window.open(`https://wa.me/?text=${pesan}`, '_blank');
  };

  // Filter & Pencarian Interaktif
  const filteredLaporan = laporan.filter((item) => {
    const matchesSearch = 
      item.nama_mesin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detail_kerusakan.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'Semua') return matchesSearch;
    return matchesSearch && item.status === filterStatus;
  });

  const totalLaporan = laporan.length;
  const jumlahMenunggu = laporan.filter((l) => l.status === 'Baru').length;
  const jumlahSelesai = laporan.filter((l) => l.status === 'Selesai').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/20 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Navbar Responsif Modern Glassmorphic */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-slate-200/80 flex items-center justify-center shadow-2xs">
                <img src="/talo.png" alt="Logo" className="h-6 sm:h-8 object-contain" onError={(e) => e.target.style.display='none'} />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5 sm:gap-2">
                  <span>MTC Dashboard Center</span>
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">PT Tatalogam Lestari • Maintenance Division</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="group flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all border border-slate-200 shadow-2xs hover:border-red-200 active:scale-95">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              <span>Keluar</span>
            </button>

          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Header & Metric Cards */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 sm:mb-8 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900">Dashboard Pemantauan Laporan </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Sistem manajemen tiket gangguan mesin pabrik secara real-time.</p>
          </div>

          {/* Tab Filter Statistik Interaktif (Responsif) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-200 w-full lg:w-auto">
            <button 
              onClick={() => setFilterStatus('Semua')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-center transition-all font-bold text-[11px] sm:text-xs ${filterStatus === 'Semua' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Semua ({totalLaporan})
            </button>
            <button 
              onClick={() => setFilterStatus('Baru')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-center transition-all font-bold text-[11px] sm:text-xs ${filterStatus === 'Baru' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Menunggu ({jumlahMenunggu})
            </button>
            <button 
              onClick={() => setFilterStatus('Selesai')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-center transition-all font-bold text-[11px] sm:text-xs ${filterStatus === 'Selesai' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Selesai ({jumlahSelesai})
            </button>
          </div>
        </div>

        {/* Toolbar: Search Input & Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="relative w-full sm:w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mesin, operator, atau kendala..." 
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold">
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
            Menampilkan <span className="text-slate-900 font-bold">{filteredLaporan.length}</span> Laporan
          </div>
        </div>

        {/* Grid Kartu Laporan Responsif */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredLaporan.map((item) => {
            const isBaru = item.status === 'Baru';
            return (
              <div 
                key={item.id} 
                className={`rounded-2xl transition-all duration-300 border flex flex-col overflow-hidden bg-white shadow-xs hover:shadow-xl hover:-translate-y-1 ${
                  isBaru 
                    ? 'border-red-300 ring-4 ring-red-500/5' 
                    : 'border-slate-200 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Indikator Garis Atas */}
                <div className={`h-1.5 w-full ${isBaru ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>

                {/* Card Header */}
                <div className={`p-4 sm:p-5 border-b flex justify-between items-start ${isBaru ? 'bg-red-50/40 border-red-100' : 'bg-slate-50/60 border-slate-100'}`}>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Mesin</span>
                    <h3 className={`text-base sm:text-lg font-black mt-0.5 ${isBaru ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                      {item.nama_mesin}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span>{item.tanggal_rusak} • {item.jam_rusak || '--:--'}</span>
                    </p>
                  </div>

                  {isBaru ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-red-100 text-red-700 border border-red-200 shadow-2xs shrink-0">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span> Baru
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      Selesai
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Nama Pelapor</span>
                      <p className="text-slate-800 font-semibold text-xs sm:text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                          {item.nama_operator ? item.nama_operator.charAt(0).toUpperCase() : 'O'}
                        </span>
                        <span className="truncate">{item.nama_operator}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Detail Kendala</span>
                      <div className="bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-200/80 text-slate-700 text-xs sm:text-sm leading-relaxed font-normal">
                        {item.detail_kerusakan}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons (Touch-Friendly) */}
                  <div className="pt-2 flex flex-col gap-2.5">
                    <button 
                      onClick={() => handleBroadcastWA(item)} 
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da84c] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs text-xs sm:text-sm active:scale-[0.98] group">
                      <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110 shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      <span>Kirim ke WhatsApp Tim</span>
                    </button>
                    
                    {isBaru && (
                      <button 
                        onClick={() => handleSelesai(item.id)} 
                        disabled={loadingId === item.id}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs text-xs sm:text-sm active:scale-[0.98] disabled:opacity-50">
                        {loadingId === item.id ? (
                          <span>Menyimpan...</span>
                        ) : (
                          <>
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                            <span>Tandai Selesai</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Kondisi Jika Laporan Kosong */}
          {filteredLaporan.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 sm:p-16 text-center shadow-xs">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
                <span className="text-2xl sm:text-3xl">🔍</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Tidak Ada Laporan Ditemukan</h3>
              <p className="text-slate-500 mt-1.5 max-w-sm mx-auto text-xs sm:text-sm">Coba ubah kata kunci pencarian atau sesuaikan filter status di atas.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}