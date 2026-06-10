import { useState, useEffect, useRef } from 'react';
import StudentModal from './StudentModal';
import AddStudentModal from './AddStudentModal';

const API_URL = 'https://tech-nova-backend.vercel.app';

interface StudentTableProps {
  onNotify?: (title: string, desc: string, type: string) => void;
}

import { Student } from '../data/students';

// Spinner kecil reusable
const Spinner = ({ color = 'text-current' }: { color?: string }) => (
  <svg className={`animate-spin h-4 w-4 ${color}`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default function StudentTable({ onNotify }: StudentTableProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('nama');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [langkah, setLangkah] = useState<number>(0);
  const [activeAlgo, setActiveAlgo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const importRef = useRef<HTMLInputElement>(null);

  // === STATE LOADING PER TOMBOL ===
  const [isSearching, setIsSearching] = useState(false);
  const [isSortingIpk, setIsSortingIpk] = useState(false);
  const [isSortingNim, setIsSortingNim] = useState(false);
  const [isSortingSemester, setIsSortingSemester] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchStudents = (params = '') => {
    setLoading(true);
    fetch(`${API_URL}/api/mahasiswa${params}`)
      .then(res => {
        if (!res.ok) throw new Error("Gagal connect ke server");
        return res.json();
      })
      .then(data => {
        const dataMahasiswa = data && data.data ? data.data : (Array.isArray(data) ? data : []);
        setStudents(dataMahasiswa);
        setLangkah(data && data.langkah !== undefined ? data.langkah : 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Koneksi ke Python terputus:", err);
        setStudents([]);
        setLoading(false);
        if (onNotify) onNotify('Koneksi Gagal', 'Gagal terhubung ke Server Python. Pastikan backend Flask sudah menyala.', 'warning');
      });
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    await new Promise(r => setTimeout(r, 600));
    fetchStudents(`?q=${search}&search_type=${searchType}`);
    let algoName = '';
    if (searchType === 'nama') { setActiveAlgo('linear'); algoName = 'Linear Search'; }
    else if (searchType === 'nim') { setActiveAlgo('binary'); algoName = 'Binary Search'; }
    else if (searchType === 'jurusan') { setActiveAlgo('sequential'); algoName = 'Sequential Search'; }
    if (onNotify) onNotify('Pencarian Selesai', `Algoritma ${algoName} berhasil mengeksekusi pencarian data.`, 'info');
    setTimeout(() => setIsSearching(false), 800);
  };

  const merge = (left: Student[], right: Student[]) => {
    let result: Student[] = [];
    let leftIndex = 0, rightIndex = 0;
    while (leftIndex < left.length && rightIndex < right.length) {
      if (Number(left[leftIndex].semester) <= Number(right[rightIndex].semester)) {
        result.push(left[leftIndex++]);
      } else {
        result.push(right[rightIndex++]);
      }
    }
    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  };

  const mergeSort = (data: Student[]): Student[] => {
    if (data.length <= 1) return data;
    const mid = Math.floor(data.length / 2);
    return merge(mergeSort(data.slice(0, mid)), mergeSort(data.slice(mid)));
  };

  const handleSort = async (type: 'ipk' | 'nim' | 'semester') => {
    if (type === 'ipk') setIsSortingIpk(true);
    else if (type === 'nim') setIsSortingNim(true);
    else setIsSortingSemester(true);

    await new Promise(r => setTimeout(r, 700));

    if (type === 'semester') {
      const sortedData = mergeSort([...students]);
      setStudents(sortedData);
      setActiveAlgo('merge');
      setLangkah(Math.ceil(students.length * Math.log2(students.length || 1)));
      if (onNotify) onNotify('Pengurutan Selesai', 'Data diurutkan dengan algoritma Merge Sort (Semester).', 'success');
      setIsSortingSemester(false);
    } else if (type === 'ipk') {
      let dataCopy = [...students];
      let steps = 0;
      for (let i = 0; i < dataCopy.length - 1; i++) {
        for (let j = 0; j < dataCopy.length - i - 1; j++) {
          steps++;
          if (Number(dataCopy[j].ipk) < Number(dataCopy[j + 1].ipk)) {
            let temp = dataCopy[j];
            dataCopy[j] = dataCopy[j + 1];
            dataCopy[j + 1] = temp;
          }
        }
      }
      setStudents(dataCopy);
      setActiveAlgo('bubble');
      setLangkah(steps);
      if (onNotify) onNotify('Pengurutan Selesai', 'Data diurutkan dengan algoritma Bubble Sort (IPK).', 'success');
      setIsSortingIpk(false);
    } else if (type === 'nim') {
      let dataCopy = [...students];
      let steps = 0;
      for (let i = 0; i < dataCopy.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < dataCopy.length; j++) {
          steps++;
          if (dataCopy[j].nim < dataCopy[minIdx].nim) minIdx = j;
        }
        if (minIdx !== i) {
          let temp = dataCopy[i];
          dataCopy[i] = dataCopy[minIdx];
          dataCopy[minIdx] = temp;
        }
      }
      setStudents(dataCopy);
      setActiveAlgo('selection');
      setLangkah(steps);
      if (onNotify) onNotify('Pengurutan Selesai', 'Data diurutkan dengan algoritma Selection Sort (NIM).', 'success');
      setIsSortingNim(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    setEditStudent(student);
    setEditForm({ ...student });
  };

  const handleEditSave = async () => {
    if (!editStudent) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`${API_URL}/api/mahasiswa/${editStudent.nim}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 500));
      if (data.status === 'success') {
        if (onNotify) onNotify('Berhasil', 'Data mahasiswa berhasil diupdate!', 'success');
        setEditStudent(null);
        fetchStudents();
      } else {
        if (onNotify) onNotify('Gagal', data.message, 'warning');
      }
    } catch {
      if (onNotify) onNotify('Error', 'Gagal menghubungi server.', 'warning');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`${API_URL}/api/mahasiswa/export`);
      const data = await res.json();
      await new Promise(r => setTimeout(r, 600));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data_mahasiswa.json';
      a.click();
      URL.revokeObjectURL(url);
      if (onNotify) onNotify('Export Berhasil', 'Data mahasiswa berhasil diexport ke JSON.', 'success');
    } catch {
      if (onNotify) onNotify('Export Gagal', 'Gagal mengexport data.', 'warning');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        await new Promise(r => setTimeout(r, 600));
        const res = await fetch(`${API_URL}/api/mahasiswa/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });
        const data = await res.json();
        if (data.status === 'success') {
          if (onNotify) onNotify('Import Berhasil', data.message, 'success');
          fetchStudents();
        } else {
          if (onNotify) onNotify('Import Gagal', data.message, 'warning');
        }
      } catch {
        if (onNotify) onNotify('Import Gagal', 'File JSON tidak valid.', 'warning');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = async () => {
    setIsResetting(true);
    await new Promise(r => setTimeout(r, 700));
    fetchStudents();
    setSearch('');
    setActiveAlgo('');
    setLangkah(0);
    setTimeout(() => setIsResetting(false), 800);
  };

  const getIpkColor = (ipk: number) => {
    if (ipk >= 3.5) return 'text-emerald-400';
    if (ipk >= 3.0) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'aktif') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (s === 'cuti') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    if (s === 'lulus') return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  };

  const getAlgoDetails = (algo: string, stepCount: number, dataSize: number) => {
    const details: Record<string, any> = {
      'linear': { title: 'Linear Search', desc: 'Mencari dengan mengecek data satu per satu dari atas ke bawah.', time: 'O(n)', best: 'O(1)', worst: 'O(n)', space: 'O(1)', color: 'text-blue-400', icon: '🔍', complexityDesc: 'Waktu bertambah linier seiring jumlah data.', steps: ['Mulai dari elemen pertama.', 'Bandingkan elemen saat ini dengan target.', 'Jika cocok, kembalikan posisinya.', 'Jika tidak, lanjut ke elemen berikutnya.', `Ulangi hingga ditemukan (${stepCount} langkah).`], comparison: [{ name: 'Linear Search', time: 'O(n)', score: 50 }, { name: 'Binary Search', time: 'O(log n)', score: 85 }, { name: 'Sequential Search', time: 'O(n)', score: 50 }] },
      'sequential': { title: 'Sequential Search', desc: 'Mengecek setiap elemen secara berurutan.', time: 'O(n)', best: 'O(1)', worst: 'O(n)', space: 'O(1)', color: 'text-teal-400', icon: '👀', complexityDesc: 'Cocok untuk pencarian berbasis kategori.', steps: ['Mulai dari indeks 0.', 'Cocokkan jurusan tiap mahasiswa.', 'Kumpulkan semua yang cocok.', `Pindai ${dataSize} data.`, `Total ${stepCount} operasi.`], comparison: [{ name: 'Linear Search', time: 'O(n)', score: 50 }, { name: 'Binary Search', time: 'O(log n)', score: 85 }, { name: 'Sequential Search', time: 'O(n)', score: 50 }] },
      'binary': { title: 'Binary Search', desc: 'Membelah data menjadi dua secara terus-menerus.', time: 'O(log n)', best: 'O(1)', worst: 'O(log n)', space: 'O(1)', color: 'text-indigo-400', icon: '⚡', complexityDesc: 'Sangat efisien untuk data terurut.', steps: ['Pastikan data terurut berdasarkan NIM.', 'Tentukan batas kiri dan kanan.', 'Hitung titik tengah.', 'Bandingkan NIM[mid] dengan target.', `Ulangi hingga ditemukan (${stepCount} langkah).`], comparison: [{ name: 'Linear Search', time: 'O(n)', score: 50 }, { name: 'Binary Search', time: 'O(log n)', score: 85 }, { name: 'Sequential Search', time: 'O(n)', score: 50 }] },
      'bubble': { title: 'Bubble Sort', desc: 'Membandingkan elemen bersebelahan dan menukar jika perlu.', time: 'O(n²)', best: 'O(n)', worst: 'O(n²)', space: 'O(1)', color: 'text-amber-400', icon: '🫧', complexityDesc: 'Kurang efisien untuk data besar.', steps: ['Mulai dari elemen pertama.', 'Bandingkan IPK[i] dan IPK[i+1].', 'Jika IPK[i] < IPK[i+1], tukar.', 'Ulangi pass hingga selesai.', `Total ${stepCount} operasi.`], comparison: [{ name: 'Bubble Sort', time: 'O(n²)', score: 25 }, { name: 'Selection Sort', time: 'O(n²)', score: 35 }, { name: 'Merge Sort', time: 'O(n log n)', score: 80 }] },
      'selection': { title: 'Selection Sort', desc: 'Mencari nilai terkecil lalu memindahkannya ke depan.', time: 'O(n²)', best: 'O(n²)', worst: 'O(n²)', space: 'O(1)', color: 'text-rose-400', icon: '🎯', complexityDesc: 'Jumlah swap lebih sedikit dari Bubble Sort.', steps: ['Anggap elemen pertama sebagai minimum.', 'Cari NIM terkecil di sisa array.', 'Tukar minimum dengan posisi saat ini.', 'Geser batas ke kanan.', `Selesai dalam ${stepCount} langkah.`], comparison: [{ name: 'Bubble Sort', time: 'O(n²)', score: 25 }, { name: 'Selection Sort', time: 'O(n²)', score: 35 }, { name: 'Merge Sort', time: 'O(n log n)', score: 80 }] },
      'merge': { title: 'Merge Sort', desc: 'Membelah array lalu menggabungkan kembali secara terurut.', time: 'O(n log n)', best: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', color: 'text-emerald-400', icon: '🔄', complexityDesc: 'Sangat optimal dan stabil.', steps: ['Belah array menjadi dua bagian.', 'Rekursif urutkan bagian kiri.', 'Rekursif urutkan bagian kanan.', 'Gabungkan dua bagian terurut.', `Selesai dalam ${stepCount} langkah.`], comparison: [{ name: 'Bubble Sort', time: 'O(n²)', score: 25 }, { name: 'Selection Sort', time: 'O(n²)', score: 35 }, { name: 'Merge Sort', time: 'O(n log n)', score: 80 }] },
    };
    return details[algo];
  };

  const activeDetails = activeAlgo ? getAlgoDetails(activeAlgo, langkah, students.length) : null;

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 flex gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="bg-[#0a0a20] border border-white/[0.08] rounded-xl px-3 py-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50 cursor-pointer"
          >
            <option value="nama" className="bg-[#0a0a20] text-white">Nama (Linear)</option>
            <option value="nim" className="bg-[#0a0a20] text-white">NIM (Binary)</option>
            <option value="jurusan" className="bg-[#0a0a20] text-white">Jurusan (Sequential)</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleSearch()}
            placeholder="Ketik nama, NIM, atau jurusan..."
            className="w-full min-w-[200px] bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-4 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50"
          />
          {/* TOMBOL CARI */}
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-all font-medium text-sm disabled:opacity-70 flex items-center gap-2 min-w-[90px] justify-center"
          >
            {isSearching ? (
              <>
                <Spinner />
                <span>Cari...</span>
              </>
            ) : 'Cari'}
          </button>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {/* TOMBOL BUBBLE SORT (IPK) */}
          <button
            onClick={() => handleSort('ipk')}
            disabled={isSortingIpk}
            className="relative p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all flex items-center justify-center group shadow-[0_0_15px_rgba(251,191,36,0.05)] hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] disabled:opacity-70 w-10 h-10"
          >
            {isSortingIpk ? (
              <Spinner color="text-amber-400" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap bg-[#0a0a20] border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg z-20">
              Bubble Sort (IPK)
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-500/30"></span>
            </span>
          </button>

          {/* TOMBOL SELECTION SORT (NIM) */}
          <button
            onClick={() => handleSort('nim')}
            disabled={isSortingNim}
            className="relative p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all flex items-center justify-center group shadow-[0_0_15px_rgba(244,63,94,0.05)] hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] disabled:opacity-70 w-10 h-10"
          >
            {isSortingNim ? (
              <Spinner color="text-rose-400" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
                <line x1="20" y1="12" x2="22" y2="12"/><line x1="2" y1="12" x2="4" y2="12"/>
              </svg>
            )}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap bg-[#0a0a20] border border-rose-500/30 text-rose-400 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg z-20">
              Selection Sort (NIM)
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-rose-500/30"></span>
            </span>
          </button>

          {/* TOMBOL MERGE SORT (SEMESTER) */}
          <button
            onClick={() => handleSort('semester')}
            disabled={isSortingSemester}
            className="relative p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all flex items-center justify-center group shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] disabled:opacity-70 w-10 h-10"
          >
            {isSortingSemester ? (
              <Spinner color="text-purple-400" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
            )}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap bg-[#0a0a20] border border-purple-500/30 text-purple-400 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg z-20">
              Merge Sort (Semester)
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-500/30"></span>
            </span>
          </button>

          <div className="w-px h-8 bg-white/[0.08] mx-1" />

          {/* TOMBOL TAMBAH */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all text-sm font-medium"
          >
            + Tambah
          </button>

          {/* TOMBOL EXPORT */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all text-sm disabled:opacity-70 flex items-center gap-2 min-w-[124px] justify-center"
          >
            {isExporting ? (
              <>
                <Spinner color="text-blue-400" />
                <span>Exporting...</span>
              </>
            ) : '⬇ Export JSON'}
          </button>

          {/* TOMBOL IMPORT */}
          <button
            onClick={() => importRef.current?.click()}
            disabled={isImporting}
            className="px-4 py-2.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-xl hover:bg-violet-500/20 transition-all text-sm disabled:opacity-70 flex items-center gap-2 min-w-[124px] justify-center"
          >
            {isImporting ? (
              <>
                <Spinner color="text-violet-400" />
                <span>Importing...</span>
              </>
            ) : '⬆ Import JSON'}
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          {/* TOMBOL RESET */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-4 py-2.5 bg-white/[0.04] text-slate-400 border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-all text-sm disabled:opacity-70 flex items-center gap-2 min-w-[80px] justify-center"
          >
            {isResetting ? (
              <>
                <Spinner color="text-slate-400" />
                <span>Reset...</span>
              </>
            ) : 'Reset'}
          </button>
        </div>
      </div>

      {activeDetails && (
        <div className="flex justify-end mb-3">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-xs">
            <span>{activeDetails.icon}</span>
            <span className={activeDetails.color}>{activeDetails.title}</span>
            <span className="text-slate-500">diselesaikan dalam:</span>
            <span className="text-white font-bold">{langkah} langkah</span>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden relative">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="text-left px-6 py-4 text-[11px] uppercase text-slate-500">NIM</th>
              <th className="text-left px-6 py-4 text-[11px] uppercase text-slate-500">Nama</th>
              <th className="text-left px-6 py-4 text-[11px] uppercase text-slate-500">Jurusan</th>
              <th className="text-left px-6 py-4 text-[11px] uppercase text-slate-500">IPK</th>
              <th className="text-left px-6 py-4 text-[11px] uppercase text-slate-500">Status</th>
              <th className="text-left px-6 py-4 text-[11px] uppercase text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="px-6 py-4"><div className="h-3 w-24 rounded-full bg-white/[0.06] animate-pulse" /></td>
                  <td className="px-6 py-4 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse flex-shrink-0" /><div className="h-3 w-36 rounded-full bg-white/[0.06] animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-3 w-28 rounded-full bg-white/[0.06] animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-3 w-10 rounded-full bg-white/[0.06] animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-16 rounded-full bg-white/[0.06] animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-16 rounded-full bg-white/[0.06] animate-pulse" /></td>
                </tr>
              ))
            ) : students.length === 0
              ? <tr><td colSpan={6} className="text-center py-10 text-slate-500 italic">Data tidak tersedia.</td></tr>
              : students.map((student) => (
                <tr
                  key={student.nim}
                  onClick={() => setSelectedStudent(student)}
                  className="hover:bg-white/[0.03] cursor-pointer border-b border-white/[0.03]"
                  style={{ animation: 'fadeInUp 0.3s ease-out both' }}
                >
                  <td className="px-6 py-4 text-sm text-cyan-400">{student.nim}</td>
                  <td className="px-6 py-4 text-sm text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs flex-shrink-0">
                      {student.nama?.charAt(0) ?? '?'}
                    </div>
                    {student.nama}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{student.jurusan}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${getIpkColor(student.ipk)}`}>{Number(student.ipk).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={(e) => handleEditClick(e, student)}
                      className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-all text-xs"
                    >
                      ✏ Edit
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIT — tombol Simpan dengan loading state */}
      {editStudent && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => !isSavingEdit && setEditStudent(null)}
        >
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-white font-bold text-lg mb-4">✏ Edit Mahasiswa</h2>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">NIM (tidak bisa diubah)</label>
                <input
                  value={editStudent.nim}
                  disabled
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-slate-500 text-sm"
                />
              </div>
              {(['nama', 'jurusan', 'semester', 'ipk'] as const).map(field => (
                <div key={field}>
                  <label className="text-slate-400 text-xs mb-1 block capitalize">{field}</label>
                  <input
                    value={editForm[field] ?? ''}
                    onChange={e => setEditForm((f: Record<string, any>) => ({ ...f, [field]: e.target.value }))}
                    disabled={isSavingEdit}
                    className="w-full bg-slate-800 border border-white/[0.08] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-400/50 disabled:opacity-60"
                  />
                </div>
              ))}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Status</label>
                <select
                  value={editForm['status'] ?? ''}
                  onChange={e => setEditForm((f: Record<string, any>) => ({ ...f, status: e.target.value }))}
                  disabled={isSavingEdit}
                  className="w-full bg-slate-800 border border-white/[0.08] rounded-xl px-4 py-2 text-white text-sm focus:outline-none disabled:opacity-60"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Drop Out">Drop Out</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditStudent(null)}
                disabled={isSavingEdit}
                className="flex-1 px-4 py-2 bg-white/[0.04] text-slate-400 border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-all text-sm disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleEditSave}
                disabled={isSavingEdit}
                className="flex-1 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-all text-sm font-medium disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSavingEdit ? (
                  <>
                    <Spinner color="text-cyan-400" />
                    <span>Menyimpan...</span>
                  </>
                ) : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAlgo && activeDetails && (
        <div className="mt-6 glass rounded-2xl overflow-hidden" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeDetails.icon}</span>
              <div>
                <h3 className={`font-bold text-lg ${activeDetails.color}`}>{activeDetails.title}</h3>
                <p className="text-slate-500 text-xs">{activeDetails.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Diselesaikan dalam</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.06] text-white font-bold">{langkah} langkah</span>
              <span className="text-slate-500">dari</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.06] text-white font-bold">{students.length} data</span>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4">Time Complexity</p>
              <div className="space-y-3">
                {[
                  { label: 'Best Case', value: activeDetails.best ?? activeDetails.time, color: 'text-emerald-400' },
                  { label: 'Average Case', value: activeDetails.time, color: activeDetails.color },
                  { label: 'Worst Case', value: activeDetails.worst ?? activeDetails.time, color: 'text-rose-400' }
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">{label}</span>
                    <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded-lg bg-white/[0.04] ${color}`}>{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-slate-400 text-xs">Space</span>
                  <span className="font-mono font-bold text-sm px-2 py-0.5 rounded-lg bg-white/[0.04] text-blue-400">{activeDetails.space ?? 'O(1)'}</span>
                </div>
              </div>
              <p className="text-slate-600 text-[11px] mt-4 leading-relaxed">{activeDetails.complexityDesc}</p>
            </div>
            <div className="glass rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4">Langkah-langkah</p>
              <ol className="space-y-2">
                {(activeDetails.steps as string[]).map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-slate-300">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeDetails.color} bg-white/[0.06]`}>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="glass rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4">Perbandingan Algoritma</p>
              <div className="space-y-2">
                {(activeDetails.comparison as { name: string; time: string; score: number }[]).map((item) => (
                  <div key={item.name} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${item.name === activeDetails.title ? 'bg-white/[0.06] ring-1 ring-white/10' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${item.name === activeDetails.title ? 'text-white' : 'text-slate-400'}`}>{item.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">{item.time}</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${item.name === activeDetails.title ? activeDetails.color.replace('text-', 'bg-') : 'bg-slate-600'}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      {isAddModalOpen && (
        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onRefresh={() => { fetchStudents(); setIsAddModalOpen(false); }}
        />
      )}
    </div>
  );
}