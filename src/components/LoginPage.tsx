import { useState, useCallback } from 'react';
import BackgroundOrbs from './BackgroundOrbs';
import logoKampus from '../assets/Logo_Technova_University.png';

interface LoginPageProps {
  onLogin: () => void;
}

const inputStyle: React.CSSProperties = {
  paddingLeft: '45px',
  paddingRight: '45px', // Ruang untuk ikon mata di kanan
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showForm, setShowForm] = useState<'login' | 'signup'>('login');

  // Fitur Mata & OTP State
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  // STATE BARU UNTUK LOADING LOGIN
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupNim, setSignupNim] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const toggleForm = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    setShowPassword(false);
    setTimeout(() => {
      setShowForm(prev => prev === 'login' ? 'signup' : 'login');
      setIsSignUp(prev => !prev);
    }, 300);
    setTimeout(() => setIsFlipping(false), 600);
  }, [isFlipping]);

  // 🚀 FUNGSI RESET PASSWORD (TERHUBUNG KE PYTHON BEBAS EMAIL APA SAJA)
  const handleForgotPassword = async () => {
    const emailInput = prompt("Masukkan email Anda untuk menerima kode OTP:");
    if (!emailInput) return;

    setIsSendingOtp(true);

    try {
      // 1. Tembak langsung ke API Python (Tidak peduli emailnya terdaftar atau tidak)
      const response = await fetch('https://tech-nova-backend.vercel.app/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Kode OTP telah dikirim ke ${emailInput}. Silakan cek Inbox/Spam.`);
        
        // 2. Meminta user memasukkan OTP yang diterima
        const otpInput = prompt("Masukkan 6 digit kode OTP yang Anda terima:");

        // 3. Validasi OTP (Mencocokkan dengan yang dikirim dari Python)
        if (otpInput === data.dev_otp) {
          const newPass = prompt("Verifikasi Berhasil! Masukkan password baru Anda (min 8 karakter):");
          
          if (newPass && newPass.length >= 8) {
            // Coba update password di database lokal (jika user tersebut memang ada)
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userIndex = registeredUsers.findIndex((u: any) => u.email === emailInput);
            
            if (userIndex !== -1) {
              registeredUsers[userIndex].password = newPass;
              localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            }
            
            alert("Password berhasil diperbarui! Silakan login.");
          } else {
            alert("Reset dibatalkan atau password terlalu pendek.");
          }
        } else {
          alert("Kode OTP salah!");
        }
      } else {
        alert(data.message || "Gagal mengirim OTP dari server.");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Gagal mengirim email. Pastikan server Backend Python sudah menyala!");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // FUNGSI LOGIN YANG SUDAH DITAMBAHKAN ANIMASI
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      alert("Harap isi email dan password terlebih dahulu!");
      return;
    }

    // Tampilkan layar loading
    setIsLoggingIn(true);

    // Simulasi loading 1.5 detik agar terlihat profesional
    setTimeout(() => {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userFound = registeredUsers.find(
        (u: any) => u.email === loginEmail && u.password === loginPassword
      );

      if (userFound) {
        localStorage.setItem('userEmail', loginEmail);
        onLogin(); 
        // Tidak perlu setIsLoggingIn(false) karena halaman akan berpindah ke Dashboard
      } else {
        setIsLoggingIn(false); // Matikan loading jika gagal
        alert("Email atau Password salah! Pastikan Anda sudah mendaftar.");
      }
    }, 1500);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirm) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const isEmailTaken = existingUsers.some((u: any) => u.email === signupEmail);
    if (isEmailTaken) {
      alert("Email ini sudah terdaftar!");
      return;
    }
    const newUser = { name: signupName, email: signupEmail, password: signupPassword, nim: signupNim };
    localStorage.setItem('registeredUsers', JSON.stringify([...existingUsers, newUser]));
    alert("Pendaftaran berhasil! Silakan login.");
    toggleForm();
  };

  // Komponen Ikon Mata Dinamis
  const EyeToggle = () => (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
    >
      {showPassword ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      )}
    </button>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <BackgroundOrbs />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6" style={{ animation: 'fadeInDown 0.8s ease-out' }}>
          <img src={logoKampus} alt="Logo TechNova" className="w-52 h-52 object-contain mx-auto mb-0 drop-shadow-[0_0_20px_rgba(0,229,255,0.6)] hover:scale-105 transition-transform duration-500" />
          <h1 className="text-3xl font-bold font-[Outfit] gradient-text tracking-tight -mt-8 relative z-20">TechNova University</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto mt-2 rounded-full opacity-60" />
        </div>

        <div className="glass-strong rounded-3xl p-8 relative overflow-hidden" style={{ animation: isFlipping ? 'flipOut 0.3s ease-in forwards' : 'flipIn 0.3s ease-out forwards', boxShadow: '0 0 60px rgba(0,229,255,0.08), 0 0 120px rgba(139,92,246,0.05)' }}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

          {showForm === 'login' ? (
            <form onSubmit={handleLogin}>
              <h2 className="text-2xl font-bold font-[Outfit] text-white mb-1">Selamat Datang</h2>
              <p className="text-slate-400 text-sm mb-6">Masuk ke akun Anda untuk melanjutkan</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <span className="absolute top-1/2 -translate-y-1/2 text-slate-500" style={{ left: '12px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </span>
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="nama@technova.ac.id" style={inputStyle} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pr-4 text-white placeholder:text-slate-600 focus:outline-none input-glow transition-all duration-300 focus:-translate-y-0.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <span className="absolute top-1/2 -translate-y-1/2 text-slate-500" style={{ left: '12px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" style={inputStyle} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 text-white placeholder:text-slate-600 focus:outline-none input-glow transition-all duration-300 focus:-translate-y-0.5" />
                    <EyeToggle />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/20 bg-white/5 accent-cyan-400" /> Ingat saya
                  </label>
                  <button type="button" onClick={handleForgotPassword} disabled={isSendingOtp} className="text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50">
                    {isSendingOtp ? 'Mengirim...' : 'Lupa password?'}
                  </button>
                </div>

                <button type="submit" disabled={isLoggingIn} className="w-full btn-gradient text-white font-semibold py-3 rounded-xl mt-2 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isLoggingIn ? 'Memproses...' : 'Masuk'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">Belum punya akun? <button type="button" onClick={toggleForm} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign Up</button></p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <h2 className="text-2xl font-bold font-[Outfit] text-white mb-1">Buat Akun Baru 🚀</h2>
              <p className="text-slate-400 text-sm mb-6">Daftar untuk mengakses sistem manajemen</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute top-1/2 -translate-y-1/2 text-slate-500" style={{ left: '12px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                    <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Nama lengkap Anda" style={inputStyle} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pr-4 text-white placeholder:text-slate-600 focus:outline-none input-glow transition-all duration-300 focus:-translate-y-0.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">NIM</label>
                    <input type="text" value={signupNim} onChange={e => setSignupNim(e.target.value)} placeholder="2024xxx" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none input-glow transition-all duration-300 focus:-translate-y-0.5" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                    <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="email@ac.id" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none input-glow transition-all duration-300 focus:-translate-y-0.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Min. 8 karakter" style={{paddingLeft: '15px', paddingRight: '45px'}} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 text-white placeholder:text-slate-600 focus:outline-none input-glow transition-all duration-300 focus:-translate-y-0.5" />
                    <EyeToggle />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Konfirmasi Password</label>
                  <input type="password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} placeholder="Ulangi password" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white focus:outline-none input-glow transition-all duration-300 focus:-translate-y-0.5" />
                </div>

                <button type="submit" className="w-full btn-gradient text-white font-semibold py-3 rounded-xl mt-2 hover:scale-[1.02] active:scale-95 transition-all duration-300">Daftar Sekarang</button>
              </div>
              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">Sudah punya akun? <button type="button" onClick={toggleForm} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign In</button></p>
              </div>
            </form>
          )}
        </div>
        <p className="text-center text-slate-600 text-xs mt-8">© 2026 TechNova University. All rights reserved.</p>
      </div>

      {/* --- EFEK LOADING MASUK (LOGIN) --- */}
      {isLoggingIn && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050510]/80 backdrop-blur-md transition-all duration-300 animate-in fade-in zoom-in-95">
          {/* Spinner dengan Ikon Login */}
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400 animate-pulse">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
            </div>
          </div>
          <h2 className="text-white font-[Outfit] text-2xl font-bold tracking-wide animate-pulse mb-2">
            Mengautentikasi
          </h2>
          <p className="text-cyan-400/80 text-sm font-mono">Memverifikasi kredensial Anda...</p>
        </div>
      )}

    </div>
  );
}