
import React, { useState, useEffect, useMemo } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { getHijriDate, formatDate, calculatePrayerStreak } from '../utils';
import { 
    BookOpen, Moon, Sun, CheckCircle, Plus, Trash2, RotateCcw, Award, 
    HeartHandshake, CloudMoon, Clock, CalendarDays, Fingerprint, RefreshCw, Star, 
    ChevronLeft, ChevronRight, Activity, Calendar, ChevronDown, Sparkles
} from 'lucide-react';
import { HifzStatus, AzkarCategory, PrayerTracker } from '../types';

// Animation Component for Islamic Header
const FallingStarBg = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
            <div 
                key={i}
                className="absolute bg-amber-100 rounded-full"
                style={{
                    top: `${Math.random() * 60}%`,
                    left: `${Math.random() * 100}%`,
                    width: Math.random() > 0.5 ? '2px' : '3px',
                    height: Math.random() > 0.5 ? '2px' : '3px',
                    boxShadow: '0 0 6px 2px rgba(251, 191, 36, 0.2)', // Amber glow
                    animation: `twinkle ${Math.random() * 4 + 2}s infinite ease-in-out ${Math.random() * 2}s`
                }}
            />
        ))}
        {/* Shooting star */}
        <div className="absolute top-[10%] right-[10%] w-[80px] h-[1px] bg-gradient-to-r from-transparent via-amber-100 to-transparent opacity-0 rotate-[-30deg] origin-right" 
             style={{ animation: 'shootingStar 8s linear infinite 3s' }}></div>
        <style>{`
            @keyframes twinkle {
                0%, 100% { opacity: 0.2; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            @keyframes shootingStar {
                0% { transform: translateX(0) translateY(0) rotate(-30deg); opacity: 1; width: 0px; }
                5% { width: 80px; }
                10% { transform: translateX(-150px) translateY(150px) rotate(-30deg); opacity: 0; width: 0px; }
                100% { opacity: 0; }
            }
        `}</style>
    </div>
);

const Islam: React.FC = () => {
  const { 
      data, updateQuranProgress, addHifzItem, updateHifzStatus, deleteHifzItem, 
      togglePrayer, addAzkarItem, incrementAzkar, deleteAzkarItem, resetAzkar,
      addTasbih, updateTasbih, deleteTasbih, resetTasbih
  } = useLifeOS();
  
  const { quran, hifz, dailyAzkar, tasbihs, prayerTracker, prayerHistory } = data.islam;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prayers' | 'calendar' | 'quran' | 'hifz' | 'azkar' | 'tasbih'>('dashboard');

  // Hifz Form
  const [surahName, setSurahName] = useState('');
  const [juzNum, setJuzNum] = useState('');

  // Azkar Form
  const [newAzkarText, setNewAzkarText] = useState('');
  const [newAzkarCount, setNewAzkarCount] = useState(33);
  const [newAzkarCat, setNewAzkarCat] = useState<AzkarCategory>('general');

  // Tasbih Form
  const [newTasbihLabel, setNewTasbihLabel] = useState('');
  const [newTasbihTarget, setNewTasbihTarget] = useState(100);

  // Quran Form
  const [currentPageInput, setCurrentPageInput] = useState(quran.currentPage.toString());
  const [currentJuzInput, setCurrentJuzInput] = useState(quran.currentJuz.toString());

  // Calendar State
  const [calDate, setCalDate] = useState(new Date());

  // Update inputs if quran data changes externally
  useEffect(() => {
      setCurrentPageInput(quran.currentPage.toString());
      setCurrentJuzInput(quran.currentJuz.toString());
  }, [quran]);

  const handleUpdateQuran = () => {
      const p = parseInt(currentPageInput);
      const j = parseInt(currentJuzInput);
      if (p > 0 && j > 0) updateQuranProgress(p, j);
  };

  const handleAddHifz = () => {
      if(!surahName) return;
      addHifzItem({ surahName, juzNumber: parseInt(juzNum) || undefined });
      setSurahName(''); setJuzNum('');
  };

  const handleAddAzkar = () => {
      if(!newAzkarText) return;
      addAzkarItem({ text: newAzkarText, target: newAzkarCount, category: newAzkarCat });
      setNewAzkarText('');
  };

  const handleAddTasbih = () => {
      if(!newTasbihLabel) return;
      addTasbih(newTasbihLabel, newTasbihTarget);
      setNewTasbihLabel('');
  };

  // Helper for Hijri Formatting specific to the Calendar Widget
  const getHijriForDate = (date: Date) => {
      try {
          // Use Intl to format parts
          const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
              day: 'numeric',
              month: 'short',
          }).formatToParts(date);
          
          const day = parts.find(p => p.type === 'day')?.value;
          const month = parts.find(p => p.type === 'month')?.value;
          return { day, month };
      } catch (e) {
          return { day: '?', month: '?' };
      }
  };

  const StatusBadge = ({ status }: { status: HifzStatus }) => {
      const colors = {
          new: 'bg-blue-500/20 text-blue-400',
          weak: 'bg-red-500/20 text-red-400',
          good: 'bg-yellow-500/20 text-yellow-400',
          strong: 'bg-green-500/20 text-green-400',
          mastered: 'bg-purple-500/20 text-purple-400'
      };
      return <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${colors[status]}`}>{status}</span>;
  };

  // Weekly Prayer Stats Calculation
  const getWeeklyStats = () => {
      const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toDateString();
      });

      return last7Days.map(dateStr => {
          const entry = prayerHistory.find(h => h.date === dateStr) || (dateStr === new Date().toDateString() ? prayerTracker : null);
          if (!entry) return { date: dateStr, count: 0, day: new Date(dateStr).toLocaleDateString('en-US', {weekday:'short'}) };
          
          let count = 0;
          if(entry.fajr) count++;
          if(entry.dhuhr) count++;
          if(entry.asr) count++;
          if(entry.maghrib) count++;
          if(entry.isha) count++;
          
          return { date: dateStr, count, day: new Date(dateStr).toLocaleDateString('en-US', {weekday:'short'}) };
      });
  };

  // Prayer History & Stats Logic
  const getPrayerHistoryStats = () => {
      const history = [...prayerHistory, prayerTracker]; // Include today
      const uniqueDays = Array.from(new Set(history.map(h => h.date))).length;
      
      let totalPrayers = 0;
      history.forEach(h => {
          if(h.fajr) totalPrayers++;
          if(h.dhuhr) totalPrayers++;
          if(h.asr) totalPrayers++;
          if(h.maghrib) totalPrayers++;
          if(h.isha) totalPrayers++;
      });
      
      const perfectStreak = calculatePrayerStreak(prayerHistory, prayerTracker);
      const possibleTotal = uniqueDays * 5;
      const rate = possibleTotal > 0 ? Math.round((totalPrayers / possibleTotal) * 100) : 0;

      return { totalPrayers, perfectStreak, rate, history };
  };

  // Upcoming Events Logic (White Days & Festives)
  const upcomingEvents = useMemo(() => {
    const events: { type: 'white_day' | 'festive', date: Date, hDate: string, name: string }[] = [];
    
    // Check next 45 days
    for(let i=0; i<45; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        
        try {
            const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric', month: 'long' }).formatToParts(d);
            const hDay = parseInt(parts.find(p => p.type === 'day')?.value || '0');
            const hMonth = parts.find(p => p.type === 'month')?.value || '';
            
            // White Days (13, 14, 15)
            if ([13, 14, 15].includes(hDay)) {
                events.push({ type: 'white_day', date: d, hDate: `${hDay} ${hMonth}`, name: 'White Day' });
            }
            
            // Major Festives (Simplified Matching)
            if (hMonth.includes('Muharram') && hDay === 10) events.push({ type: 'festive', date: d, hDate: `${hDay} ${hMonth}`, name: 'Ashura' });
            if (hMonth.includes('Rabiʻ I') && hDay === 12) events.push({ type: 'festive', date: d, hDate: `${hDay} ${hMonth}`, name: 'Mawlid al-Nabi' });
            if (hMonth.includes('Rajab') && hDay === 27) events.push({ type: 'festive', date: d, hDate: `${hDay} ${hMonth}`, name: 'Isra & Mi\'raj' });
            if (hMonth.includes('Ramadan') && hDay === 1) events.push({ type: 'festive', date: d, hDate: `${hDay} ${hMonth}`, name: 'Start of Ramadan' });
            if (hMonth.includes('Ramadan') && hDay >= 21 && hDay % 2 !== 0) events.push({ type: 'festive', date: d, hDate: `${hDay} ${hMonth}`, name: 'Odd Night (Laylat al-Qadr)' });
            if (hMonth.includes('Shawwal') && hDay === 1) events.push({ type: 'festive', date: d, hDate: `${hDay} ${hMonth}`, name: 'Eid al-Fitr' });
            if (hMonth.includes('Dhuʻl-Hijjah') && hDay === 9) events.push({ type: 'festive', date: d, hDate: `${hDay} ${hMonth}`, name: 'Day of Arafah' });
            if (hMonth.includes('Dhuʻl-Hijjah') && hDay === 10) events.push({ type: 'festive', date: d, hDate: `${hDay} ${hMonth}`, name: 'Eid al-Adha' });
        } catch(e) {
            // Ignore format errors
        }
    }
    return events;
  }, []);

  const whiteDays = upcomingEvents.filter(e => e.type === 'white_day').slice(0, 3);
  const festiveEvents = upcomingEvents.filter(e => e.type === 'festive').slice(0, 3);

  const weeklyStats = getWeeklyStats();
  const prayerStats = getPrayerHistoryStats();

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
        {/* Top Navigation */}
        <div className="flex flex-wrap gap-2 mb-2">
            {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'prayers', label: 'Prayers', icon: Clock },
                { id: 'calendar', label: 'Calendar', icon: Calendar },
                { id: 'quran', label: 'Quran', icon: BookOpen },
                { id: 'hifz', label: 'Hifz', icon: HeartHandshake },
                { id: 'azkar', label: 'Azkar', icon: Sun },
                { id: 'tasbih', label: 'Tasbih', icon: Fingerprint }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-bg-tertiary text-gray-400 hover:text-white hover:bg-bg-secondary'}`}
                >
                    <tab.icon size={16} />
                    <span className="font-medium text-sm">{tab.label}</span>
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pb-10">
            
            {/* --- DASHBOARD TAB (Summary) --- */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    {/* Header Card */}
                    <div className="rounded-2xl p-8 relative overflow-hidden text-center shadow-2xl border border-emerald-500/30"
                         style={{ background: 'linear-gradient(180deg, #0f172a 0%, #064e3b 100%)' }}> {/* Midnight to Emerald */}
                        <FallingStarBg />
                        
                        {/* Geometric Overlay */}
                        <div className="absolute inset-0 opacity-10" 
                             style={{ backgroundImage: 'radial-gradient(circle at 50% 120%, #10b981 0%, transparent 50%)' }}></div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                                Today
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-300 drop-shadow-sm mb-4">
                                {getHijriDate()}
                            </h1>
                            <p className="text-lg text-emerald-100/80 font-light flex items-center gap-2">
                                <CalendarDays size={18} className="text-emerald-400" />
                                {formatDate(new Date(), 'full')}
                            </p>
                        </div>
                    </div>

                    {/* Namaz Tracker Summary */}
                    <div className="glass-card rounded-xl p-6 border-emerald-500/10">
                        <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Clock className="text-emerald-400" /> Today's Prayers</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            {[
                                { label: 'Fajr', done: prayerTracker.fajr, id: 'fajr' },
                                { label: 'Dhuhr', done: prayerTracker.dhuhr, id: 'dhuhr' },
                                { label: 'Asr', done: prayerTracker.asr, id: 'asr' },
                                { label: 'Maghrib', done: prayerTracker.maghrib, id: 'maghrib' },
                                { label: 'Isha', done: prayerTracker.isha, id: 'isha' }
                            ].map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => togglePrayer(p.id as any)}
                                    className={`relative pt-6 pb-4 px-2 rounded-t-[3rem] rounded-b-xl border transition-all flex flex-col items-center gap-2 overflow-hidden group ${
                                        p.done 
                                        ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 text-white border-emerald-500/50 shadow-lg shadow-emerald-900/50' 
                                        : 'bg-bg-tertiary/50 border-white/5 text-gray-400 hover:bg-bg-tertiary hover:border-emerald-500/30'
                                    }`}
                                >
                                    {/* Inner decorative line for arch effect */}
                                    <div className={`absolute top-2 inset-x-4 h-full rounded-t-[2.5rem] border-t border-x ${p.done ? 'border-white/20' : 'border-white/5'} pointer-events-none`}></div>
                                    
                                    <div className={`w-2 h-2 rounded-full mb-1 ${p.done ? 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]' : 'bg-gray-700'}`}></div>
                                    <span className="font-serif text-lg tracking-wide">{p.label}</span>
                                    {p.done && <CheckCircle size={16} className="mt-1 text-emerald-200" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Events: White Days & Festives */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* White Days Card */}
                        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-16 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="flex items-center gap-2 mb-4">
                                <Moon className="text-blue-400" size={20} />
                                <h3 className="font-bold text-lg">White Days (Ayyam al-Bid)</h3>
                            </div>
                            
                            <div className="space-y-3 relative z-10">
                                {whiteDays.length > 0 ? (
                                    whiteDays.map((event, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary/50 border border-border">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white">{formatDate(event.date, 'short')}</span>
                                                <span className="text-xs text-gray-400">{event.hDate}</span>
                                            </div>
                                            <span className="px-2 py-1 rounded text-[10px] bg-blue-500/10 text-blue-400 uppercase font-bold">Sunnah</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No upcoming white days in range.</p>
                                )}
                            </div>
                        </div>

                        {/* Month Festives Card */}
                        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-16 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="text-purple-400" size={20} />
                                <h3 className="font-bold text-lg">Upcoming Events</h3>
                            </div>
                            
                            <div className="space-y-3 relative z-10">
                                {festiveEvents.length > 0 ? (
                                    festiveEvents.map((event, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary/50 border border-border">
                                             <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white">{event.name}</span>
                                                <span className="text-xs text-gray-400">{formatDate(event.date, 'short')}</span>
                                            </div>
                                            <span className="px-2 py-1 rounded text-[10px] bg-purple-500/10 text-purple-400 uppercase font-bold">{event.hDate}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm py-2">No major events upcoming shortly.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card rounded-xl p-6">
                             <h3 className="font-bold text-lg mb-4">Daily Hadith</h3>
                             <blockquote className="italic text-gray-300 border-l-4 border-emerald-500 pl-4 py-2">
                                "The difference between a man and shirk and kufr is the abandoning of salah."
                             </blockquote>
                             <p className="text-right text-xs text-gray-500 mt-2">— Sahih Muslim</p>
                        </div>
                        <div className="glass-card rounded-xl p-6 flex flex-col justify-center">
                             <div className="flex justify-between items-center mb-2">
                                 <h3 className="font-bold text-lg">Azkar Progress</h3>
                                 <span className="text-emerald-400 text-sm">{dailyAzkar.filter(a => a.completed).length} / {dailyAzkar.length}</span>
                             </div>
                             <div className="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-emerald-500 transition-all duration-500" 
                                    style={{ width: `${(dailyAzkar.filter(a => a.completed).length / (dailyAzkar.length || 1)) * 100}%` }}
                                 ></div>
                             </div>
                             <button onClick={() => setActiveTab('azkar')} className="mt-4 text-xs text-gray-400 hover:text-white text-right">View All &rarr;</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PRAYERS TAB (Detailed History) --- */}
            {activeTab === 'prayers' && (
                <div className="space-y-6">
                    {/* Stats Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-emerald-500/10 to-transparent border-l-4 border-emerald-500">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Streak</p>
                            <h3 className="text-3xl font-bold text-white flex items-end gap-2">
                                {prayerStats.perfectStreak} <span className="text-sm font-normal text-emerald-400 mb-1">Days (All 5)</span>
                            </h3>
                        </div>
                        <div className="glass-card rounded-xl p-6">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Completion Rate</p>
                            <h3 className="text-3xl font-bold text-white flex items-end gap-2">
                                {prayerStats.rate}% <span className="text-sm font-normal text-gray-500 mb-1">Overall</span>
                            </h3>
                        </div>
                        <div className="glass-card rounded-xl p-6">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Offered</p>
                            <h3 className="text-3xl font-bold text-white flex items-end gap-2">
                                {prayerStats.totalPrayers} <span className="text-sm font-normal text-gray-500 mb-1">Prayers Logged</span>
                            </h3>
                        </div>
                    </div>

                     {/* Today's Toggles (Detailed) */}
                     <div className="glass-card rounded-xl p-6">
                        <h3 className="font-bold text-xl mb-6">Log Today's Salah</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                            {[
                                { label: 'Fajr', done: prayerTracker.fajr, id: 'fajr', time: 'Pre-Dawn' },
                                { label: 'Dhuhr', done: prayerTracker.dhuhr, id: 'dhuhr', time: 'Noon' },
                                { label: 'Asr', done: prayerTracker.asr, id: 'asr', time: 'Afternoon' },
                                { label: 'Maghrib', done: prayerTracker.maghrib, id: 'maghrib', time: 'Sunset' },
                                { label: 'Isha', done: prayerTracker.isha, id: 'isha', time: 'Night' }
                            ].map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => togglePrayer(p.id as any)}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 h-32 relative overflow-hidden group ${p.done ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-bg-tertiary border-border hover:border-emerald-500/50'}`}
                                >
                                    {p.done && <div className="absolute inset-0 bg-emerald-500 opacity-20 animate-pulse"></div>}
                                    <span className="text-xs opacity-70 uppercase tracking-widest">{p.time}</span>
                                    <span className="font-bold text-xl">{p.label}</span>
                                    {p.done ? <CheckCircle size={24} className="mt-2 text-white" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-600 mt-2 group-hover:border-emerald-500 transition-colors"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* History Log */}
                    <div className="glass-card rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-border bg-bg-tertiary/20">
                            <h3 className="font-bold text-lg">History Log</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="text-xs uppercase text-gray-500 border-b border-border/50">
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium text-center">Fajr</th>
                                        <th className="p-4 font-medium text-center">Dhuhr</th>
                                        <th className="p-4 font-medium text-center">Asr</th>
                                        <th className="p-4 font-medium text-center">Maghrib</th>
                                        <th className="p-4 font-medium text-center">Isha</th>
                                        <th className="p-4 font-medium text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[prayerTracker, ...prayerHistory].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30).map((entry, idx) => {
                                        const count = [entry.fajr, entry.dhuhr, entry.asr, entry.maghrib, entry.isha].filter(Boolean).length;
                                        const isToday = entry.date === new Date().toDateString();
                                        
                                        return (
                                            <tr key={idx} className={`border-b border-border/30 hover:bg-bg-tertiary/30 transition-colors ${isToday ? 'bg-emerald-500/5' : ''}`}>
                                                <td className="p-4 font-medium">
                                                    <div>{formatDate(entry.date, 'short')}</div>
                                                    {isToday && <span className="text-[10px] text-emerald-500 font-bold uppercase">Today</span>}
                                                </td>
                                                {[entry.fajr, entry.dhuhr, entry.asr, entry.maghrib, entry.isha].map((done, i) => (
                                                    <td key={i} className="p-4 text-center">
                                                        <div className={`w-2 h-2 rounded-full mx-auto ${done ? 'bg-emerald-500' : 'bg-bg-tertiary border border-gray-600'}`}></div>
                                                    </td>
                                                ))}
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${count === 5 ? 'bg-emerald-500/20 text-emerald-400' : count >= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {count}/5
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CALENDAR WIDGET TAB --- */}
            {activeTab === 'calendar' && (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6 bg-bg-tertiary/20 p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold font-mono">
                                {calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex gap-1">
                                <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))} className="p-2 hover:bg-bg-tertiary rounded-lg border border-border/50"><ChevronLeft size={20} /></button>
                                <button onClick={() => setCalDate(new Date())} className="px-3 py-1 text-sm hover:bg-bg-tertiary rounded-lg border border-border/50">Today</button>
                                <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))} className="p-2 hover:bg-bg-tertiary rounded-lg border border-border/50"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-xs text-emerald-400 uppercase tracking-widest">Islamic Calendar</p>
                            <p className="text-sm text-gray-400">View Hijri dates for any month</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px mb-2 text-center text-gray-500 text-xs uppercase font-bold">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr min-h-[400px]">
                        {(() => {
                            const year = calDate.getFullYear();
                            const month = calDate.getMonth();
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const firstDay = new Date(year, month, 1).getDay();
                            
                            const emptyCells = Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`}></div>);
                            
                            const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const date = new Date(year, month, day);
                                const dateStr = date.toDateString();
                                const isToday = new Date().toDateString() === dateStr;
                                const hijri = getHijriForDate(date);
                                
                                // Simple Event Highlighting (Mockup logic - real logic requires complex libraries)
                                // We can highlight Fridays
                                const isFriday = date.getDay() === 5;

                                return (
                                    <div 
                                        key={day} 
                                        className={`glass-card rounded-lg p-2 flex flex-col justify-between hover:border-emerald-500/50 transition-colors ${isToday ? 'bg-emerald-500/10 border-emerald-500' : 'bg-bg-tertiary/30'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-gray-300'}`}>{day}</span>
                                            {isFriday && <span className="text-[10px] text-emerald-400 font-bold">Jumu'ah</span>}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-emerald-300/80 font-mono">{hijri.day}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{hijri.month}</div>
                                        </div>
                                    </div>
                                );
                            });

                            return [...emptyCells, ...dayCells];
                        })()}
                    </div>
                </div>
            )}

            {/* --- QURAN TAB --- */}
            {activeTab === 'quran' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-32 h-32 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-500 relative">
                            <BookOpen size={48} />
                            <div className="absolute -bottom-2 bg-bg-secondary px-3 py-1 rounded-full text-xs border border-emerald-500/30">
                                Juz {quran.currentJuz}
                            </div>
                        </div>
                        <h3 className="text-5xl font-bold mb-2 text-white">{quran.currentPage}</h3>
                        <p className="text-gray-400 mb-6 uppercase tracking-widest text-xs">Current Page</p>
                        
                        <div className="w-full h-4 bg-bg-tertiary rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{ width: `${(quran.currentPage / 604) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-emerald-400 font-medium">{(quran.currentPage / 604 * 100).toFixed(1)}% Completed</p>
                    </div>

                    <div className="glass-card rounded-xl p-6">
                        <h3 className="font-semibold mb-6 text-xl">Update Progress</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs text-gray-400 block mb-2 font-bold uppercase">Page Number (1-604)</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPageInput(Math.max(1, parseInt(currentPageInput) - 1).toString())} className="p-3 bg-bg-tertiary rounded-lg hover:bg-bg-secondary">-</button>
                                    <input 
                                        type="number" 
                                        value={currentPageInput} 
                                        onChange={(e) => setCurrentPageInput(e.target.value)} 
                                        className="flex-1 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-emerald-500 outline-none text-center font-bold text-lg"
                                    />
                                    <button onClick={() => setCurrentPageInput(Math.min(604, parseInt(currentPageInput) + 1).toString())} className="p-3 bg-bg-tertiary rounded-lg hover:bg-bg-secondary">+</button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-2 font-bold uppercase">Juz Number (1-30)</label>
                                <input 
                                    type="number" 
                                    value={currentJuzInput} 
                                    onChange={(e) => setCurrentJuzInput(e.target.value)} 
                                    className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <button onClick={handleUpdateQuran} className="w-full bg-emerald-600 py-4 rounded-xl font-bold text-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
                                Save Progress
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-2">Last updated: {formatDate(quran.lastReadDate, 'short')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HIFZ TAB --- */}
            {activeTab === 'hifz' && (
                <div className="space-y-6">
                    <div className="glass-card rounded-xl p-6 border border-emerald-500/20 bg-emerald-500/5">
                         <h3 className="font-semibold mb-4 text-emerald-400 flex items-center gap-2"><Plus size={18} /> New Hifz Goal</h3>
                         <div className="flex flex-col md:flex-row gap-4">
                            <input 
                                value={surahName} 
                                onChange={(e) => setSurahName(e.target.value)} 
                                placeholder="Surah Name" 
                                className="flex-1 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-emerald-500 outline-none"
                            />
                            <input 
                                type="number"
                                value={juzNum} 
                                onChange={(e) => setJuzNum(e.target.value)} 
                                placeholder="Juz" 
                                className="w-full md:w-24 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-emerald-500 outline-none"
                            />
                            <button onClick={handleAddHifz} className="bg-emerald-600 px-6 py-2 rounded-lg font-medium hover:bg-emerald-500 transition-colors">
                                Add
                            </button>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hifz.map(item => (
                            <div key={item.id} className="glass-card rounded-xl p-5 relative group hover:border-emerald-500/50 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg">{item.surahName}</h4>
                                    <StatusBadge status={item.status} />
                                </div>
                                {item.juzNumber && <p className="text-xs text-gray-500 mb-4">Juz {item.juzNumber}</p>}
                                
                                <p className="text-[10px] text-gray-500 mb-3">Last Revised: {formatDate(item.lastRevised, 'short')}</p>

                                <div className="mt-4">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Update Status</label>
                                    <div className="relative">
                                        <select
                                            value={item.status}
                                            onChange={(e) => updateHifzStatus(item.id, e.target.value as HifzStatus)}
                                            className="w-full appearance-none bg-bg-tertiary border border-border text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-emerald-500 cursor-pointer hover:bg-bg-tertiary/80 transition-colors"
                                        >
                                            <option value="new">New</option>
                                            <option value="weak">Weak</option>
                                            <option value="good">Good</option>
                                            <option value="strong">Strong</option>
                                            <option value="mastered">Mastered</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>
                                </div>
                                
                                <button onClick={() => deleteHifzItem(item.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- AZKAR TAB --- */}
            {activeTab === 'azkar' && (
                <div className="space-y-6">
                    {/* Categories */}
                    {[
                        { id: 'morning', label: 'Morning Adhkar', icon: Sun },
                        { id: 'evening', label: 'Evening Adhkar', icon: CloudMoon },
                        { id: 'sleep', label: 'Sleep Adhkar', icon: Moon },
                        { id: 'general', label: 'General / Daily Wirs', icon: Star }
                    ].map(cat => {
                        const items = dailyAzkar.filter(a => a.category === cat.id);
                        if (items.length === 0 && cat.id !== 'general') return null;

                        return (
                            <div key={cat.id} className="glass-card rounded-xl overflow-hidden">
                                <div className="p-4 bg-bg-tertiary/50 border-b border-border flex items-center gap-3">
                                    <cat.icon size={20} className="text-emerald-400" />
                                    <h3 className="font-bold text-lg">{cat.label}</h3>
                                </div>
                                <div className="divide-y divide-border/50">
                                    {items.map(azkar => (
                                        <div key={azkar.id} className="p-4 flex items-center justify-between hover:bg-bg-tertiary/20 transition-colors group">
                                            <div className="flex-1">
                                                <p className={`font-medium text-lg ${azkar.completed ? 'text-emerald-400 line-through opacity-70' : 'text-gray-200'}`}>
                                                    {azkar.text}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Target: {azkar.target} times</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => incrementAzkar(azkar.id, 1)}
                                                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${azkar.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-600 hover:border-emerald-500 text-gray-400 hover:text-white'}`}
                                                >
                                                    {azkar.completed ? <CheckCircle size={20} /> : <span className="font-mono">{azkar.count}</span>}
                                                </button>
                                                <button onClick={() => deleteAzkarItem(azkar.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="p-6 text-center text-gray-500 italic">No azkars in this category.</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* Add Azkar Form */}
                    <div className="glass-card rounded-xl p-6 border-dashed border-2 border-border/50">
                        <h4 className="font-bold mb-4 text-gray-400">Add Custom Azkar</h4>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input 
                                value={newAzkarText} 
                                onChange={(e) => setNewAzkarText(e.target.value)} 
                                placeholder="Azkar Text" 
                                className="flex-1 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-emerald-500 outline-none"
                            />
                            <select 
                                value={newAzkarCat} 
                                onChange={(e) => setNewAzkarCat(e.target.value as AzkarCategory)}
                                className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-emerald-500 outline-none"
                            >
                                <option value="morning">Morning</option>
                                <option value="evening">Evening</option>
                                <option value="sleep">Sleep</option>
                                <option value="general">General</option>
                            </select>
                             <input 
                                type="number"
                                value={newAzkarCount} 
                                onChange={(e) => setNewAzkarCount(parseInt(e.target.value))} 
                                placeholder="Target" 
                                className="w-24 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-emerald-500 outline-none"
                            />
                            <button onClick={handleAddAzkar} className="bg-bg-tertiary border border-border px-6 py-2 rounded-lg font-medium hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TASBIH TAB --- */}
            {activeTab === 'tasbih' && (
                <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tasbihs.map(t => (
                            <div key={t.id} className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center relative group">
                                <button onClick={() => deleteTasbih(t.id)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                </button>
                                
                                <h3 className="text-xl font-bold mb-1 text-gray-300">{t.label}</h3>
                                <p className="text-xs text-gray-500 mb-6">Target: {t.target}</p>
                                
                                <div className="relative">
                                    <button 
                                        onClick={() => updateTasbih(t.id, t.count + 1)}
                                        className="w-40 h-40 rounded-full bg-gradient-to-br from-bg-tertiary to-bg-secondary border-4 border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)] active:scale-95 transition-transform"
                                    >
                                        <span className="text-6xl font-mono font-bold text-emerald-400">{t.count}</span>
                                    </button>
                                </div>
                                
                                <div className="flex gap-4 mt-8 w-full px-8">
                                    <button 
                                        onClick={() => resetTasbih(t.id)}
                                        className="flex-1 py-2 rounded-lg bg-bg-tertiary hover:bg-bg-secondary text-gray-400 text-sm flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={14} /> Reset
                                    </button>
                                     <button 
                                        onClick={() => updateTasbih(t.id, t.count > 0 ? t.count - 1 : 0)}
                                        className="flex-1 py-2 rounded-lg bg-bg-tertiary hover:bg-bg-secondary text-gray-400 text-sm"
                                    >
                                        -1
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add New Tasbih */}
                        <div className="glass-card rounded-2xl p-6 flex flex-col justify-center border-dashed border-2 border-border/50 bg-transparent min-h-[300px]">
                            <h3 className="text-center font-bold text-gray-400 mb-6">Create New Counter</h3>
                            <div className="space-y-4 max-w-xs mx-auto w-full">
                                <input 
                                    value={newTasbihLabel} 
                                    onChange={(e) => setNewTasbihLabel(e.target.value)} 
                                    placeholder="Label (e.g. Salawat)" 
                                    className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-emerald-500 outline-none text-center"
                                />
                                <input 
                                    type="number"
                                    value={newTasbihTarget} 
                                    onChange={(e) => setNewTasbihTarget(parseInt(e.target.value))} 
                                    placeholder="Target Count" 
                                    className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-emerald-500 outline-none text-center"
                                />
                                <button onClick={handleAddTasbih} className="w-full bg-emerald-600 py-3 rounded-lg font-bold hover:bg-emerald-500 transition-colors">
                                    Create Widget
                                </button>
                            </div>
                        </div>
                     </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default Islam;
