
import React, { useState, useMemo, useEffect } from 'react';
import { PeriodEntry } from '../types';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const MOCK_ENTRIES: PeriodEntry[] = [
  { startDate: '2025-01-05', endDate: '2025-01-10', flow: 'Medium' },
  { startDate: '2025-02-02', endDate: '2025-02-07', flow: 'Heavy' },
];

const PeriodTracker: React.FC<{ userId?: string, isGuest: boolean }> = ({ userId, isGuest }) => {
  const [entries, setEntries] = useState<PeriodEntry[]>(isGuest ? MOCK_ENTRIES : []);
  const [loading, setLoading] = useState(!isGuest);

  useEffect(() => {
    if (!isGuest && userId) {
      fetchEntries();
    }
  }, [userId, isGuest]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/tracker?userId=${userId}`);
      setEntries(data.length > 0 ? data : []);
    } catch (error) {
      console.error('Error fetching period entries:', error);
      setEntries(MOCK_ENTRIES); // Fallback to mock if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const [showLogForm, setShowLogForm] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<PeriodEntry>>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    flow: 'Medium'
  });

  const stats = useMemo(() => {
    if (entries.length === 0) return { avgCycle: 28, avgLength: 5, prediction: null };
    const sorted = [...entries].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const lengths = sorted.map(e => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate || e.startDate);
      return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    });
    const avgLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    let avgCycle = 28;
    if (sorted.length > 1) {
      const intervals = [];
      for (let i = 1; i < sorted.length; i++) {
        intervals.push(Math.ceil(Math.abs(new Date(sorted[i].startDate).getTime() - new Date(sorted[i - 1].startDate).getTime()) / (1000 * 60 * 60 * 24)));
      }
      avgCycle = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
    }
    const lastStart = new Date(sorted[sorted.length - 1].startDate);
    const prediction = new Date(lastStart);
    prediction.setDate(prediction.getDate() + avgCycle);
    return { avgCycle, avgLength, prediction };
  }, [entries]);

  const [viewDate, setViewDate] = useState(new Date());
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...[...Array(days).keys()].map(d => new Date(year, month, d + 1))];
  }, [viewDate]);

  const getDayStatus = (date: Date | null) => {
    if (!date) return { isLogged: false, isPredicted: false, flow: null };
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find(e => {
      const start = new Date(e.startDate).toISOString().split('T')[0];
      const end = new Date(e.endDate || e.startDate).toISOString().split('T')[0];
      return dateStr >= start && dateStr <= end;
    });
    if (entry) return { isLogged: true, isPredicted: false, flow: entry.flow };
    if (stats.prediction) {
      const pStart = stats.prediction.toISOString().split('T')[0];
      const pEnd = new Date(stats.prediction);
      pEnd.setDate(pEnd.getDate() + stats.avgLength - 1);
      const isPredicted = dateStr >= pStart && dateStr <= pEnd.toISOString().split('T')[0];
      return { isLogged: false, isPredicted, flow: null };
    }
    return { isLogged: false, isPredicted: false, flow: null };
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.startDate) return;

    if (!isGuest && userId) {
      try {
        await axios.post(`${API_BASE_URL}/tracker`, {
          userId,
          startDate: newEntry.startDate,
          endDate: newEntry.endDate,
          flow: newEntry.flow
        });
        fetchEntries();
      } catch (error) {
        alert('Failed to save entry to database.');
      }
    } else {
      setEntries([...entries, newEntry as PeriodEntry]);
    }
    setShowLogForm(false);
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-40">
        <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-12">
        <div className="space-y-4">
          <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.5em] block">Cycle Intelligence {isGuest && '(Mock Mode)'}</span>
          <h2 className="text-6xl lg:text-[7rem] font-black text-rose-950 tracking-tighter leading-none italic font-['Playfair_Display']">
            Your Health <br /><span className="text-rose-500 font-sans not-italic">Dashboard.</span>
          </h2>
        </div>
        <button
          onClick={() => setShowLogForm(true)}
          className="px-12 py-8 glass-button-primary text-white rounded-[3rem] font-black text-xl uppercase tracking-widest shadow-2xl flex items-center gap-4 group"
        >
          <i className="fas fa-plus group-hover:rotate-180 transition-transform"></i> Record Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: 'Predicted Start', value: stats.prediction?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '---', icon: 'fa-sparkles', color: 'text-rose-500' },
          { label: 'Cycle Average', value: `${stats.avgCycle} Days`, icon: 'fa-sync-alt', color: 'text-rose-400' },
          { label: 'Flow Average', value: `${stats.avgLength} Days`, icon: 'fa-droplet', color: 'text-rose-300' }
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-12 rounded-[4rem] shadow-xl border-rose-100/30 group relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 text-7xl ${item.color} opacity-5 group-hover:opacity-10 transition-opacity`}>
              <i className={`fas ${item.icon}`}></i>
            </div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mb-4">{item.label}</p>
            <p className="text-5xl font-black text-rose-950 tracking-tighter">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 glass-card rounded-[5rem] p-16 shadow-2xl border-white/50">
          <div className="flex items-center justify-between mb-16">
            <h3 className="text-4xl font-black text-rose-950 tracking-tight leading-none italic font-['Playfair_Display']">
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-4">
              <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="w-14 h-14 rounded-2xl glass-card text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"><i className="fas fa-chevron-left"></i></button>
              <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="w-14 h-14 rounded-2xl glass-card text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"><i className="fas fa-chevron-right"></i></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 mb-10">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[10px] font-black text-rose-300 uppercase tracking-widest">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={i} className="aspect-square"></div>;
              const { isLogged, isPredicted } = getDayStatus(date);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-[1.8rem] flex items-center justify-center relative transition-all border-2 ${isLogged ? 'bg-rose-500 border-rose-600 text-white shadow-xl scale-110 z-10' :
                      isPredicted ? 'bg-rose-50 border-rose-100 text-rose-300 border-dashed' :
                        isToday ? 'border-rose-400 text-rose-950 ring-4 ring-rose-50' :
                          'border-transparent hover:bg-rose-50/30 text-rose-900/40'
                    }`}
                >
                  <span className="text-xl font-black tracking-tighter">{date.getDate()}</span>
                  {isToday && !isLogged && <div className="absolute -top-2 px-2 py-0.5 bg-rose-500 text-[6px] text-white font-black uppercase rounded-full">Today</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="glass-card rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-rose-500"><i className="fas fa-history text-7xl"></i></div>
            <h3 className="text-3xl font-black text-rose-950 mb-10 tracking-tight">Recent <span className="text-rose-500">History</span></h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {entries.map((e, idx) => (
                <div key={idx} className="p-6 bg-white/40 rounded-[2.5rem] border border-rose-50 flex items-center gap-6 hover:translate-x-2 transition-transform cursor-default shadow-sm">
                  <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white text-lg"><i className="fas fa-tint"></i></div>
                  <div>
                    <p className="font-black text-rose-950">{new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{e.flow} Flow</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showLogForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-rose-950/40 backdrop-blur-xl animate-reveal">
          <div className="glass-card w-full max-w-xl rounded-[4rem] p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-white/20">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-5xl font-black text-rose-950 tracking-tighter leading-none italic font-['Playfair_Display']">Record <br /><span className="text-rose-500 font-sans not-italic">Entry.</span></h3>
              <button onClick={() => setShowLogForm(false)} className="w-14 h-14 rounded-full glass-card text-gray-400 hover:text-rose-500 flex items-center justify-center transition-all shadow-sm"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleLogSubmit} className="space-y-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] ml-2">Start Date</label>
                <input required type="date" value={newEntry.startDate} onChange={e => setNewEntry({ ...newEntry, startDate: e.target.value })} className="w-full px-8 py-6 rounded-3xl bg-white/40 border border-rose-100 outline-none font-black text-rose-950 focus:ring-4 focus:ring-rose-500/10 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] ml-2">Flow Intensity</label>
                <div className="flex gap-4">
                  {['Light', 'Medium', 'Heavy'].map(f => (
                    <button key={f} type="button" onClick={() => setNewEntry({ ...newEntry, flow: f as any })} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${newEntry.flow === f ? 'bg-rose-500 border-rose-600 text-white shadow-xl' : 'bg-white/40 border-rose-50 text-rose-400'}`}>{f}</button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-8 glass-button-primary text-white rounded-[3rem] font-black text-xl uppercase tracking-[0.3em] shadow-2xl">Confirm Log</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodTracker;
