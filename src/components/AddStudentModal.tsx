import { useState } from 'react';
import { createPortal } from 'react-dom'; 

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onNotify?: (title: string, desc: string, type: string) => void;
}

export default function AddStudentModal({ isOpen, onClose, onRefresh, onNotify }: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    nim: '', nama: '', jurusan: '', semester: '', status: 'Aktif', ipk: ''
  });
  
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    fetch('https://tech-nova-backend.vercel.app/api/mahasiswa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.status === 'success') {
        if (onNotify) onNotify('Berhasil', 'Data mahasiswa berhasil ditambahkan!', 'success');
        onRefresh(); 
        onClose();   
      } else {
        if (onNotify) onNotify('Gagal', 'Error: ' + data.message, 'warning');
      }
    })
    .catch(err => {
      setLoading(false);
      if (onNotify) onNotify('Terjadi Kesalahan', 'Gagal terhubung ke server backend.', 'error');
      console.error(err);
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        
        {/* Backdrop (Overlay Hitam Blur) */}
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-backdrop cursor-pointer" 
          onClick={() => !loading && onClose()} 
        />

        {/* Modal Content - Background Solid agar tidak tembus pandang */}
        <div 
          className="relative bg-[#0a0a20] border border-white/15 w-full max-w-md p-8 rounded-3xl shadow-2xl animate-modal-popup text-left my-8"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold font-[Outfit] text-white mb-6 gradient-text">Tambah Mahasiswa Baru</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              placeholder="NIM (Contoh: IT20240001)" 
              className="w-full bg-[#0f0f2a] border border-white/10 p-3 rounded-xl text-white focus:border-cyan-400/50 input-glow transition-all disabled:opacity-50 outline-none" 
              onChange={e => setFormData({...formData, nim: e.target.value})} 
              required 
              disabled={loading}
            />
            <input 
              type="text" 
              placeholder="Nama Lengkap" 
              className="w-full bg-[#0f0f2a] border border-white/10 p-3 rounded-xl text-white focus:border-cyan-400/50 input-glow transition-all disabled:opacity-50 outline-none" 
              onChange={e => setFormData({...formData, nama: e.target.value})} 
              required 
              disabled={loading}
            />
            <input 
              type="text" 
              placeholder="Jurusan" 
              className="w-full bg-[#0f0f2a] border border-white/10 p-3 rounded-xl text-white focus:border-cyan-400/50 input-glow transition-all disabled:opacity-50 outline-none" 
              onChange={e => setFormData({...formData, jurusan: e.target.value})} 
              required 
              disabled={loading}
            />
            
            <div className="flex gap-4">
              <input 
                type="text" 
                inputMode="numeric" 
                placeholder="SMT" 
                className="w-full bg-[#0f0f2a] border border-white/10 p-3 rounded-xl text-white focus:border-cyan-400/50 input-glow transition-all disabled:opacity-50 outline-none" 
                onChange={e => setFormData({...formData, semester: e.target.value})} 
                required 
                disabled={loading}
              />
              <input 
                type="text" 
                inputMode="decimal" 
                placeholder="IPK" 
                className="w-full bg-[#0f0f2a] border border-white/10 p-3 rounded-xl text-white focus:border-cyan-400/50 input-glow transition-all disabled:opacity-50 outline-none" 
                onChange={e => setFormData({...formData, ipk: e.target.value})} 
                required 
                disabled={loading}
              />
            </div>
            
            <select 
              className="w-full bg-[#0f0f2a] border border-white/10 p-3 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 transition-all cursor-pointer disabled:opacity-50" 
              onChange={e => setFormData({...formData, status: e.target.value})}
              disabled={loading}
            >
              <option value="Aktif" className="bg-[#0a0a20]">Aktif</option>
              <option value="Cuti" className="bg-[#0a0a20]">Cuti</option>
              <option value="Lulus" className="bg-[#0a0a20]">Lulus</option>
            </select>
            
            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={loading}
                className="flex-1 p-3 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 text-sm font-medium"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold hover:bg-cyan-500/30 transition-all shadow-[0_0_15px_rgba(0,229,255,0.15)] flex items-center justify-center disabled:opacity-70 text-sm"
              >
                {loading ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>,
    document.body 
  );
}