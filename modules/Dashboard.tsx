
import React from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { calculateStreak, formatCurrency, getGoalProgress, getCategoryColor, getCategoryIcon, getRelativeTime, getHijriDate } from '../utils';
import { Activity, Target, CheckCircle, Flame, ArrowUpRight, ArrowDownRight, Moon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ModuleType } from '../types';

// Animation Component for Dashboard Card
const FallingStarBg = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
            <div 
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                    top: `${Math.random() * 50}%`,
                    left: `${Math.random() * 100}%`,
                    width: Math.random() > 0.5 ? '2px' : '1.5px',
                    height: Math.random() > 0.5 ? '2px' : '1.5px',
                    opacity: 0,
                    boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.4)',
                    animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out ${Math.random() * 2}s`
                }}
            />
        ))}
        {/* Shooting star effect */}
        <div className="absolute top-[-10%] right-[-10%] w-[100px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-0 rotate-[-45deg] origin-right" 
             style={{ animation: 'shootingStar 6s linear infinite 3s' }}></div>
        <style>{`
            @keyframes twinkle {
                0%, 100% { opacity: 0.2; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.5); }
            }
            @keyframes shootingStar {
                0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; width: 0px; }
                10% { width: 80px; }
                20% { transform: translateX(-200px) translateY(200px) rotate(-45deg); opacity: 0; width: 0px; }
                100% { opacity: 0; }
            }
        `}</style>
        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
        </div>
    </div>
);

const Dashboard: React.FC<{ onNavigate: (m: ModuleType) => void }> = ({ onNavigate }) => {
  const { data, toggleTask, toggleHabit } = useLifeOS();
  const { tasks, goals, learnings, finance, health, freelance, career, islam } = data;

  // Stats Calculations
  const productivityScore = React.useMemo(() => {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const weekTasks = tasks.filter(t => new Date(t.createdAt) >= thisWeek);
    const completedTasks = weekTasks.filter(t => t.completed).length;
    const totalTasks = weekTasks.length || 1;
    
    let goalProgress = 0;
    if (goals.length > 0) {
        goalProgress = goals.reduce((acc, g) => acc + getGoalProgress(g), 0) / goals.length;
    }
    return Math.round(((completedTasks / totalTasks) * 0.6 + (goalProgress / 100) * 0.4) * 100);
  }, [tasks, goals]);

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed).length;
  
  const todayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString());
  const completedToday = todayTasks.filter(t => t.completed).length;
  
  const learningStreak = calculateStreak(learnings.map(l => l.date));

  const thisMonth = new Date().getMonth();
  const monthTransactions = finance.transactions.filter(t => new Date(t.date).getMonth() === thisMonth);
  const income = monthTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  // Islam Stats
  const prayersDone = [
      islam.prayerTracker.fajr, 
      islam.prayerTracker.dhuhr, 
      islam.prayerTracker.asr, 
      islam.prayerTracker.maghrib, 
      islam.prayerTracker.isha
  ].filter(Boolean).length;

  const getIconComponent = (iconName: string) => {
    // @ts-ignore
    const Icon = LucideIcons[iconName.charAt(0).toUpperCase() + iconName.slice(1)] || LucideIcons.Flag; 
    // Basic mapping for the hardcoded string names in utils to Lucide
    if (iconName === 'heart') return LucideIcons.Heart;
    if (iconName === 'briefcase') return LucideIcons.Briefcase;
    if (iconName === 'book') return LucideIcons.BookOpen;
    if (iconName === 'wallet') return LucideIcons.Wallet;
    if (iconName === 'user') return LucideIcons.User;
    if (iconName === 'dumbbell') return LucideIcons.Dumbbell;
    return LucideIcons.Flag;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Productivity Score</span>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Activity className="text-indigo-500" size={20} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{productivityScore}%</span>
          </div>
          <div className="mt-3 h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${productivityScore}%` }}></div>
          </div>
        </div>

        <div className="kpi-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Active Goals</span>
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Target className="text-purple-500" size={20} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{activeGoals.length}</span>
            <span className="text-green-500 text-sm mb-1">{completedGoals} done</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">{goals.length} total goals</p>
        </div>

        <div className="kpi-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Today's Tasks</span>
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={20} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{completedToday}/{todayTasks.length}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">{todayTasks.length - completedToday} remaining</p>
        </div>

        <div className="kpi-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Learning Streak</span>
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Flame className="text-orange-500" size={20} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{learningStreak}</span>
            <span className="text-gray-400 mb-1 ml-1 text-sm">days</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Keep it up!</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Goals */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Active Goals</h3>
              <button onClick={() => onNavigate('goals')} className="text-accent text-sm hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {activeGoals.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No active goals.</p>
              ) : (
                activeGoals.slice(0, 3).map(g => {
                  const progress = getGoalProgress(g);
                  const Icon = getIconComponent(getCategoryIcon(g.category));
                  const color = getCategoryColor(g.category);
                  
                  return (
                    <div key={g.id} className="glass-card border border-border rounded-xl p-4 hover:border-accent transition-colors cursor-pointer" onClick={() => onNavigate('goals')}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                            <Icon size={18} style={{ color: color }} />
                          </div>
                          <div>
                            <h4 className="font-medium">{g.title}</h4>
                            <p className="text-xs text-gray-400">{g.timeframe} • {g.deadline ? getRelativeTime(g.deadline) : 'No deadline'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold" style={{ color: color }}>{progress}%</span>
                          <p className="text-xs text-gray-400">{g.checklistItems.filter(i => i.completed).length}/{g.checklistItems.length}</p>
                        </div>
                      </div>
                      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: color }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="glass-card rounded-xl p-5">
             <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Today's Focus</h3>
              <button onClick={() => onNavigate('tasks')} className="text-accent text-sm hover:underline">View All</button>
            </div>
            <div className="space-y-3">
               {todayTasks.length === 0 ? (
                 <p className="text-gray-400 text-center py-4">No tasks for today. Add some!</p>
               ) : (
                 todayTasks.slice(0, 5).map(t => (
                   <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg hover:bg-bg-tertiary transition-all ${t.priority === 'high' ? 'border-l-2 border-red-500 pl-2.5' : t.priority === 'medium' ? 'border-l-2 border-yellow-500 pl-2.5' : 'border-l-2 border-green-500 pl-2.5'}`}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleTask(t.id); }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${t.completed ? 'bg-green-500 border-green-500' : 'border-border'}`}
                      >
                        {t.completed && <CheckCircle size={12} className="text-white" />}
                      </button>
                      <span className={`flex-1 ${t.completed ? 'line-through text-gray-500' : ''}`}>{t.title}</span>
                      {t.goalId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Goal</span>}
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Spiritual Snapshot (Enhanced with Gradient & Stars) */}
          <div 
            className="rounded-xl p-5 relative overflow-hidden group cursor-pointer transition-all shadow-xl hover:shadow-emerald-500/20 border border-emerald-500/30" 
            style={{ background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' }}
            onClick={() => onNavigate('islam')}
          >
              <FallingStarBg />
              
              {/* Content */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-emerald-100/80 text-xs uppercase tracking-widest font-medium">Islamic Date</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center border border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      <Moon className="text-emerald-200" size={14} fill="currentColor" fillOpacity={0.2} />
                  </div>
              </div>
              
              <h3 className="font-serif text-xl md:text-2xl text-white mb-1 relative z-10 drop-shadow-md">{getHijriDate()}</h3>
              
              <div className="flex justify-between items-end mt-4 relative z-10">
                  <div className="flex flex-col">
                      <span className="text-[10px] text-emerald-200/70 uppercase mb-1">Daily Prayers</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">{prayersDone}</span>
                        <span className="text-sm text-emerald-300/60">/ 5</span>
                      </div>
                  </div>
                  
                  {/* Mini Progress Ring or Bar */}
                  <div className="w-16 h-1 bg-emerald-900/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-700" style={{ width: `${(prayersDone/5)*100}%` }}></div>
                  </div>
              </div>
          </div>

          {/* Goal Progress Summary */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-4">Goal Progress</h3>
            <div className="space-y-4">
              {activeGoals.slice(0, 4).map(g => {
                const progress = getGoalProgress(g);
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate flex-1 mr-2">{g.title}</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: getCategoryColor(g.category) }}></div>
                    </div>
                  </div>
                )
              })}
              {activeGoals.length === 0 && <p className="text-gray-400 text-sm">No active goals</p>}
            </div>
          </div>

          {/* Habits */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-4">Today's Habits</h3>
            <div className="space-y-3">
              {health.habits.length === 0 ? <p className="text-gray-400 text-sm">No habits tracked</p> :
               health.habits.slice(0, 5).map(h => {
                 const today = new Date().toDateString();
                 const completedToday = h.completions.includes(today);
                 const streak = calculateStreak(h.completions);
                 return (
                   <div key={h.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary">
                     <button 
                       onClick={() => toggleHabit(h.id)}
                       className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${completedToday ? 'bg-green-500 border-green-500 text-white' : 'border-border text-gray-400'}`}
                     >
                       {completedToday ? <CheckCircle size={16} /> : <span>{h.icon}</span>}
                     </button>
                     <div className="flex-1">
                       <p className="text-sm">{h.name}</p>
                       <p className="text-xs text-gray-400">{streak} day streak</p>
                     </div>
                   </div>
                 );
               })
              }
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-gray-400 text-sm">Monthly Balance</span>
                 <span className={`font-semibold text-sm ${income - expenses >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(income - expenses)}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-400 text-sm">Active Projects</span>
                 <span className="font-semibold text-sm">{freelance.projects.filter((p: any) => p.status === 'active').length}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-400 text-sm">Job Applications</span>
                 <span className="font-semibold text-sm">{career.applications.length}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
