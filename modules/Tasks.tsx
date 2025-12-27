import React, { useState, useEffect } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { getRelativeTime, getCategoryColor } from '../utils';
import { Task, Priority } from '../types';
import { Check, Plus, Trash2, Calendar, AlertCircle, AlertTriangle, Info, Play, Pause, Square, X } from 'lucide-react';

const Tasks: React.FC = () => {
  const { data, toggleTask, deleteTask, addTask } = useLifeOS();
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'overdue' | 'completed'>('all');
  const [showAdd, setShowAdd] = useState(false);
  
  // Quick Add State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [goalId, setGoalId] = useState('');

  // Focus Mode State
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);

  // Focus Timer Logic
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play sound or notification here
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(25 * 60); };
  const closeFocus = () => { setIsActive(false); setFocusTask(null); };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilteredTasks = () => {
      const now = new Date();
      const todayStr = now.toDateString();
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);

      let filtered = [...data.tasks];
      
      switch(filter) {
          case 'today':
              filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === todayStr);
              break;
          case 'week':
              filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) <= weekEnd && new Date(t.dueDate) >= now);
              break;
          case 'overdue':
              filtered = filtered.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now);
              break;
          case 'completed':
              filtered = filtered.filter(t => t.completed);
              break;
      }
      return filtered.sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          const pOrder = { high: 0, medium: 1, low: 2 };
          return pOrder[a.priority] - pOrder[b.priority];
      });
  };

  const handleAdd = () => {
      if (!title.trim()) return;
      addTask({ title, description: desc, priority, dueDate: dueDate || null, goalId: goalId || null });
      setTitle(''); setDesc(''); setPriority('medium'); setDueDate(''); setGoalId('');
      setShowAdd(false);
  };

  const filteredTasks = getFilteredTasks();
  const activeGoals = data.goals.filter(g => !g.completed);

  // Stats
  const completionRate = Math.round((data.tasks.filter(t => t.completed).length / (data.tasks.length || 1)) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in relative">
        
        {/* Focus Mode Overlay */}
        {focusTask && (
            <div className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
                <button onClick={closeFocus} className="absolute top-8 right-8 p-4 bg-bg-tertiary rounded-full hover:bg-red-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                
                <div className="text-center space-y-8 max-w-2xl px-4">
                    <div className="inline-block px-4 py-1 rounded-full bg-accent/20 text-accent font-mono text-sm mb-4">FOCUS MODE</div>
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight">{focusTask.title}</h2>
                    {focusTask.description && <p className="text-xl text-gray-400">{focusTask.description}</p>}
                    
                    <div className="w-80 h-80 rounded-full border-8 border-bg-tertiary flex items-center justify-center mx-auto relative">
                         <div className="absolute inset-0 rounded-full border-8 border-accent border-t-transparent animate-spin duration-[10000ms]" style={{ animationPlayState: isActive ? 'running' : 'paused' }}></div>
                         <div className="text-7xl font-mono font-bold tracking-tighter tabular-nums">
                             {formatTime(timeLeft)}
                         </div>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                        <button onClick={toggleTimer} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-green-500 hover:bg-green-400'} text-black shadow-lg shadow-white/10`}>
                            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>
                         <button onClick={resetTimer} className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center hover:bg-bg-secondary text-gray-400 hover:text-white transition-colors">
                            <Square size={24} fill="currentColor" />
                        </button>
                    </div>

                    {timeLeft === 0 && (
                        <div className="animate-bounce mt-8 text-2xl font-bold text-green-500">
                            Session Complete! Great job.
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <div className="glass-card rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {['all', 'today', 'week', 'overdue', 'completed'].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-2 rounded-lg text-sm capitalize ${filter === f ? 'bg-accent text-white' : 'hover:bg-bg-tertiary text-gray-400'}`}
                            >
                                {f.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowAdd(true)} className="bg-accent px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors flex items-center">
                        <Plus size={16} className="mr-2" /> Add Task
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {showAdd && (
                <div className="glass-card rounded-xl p-5 animate-fade-in border border-accent/50">
                    <h3 className="font-semibold mb-4">New Task</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" autoFocus />
                        <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none">
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                        <select value={goalId} onChange={e => setGoalId(e.target.value)} className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none">
                            <option value="">Link to Goal (optional)</option>
                            {activeGoals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </select>
                    </div>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description..." className="w-full mt-4 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none h-20" />
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg hover:bg-bg-tertiary text-gray-400">Cancel</button>
                        <button onClick={handleAdd} className="bg-accent px-4 py-2 rounded-lg font-medium">Save Task</button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="glass-card rounded-xl p-5">
                <div className="space-y-2">
                    {filteredTasks.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No tasks found</p>
                    ) : (
                        filteredTasks.map(t => {
                            const goal = data.goals.find(g => g.id === t.goalId);
                            const isOverdue = !t.completed && t.dueDate && new Date(t.dueDate) < new Date();
                            
                            return (
                                <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group border border-transparent hover:border-border">
                                    <button 
                                        onClick={() => toggleTask(t.id)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${t.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-green-500'}`}
                                    >
                                        {t.completed && <Check size={14} className="text-white" />}
                                    </button>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium ${t.completed ? 'line-through text-gray-500' : ''}`}>{t.title}</p>
                                        {t.description && <p className="text-sm text-gray-500 truncate">{t.description}</p>}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-sm">
                                        {!t.completed && (
                                            <button 
                                                onClick={() => { setFocusTask(t); setTimeLeft(25 * 60); setIsActive(false); }}
                                                className="opacity-0 group-hover:opacity-100 p-2 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-lg transition-all flex items-center gap-2"
                                                title="Start Focus Session"
                                            >
                                                <Play size={14} fill="currentColor" /> <span className="hidden md:inline text-xs font-bold">FOCUS</span>
                                            </button>
                                        )}

                                        {goal && (
                                            <span className="px-2 py-0.5 rounded-full text-xs hidden md:inline-block truncate max-w-[100px]" style={{ backgroundColor: `${getCategoryColor(goal.category)}20`, color: getCategoryColor(goal.category) }}>
                                                {goal.title}
                                            </span>
                                        )}
                                        {t.dueDate && (
                                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                                                <Calendar size={12} /> {getRelativeTime(t.dueDate)}
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.priority === 'high' ? 'bg-red-500/20 text-red-500' : t.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                            {t.priority}
                                        </span>
                                        <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
            <div className="glass-card rounded-xl p-5">
                <h3 className="font-semibold mb-4">Statistics</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Completion Rate</span>
                            <span>{completionRate}%</span>
                        </div>
                        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${completionRate}%` }}></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Tasks</span>
                        <span className="font-semibold">{data.tasks.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Completed</span>
                        <span className="font-semibold text-green-500">{data.tasks.filter(t => t.completed).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Pending</span>
                        <span className="font-semibold text-yellow-500">{data.tasks.filter(t => !t.completed).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Overdue</span>
                        <span className="font-semibold text-red-500">{data.tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length}</span>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-xl p-5">
                <h3 className="font-semibold mb-4">Goal-Linked Tasks</h3>
                <div className="space-y-3">
                    {activeGoals.slice(0, 5).map(g => {
                        const linked = data.tasks.filter(t => t.goalId === g.id);
                        const done = linked.filter(t => t.completed).length;
                        return (
                            <div key={g.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-tertiary cursor-pointer">
                                <span className="text-sm truncate flex-1 mr-2">{g.title}</span>
                                <span className="text-xs text-gray-400">{done}/{linked.length}</span>
                            </div>
                        )
                    })}
                    {activeGoals.length === 0 && <p className="text-gray-500 text-sm">No active goals</p>}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Tasks;