import React, { useState, useMemo } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { calculateStreak, formatDate } from '../utils';
import { Heart, Plus, Trash2, Check, Flame, Dumbbell, Activity, Scale, TrendingUp, Calendar, ChevronDown } from 'lucide-react';

const Health: React.FC = () => {
  const { data, addHabit, toggleHabit, deleteHabit, addWorkout, deleteWorkout, addWeightEntry, deleteWeightEntry } = useLifeOS();
  const [activeTab, setActiveTab] = useState<'habits' | 'workouts' | 'body'>('habits');
  
  // Habits Form
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [icon, setIcon] = useState('💪');

  // Workout Form
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [exercises, setExercises] = useState<{name: string, sets: string, reps: string, weight: string}[]>([{name: '', sets: '', reps: '', weight: ''}]);

  // Weight Form
  const [weight, setWeight] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);

  const habits = data.health.habits;
  const workouts = [...(data.health.workouts || [])].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const weightLogs = [...(data.health.weight || [])].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Habit Helper
  const getLast7Days = () => Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
  });
  const last7Days = getLast7Days();

  const handleAddHabit = () => {
      if (!newHabit) return;
      addHabit({ name: newHabit, icon });
      setNewHabit(''); setShowAddHabit(false);
  };

  const handleAddExerciseRow = () => {
      setExercises([...exercises, {name: '', sets: '', reps: '', weight: ''}]);
  };

  const handleExerciseChange = (index: number, field: string, value: string) => {
      const newExercises = [...exercises];
      // @ts-ignore
      newExercises[index][field] = value;
      setExercises(newExercises);
  };

  const handleAddWorkout = () => {
      if (!workoutName) return;
      const validExercises = exercises.filter(e => e.name);
      addWorkout({
          name: workoutName,
          duration: parseInt(workoutDuration) || 0,
          exercises: validExercises,
          date: new Date().toISOString()
      });
      setWorkoutName(''); setWorkoutDuration(''); setExercises([{name: '', sets: '', reps: '', weight: ''}]); setShowAddWorkout(false);
  };

  const handleAddWeight = () => {
      if (!weight) return;
      addWeightEntry({ weight: parseFloat(weight), date: weightDate });
      setWeight('');
  };

  // Weight Chart Logic
  const weightChartPoints = useMemo(() => {
      if (weightLogs.length < 2) return '';
      const minWeight = Math.min(...weightLogs.map((w: any) => w.weight)) - 2;
      const maxWeight = Math.max(...weightLogs.map((w: any) => w.weight)) + 2;
      const width = 1000;
      const height = 300;
      
      return weightLogs.map((w: any, i: number) => {
          const x = (i / (weightLogs.length - 1)) * width;
          const y = height - ((w.weight - minWeight) / (maxWeight - minWeight)) * height;
          return `${x},${y}`;
      }).join(' ');
  }, [weightLogs]);

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
        {/* Navigation */}
        <div className="flex bg-bg-tertiary p-1 rounded-lg w-fit">
            {[
                { id: 'habits', icon: Heart, label: 'Habits' },
                { id: 'workouts', icon: Dumbbell, label: 'Workouts' },
                { id: 'body', icon: Scale, label: 'Body Stats' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-bg-primary shadow text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}
        </div>

        {/* --- HABITS TAB --- */}
        {activeTab === 'habits' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Daily Habits</h2>
                    <button onClick={() => setShowAddHabit(!showAddHabit)} className="bg-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors flex items-center gap-2">
                        <Plus size={18} /> New Habit
                    </button>
                </div>

                {showAddHabit && (
                    <div className="glass-card rounded-xl p-6 border border-accent/50 max-w-lg mx-auto animate-fade-in">
                        <h3 className="font-semibold mb-4">Track a New Habit</h3>
                        <div className="flex gap-4">
                            <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-16 text-center p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none text-xl" />
                            <input type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="Habit name (e.g. Drink Water)" className="flex-1 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" autoFocus />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowAddHabit(false)} className="px-4 py-2 rounded-lg hover:bg-bg-tertiary text-gray-400">Cancel</button>
                            <button onClick={handleAddHabit} className="bg-accent px-6 py-2 rounded-lg font-medium">Start Tracking</button>
                        </div>
                    </div>
                )}

                <div className="glass-card rounded-xl p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr>
                                <th className="pb-4 pl-4 font-medium text-gray-400">Habit</th>
                                <th className="pb-4 font-medium text-gray-400 text-center w-24">Streak</th>
                                {last7Days.map(d => (
                                    <th key={d.toISOString()} className="pb-4 font-medium text-gray-400 text-center w-12">
                                        <div className="text-xs uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                        <div className="text-xs">{d.getDate()}</div>
                                    </th>
                                ))}
                                <th className="pb-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {habits.map(h => {
                                const streak = calculateStreak(h.completions);
                                return (
                                    <tr key={h.id} className="border-t border-border hover:bg-bg-tertiary/20 group">
                                        <td className="p-4 font-medium flex items-center gap-3">
                                            <span className="text-2xl">{h.icon}</span>
                                            {h.name}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-orange-500 font-bold bg-orange-500/10 px-2 py-1 rounded-full text-xs">
                                                <Flame size={12} /> {streak}
                                            </div>
                                        </td>
                                        {last7Days.map(d => {
                                            const dateStr = d.toDateString();
                                            const isCompleted = h.completions.includes(dateStr);
                                            const isToday = new Date().toDateString() === dateStr;
                                            return (
                                                <td key={dateStr} className="p-2 text-center">
                                                    <button 
                                                        onClick={() => { if(isToday) toggleHabit(h.id); }}
                                                        disabled={!isToday}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-bg-tertiary text-gray-600'} ${isToday ? 'cursor-pointer hover:bg-green-500/50' : 'cursor-default opacity-50'}`}
                                                    >
                                                        {isCompleted && <Check size={16} />}
                                                    </button>
                                                </td>
                                            )
                                        })}
                                        <td className="p-4 text-center">
                                            <button onClick={() => deleteHabit(h.id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {habits.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-gray-500">No habits tracked yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- WORKOUTS TAB --- */}
        {activeTab === 'workouts' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Workout Log</h2>
                        <button onClick={() => setShowAddWorkout(!showAddWorkout)} className="bg-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors flex items-center gap-2">
                            <Plus size={18} /> Log Workout
                        </button>
                    </div>

                    {showAddWorkout && (
                        <div className="glass-card rounded-xl p-6 border border-accent/50 animate-fade-in">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold">Log Session</h3>
                                <button onClick={() => setShowAddWorkout(false)} className="text-gray-500 hover:text-white"><Trash2 size={16} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="Workout Name (e.g. Upper Body)" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" autoFocus />
                                <input type="number" value={workoutDuration} onChange={e => setWorkoutDuration(e.target.value)} placeholder="Duration (min)" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                            </div>
                            
                            <div className="space-y-3 mb-4">
                                <label className="text-xs text-gray-500 uppercase font-bold">Exercises</label>
                                {exercises.map((ex, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input value={ex.name} onChange={e => handleExerciseChange(idx, 'name', e.target.value)} placeholder="Exercise Name" className="flex-1 p-2 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none text-sm" />
                                        <input value={ex.sets} onChange={e => handleExerciseChange(idx, 'sets', e.target.value)} placeholder="Sets" className="w-16 p-2 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none text-sm text-center" />
                                        <input value={ex.reps} onChange={e => handleExerciseChange(idx, 'reps', e.target.value)} placeholder="Reps" className="w-16 p-2 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none text-sm text-center" />
                                        <input value={ex.weight} onChange={e => handleExerciseChange(idx, 'weight', e.target.value)} placeholder="Kg" className="w-16 p-2 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none text-sm text-center" />
                                    </div>
                                ))}
                                <button onClick={handleAddExerciseRow} className="text-xs text-accent hover:underline flex items-center gap-1">+ Add Exercise</button>
                            </div>

                            <button onClick={handleAddWorkout} className="w-full bg-accent py-2 rounded-lg font-medium hover:bg-accent/80">Save Workout</button>
                        </div>
                    )}

                    <div className="space-y-4">
                        {workouts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 glass-card rounded-xl">
                                <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No workouts logged.</p>
                            </div>
                        ) : (
                            workouts.map((w: any) => (
                                <div key={w.id} className="glass-card rounded-xl p-5 hover:border-accent/30 transition-all group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-lg">{w.name}</h4>
                                            <p className="text-xs text-gray-400 flex items-center gap-2"><Calendar size={12} /> {formatDate(w.date, 'full')}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm bg-bg-tertiary px-2 py-1 rounded">
                                            <Activity size={14} className="text-accent" /> {w.duration} min
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1 mt-3 pl-4 border-l-2 border-border">
                                        {w.exercises?.map((ex: any, i: number) => (
                                            <div key={i} className="text-sm flex justify-between">
                                                <span className="text-gray-300">{ex.name}</span>
                                                <span className="text-gray-500 font-mono text-xs">{ex.sets} x {ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ''}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={() => deleteWorkout(w.id)} className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-2 rounded transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card rounded-xl p-6 text-center">
                         <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                            <Activity size={24} className="text-blue-500" />
                        </div>
                        <h3 className="text-3xl font-bold">{workouts.length}</h3>
                        <p className="text-gray-400 text-sm">Total Sessions</p>
                    </div>
                     <div className="glass-card rounded-xl p-6 text-center">
                         <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                            <Activity size={24} className="text-orange-500" />
                        </div>
                        <h3 className="text-3xl font-bold">{workouts.reduce((acc: number, w: any) => acc + (w.duration || 0), 0)}</h3>
                        <p className="text-gray-400 text-sm">Minutes Trained</p>
                    </div>
                </div>
            </div>
        )}

        {/* --- BODY STATS TAB --- */}
        {activeTab === 'body' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <div className="glass-card rounded-xl p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-green-500" /> Weight Progress</h3>
                    
                    <div className="flex-1 min-h-[250px] relative border-b border-l border-border/50">
                        {weightLogs.length > 1 ? (
                            <svg className="w-full h-full p-4 overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <polyline 
                                    fill="url(#lineGradient)" 
                                    stroke="none" 
                                    points={`${weightChartPoints} 1000,300 0,300`} 
                                />
                                <polyline 
                                    fill="none" 
                                    stroke="#10b981" 
                                    strokeWidth="3" 
                                    points={weightChartPoints} 
                                    vectorEffect="non-scaling-stroke"
                                />
                                {weightLogs.map((w: any, i: number) => {
                                     // Re-calc specific point for circles
                                     const minWeight = Math.min(...weightLogs.map((l: any) => l.weight)) - 2;
                                     const maxWeight = Math.max(...weightLogs.map((l: any) => l.weight)) + 2;
                                     const x = (i / (weightLogs.length - 1)) * 1000;
                                     const y = 300 - ((w.weight - minWeight) / (maxWeight - minWeight)) * 300;
                                     return (
                                         <g key={i} className="group">
                                            <circle cx={x} cy={y} r="6" fill="#10b981" className="hover:r-8 transition-all" />
                                            <text x={x} y={y - 15} textAnchor="middle" fill="white" fontSize="24" className="opacity-0 group-hover:opacity-100 transition-opacity select-none bg-black">
                                                {w.weight}
                                            </text>
                                         </g>
                                     )
                                })}
                            </svg>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Need at least 2 entries for graph</div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card rounded-xl p-6">
                        <h3 className="font-bold mb-4">Log Weight</h3>
                        <div className="flex gap-4">
                            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight (kg)" className="flex-1 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                            <input type="date" value={weightDate} onChange={e => setWeightDate(e.target.value)} className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                            <button onClick={handleAddWeight} className="bg-accent px-4 rounded-lg font-medium hover:bg-accent/80">Log</button>
                        </div>
                    </div>

                    <div className="glass-card rounded-xl p-0 overflow-hidden flex-1 max-h-[400px] overflow-y-auto scrollbar-thin">
                        <table className="w-full text-left">
                            <thead className="bg-bg-tertiary/50">
                                <tr>
                                    <th className="p-4 text-xs uppercase text-gray-400">Date</th>
                                    <th className="p-4 text-xs uppercase text-gray-400">Weight</th>
                                    <th className="p-4 text-xs uppercase text-gray-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weightLogs.slice().reverse().map((w: any) => (
                                    <tr key={w.id} className="border-b border-border/50 hover:bg-bg-tertiary/20">
                                        <td className="p-4 font-mono text-sm text-gray-300">{w.date}</td>
                                        <td className="p-4 font-bold">{w.weight} <span className="text-xs font-normal text-gray-500">kg</span></td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => deleteWeightEntry(w.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Health;