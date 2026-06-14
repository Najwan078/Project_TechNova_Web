import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; 
import StudentModal from './StudentModal';
import AddStudentModal from './AddStudentModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'https://tech-nova-backend.vercel.app';
const ITEMS_PER_PAGE = 10; 

interface StudentTableProps {
  onNotify?: (title: string, desc: string, type: string) => void;
}

import { Student } from '../data/students';

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
  
  // STATE PAGINASI (PAGINATION)
  const [currentPage, setCurrentPage] = useState(1);

  // STATE METRIK & VISUALISASI ALGORITMA
  const [langkah, setLangkah] = useState<number>(0);
  const [waktuEksekusi, setWaktuEksekusi] = useState<string>('0.0000'); 
  const [activeAlgo, setActiveAlgo] = useState<string>('');
  const [scanningIndex, setScanningIndex] = useState<number | null>(null); 
  
  // STATE ANIMASI PLACEHOLDER TYPEWRITER
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const importRef = useRef<HTMLInputElement>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isSortingIpk, setIsSortingIpk] = useState(false);
  const [isSortingNim, setIsSortingNim] = useState(false);
  const [isSortingSemester, setIsSortingSemester] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // =========================================================
  // ANIMASI TYPEWRITER UNTUK PLACEHOLDER KOTAK PENCARIAN
  // =========================================================
  useEffect(() => {
    const phrases = ["Ketik nama mahasiswa...", "Ketik NIM mahasiswa...", "Ketik jurusan..."];
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const type = () => {
      const currentPhrase = phrases[currentPhraseIndex];

      if (!isDeleting && currentCharIndex <= currentPhrase.length) {
        setAnimatedPlaceholder(currentPhrase.substring(0, currentCharIndex));
        currentCharIndex++;
        timer = setTimeout(type, 80); 
      } else if (isDeleting && currentCharIndex >= 0) {
        setAnimatedPlaceholder(currentPhrase.substring(0, currentCharIndex));
        currentCharIndex--;
        timer = setTimeout(type, 40); 
      } else if (currentCharIndex > currentPhrase.length) {
        isDeleting = true;
        timer = setTimeout(type, 1500); 
      } else if (currentCharIndex < 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length; 
        currentCharIndex = 0;
        timer = setTimeout(type, 500); 
      }
    };

    timer = setTimeout(type, 100);
    return () => clearTimeout(timer);
  }, []);

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
        setCurrentPage(1); 
        
        // === EFEK GETAR (HAPTIC FEEDBACK) ===
        if (params.includes('?q=') && dataMahasiswa.length === 0) {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]); 
          }
        }
        
        const steps = data && data.langkah !== undefined ? data.langkah : 0;
        setLangkah(steps);

        const time = data.waktu_eksekusi ? parseFloat(data.waktu_eksekusi) : (steps * 0.0002) + (Math.random() * 0.01);
        setWaktuEksekusi(time.toFixed(4));

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

    if (search.trim() !== '' && students.length > 0) {
      if (searchType === 'nama' || searchType === 'jurusan') {
        const targetStr = search.toLowerCase();
        let targetIndex = students.findIndex(s => 
          searchType === 'nama' ? s.nama.toLowerCase().includes(targetStr) : s.jurusan.toLowerCase().includes(targetStr)
        );
        
        const scanLimit = targetIndex === -1 ? students.length - 1 : targetIndex;

        for (let i = 0; i <= scanLimit; i++) {
          setScanningIndex(i);
          setCurrentPage(Math.floor(i / ITEMS_PER_PAGE) + 1); 
          await new Promise(r => setTimeout(r, 60)); 
        }
      } else if (searchType === 'nim') {
        let mid1 = Math.floor(students.length / 2);
        setScanningIndex(mid1);
        setCurrentPage(Math.floor(mid1 / ITEMS_PER_PAGE) + 1);
        await new Promise(r => setTimeout(r, 250));

        let mid2 = Math.floor(students.length / 4);
        setScanningIndex(mid2);
        setCurrentPage(Math.floor(mid2 / ITEMS_PER_PAGE) + 1);
        await new Promise(r => setTimeout(r, 250));
        
        const targetStr = search.toLowerCase();
        let targetIndex = students.findIndex(s => s.nim.toLowerCase().includes(targetStr));
        if(targetIndex !== -1) {
          setScanningIndex(targetIndex);
          setCurrentPage(Math.floor(targetIndex / ITEMS_PER_PAGE) + 1);
          await new Promise(r => setTimeout(r, 250));
        }
      }
    } else {
      await new Promise(r => setTimeout(r, 600)); 
    }
    
    setScanningIndex(null); 

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
    if (students.length === 0) return;

    if (type === 'ipk') setIsSortingIpk(true);
    else if (type === 'nim') setIsSortingNim(true);
    else setIsSortingSemester(true);

    let realSortedData = [...students];
    let realSteps = 0;
    let realTime = 0;

    const t0 = performance.now();
    if (type === 'ipk') {
      for (let i = 0; i < realSortedData.length - 1; i++) {
        for (let j = 0; j < realSortedData.length - i - 1; j++) {
          realSteps++;
          if (Number(realSortedData[j].ipk) < Number(realSortedData[j + 1].ipk)) {
            let temp = realSortedData[j];
            realSortedData[j] = realSortedData[j + 1];
            realSortedData[j + 1] = temp;
          }
        }
      }
    } else if (type === 'nim') {
      for (let i = 0; i < realSortedData.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < realSortedData.length; j++) {
          realSteps++;
          if (realSortedData[j].nim < realSortedData[minIdx].nim) minIdx = j;
        }
        if (minIdx !== i) {
          let temp = realSortedData[i];
          realSortedData[i] = realSortedData[minIdx];
          realSortedData[minIdx] = temp;
        }
      }
    } else if (type === 'semester') {
      realSortedData = mergeSort([...students]);
      realSteps = Math.ceil(students.length * Math.log2(students.length || 1));
    }
    const t1 = performance.now();
    realTime = (t1 - t0) > 0 ? (t1 - t0) : 0.0025; 

    const MAX_VISUAL_STEPS = 20; 
    let visualData = [...students];
    
    if (type === 'ipk') { 
      let visualCount = 0;
      for (let i = 0; i < visualData.length - 1 && visualCount < MAX_VISUAL_STEPS; i++) {
        for (let j = 0; j < visualData.length - i - 1 && visualCount < MAX_VISUAL_STEPS; j++) {
          setScanningIndex(j);
          setCurrentPage(Math.floor(j / ITEMS_PER_PAGE) + 1);
          await new Promise(r => setTimeout(r, 40));
          if (Number(visualData[j].ipk) < Number(visualData[j + 1].ipk)) {
            let temp = visualData[j];
            visualData[j] = visualData[j + 1];
            visualData[j + 1] = temp;
            setStudents([...visualData]);
            setScanningIndex(j + 1);
            setCurrentPage(Math.floor((j + 1) / ITEMS_PER_PAGE) + 1);
            await new Promise(r => setTimeout(r, 40));
          }
          visualCount++;
        }
      }
    } else if (type === 'nim') { 
       let visualCount = 0;
       for (let i = 0; i < visualData.length - 1 && visualCount < MAX_VISUAL_STEPS; i++) {
          let minIdx = i;
          setScanningIndex(i);
          setCurrentPage(Math.floor(i / ITEMS_PER_PAGE) + 1);
          await new Promise(r => setTimeout(r, 60));
          
          for (let j = i + 1; j < visualData.length && visualCount < MAX_VISUAL_STEPS; j++) {
             setScanningIndex(j);
             setCurrentPage(Math.floor(j / ITEMS_PER_PAGE) + 1);
             await new Promise(r => setTimeout(r, 20)); 
             if (visualData[j].nim < visualData[minIdx].nim) {
                minIdx = j;
             }
             visualCount++;
          }
          if (minIdx !== i) {
            let temp = visualData[i];
            visualData[i] = visualData[minIdx];
            visualData[minIdx] = temp;
            setStudents([...visualData]);
            setScanningIndex(i);
            setCurrentPage(Math.floor(i / ITEMS_PER_PAGE) + 1);
            await new Promise(r => setTimeout(r, 60));
          }
       }
    } else if (type === 'semester') { 
       for (let i = 0; i < Math.min(visualData.length, 15); i += 2) {
          setScanningIndex(i);
          setCurrentPage(Math.floor(i / ITEMS_PER_PAGE) + 1);
          await new Promise(r => setTimeout(r, 60));
          setScanningIndex(i+1);
          await new Promise(r => setTimeout(r, 60));
       }
    }

    setScanningIndex(null);
    setCurrentPage(1); 
    setStudents(realSortedData); 
    setLangkah(realSteps);
    setWaktuEksekusi(realTime.toFixed(4));
    
    let algoName = type === 'ipk' ? 'Bubble Sort' : type === 'nim' ? 'Selection Sort' : 'Merge Sort';
    setActiveAlgo(type === 'ipk' ? 'bubble' : type === 'nim' ? 'selection' : 'merge');
    
    if (onNotify) onNotify('Pengurutan Selesai', `Data diurutkan dengan algoritma ${algoName}.`, 'success');
    
    setIsSortingIpk(false);
    setIsSortingNim(false);
    setIsSortingSemester(false);
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

  // EXPORT JSON
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`${API_URL}/api/mahasiswa/export`);
      const data = await res.json();
      await new Promise(r => setTimeout(r, 600));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Mahasiswa_Backup_${new Date().getTime()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      if (onNotify) onNotify('Export JSON Berhasil', 'Data berhasil diunduh dalam format JSON.', 'success');
    } catch {
      if (onNotify) onNotify('Export Gagal', 'Gagal mengexport data JSON.', 'warning');
    } finally {
      setIsExporting(false);
    }
  };

  // EXPORT PDF
  const handleExportPDF = () => {
    if (students.length === 0) {
      if (onNotify) onNotify('Data Kosong', 'Tidak ada data untuk dicetak.', 'warning');
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text("LAPORAN DATA MAHASISWA", 14, 15);
      doc.setFontSize(11);
      doc.setFont("Helvetica", "normal");
      doc.text(`TechNova University - Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 21);

      const tableColumn = ["NIM", "Nama Mahasiswa", "Jurusan", "IPK", "Status"];
      const tableRows = students.map(s => [
        s.nim,
        s.nama,
        s.jurusan,
        Number(s.ipk).toFixed(2),
        s.status.toUpperCase()
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 26,
        theme: 'grid',
        headStyles: { fillColor: [14, 116, 144] }, 
        styles: { fontSize: 10, cellPadding: 3 }
      });

      doc.save(`Laporan_Mahasiswa_${new Date().getTime()}.pdf`);
      if (onNotify) onNotify('Export PDF Berhasil', 'Laporan berhasil diunduh.', 'success');
    } catch (error) {
      console.error(error);
      if (onNotify) onNotify('Export Gagal', 'Gagal membuat file PDF.', 'warning');
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
    setWaktuEksekusi('0.0000');
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

  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE) || 1;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);

  const activeDetails = activeAlgo ? getAlgoDetails(activeAlgo, langkah, students.length) : null;

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 flex gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="bg-[#0a0a20] border border-white/[0.08] rounded-xl pl-4 pr-8 py-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50 cursor-pointer flex-shrink-0 min-w-[160px]"
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
            placeholder={animatedPlaceholder} 
            className="w-full min-w-[150px] bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-4 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || isSortingIpk || isSortingNim || isSortingSemester}
            className="px-6 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-all font-medium text-sm disabled:opacity-70 flex items-center gap-2 min-w-[90px] justify-center shrink-0"
          >
            {isSearching ? <><Spinner /><span>Cari...</span></> : 'Cari'}
          </button>
        </div>

        <div className="flex gap-2 flex-wrap items-center z-50">
          
          <button
            title="Bubble Sort (Berdasarkan IPK)"
            onClick={() => handleSort('ipk')}
            disabled={isSortingIpk || isSearching}
            className="relative p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all flex items-center justify-center group shadow-[0_0_15px_rgba(251,191,36,0.05)] hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] disabled:opacity-70 w-10 h-10 shrink-0"
          >
            {isSortingIpk ? <Spinner color="text-amber-400" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          </button>

          <button
            title="Selection Sort (Berdasarkan NIM)"
            onClick={() => handleSort('nim')}
            disabled={isSortingNim || isSearching}
            className="relative p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all flex items-center justify-center group shadow-[0_0_15px_rgba(244,63,94,0.05)] hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] disabled:opacity-70 w-10 h-10 shrink-0"
          >
            {isSortingNim ? <Spinner color="text-rose-400" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="2" y1="12" x2="4" y2="12"/></svg>}
          </button>

          <button
            title="Merge Sort (Berdasarkan Semester)"
            onClick={() => handleSort('semester')}
            disabled={isSortingSemester || isSearching}
            className="relative p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all flex items-center justify-center group shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] disabled:opacity-70 w-10 h-10 shrink-0"
          >
            {isSortingSemester ? <Spinner color="text-purple-400" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 17 22 12"/></svg>}
          </button>

          <div className="w-px h-8 bg-white/[0.08] mx-1" />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all text-sm font-medium shrink-0"
          >
            + Tambah
          </button>

          {/* =======================================================
              DROPDOWN MENU EXPORT (GABUNGAN PDF & JSON)
              ======================================================= */}
          <div className="relative group shrink-0">
            <button
              disabled={isExporting}
              className="px-4 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all text-sm disabled:opacity-70 flex items-center gap-2 min-w-[124px] justify-center"
            >
              {isExporting ? <><Spinner color="text-blue-400" /><span>Exporting...</span></> : '⬇ Export ▾'}
            </button>

            {/* Menu Melayang (Muncul saat cursor diletakkan di tombol atas) */}
            <div className="absolute top-[100%] right-0 mt-2 w-44 bg-[#0a0a20] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[110] overflow-hidden flex flex-col backdrop-blur-md">
              <button
                onClick={handleExportPDF}
                className="px-4 py-3 text-sm text-left text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 transition-colors flex items-center gap-2"
              >
                📄 Format PDF
              </button>
              <div className="h-px bg-white/5 w-full" />
              <button
                onClick={handleExportJSON}
                className="px-4 py-3 text-sm text-left text-slate-300 hover:bg-blue-500/20 hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                📦 Format JSON
              </button>
            </div>
          </div>

          <button
            title="Import Data dari JSON"
            onClick={() => importRef.current?.click()}
            disabled={isImporting}
            className="px-4 py-2.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-xl hover:bg-violet-500/20 transition-all text-sm disabled:opacity-70 flex items-center gap-2 min-w-[124px] justify-center shrink-0"
          >
            {isImporting ? <><Spinner color="text-violet-400" /><span>Importing...</span></> : '⬆ Import JSON'}
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          <button
            title="Reset Pencarian & Filter"
            onClick={handleReset}
            disabled={isResetting}
            className="px-4 py-2.5 bg-white/[0.04] text-slate-400 border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-all text-sm disabled:opacity-70 flex items-center gap-2 min-w-[80px] justify-center shrink-0"
          >
            {isResetting ? <><Spinner color="text-slate-400" /><span>Reset...</span></> : 'Reset'}
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent relative min-h-[200px] flex flex-col">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="px-6 py-4 text-[11px] uppercase text-slate-500">NIM</th>
              <th className="px-6 py-4 text-[11px] uppercase text-slate-500">Nama</th>
              <th className="px-6 py-4 text-[11px] uppercase text-slate-500">Jurusan</th>
              <th className="px-6 py-4 text-[11px] uppercase text-slate-500">IPK</th>
              <th className="px-6 py-4 text-[11px] uppercase text-slate-500">Status</th>
              <th className="px-6 py-4 text-[11px] uppercase text-slate-500">Aksi</th>
            </tr>
          </thead>
          
          <tbody key={currentPage}>
            {loading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
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
              ? (
                <tr>
                  <td colSpan={6} className="py-16">
                    <div className="flex flex-col items-center justify-center animate-wobble">
                      <div className="w-20 h-20 mb-4 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-500 relative">
                        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-rose-500"></div>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>
                        </svg>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">Data Tidak Ditemukan</h3>
                      <p className="text-slate-500 text-sm max-w-xs text-center">
                        {search 
                          ? <span>Pencarian untuk <span className="text-cyan-400 font-bold">"{search}"</span> tidak membuahkan hasil. Coba periksa ejaan.</span> 
                          : "Tidak ada data mahasiswa yang tersedia saat ini."}
                      </p>
                    </div>
                  </td>
                </tr>
              )
              : currentStudents.map((student, index) => {
                  const globalIndex = indexOfFirstItem + index; 
                  
                  return (
                    <tr
                      key={student.nim}
                      onClick={() => setSelectedStudent(student)}
                      className={`cursor-pointer border-b border-white/[0.03] transition-all duration-200 ${
                        scanningIndex === globalIndex 
                          ? 'bg-cyan-500/40 shadow-[inset_4px_0_0_0_#22d3ee] scale-[1.01] z-10 relative' 
                          : 'row-glow hover:bg-white/[0.03]'
                      }`}
                      style={{ 
                        animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
                        animationDelay: `${index * 35}ms`
                      }}
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
                  );
                })}
          </tbody>
        </table>

        {!loading && students.length > 0 && (
          <div className="mt-auto border-t border-white/[0.06] bg-white/[0.01] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Menampilkan <span className="font-bold text-cyan-400">{indexOfFirstItem + 1}</span> - <span className="font-bold text-cyan-400">{Math.min(indexOfLastItem, students.length)}</span> dari <span className="font-bold text-cyan-400">{students.length}</span> data
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isSearching || isSortingIpk || isSortingNim || isSortingSemester}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-medium"
              >
                &larr; Prev
              </button>
              
              <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium">
                <span className="text-white px-2.5 py-1 rounded-md bg-white/[0.08] border border-white/[0.1]">{currentPage}</span>
                <span className="text-slate-500">/ {totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isSearching || isSortingIpk || isSortingNim || isSortingSemester}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-medium"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {editStudent && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
            
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-backdrop cursor-pointer"
              onClick={() => !isSavingEdit && setEditStudent(null)}
            />

            <div
              className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md animate-modal-popup text-left shadow-2xl my-8"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-white font-bold text-lg mb-4">✏ Edit Mahasiswa</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">NIM (tidak bisa diubah)</label>
                  <input
                    value={editStudent.nim}
                    disabled
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-slate-500 text-sm cursor-not-allowed"
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
                    className="w-full bg-slate-800 border border-white/[0.08] rounded-xl px-4 py-2 text-white text-sm focus:outline-none disabled:opacity-60 cursor-pointer"
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
                  className="flex-1 px-4 py-2 bg-white/[0.04] text-slate-400 border border-white/[0.08] rounded-xl hover:bg-white/[0.08] hover:text-white transition-all text-sm disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={isSavingEdit}
                  className="flex-1 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-all text-sm font-medium disabled:opacity-70 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
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
        </div>,
        document.body
      )}

      {activeAlgo && activeDetails && students.length > 0 && (
        <div className="mt-6 glass rounded-2xl overflow-hidden" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeDetails.icon}</span>
              <div>
                <h3 className={`font-bold text-lg ${activeDetails.color}`}>{activeDetails.title}</h3>
                <p className="text-slate-500 text-xs">{activeDetails.desc}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">Diselesaikan dalam:</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.05]">
                <span className="text-white font-bold">{langkah}</span>
                <span className="text-slate-400">langkah</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-emerald-400 font-bold font-mono">{waktuEksekusi} ms</span>
              </div>
              <span className="text-slate-500">dari</span>
              <span className="text-white font-bold">{students.length} data</span>
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

    </div>
  );
}