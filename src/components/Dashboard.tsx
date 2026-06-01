import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BackgroundOrbs from './BackgroundOrbs';
import Sidebar from './Sidebar';
import StudentTable from './StudentTable';
import AcademicCalendar from './AkademikKalender';
import logoKampus from '../assets/Logo_Technova_University.png';
import imgGedung from '../assets/Gedung Utama.png';
import imgHalaman from '../assets/Halaman Depan Kampus.png';
import imgKantin from '../assets/Kantin.png';
import imgKelas from '../assets/Kelas.png';
import imgParkiran from '../assets/Parkiran Kampus.png';
import imgToilet from '../assets/Toilet Kampus.png';
import imgMaskot from '../assets/Ikon Chatbot.png';

const useCountUp = (target: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(target);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
};

const useCountUpFloat = (target: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((target * eased).toFixed(2)));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(target);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
};

interface DashboardProps {
  onLogout: () => void;
}

interface StudentData {
  nim: string;
  nama: string;
  jurusan: string;
  semester: string;
  status: string;
  ipk: number;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || 'Admin');
  const [isLightMode, setIsLightMode] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, text: 'Halo! Saya TechBot 🤖. Ada yang bisa saya bantu seputar TechNova University?', sender: 'bot' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const accountRef = useRef<HTMLDivElement>(null);

  // === STATE & FUNGSI UNTUK AGENDA KAMPUS DINAMIS ===
  const [agendas, setAgendas] = useState([
    { id: 1, title: 'Seminar Nasional AI & Web 3.0', date: '5 Juni 2026', loc: 'Auditorium Utama', type: 'Seminar', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { id: 2, title: 'Pekan Olahraga Teknik (PORSENI)', date: '12 - 15 Juni 2026', loc: 'Lapangan Olahraga', type: 'Kegiatan', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { id: 3, title: 'Campus Hiring & Tech Job Fair', date: '20 Juni 2026', loc: 'Gedung Serbaguna', type: 'Karir', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  ]);
  const [newAgenda, setNewAgenda] = useState({ title: '', date: '', loc: '', type: 'Seminar' });

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
        setShowChangePassword(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isBotTyping, isChatOpen]);

  const [students, setStudents] = useState<StudentData[]>([]);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Login Berhasil', desc: 'Selamat datang kembali di sistem TechNova.', time: 'Sistem', type: 'info' }
  ]);

  const addNotification = (title: string, desc: string, type: string) => {
    setNotifications(prev => [{ id: Date.now(), title, desc, time: 'Baru saja', type }, ...prev]);
  };

  useEffect(() => {
    fetch('https://tech-nova-backend.vercel.app/api/mahasiswa')
      .then(res => res.json())
      .then(data => {
        const actualData = data && data.data ? data.data : (Array.isArray(data) ? data : []);
        setStudents(actualData);
      })
      .catch(() => setStudents([]));
  }, [activeMenu]);

  const stats = [
    { label: 'Total Mahasiswa', value: students.length, icon: '🎓', color: 'from-cyan-400/20 to-cyan-400/5', borderColor: 'border-cyan-400/20', textColor: 'text-cyan-400' },
    { label: 'Mahasiswa Aktif', value: students.filter(s => s.status === 'Aktif').length, icon: '✅', color: 'from-emerald-400/20 to-emerald-400/5', borderColor: 'border-emerald-400/20', textColor: 'text-emerald-400' },
    { label: 'IPK Rata-rata', value: students.length > 0 ? (students.reduce((a, b) => a + Number(b.ipk), 0) / students.length).toFixed(2) : "0.00", icon: '📊', color: 'from-purple-400/20 to-purple-400/5', borderColor: 'border-purple-400/20', textColor: 'text-purple-400' },
    { label: 'Mahasiswa Lulus', value: students.filter(s => s.status === 'Lulus').length, icon: '🏆', color: 'from-amber-400/20 to-amber-400/5', borderColor: 'border-amber-400/20', textColor: 'text-amber-400' },
  ];

  const animatedTotal = useCountUp(students.length);
  const animatedAktif = useCountUp(students.filter(s => s.status === 'Aktif').length);
  const animatedLulus = useCountUp(students.filter(s => s.status === 'Lulus').length);
  const animatedIpk = useCountUpFloat(students.length > 0 ? parseFloat((students.reduce((a, b) => a + Number(b.ipk), 0) / students.length).toFixed(2)) : 0);

  // === DATA UNTUK RECHARTS DONUT ===
  const totalMhs = students.length;
  const aktifMhs = students.filter(s => s.status === 'Aktif').length;
  const lulusMhs = students.filter(s => s.status === 'Lulus').length;
  
  const aktifPersen = totalMhs === 0 ? 0 : Math.round((aktifMhs / totalMhs) * 100);

  const chartData = [
    { name: 'Aktif', value: aktifMhs, color: '#10b981' }, 
    { name: 'Lulus', value: lulusMhs, color: '#f59e0b' }  
  ].filter(item => item.value > 0);

  const defaultChartData = [{ name: 'Belum Ada Data', value: 1, color: '#334155' }];

  // === STATE & EFFECT UNTUK GRAFIK REAL-TIME LINE CHART ===
  const [trendData, setTrendData] = useState<{ time: string; active: number }[]>([]);

  useEffect(() => {
    const currentActiveCount = students.filter(s => s.status === 'Aktif').length;
    
    setTrendData(prev => {
      if (prev.length === 0) {
        return Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(Date.now() - (7 - i) * 3000);
          return {
            time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`,
            active: currentActiveCount
          };
        });
      }
      return prev;
    });

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setTrendData(prev => {
        const newData = [...prev, { time: timeStr, active: currentActiveCount }];
        return newData.slice(-7); 
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [students]); 

  const handleSendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSendingMsg(true); 
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('https://tech-nova-backend.vercel.app/api/contact', { method: 'POST', body: formData });
      const result = await response.json();
      
      setTimeout(() => {
        if (response.ok) {
          alert("Mantap! Pesan berhasil dikirim! 🚀");
          addNotification('Pesan Terkirim', 'Laporan kendala telah diteruskan.', 'success');
          (e.target as HTMLFormElement).reset();
          setFileName(null);
        } else {
          alert(result.message || "Gagal mengirim pesan.");
          addNotification('Gagal Terkirim', 'Silakan coba lagi.', 'warning');
        }
        setIsSendingMsg(false); 
      }, 1500);

    } catch {
      setTimeout(() => {
        alert("Gagal mengirim pesan. Pastikan backend menyala.");
        addNotification('Gagal Terkirim', 'Koneksi terputus.', 'warning');
        setIsSendingMsg(false);
      }, 1500);
    }
  };

  // === FUNGSI TAMBAH AGENDA ===
  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    let color = 'text-sky-400';
    let bg = 'bg-sky-500/10 border-sky-500/20';
    
    if (newAgenda.type === 'Seminar') { color = 'text-purple-400'; bg = 'bg-purple-500/10 border-purple-500/20'; }
    if (newAgenda.type === 'Kegiatan') { color = 'text-emerald-400'; bg = 'bg-emerald-500/10 border-emerald-500/20'; }
    if (newAgenda.type === 'Karir') { color = 'text-amber-400'; bg = 'bg-amber-500/10 border-amber-500/20'; }
    if (newAgenda.type === 'Penting') { color = 'text-rose-400'; bg = 'bg-rose-500/10 border-rose-500/20'; }

    const agendaItem = { ...newAgenda, id: Date.now(), color, bg };
    setAgendas([agendaItem, ...agendas]);
    addNotification('Agenda Ditambahkan', `${newAgenda.title} berhasil diterbitkan.`, 'success');
    setNewAgenda({ title: '', date: '', loc: '', type: 'Seminar' }); // Reset Form
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName(null);
    }
  };

  const handleLogoutWithAnimation = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      onLogout();
    }, 1500);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setChatInput('');
    setIsBotTyping(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Kamu adalah TechBot, asisten virtual kampus TechNova University.Jawab pertanyaan seputar akademik, jadwal kuliah, nilai, UKT, beasiswa, dan administrasi kampus secara ramah dan ringkas dalam Bahasa Indonesia.`,
            },
            { role: 'user', content: userText },
          ],
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      const botReply = data?.choices?.[0]?.message?.content
        ?? 'Maaf, saya tidak bisa memproses pertanyaan kamu saat ini. Coba lagi ya!';

      setChatMessages(prev => [...prev, { id: Date.now(), text: botReply, sender: 'bot' }]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        { id: Date.now(), text: 'Koneksi bermasalah. Pastikan API key Groq sudah terpasang.', sender: 'bot' },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const userName = userEmail.split('@')[0];
  const userId = 'TN-' + userEmail.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <div
      className="flex min-h-screen bg-[#050510]"
      style={{ filter: isLightMode ? 'invert(1) hue-rotate(180deg)' : 'none', transition: 'filter 0.5s ease' }}
    >
      <Sidebar
        activeMenu={activeMenu}
        onMenuClick={setActiveMenu}
        isMobileOpen={sidebarMobileOpen}
        onMobileClose={() => setSidebarMobileOpen(false)}
        isLightMode={isLightMode}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <BackgroundOrbs />

        <header className="relative z-30 bg-[#0a0a20]/80 backdrop-blur-xl border-b border-white/[0.06] shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarMobileOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center gap-1.5 hover:bg-white/[0.08] transition-all duration-300 group"
              >
                <span className="w-4 h-0.5 bg-slate-400 group-hover:bg-cyan-400 transition-colors rounded-full" />
                <span className="w-3 h-0.5 bg-slate-400 group-hover:bg-cyan-400 transition-colors rounded-full" />
                <span className="w-4 h-0.5 bg-slate-400 group-hover:bg-cyan-400 transition-colors rounded-full" />
              </button>
              <h1 className="font-[Outfit] font-bold text-white text-lg leading-tight">
                TechNova <span className="gradient-text">University</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLightMode(!isLightMode)}
                className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 hover:bg-white/[0.08] transition-all duration-300"
              >
                {isLightMode ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => { setIsNotifOpen(!isNotifOpen); setIsAccountOpen(false); }}
                  className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 ${isNotifOpen ? 'bg-white/[0.08] text-white border-cyan-400/30' : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white hover:bg-white/[0.08]'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                  </svg>
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.6)] animate-pulse" />
                </button>
                {isNotifOpen && (
                  <div className="absolute top-14 right-0 w-80 bg-[#0a0a20]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
                      <h3 className="font-[Outfit] font-semibold text-white text-sm">Notifikasi</h3>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-full font-bold border border-cyan-500/20">{notifications.length} Baru</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className="px-4 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors cursor-pointer flex gap-3 group">
                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.type === 'success' ? 'bg-emerald-400' : notif.type === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                          <div>
                            <h4 className="text-sm font-medium text-white mb-0.5">{notif.title}</h4>
                            <p className="text-xs text-slate-400">{notif.desc}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 text-center border-t border-white/[0.06]">
                      <button onClick={() => setIsNotifOpen(false)} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">Tutup Notifikasi</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => { setIsAccountOpen(!isAccountOpen); setIsNotifOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${isAccountOpen ? 'bg-white/[0.08] border-cyan-400/30' : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]'}`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                    {userName.charAt(0)}
                  </div>
                  <span className="text-sm text-white font-medium hidden sm:block">{userName}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {isAccountOpen && (
                  <div className="absolute top-14 right-0 w-72 bg-[#0a0a20]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
                    <div className="px-4 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg uppercase">
                          {userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm capitalize">{userName}</p>
                          <p className="text-slate-400 text-xs">{userEmail}</p>
                          <p className="text-cyan-400 text-[10px] font-mono mt-0.5">ID: {userId}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      {!showChangePassword ? (
                        <button
                          onClick={() => setShowChangePassword(true)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all text-sm"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          Ganti Password
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-400 mb-2">Password Baru</p>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Masukkan password baru..."
                            className="w-full bg-slate-800 border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400/50"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => { setShowChangePassword(false); setNewPassword(''); }} className="flex-1 py-1.5 text-xs text-slate-400 bg-white/[0.04] rounded-lg hover:bg-white/[0.08] transition-all">Batal</button>
                            <button
                              onClick={() => {
                                if (newPassword.length < 6) { alert('Password minimal 6 karakter!'); return; }
                                alert('Password berhasil diubah! (simulasi)');
                                setShowChangePassword(false);
                                setNewPassword('');
                              }}
                              className="flex-1 py-1.5 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-all"
                            >Simpan</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-3">
                      <button
                        onClick={handleLogoutWithAnimation}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-400/10 transition-all text-sm"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 px-6 py-8 overflow-y-auto lg:ml-0 pb-24">
          <div className="max-w-6xl mx-auto">

            {activeMenu === 'beranda' && (
              <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold font-[Outfit] text-white mb-2">
                    Selamat Datang <span className="gradient-text capitalize">{userName}</span> 
                  </h2>
                  <p className="text-slate-400">Berikut ringkasan data mahasiswa dari Database Python</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                  {stats.map((stat, i) => (
                    <div 
                      key={stat.label} 
                      className={`glass rounded-3xl p-6 border ${stat.borderColor} relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)] cursor-pointer`} 
                      style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both` }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0`} />
                      <div className="absolute top-0 -left-[100%] h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500`}>
                            {stat.icon}
                          </div>
                          <span className={`text-4xl font-extrabold font-[Outfit] tracking-tight ${stat.textColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:scale-110 transition-transform duration-500`}>
                            {stat.label === 'Total Mahasiswa' ? animatedTotal
                              : stat.label === 'Mahasiswa Aktif' ? animatedAktif
                              : stat.label === 'Mahasiswa Lulus' ? animatedLulus
                              : animatedIpk.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">{stat.label}</p>
                          <div className={`w-2 h-2 rounded-full ${stat.textColor.replace('text-', 'bg-')} animate-pulse opacity-50 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_currentColor]`}></div>
                        </div>
                      </div>
                      <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ease-out ${stat.textColor.replace('text-', 'bg-')}`}></div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-start">
                  
                  {/* Kolom Kiri: Donut Chart + Realtime Chart */}
                  <div className="flex flex-col gap-6 w-full h-full">
                    {/* === KOTAK TARGET MAHASISWA (UI DONAT RECHARTS) === */}
                    <div className="glass rounded-3xl p-7 border border-white/[0.06] hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,229,255,0.15)] transition-all duration-500 relative overflow-hidden group h-fit">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                      <div className="relative z-10">
                        <h3 className="font-[Outfit] font-semibold text-white text-xl mb-6 flex items-center gap-2">
                          📊 <span className="group-hover:text-cyan-400 transition-colors duration-300">Target Mahasiswa</span>
                        </h3>
                        
                        <div className="flex flex-col items-center gap-8">
                          {/* Atas: Diagram Donat */}
                          <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={chartData.length > 0 ? chartData : defaultChartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={65}
                                  outerRadius={90}
                                  paddingAngle={5}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {(chartData.length > 0 ? chartData : defaultChartData).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  offset={80}
                                  allowEscapeViewBox={{ x: true, y: true }}
                                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                  cursor={{fill: 'transparent'}}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            {/* Teks Persentase di Tengah Donat */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-4xl font-bold text-white leading-none mb-1">{aktifPersen}%</span>
                              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">AKTIF</span>
                            </div>
                          </div>

                          {/* Bawah: Kotak Statistik Sejajar */}
                          <div className="grid grid-cols-3 gap-3 w-full">
                            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 transition-all hover:bg-white/[0.06] flex flex-col items-center text-center justify-center group/card">
                              <p className="text-[9px] text-slate-400 font-bold mb-1.5 tracking-wider group-hover/card:text-cyan-400 transition-colors uppercase">TOTAL</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-white leading-none">{totalMhs}</span>
                                <span className="text-[10px] text-slate-500 font-medium">/ 50</span>
                              </div>
                            </div>
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 transition-all hover:bg-emerald-500/10 flex flex-col items-center text-center justify-center group/card">
                              <p className="text-[9px] text-emerald-500/80 font-bold mb-1.5 tracking-wider group-hover/card:text-emerald-400 transition-colors uppercase">AKTIF</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-emerald-400 leading-none">{aktifMhs}</span>
                                <span className="text-[10px] text-emerald-500/50 font-medium">/ {totalMhs || 1}</span>
                              </div>
                            </div>
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 transition-all hover:bg-amber-500/10 flex flex-col items-center text-center justify-center group/card">
                              <p className="text-[9px] text-amber-500/80 font-bold mb-1.5 tracking-wider group-hover/card:text-amber-400 transition-colors uppercase">LULUS</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-amber-400 leading-none">{lulusMhs}</span>
                                <span className="text-[10px] text-amber-500/50 font-medium">/ {totalMhs || 1}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* === KOTAK GRAFIK KARTESIUS REAL-TIME === */}
                    <div className="glass rounded-3xl p-6 border border-white/[0.06] relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 flex-1 flex flex-col shadow-[0_15px_40px_-10px_rgba(16,185,129,0.1)]">
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <h3 className="font-[Outfit] font-semibold text-white text-lg flex items-center gap-2">
                          📈 <span className="group-hover:text-emerald-400 transition-colors duration-300">Live Tracker Aktif</span>
                        </h3>
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                          <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold">Real-time</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-6">Memonitor jumlah mahasiswa aktif secara langsung setiap 3 detik.</p>
                      
                      <div className="flex-1 w-full relative z-10 -ml-4 min-h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} tick={{fill: '#94a3b8'}} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tick={{fill: '#94a3b8'}} allowDecimals={false} domain={['dataMin - 1', 'dataMax + 1']} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: '12px', fontSize: '12px', backdropFilter: 'blur(10px)' }}
                              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="active" 
                              name="Mahasiswa Aktif"
                              stroke="#10b981" 
                              strokeWidth={3} 
                              dot={{ r: 4, fill: '#0a0a20', stroke: '#10b981', strokeWidth: 2 }} 
                              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                              animationDuration={500}
                              isAnimationActive={true}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan: Kalender Akademik */}
                  <div className="glass rounded-3xl p-7 border border-white/[0.06] hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(168,85,247,0.15)] transition-all duration-500 relative overflow-hidden group h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                    <div className="relative z-10">
                      <h3 className="font-[Outfit] font-semibold text-white text-xl mb-6 flex items-center gap-2">
                        📅 <span className="group-hover:text-purple-400 transition-colors duration-300">Kalender Akademik</span>
                      </h3>
                      <AcademicCalendar />
                    </div>
                  </div>
                </div>

                {/* === BARIS BAWAH: AGENDA KAMPUS (FULL WIDTH) === */}
                <div className="glass rounded-3xl p-7 border border-white/[0.06] hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(56,189,248,0.15)] transition-all duration-500 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-[Outfit] font-semibold text-white text-xl flex items-center gap-2">
                        📢 <span className="group-hover:text-sky-400 transition-colors duration-300">Agenda Kampus</span>
                      </h3>
                      <button onClick={() => setActiveMenu('agenda')} className="text-sm px-4 py-2 bg-sky-400/10 text-sky-400 rounded-xl hover:bg-sky-400/20 hover:scale-105 transition-all flex items-center gap-2 font-medium">
                        Lihat Semua
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {agendas.slice(0, 3).map((info, idx) => (
                        <div key={info.id || idx} className="flex flex-col gap-4 items-start p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-sky-400/30 transition-all duration-300 cursor-pointer hover:-translate-y-1">
                          <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${info.bg} ${info.color} whitespace-nowrap`}>
                            {info.type}
                          </div>
                          <div>
                            <p className="text-base font-semibold text-white mb-3 leading-snug group-hover:text-sky-300 transition-colors">{info.title}</p>
                            <div className="flex flex-col gap-2.5">
                              <p className="text-xs text-slate-400 flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                {info.date}
                              </p>
                              <p className="text-xs text-slate-400 flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                {info.loc}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {agendas.length === 0 && <p className="text-slate-500 text-sm italic col-span-3 text-center py-6">Belum ada agenda kampus.</p>}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* === MENU BARU: MANAJEMEN AGENDA === */}
            {activeMenu === 'agenda' && (
              <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold font-[Outfit] text-white mb-2">Manajemen <span className="gradient-text">Agenda Kampus</span></h2>
                    <p className="text-slate-400">Tambahkan dan kelola pengumuman kegiatan universitas</p>
                  </div>
                  <button onClick={() => setActiveMenu('beranda')} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Kembali
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Kolom Kiri: Form Tambah Agenda */}
                  <div className="lg:col-span-1 glass rounded-3xl p-7 border border-white/[0.06] sticky top-6">
                    <h3 className="text-xl font-bold font-[Outfit] text-white mb-5 flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      Tambah Agenda Baru
                    </h3>
                    
                    <form onSubmit={handleAddAgenda} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Judul Kegiatan</label>
                        <input type="text" required value={newAgenda.title} onChange={e => setNewAgenda({...newAgenda, title: e.target.value})} placeholder="Contoh: Kuliah Umum AI..." className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Tanggal Pelaksanaan</label>
                        <input type="text" required value={newAgenda.date} onChange={e => setNewAgenda({...newAgenda, date: e.target.value})} placeholder="Contoh: 10 Juli 2026" className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Lokasi / Tempat</label>
                        <input type="text" required value={newAgenda.loc} onChange={e => setNewAgenda({...newAgenda, loc: e.target.value})} placeholder="Contoh: Aula Gedung A" className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Kategori</label>
                        <select value={newAgenda.type} onChange={e => setNewAgenda({...newAgenda, type: e.target.value})} className="w-full px-4 py-3 bg-slate-900 border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all appearance-none cursor-pointer">
                          <option value="Seminar">Seminar</option>
                          <option value="Kegiatan">Kegiatan</option>
                          <option value="Karir">Karir</option>
                          <option value="Penting">Penting</option>
                        </select>
                      </div>
                      <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all duration-300">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Terbitkan Agenda
                      </button>
                    </form>
                  </div>

                  {/* Kolom Kanan: Daftar Seluruh Agenda */}
                  <div className="lg:col-span-2 glass rounded-3xl p-7 border border-white/[0.06]">
                     <h3 className="text-xl font-bold font-[Outfit] text-white mb-6 flex items-center gap-2">
                        📋 Daftar Seluruh Agenda
                     </h3>
                     
                     <div className="space-y-4">
                       {agendas.map((info, idx) => (
                         <div key={info.id || idx} className="flex flex-col sm:flex-row gap-5 items-start sm:items-center p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`px-2.5 py-1 rounded-md border text-[9px] font-bold uppercase tracking-wider ${info.bg} ${info.color}`}>
                                  {info.type}
                                </div>
                                <span className="text-xs text-slate-500 font-mono">ID: #{info.id || 'SYS'}</span>
                              </div>
                              <p className="text-lg font-semibold text-white mb-2 leading-tight group-hover:text-cyan-300 transition-colors">{info.title}</p>
                              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>{info.date}</span>
                                <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>{info.loc}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                setAgendas(agendas.filter(a => a.id !== info.id));
                                addNotification('Agenda Dihapus', 'Agenda telah ditarik dari sistem.', 'info');
                              }}
                              className="shrink-0 w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                              title="Hapus Agenda"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                         </div>
                       ))}
                       {agendas.length === 0 && (
                         <div className="text-center py-10">
                           <p className="text-slate-500 mb-1">Tidak ada agenda saat ini.</p>
                           <p className="text-xs text-slate-600">Gunakan form di samping untuk menambahkan agenda baru.</p>
                         </div>
                       )}
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'pencarian' && (
              <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold font-[Outfit] text-white mb-2">Pencarian <span className="gradient-text">Data Mahasiswa</span></h2>
                  <p className="text-slate-400">Kelola dan cari data mahasiswa TechNova University</p>
                </div>
                <StudentTable onNotify={addNotification} />
              </div>
            )}

            {activeMenu === 'about' && (
              <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                <div className="max-w-5xl mx-auto pb-20">
                  
                  {/* --- HEADER LOGO --- */}
                  <div className="text-center mb-16">
                    <div className="relative inline-block">
                       <div className="absolute inset-0 bg-cyan-500/20 blur-[50px] rounded-full"></div>
                       <img 
                        src={logoKampus} 
                        alt="Logo Kampus" 
                        className="w-48 h-auto object-contain mx-auto mb-4 relative z-10 drop-shadow-[0_0_30px_rgba(0,229,255,0.4)]" 
                        style={{ filter: isLightMode ? 'invert(1) hue-rotate(180deg)' : 'none' }} 
                      />
                    </div>
                    <h2 className="text-5xl font-bold font-[Outfit] gradient-text mb-2">TechNova University</h2>
                    <p className="text-slate-400 text-lg tracking-[0.2em] uppercase font-light">Membentuk Generasi Digital Masa Depan</p>
                  </div>

                  <div className="space-y-8">
                    
                    {/* --- VISI & MISI --- */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-10 backdrop-blur-md relative overflow-hidden group hover:border-cyan-400/30 transition-all duration-500">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors"></div>
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-cyan-400"></span>
                        Visi & Misi
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-lg font-light">
                        TechNova University adalah platform sistem informasi akademik modern yang dirancang untuk mengelola data mahasiswa secara efisien menggunakan teknologi terbaru. Kami mengintegrasikan algoritma pemrograman fundamental dengan antarmuka pengguna yang futuristik untuk menciptakan pengalaman akademik yang tak terlupakan.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* --- ALGORITMA CARD --- */}
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-8 hover:bg-white/[0.05] transition-all group">
                        <div className="w-14 h-14 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-4">Core Algorithms</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Linear Search', 'Binary Search'].map((algo) => (
                            <span key={algo} className="px-3 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-slate-400 group-hover:text-cyan-300 transition-colors">{algo}</span>
                          ))}
                        </div>
                        <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                          Sistem ini mengimplementasikan berbagai algoritma pencarian dan pengurutan untuk memastikan efisiensi pemrosesan data mahasiswa skala besar.
                        </p>
                      </div>

                      {/* --- TECH STACK CARD --- */}
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-8 hover:bg-white/[0.05] transition-all group">
                        <div className="w-14 h-14 bg-purple-400/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-4">Tech Stack</h4>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                            <i className="fa-brands fa-react animate-spin-slow"></i> React.js
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                            <i className="fa-solid fa-bolt"></i> Vite
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.1)]">
                            <i className="fa-brands fa-css3-alt"></i> Tailwind
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                            <i className="fa-brands fa-python"></i> Flask API
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-5 leading-relaxed">
                          Dibangun menggunakan ekosistem JavaScript modern di sisi frontend dan skalabilitas Python di sisi backend.
                        </p>
                      </div>
                    </div>

                    {/* --- GALERI FASILITAS --- */}
                    <div className="mt-16 pt-12 border-t border-white/[0.06]">
                      <div className="text-center mb-10">
                        <h3 className="text-3xl font-bold font-[Outfit] text-white">Jelajahi <span className="gradient-text">Kampus Kami</span></h3>
                        <p className="text-slate-500 text-sm mt-2 font-light">Lingkungan belajar yang inspiratif dengan teknologi mutakhir.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { title: "Gedung Utama", desc: "Pusat administrasi dan rektorat megah.", src: imgGedung },
                          { title: "Halaman Depan", desc: "Area terbuka hijau untuk diskusi santai.", src: imgHalaman },
                          { title: "Fasilitas Kelas Modern", desc: "Dilengkapi perangkat smart-classroom.", src: imgKelas },
                          { title: "Kantin Digital", desc: "Sistem pembayaran cashless terintegrasi.", src: imgKantin },
                          { title: "Smart Parking", desc: "Sistem parkir otomatis berbasis AI.", src: imgParkiran },
                          { title: "Smart Toilet", desc: "Fasilitas bersih dengan sensor otomatis.", src: imgToilet },
                        ].map((item, index) => (
                          <div key={index} className="group relative rounded-[2rem] overflow-hidden border border-white/[0.08] aspect-[4/3] cursor-pointer bg-black">
                            <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 opacity-70 group-hover:opacity-100" />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                            
                            <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                               <div className="w-10 h-1 bg-cyan-400 rounded-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100"></div>
                               <h4 className="text-white font-bold font-[Outfit] text-xl mb-1">{item.title}</h4>
                               <p className="text-slate-300 text-xs font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* --- MEET THE DEVELOPER --- */}
                    <div className="mt-20 pt-16 flex flex-col items-center">
                       <div className="text-center mb-10">
                          <h3 className="text-2xl font-bold font-[Outfit] text-white">Meet the <span className="gradient-text">Developer</span></h3>
                       </div>
                       
                       <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                          
                          <div className="relative w-full max-w-md bg-[#0a0a20]/90 border border-white/[0.1] rounded-[2.5rem] p-8 backdrop-blur-2xl flex flex-col sm:flex-row items-center gap-8 shadow-2xl">
                             <div className="relative">
                                <div className="w-24 h-24 rounded-full border-2 border-cyan-400/50 p-1 group-hover:rotate-12 transition-transform duration-500">
                                   <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                                      <span className="text-3xl">👨‍💻</span>
                                   </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[#0a0a20] rounded-full animate-pulse"></div>
                             </div>
                             
                             <div className="flex-1 text-center sm:text-left">
                                <h4 className="text-2xl font-bold text-white font-[Outfit] mb-1">{userName}</h4>
                                <p className="text-cyan-400 text-sm font-mono mb-3 uppercase tracking-tighter">Student @ Teknik Informatika</p>
                                <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                                   <div className="flex items-center gap-2 justify-center sm:justify-start">
                                      <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                                      Universitas Pamulang
                                   </div>
                                   <div className="flex items-center gap-2 justify-center sm:justify-start">
                                      <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                                      Web Application Engineer
                                   </div>
                                </div>
                                
                                <div className="flex gap-3 mt-5 justify-center sm:justify-start">
                                   <button className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white hover:bg-cyan-500/20 transition-all"><i className="fa-brands fa-github text-sm"></i></button>
                                   <button className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-500/20 transition-all"><i className="fa-brands fa-linkedin-in text-sm"></i></button>
                                   <button className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white hover:bg-pink-500/20 transition-all"><i className="fa-brands fa-instagram text-sm"></i></button>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'contact' && (
              <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                <div className="max-w-6xl mx-auto">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="pr-0 lg:pr-8">
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold font-[Outfit] text-white mb-2">
                          Hubungi <span className="gradient-text">Kami</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Punya kendala sistem, pertanyaan seputar akademik, atau butuh bantuan teknis? Tim administrasi TechNova siap membantu Anda.
                        </p>
                      </div>

                      <div className="space-y-4 mb-10">
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-cyan-400/30 transition-all group">
                          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">Alamat Kampus</h4>
                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Gedung Utama Jl. Teknologi No. 1,<br/>Tangerang Selatan, Banten, Indonesia.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-purple-400/30 transition-all group">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">Email Support</h4>
                            <p className="text-slate-400 text-xs mt-1.5">support@technova.ac.id<br/>admin.akademik@technova.ac.id</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold font-[Outfit] text-white mb-4 flex items-center gap-2">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          Frequently Asked Questions
                        </h3>
                        <div className="space-y-3">
                          {[
                            { q: "Bagaimana cara mereset password?", a: "Gunakan fitur 'Lupa Password' di halaman login. Sistem akan mengirimkan OTP ke email Anda." },
                            { q: "Kapan data mahasiswa di-update?", a: "Sistem TechNova melakukan sinkronisasi otomatis dengan server Python setiap kali halaman dimuat." },
                            { q: "Apakah algoritma sorting bisa diexport?", a: "Ya, Anda bisa mengunduh (export) data yang sudah diurutkan ke dalam format JSON melalui tombol Export." }
                          ].map((faq, idx) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden transition-all">
                              <button 
                                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                className="w-full px-5 py-4 text-left flex justify-between items-center text-sm font-medium text-slate-300 hover:text-white transition-colors"
                              >
                                {faq.q}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-slate-500 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                              </button>
                              <div className={`px-5 text-xs text-slate-400 leading-relaxed transition-all duration-300 overflow-hidden ${activeFaq === idx ? 'max-h-24 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                {faq.a}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="glass rounded-3xl p-8 border border-white/[0.06] relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                      
                      <h3 className="text-2xl font-bold font-[Outfit] text-white mb-6 relative z-10">Kirim Tiket Bantuan</h3>
                      
                      <form className="space-y-5 relative z-10" onSubmit={handleSendEmail}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
                            <input type="text" name="from_name" required placeholder="John Doe" className="w-full px-4 py-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Alamat Email</label>
                            <input type="email" name="reply_to" required placeholder="john@technova.ac.id" className="w-full px-4 py-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Detail Pesan / Masalah</label>
                          <textarea name="message" rows={4} required placeholder="Jelaskan secara detail kendala yang Anda alami..." className="w-full px-4 py-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all resize-none" />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Lampiran Bukti (Opsional)</label>
                          <label className={`cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all duration-300 ${fileName ? 'border-cyan-400/50 bg-cyan-400/5' : 'border-slate-600 bg-white/[0.02] hover:bg-white/[0.04] hover:border-slate-400'}`}>
                            <input type="file" name="my_file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                            
                            {fileName ? (
                              <div className="flex flex-col items-center text-cyan-400 animate-in zoom-in">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                <span className="text-sm font-medium text-white truncate max-w-[200px]">{fileName}</span>
                                <span className="text-[10px] text-cyan-400/80 mt-1">Klik untuk mengganti file</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-slate-400">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                <span className="text-sm font-medium text-slate-300">Pilih file atau drag ke sini</span>
                                <span className="text-[10px] text-slate-500 mt-1">Mendukung JPG, PNG, PDF (Max 5MB)</span>
                              </div>
                            )}
                          </label>
                        </div>

                        <button 
                          type="submit" 
                          disabled={isSendingMsg}
                          className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all duration-300 disabled:opacity-70 group overflow-hidden relative mt-4"
                        >
                          <span className={`flex items-center gap-2 transition-transform duration-500 ${isSendingMsg ? 'translate-x-32 opacity-0' : 'translate-x-0'}`}>
                            Kirim Pesan
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                          </span>
                          
                          <span className={`absolute flex items-center gap-2 transition-transform duration-500 ${isSendingMsg ? 'translate-x-0 opacity-100' : '-translate-x-32 opacity-0'}`}>
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Mengirim Tiket...
                          </span>
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </main>

        {/* --- FLOATING CHATBOT AI --- */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          
          {/* Chat Window */}
          <div className={`transition-all duration-500 ease-in-out transform origin-bottom-right ${isChatOpen ? 'scale-100 opacity-100 translate-y-0 mb-4' : 'scale-0 opacity-0 translate-y-10 mb-0 pointer-events-none'} w-[320px] sm:w-[360px] h-[450px] glass border border-cyan-400/30 rounded-2xl shadow-[0_15px_40px_rgba(0,229,255,0.2)] flex flex-col overflow-hidden`}>
            
            {/* Header Chat */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-cyan-400/20 px-4 py-3 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/50 overflow-hidden">
                    <img src={imgMaskot} alt="Maskot TechNova" className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0a0a20] rounded-full"></span>
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold font-[Outfit]">TechBot AI</h4>
                  <p className="text-[10px] text-cyan-400">Asisten Kampus Online</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Body Chat (Daftar Pesan) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'user' ? 'bg-cyan-500 text-white rounded-br-sm shadow-[0_5px_15px_rgba(0,229,255,0.3)]' : 'bg-white/[0.05] border border-white/[0.1] text-slate-300 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Animasi Typing */}
              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.05] border border-white/[0.1] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Footer Input */}
            <div className="p-3 bg-black/60 border-t border-white/[0.05]">
              <form onSubmit={handleChatSubmit} className="relative flex items-center">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tanya sesuatu ke TechBot..." 
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-full pl-4 pr-12 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
                <button type="submit" disabled={!chatInput.trim() || isBotTyping} className="absolute right-1.5 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white hover:bg-cyan-400 disabled:opacity-50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </form>
            </div>
          </div>

          {/* Tombol Floating Action Button (FAB) */}
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:scale-110 z-50 ${isChatOpen ? 'bg-rose-500 rotate-90 text-white' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white animate-bounce'}`}
          >
            {isChatOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <img src={imgMaskot} alt="TechBot Mascot" className="w-9 h-9 object-contain" />
            )}
          </button>
        </div>

        {isLoggingOut && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050510]/80 backdrop-blur-md transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400 animate-pulse">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
            </div>
            <h2 className="text-white font-[Outfit] text-2xl font-bold tracking-wide animate-pulse mb-2">
              Keluar dari Sistem
            </h2>
            <p className="text-cyan-400/80 text-sm font-mono">Mengamankan sesi Anda...</p>
          </div>
        )}

      </div>
    </div>
  );
}