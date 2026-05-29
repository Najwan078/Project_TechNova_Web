import { useState } from 'react';

export default function AddStudentModal({ isOpen, onClose, onRefresh }: { isOpen: boolean, onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({
    nim: '', nama: '', jurusan: '', semester: '', status: 'Aktif', ipk: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('https://tech-nova-backend.vercel.app/api/mahasiswa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert("Data Berhasil Ditambahkan!");
        onRefresh(); // Refresh tabel
        onClose();   // Tutup modal
      } else {
        alert("Error: " + data.message); // Menampilkan error Regex dari Python
      }
    })
    .catch(err => {
      alert("Terjadi kesalahan jaringan! Cek console.");
      console.error(err);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 gradient-text">Tambah Mahasiswa Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="NIM (Contoh: IT20240001)" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white" onChange={e => setFormData({...formData, nim: e.target.value})} required />
          <input type="text" placeholder="Nama Lengkap" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white" onChange={e => setFormData({...formData, nama: e.target.value})} required />
          <input type="text" placeholder="Jurusan" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white" onChange={e => setFormData({...formData, jurusan: e.target.value})} required />
          <div className="flex gap-4">
            {/* Diubah jadi text agar browser tidak rewel soal titik/koma */}
            <input type="text" inputMode="numeric" placeholder="SMT" className="w-1/2 bg-white/5 border border-white/10 p-3 rounded-xl text-white" onChange={e => setFormData({...formData, semester: e.target.value})} required />
            <input type="text" inputMode="decimal" placeholder="IPK" className="w-1/2 bg-white/5 border border-white/10 p-3 rounded-xl text-white" onChange={e => setFormData({...formData, ipk: e.target.value})} required />
          </div>
          <select className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white" onChange={e => setFormData({...formData, status: e.target.value})}>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti</option>
            <option value="Lulus">Lulus</option>
          </select>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl bg-white/5 text-slate-400">Batal</button>
            <button type="submit" className="flex-1 p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  );
}
