import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

export default function DashboardMTC() {
    const [laporan, setLaporan] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [loadingId, setLoadingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Minta izin memunculkan notifikasi browser saat pertama kali buka dashboard
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        fetchLaporan();

        // Listener Realtime Supabase
        const channel = supabase.channel('tabel-laporan-realtime')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'laporan_mesin' },
            (payload) => {
                const laporanBaru = payload.new;
                setLaporan((prev) => [laporanBaru, ...prev]);

                // 1. Bunyikan Suara Notifikasi (Ala WhatsApp)
                playNotificationSound();

                // 2. Munculkan Pop-up Notifikasi Baris Baru di Layar HP
                showMobileNotification(laporanBaru);
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

    // Fungsi untuk memutar suara notifikasi
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notif.mp3'); // Pastikan file ada di folder public
            audio.play().catch((e) => console.log('Audio autoplay blocked:', e));
        } catch (err) {
            console.log('Gagal memutar suara:', err);
        }
    };

    // Fungsi untuk memunculkan Push Notification baru sebagai baris terpisah (Tidak menimpa)
    const showMobileNotification = (item) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification('🚨 Laporan Kerusakan Baru!', {
                        body: `Mesin: ${item.nama_mesin}\nPelapor: ${item.nama_operator}\nKendala: ${item.detail_kerusakan}`,
                        icon: '/talo.png',
                        badge: '/talo.png',
                        vibrate: [300, 100, 300, 100, 300],
                        tag: `mtc-alert-${item.id || Date.now()}`, // <--- TAG UNIK: Mencegah notifikasi lama tertimpa
                        renotify: true,
                        requireInteraction: true
                    });
                });
            } catch (err) {
                new Notification('🚨 Laporan Kerusakan Baru!', {
                    body: `Mesin: ${item.nama_mesin}\n${item.detail_kerusakan}`,
                    icon: '/talo.png',
                    tag: `mtc-alert-${Date.now()}`
                });
            }
        }
    };

    useEffect(() => {
        const jumlahBaru = laporan.filter((item) => item.status === 'Baru').length;
        if (jumlahBaru > 0) {
            document.title = `(${jumlahBaru}) Laporan Baru - MTC Dashboard`;
        } else {
            document.title = 'MTC Dashboard Center | PT. Tatalogam Lestari';
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
        const pesan = `*🚨 LAPORAN KERUSAKAN MESIN 🚨*%0A%0A*Mesin:* ${item.nama_mesin}%0A*Operator:* ${item.nama_operator}%0A*Waktu:* ${item.tanggal_rusak} | ${item.jam_rusak || '--:--'}%0A*Detail:* ${item.detail_kerusakan}%0A%0AMohon tim MTC segera merapat ke lokasi.`;
        window.open(`https://wa.me/?text=${pesan}`, '_blank');
    };

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
        
        {/* Navbar */}
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
                <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-slate-200/80 flex items-center justify-center shadow-2xs">
                    <img src="/talo.png" alt="Logo" className="h-6 sm:h-8 object-contain" onError={(e) => e.target.style.display='none'} />
                </div>
                <div>
                    <h1 className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5 sm:gap-2">
                    <span>MTC Command Center</span>
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">PT Tatalogam Lestari • Maintenance Division</p>
                </div>
                </div>
                
                <button 
                onClick={handleLogout} 
                className="group flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all border border-slate-200 shadow-2xs hover:border-red-200 active:scale-95">
                <span>Keluar</span>
                </button>
            </div>
            </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 sm:mb-8 pb-6 border-b border-slate-200">
            <div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900">Dashboard Pemantauan Laporan Mesin</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Sistem manajemen tiket gangguan mesin pabrik secara real-time.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                {/* Search Bar */}
                <div className="relative">
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari mesin, pelapor..."
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 w-full sm:w-64 shadow-2xs"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                    onClick={() => setFilterStatus('Semua')}
                    className={`px-3 py-2 rounded-xl text-center transition-all font-bold text-[11px] sm:text-xs ${filterStatus === 'Semua' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                    Semua ({totalLaporan})
                    </button>
                    <button 
                    onClick={() => setFilterStatus('Baru')}
                    className={`px-3 py-2 rounded-xl text-center transition-all font-bold text-[11px] sm:text-xs ${filterStatus === 'Baru' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                    Menunggu ({jumlahMenunggu})
                    </button>
                    <button 
                    onClick={() => setFilterStatus('Selesai')}
                    className={`px-3 py-2 rounded-xl text-center transition-all font-bold text-[11px] sm:text-xs ${filterStatus === 'Selesai' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                    Selesai ({jumlahSelesai})
                    </button>
                </div>
            </div>
            </div>

            {/* Grid Laporan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredLaporan.map((item) => {
                const isBaru = item.status === 'Baru';
                return (
                <div 
                    key={item.id} 
                    className={`rounded-2xl transition-all duration-300 border flex flex-col overflow-hidden bg-white shadow-xs hover:shadow-xl hover:-translate-y-1 ${
                    isBaru ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                >
                    <div className={`h-1.5 w-full ${isBaru ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>

                    <div className={`p-4 sm:p-5 border-b flex justify-between items-start ${isBaru ? 'bg-red-50/40 border-red-100' : 'bg-slate-50/60 border-slate-100'}`}>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Mesin</span>
                        <h3 className={`text-base sm:text-lg font-black mt-0.5 ${isBaru ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                        {item.nama_mesin}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                            <span>{item.tanggal_rusak} • {item.jam_rusak || '--:--'}</span>
                        </p>
                    </div>

                    {isBaru ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-red-100 text-red-700 border border-red-200 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span> Baru
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                        Selesai
                        </span>
                    )}
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                        <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Nama Pelapor</span>
                        <p className="text-slate-800 font-semibold text-xs sm:text-sm">{item.nama_operator}</p>
                        </div>
                        <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Detail Kendala</span>
                        <div className="bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-200/80 text-slate-700 text-xs sm:text-sm leading-relaxed">
                            {item.detail_kerusakan}
                        </div>
                        </div>
                    </div>
                    
                    <div className="pt-2 flex flex-col gap-2.5">
                        <button 
                        onClick={() => handleBroadcastWA(item)} 
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.98]">
                        Kirim ke WhatsApp Tim
                        </button>
                        
                        {isBaru && (
                        <button 
                            onClick={() => handleSelesai(item.id)} 
                            disabled={loadingId === item.id}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.98]">
                            {loadingId === item.id ? 'Menyimpan...' : 'Tandai Selesai'}
                        </button>
                        )}
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
        </main>
        </div>
    );
}
