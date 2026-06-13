import { useEffect } from 'react';
import { createPortal } from 'react-dom'; // <--- TAMBAHAN PENTING
import { Student, getStatusColor, getStatusBg, getIpkColor } from '../data/students';
import UserAvatar from './UserAvatar';

interface StudentModalProps {
  student: Student | null;
  onClose: () => void;
}

export default function StudentModal({ student, onClose }: StudentModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!student) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-left">
        
        <div
          className="fixed inset-0 bg-black/60 animate-backdrop cursor-pointer"
          onClick={onClose}
        />

        <div
          className="relative glass-strong rounded-3xl p-8 max-w-lg w-full animate-modal-popup my-8 shadow-2xl"
          style={{
            boxShadow: '0 0 80px rgba(0, 229, 255, 0.1), 0 0 160px rgba(139, 92, 246, 0.05)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 rounded-t-3xl" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/80 transition-all duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>

          <div className="flex items-center gap-5 mb-6 mt-2">
            <div
              className="rounded-2xl border border-white/[0.08] flex items-center justify-center overflow-hidden"
              style={{ animation: 'glowPulse 3s ease-in-out infinite', background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(139,92,246,0.12))' }}
            >
              <UserAvatar size="lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-[Outfit] text-white mb-1">{student.nama}</h3>
              <p className="text-cyan-400 text-sm font-mono">{student.nim}</p>
              <div className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBg(student.status)} ${getStatusColor(student.status)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {student.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass rounded-xl p-4 hover:-translate-y-1 transition-transform">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Jurusan</p>
              <p className="text-sm font-medium text-white">{student.jurusan}</p>
            </div>
            <div className="glass rounded-xl p-4 hover:-translate-y-1 transition-transform">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Semester</p>
              <p className="text-sm font-medium text-white">Semester {student.semester}</p>
            </div>
            <div className="glass rounded-xl p-4 hover:-translate-y-1 transition-transform">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">IPK</p>
              <p className={`text-lg font-bold font-[Outfit] ${getIpkColor(student.ipk)}`}>
                {student.ipk.toFixed(2)}
              </p>
            </div>
            <div className="glass rounded-xl p-4 hover:-translate-y-1 transition-transform">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Tanggal Masuk</p>
              <p className="text-sm font-medium text-white">{student.tanggalMasuk}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm group">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors flex items-center justify-center text-slate-500 border border-transparent group-hover:border-cyan-500/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <span className="text-slate-300">{student.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm group">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors flex items-center justify-center text-slate-500 border border-transparent group-hover:border-purple-500/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <span className="text-slate-300">{student.telepon}</span>
            </div>
            <div className="flex items-center gap-3 text-sm group">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors flex items-center justify-center text-slate-500 border border-transparent group-hover:border-emerald-500/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span className="text-slate-300">{student.alamat}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}