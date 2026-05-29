import { useState } from 'react';

const academicEvents: Record<string, { label: string; color: string }[]> = {
  // Semester Genap 2025/2026
  '2026-02-02': [{ label: 'Awal Semester Genap 2025/2026', color: 'bg-cyan-400' }],
  '2026-02-16': [{ label: 'Batas Pengambilan KRS', color: 'bg-amber-400' }],
  '2026-03-30': [{ label: 'Libur Nyepi', color: 'bg-rose-400' }],
  '2026-04-03': [{ label: 'Libur Wafat Isa Al-Masih', color: 'bg-rose-400' }],
  '2026-04-06': [{ label: 'Pekan UTS', color: 'bg-purple-400' }],
  '2026-04-07': [{ label: 'Pekan UTS', color: 'bg-purple-400' }],
  '2026-04-08': [{ label: 'Pekan UTS', color: 'bg-purple-400' }],
  '2026-04-09': [{ label: 'Pekan UTS', color: 'bg-purple-400' }],
  '2026-04-10': [{ label: 'Pekan UTS', color: 'bg-purple-400' }],
  '2026-05-01': [{ label: 'Libur Hari Buruh', color: 'bg-rose-400' }],
  '2026-05-14': [{ label: 'Libur Kenaikan Isa', color: 'bg-rose-400' }],
  '2026-05-25': [{ label: 'Libur Hari Raya Waisak', color: 'bg-rose-400' }],
  '2026-06-01': [{ label: 'Libur Hari Pancasila', color: 'bg-rose-400' }],
  '2026-06-05': [{ label: 'Batas Pengumpulan Tugas Akhir', color: 'bg-amber-400' }],
  '2026-06-15': [{ label: 'Pekan UAS', color: 'bg-emerald-400' }],
  '2026-06-16': [{ label: 'Pekan UAS', color: 'bg-emerald-400' }],
  '2026-06-17': [{ label: 'Pekan UAS', color: 'bg-emerald-400' }],
  '2026-06-18': [{ label: 'Pekan UAS', color: 'bg-emerald-400' }],
  '2026-06-19': [{ label: 'Pekan UAS', color: 'bg-emerald-400' }],
  '2026-06-30': [{ label: 'Pengumuman Hasil Studi', color: 'bg-cyan-400' }],
  '2026-07-01': [{ label: 'Libur Semester', color: 'bg-rose-400' }],

  // Semester Ganjil 2026/2027
  '2026-08-03': [{ label: 'Awal Semester Ganjil 2026/2027', color: 'bg-cyan-400' }],
  '2026-08-17': [{ label: 'Libur HUT RI ke-81', color: 'bg-rose-400' }],
  '2026-09-14': [{ label: 'Batas Pengambilan KRS', color: 'bg-amber-400' }],
  '2026-10-05': [{ label: 'Pekan UTS', color: 'bg-purple-400' }],
  '2026-10-06': [{ label: 'Pekan UTS', color: 'bg-purple-400' }],
  '2026-10-07': [{ label: 'Pekan UTS', color: 'bg-purple-400' }],
  '2026-10-08': [{ label: 'Pekan UTS', color: 'bg-purple-400' }],
  '2026-10-09': [{ label: 'Pekan UTS', color: 'bg-purple-400' }],
  '2026-11-10': [{ label: 'Libur Hari Pahlawan', color: 'bg-rose-400' }],
  '2026-12-05': [{ label: 'Batas Pengumpulan Tugas Akhir', color: 'bg-amber-400' }],
  '2026-12-14': [{ label: 'Pekan UAS', color: 'bg-emerald-400' }],
  '2026-12-15': [{ label: 'Pekan UAS', color: 'bg-emerald-400' }],
  '2026-12-16': [{ label: 'Pekan UAS', color: 'bg-emerald-400' }],
  '2026-12-17': [{ label: 'Pekan UAS', color: 'bg-emerald-400' }],
  '2026-12-18': [{ label: 'Pekan UAS', color: 'bg-emerald-400' }],
  '2026-12-25': [{ label: 'Libur Natal', color: 'bg-rose-400' }],
  '2026-12-31': [{ label: 'Pengumuman Hasil Studi', color: 'bg-cyan-400' }],
};

const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const dayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

export default function AcademicCalendar() {
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const eventsThisMonth = Object.entries(academicEvents)
    .filter(([date]) => {
      const d = new Date(date);
      return d.getFullYear() === calYear && d.getMonth() === calMonth;
    })
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc: [string, { label: string; color: string }[]][], [date, evs]) => {
      const existing = acc.find(([d]) => d === date);
      if (!existing) acc.push([date, evs]);
      return acc;
    }, []);

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="text-white font-semibold font-[Outfit]">{monthNames[calMonth]} {calYear}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] text-slate-500 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const events = academicEvents[dateStr] || [];
          const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
          const isSelected = selectedDate === dateStr;
          const isSunday = new Date(calYear, calMonth, day).getDay() === 0;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-start pt-1 text-xs font-medium transition-all duration-200 ${
                isSelected ? 'bg-cyan-400/20 border border-cyan-400/40 text-cyan-400' :
                isToday ? 'bg-cyan-400 text-[#050510] font-bold' :
                events.length > 0 ? 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-white' :
                isSunday ? 'text-rose-400 hover:bg-white/[0.04]' :
                'text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              {day}
              {events.length > 0 && !isToday && (
                <div className="flex gap-0.5 mt-0.5">
                  {events.slice(0, 2).map((ev, ei) => (
                    <span key={ei} className={`w-1 h-1 rounded-full ${ev.color}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && academicEvents[selectedDate] && (
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <p className="text-xs text-slate-400 mb-2">📌 {selectedDate}:</p>
          {academicEvents[selectedDate].map((ev, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ev.color}`} />
              <span className="text-sm text-white">{ev.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Event List This Month */}
      {eventsThisMonth.length > 0 && (
        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Event Bulan Ini</p>
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {eventsThisMonth.map(([date, evs]) => (
              <div key={date} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${evs[0].color}`} />
                <span className="text-slate-400 font-mono">{date.split('-')[2]}</span>
                <span className="text-slate-300">{evs[0].label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-white/[0.06] text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"/>Akademik</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block"/>UTS</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>UAS</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Deadline</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block"/>Libur</span>
      </div>
    </div>
  );
}