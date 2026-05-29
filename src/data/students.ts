export interface Student {
  nim: string;
  nama: string;
  ipk: number;
  status: 'Aktif' | 'Cuti' | 'Lulus' | 'Drop Out';
  jurusan: string;
  semester: number;
  email: string;
  telepon: string;
  alamat: string;
  tanggalMasuk: string;
  foto: string;
}

export const students: Student[] = [
  {
    nim: '2024001',
    nama: 'Arya Wijaya',
    ipk: 3.87,
    status: 'Aktif',
    jurusan: 'Teknik Informatika',
    semester: 4,
    email: 'arya.wijaya@technova.ac.id',
    telepon: '0812-3456-7890',
    alamat: 'Jl. Merdeka No. 45, Jakarta Selatan',
    tanggalMasuk: '2022-08-01',
    foto: '👨‍💻',
  },
  {
    nim: '2024002',
    nama: 'Siti Nurhaliza',
    ipk: 3.95,
    status: 'Aktif',
    jurusan: 'Sistem Informasi',
    semester: 4,
    email: 'siti.nurhaliza@technova.ac.id',
    telepon: '0813-2345-6789',
    alamat: 'Jl. Sudirman No. 12, Bandung',
    tanggalMasuk: '2022-08-01',
    foto: '👩‍🎓',
  },
  {
    nim: '2024003',
    nama: 'Budi Santoso',
    ipk: 3.42,
    status: 'Aktif',
    jurusan: 'Teknik Komputer',
    semester: 4,
    email: 'budi.santoso@technova.ac.id',
    telepon: '0856-7890-1234',
    alamat: 'Jl. Gatot Subroto No. 78, Surabaya',
    tanggalMasuk: '2022-08-01',
    foto: '👨‍🔬',
  },
  {
    nim: '2024004',
    nama: 'Dewi Lestari',
    ipk: 2.89,
    status: 'Cuti',
    jurusan: 'Teknik Informatika',
    semester: 6,
    email: 'dewi.lestari@technova.ac.id',
    telepon: '0878-9012-3456',
    alamat: 'Jl. Diponegoro No. 33, Yogyakarta',
    tanggalMasuk: '2021-08-01',
    foto: '👩‍💼',
  },
  {
    nim: '2024005',
    nama: 'Rizky Pratama',
    ipk: 3.71,
    status: 'Aktif',
    jurusan: 'Data Science',
    semester: 4,
    email: 'rizky.pratama@technova.ac.id',
    telepon: '0821-5678-9012',
    alamat: 'Jl. Ahmad Yani No. 56, Semarang',
    tanggalMasuk: '2022-08-01',
    foto: '🧑‍💻',
  },
  {
    nim: '2024006',
    nama: 'Putri Amelia',
    ipk: 3.98,
    status: 'Lulus',
    jurusan: 'Sistem Informasi',
    semester: 8,
    email: 'putri.amelia@technova.ac.id',
    telepon: '0857-4321-8765',
    alamat: 'Jl. Pemuda No. 90, Medan',
    tanggalMasuk: '2020-08-01',
    foto: '👩‍🏫',
  },
  {
    nim: '2024007',
    nama: 'Fajar Nugroho',
    ipk: 2.15,
    status: 'Drop Out',
    jurusan: 'Teknik Komputer',
    semester: 3,
    email: 'fajar.nugroho@technova.ac.id',
    telepon: '0838-6789-5432',
    alamat: 'Jl. Veteran No. 21, Makassar',
    tanggalMasuk: '2023-08-01',
    foto: '🧑‍🔧',
  },
  {
    nim: '2024008',
    nama: 'Nadia Safitri',
    ipk: 3.65,
    status: 'Aktif',
    jurusan: 'Cyber Security',
    semester: 4,
    email: 'nadia.safitri@technova.ac.id',
    telepon: '0819-8765-4321',
    alamat: 'Jl. Pahlawan No. 67, Denpasar',
    tanggalMasuk: '2022-08-01',
    foto: '👩‍💻',
  },
  {
    nim: '2024009',
    nama: 'Hendra Gunawan',
    ipk: 3.33,
    status: 'Aktif',
    jurusan: 'Teknik Informatika',
    semester: 6,
    email: 'hendra.gunawan@technova.ac.id',
    telepon: '0852-1234-5678',
    alamat: 'Jl. Imam Bonjol No. 14, Palembang',
    tanggalMasuk: '2021-08-01',
    foto: '👨‍🎓',
  },
  {
    nim: '2024010',
    nama: 'Layla Azzahra',
    ipk: 3.78,
    status: 'Aktif',
    jurusan: 'Data Science',
    semester: 4,
    email: 'layla.azzahra@technova.ac.id',
    telepon: '0815-9876-5432',
    alamat: 'Jl. Teuku Umar No. 29, Malang',
    tanggalMasuk: '2022-08-01',
    foto: '👩‍🔬',
  },
];

export const getStatusColor = (status: Student['status']): string => {
  switch (status) {
    case 'Aktif': return 'text-emerald-400';
    case 'Cuti': return 'text-amber-400';
    case 'Lulus': return 'text-cyan-400';
    case 'Drop Out': return 'text-rose-400';
    default: return 'text-slate-400';
  }
};

export const getStatusBg = (status: Student['status']): string => {
  switch (status) {
    case 'Aktif': return 'bg-emerald-400/10 border-emerald-400/20';
    case 'Cuti': return 'bg-amber-400/10 border-amber-400/20';
    case 'Lulus': return 'bg-cyan-400/10 border-cyan-400/20';
    case 'Drop Out': return 'bg-rose-400/10 border-rose-400/20';
    default: return 'bg-slate-400/10 border-slate-400/20';
  }
};

export const getIpkColor = (ipk: number): string => {
  if (ipk >= 3.75) return 'text-emerald-400';
  if (ipk >= 3.5) return 'text-cyan-400';
  if (ipk >= 3.0) return 'text-amber-400';
  return 'text-rose-400';
};