import React, { useState } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { getGoalProgress, getDaysRemaining, getCategoryColor, getCategoryIcon, formatDate } from '../utils';
import { Goal, GoalCategory } from '../types';
import { Target, Trophy, TrendingUp, ListTodo, Plus, Trash2, Check, RotateCcw, X, PlusCircle, Edit2, MoreVertical, Save } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Confetti from 'react-confetti';

const Goals: React.FC<{ onOpenQuickAdd: (type: 'goal') => void }> = ({ onOpenQuickAdd }) => {
  const { data, updateGoal, deleteGoal } = useLifeOS();
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [categoryFilter, setCategoryFilter] = useState<GoalCategory | 'all'>('all');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  
  // Edit functionality
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', category: 'personal' as GoalCategory, deadline: '' });

  const activeGoals = data.goals.filter(g => !g.completed);
  const completedGoals = data.goals.filter(g => g.completed);
  
  const totalItems = data.goals.reduce((acc, g) => acc + (g.checklistItems?.length || 0), 0);
  const completedItems = data.goals.reduce((acc, g) => acc + (g.checklistItems?.filter(i => i.completed).length || 0), 0);
  const avgProgress = activeGoals.length > 0 
      ? Math.round(activeGoals.reduce((acc, g) => acc + getGoalProgress(g), 0) / activeGoals.length) 
      : 0;

  const getFilteredGoals = () => {
    let filtered = [...data.goals];
    if (filter === 'active') filtered = filtered.filter(g => !g.completed);
    else if (filter === 'completed') filtered = filtered.filter(g => g.completed);
    
    if (categoryFilter !== 'all') filtered = filtered.filter(g => g.category === categoryFilter);
    
    return filtered.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  };

  const filteredGoals = getFilteredGoals();

  const handleAddChecklistItem = () => {
    if (!selectedGoal || !newItemText.trim()) return;
    const updated = {
        ...selectedGoal,
        checklistItems: [...selectedGoal.checklistItems, { text: newItemText, completed: false, createdAt: new Date().toISOString() }]
    };
    updateGoal(updated);
    setSelectedGoal(updated);
    setNewItemText('');
  };

  const handleToggleItem = (idx: number) => {
      if (!selectedGoal) return;
      const items = [...selectedGoal.checklistItems];
      items[idx].completed = !items[idx].completed;
      
      let updated = { ...selectedGoal, checklistItems: items };
      
      // Auto complete
      const allDone = items.every(i => i.completed);
      if (allDone && items.length > 0 && !updated.completed) {
          updated.completed = true;
          updated.completedAt = new Date().toISOString();
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
      }
      
      updateGoal(updated);
      setSelectedGoal(updated);
  };

  const handleDeleteItem = (idx: number) => {
    if (!selectedGoal) return;
    const items = [...selectedGoal.checklistItems];
    items.splice(idx, 1);
    const updated = { ...selectedGoal, checklistItems: items };
    updateGoal(updated);
    setSelectedGoal(updated);
  };

  const handleGoalCompletion = (completed: boolean) => {
      if (!selectedGoal) return;
      const updated = { 
          ...selectedGoal, 
          completed, 
          completedAt: completed ? new Date().toISOString() : null 
      };
      if (completed) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
      }
      updateGoal(updated);
      setSelectedGoal(null); // Close modal
  };

  const handleDeleteGoal = () => {
      if (!selectedGoal) return;
      if (confirm('Are you sure?')) {
          deleteGoal(selectedGoal.id);
          setSelectedGoal(null);
      }
  };

  // Helper to render icon
  const GoalIcon = ({ category, className }: { category: string, className?: string }) => {
    // @ts-ignore
    const Icon = LucideIcons[getCategoryIcon(category).charAt(0).toUpperCase() + getCategoryIcon(category).slice(1)] || LucideIcons.Flag;
    return <Icon className={className} />;
  };

  return (
    <div className="animate-fade-in relative">
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-[100]"><Confetti numberOfPieces={200} recycle={false} /></div>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Goals', val: activeGoals.length, icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/20' },
          { label: 'Completed', val: completedGoals.length, icon: Trophy, color: 'text-green-500', bg: 'bg-green-500/20' },
          { label: 'Avg Progress', val: `${avgProgress}%`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/20' },
          { label: 'Tasks Done', val: `${completedItems}/${totalItems}`, icon: ListTodo, color: 'text-blue-500', bg: 'bg-blue-500/20' },
        ].map((s, i) => (
            <div key={i} className="kpi-card rounded-xl p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">{s.label}</p>
                        <p className={`text-3xl font-bold mt-1 ${s.color.includes('green') ? 'text-green-500' : ''}`}>{s.val}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                        <s.icon className={`${s.color}`} size={24} />
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
                {['active', 'completed', 'all'].map((f) => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f as any)} 
                        className={`px-4 py-2 rounded-lg text-sm capitalize ${filter === f ? 'bg-accent text-white' : 'hover:bg-bg-tertiary text-gray-400'}`}
                    >
                        {f}
                    </button>
                ))}
                <div className="w-px bg-border mx-2 h-8 self-center"></div>
                <select 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value as any)} 
                    className="px-3 py-2 rounded-lg text-sm bg-bg-tertiary border border-border focus:border-accent outline-none"
                >
                    <option value="all">All Categories</option>
                    <option value="personal">🎯 Personal</option>
                    <option value="career">💼 Career</option>
                    <option value="health">❤️ Health</option>
                    <option value="fitness">💪 Fitness</option>
                    <option value="learning">📚 Learning</option>
                    <option value="finance">💰 Finance</option>
                </select>
            </div>
            <button onClick={() => onOpenQuickAdd('goal')} className="bg-gradient-to-r from-accent to-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center">
                <Plus size={16} className="mr-2" /> New Goal
            </button>
        </div>

        {/* Edit Form */}
        {editingId && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4 mb-6">
            <h3 className="font-bold text-lg flex items-center justify-between">
              Edit Goal
              <button onClick={() => setEditingId(null)} className="hover:bg-gray-700 p-1 rounded">
                <X size={20} />
              </button>
            </h3>

            <input
              type="text"
              placeholder="Goal name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
            />

            <textarea
              placeholder="Description (optional)"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 h-20 resize-none"
            />

            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value as GoalCategory })}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white"
            >
              <option value="personal">Personal</option>
              <option value="career">Career</option>
              <option value="health">Health</option>
              <option value="fitness">Fitness</option>
              <option value="learning">Learning</option>
              <option value="finance">Finance</option>
            </select>

            <input
              type="date"
              value={editForm.deadline}
              onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={() => {
                  const goal = data.goals.find(g => g.id === editingId);
                  if (goal) {
                    updateGoal({
                      ...goal,
                      title: editForm.name,
                      description: editForm.description,
                      category: editForm.category,
                      deadline: editForm.deadline,
                    });
                    setEditingId(null);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
              >
                <Save size={18} /> Update
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredGoals.map(g => {
            const progress = getGoalProgress(g);
            const daysLeft = g.deadline ? getDaysRemaining(g.deadline) : null;
            const color = getCategoryColor(g.category);

            return (
                <div 
                    key={g.id} 
                    onClick={() => setSelectedGoal(g)}
                    className={`goal-card rounded-xl p-5 cursor-pointer relative overflow-hidden group ${g.completed ? 'opacity-60' : ''}`}
                >
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <span className="px-3 py-1 rounded-full text-xs font-medium capitalize" style={{ backgroundColor: `${color}20`, color: color }}>
                            {g.category}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Edit/Delete Menu */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(menuOpen === g.id ? null : g.id);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {menuOpen === g.id && (
                              <div className="absolute right-0 mt-1 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(g.id);
                                    setEditForm({ name: g.title, description: g.description, category: g.category, deadline: g.deadline || '' });
                                    setMenuOpen(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-800 text-sm flex items-center gap-2 border-b border-gray-700"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete this goal?')) deleteGoal(g.id);
                                    setMenuOpen(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-800 text-red-400 text-sm flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                          {g.completed ? (
                            <Check className="text-green-500" size={18} />
                          ) : (
                            daysLeft !== null && (
                              <span className={`text-xs ${daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-yellow-500' : 'text-gray-400'}`}>
                                {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Today!' : 'Overdue'}
                              </span>
                            )
                          )}
                        </div>
                    </div>
                    
                    <h3 className={`font-semibold text-lg mb-2 relative z-10 ${g.completed ? 'line-through' : ''}`}>{g.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 relative z-10">{g.description || 'No description'}</p>
                    
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <span className="text-sm text-gray-400">{g.checklistItems.filter(i => i.completed).length}/{g.checklistItems.length} tasks</span>
                        <span className="text-lg font-bold" style={{ color }}>{progress}%</span>
                    </div>
                    
                    <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden relative z-10">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: color }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border relative z-10">
                        <span className="text-xs text-gray-400 capitalize">{g.timeframe}</span>
                        <span className="text-xs text-gray-400">{g.deadline ? formatDate(g.deadline, 'short') : 'No deadline'}</span>
                    </div>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
                </div>
            )
        })}
        {filteredGoals.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                <Target size={48} className="mx-auto mb-4 opacity-30" />
                <p>No goals found</p>
                <button onClick={() => onOpenQuickAdd('goal')} className="text-accent hover:underline mt-2">Create your first goal</button>
            </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedGoal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedGoal(null) }}>
              <div className="glass-card w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden animate-fade-in shadow-2xl shadow-black/50">
                  <div className="p-6 border-b border-border flex items-start justify-between bg-bg-secondary/50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${getCategoryColor(selectedGoal.category)}20` }}>
                            <GoalIcon category={selectedGoal.category} className={`text-2xl`} />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold ${selectedGoal.completed ? 'line-through text-gray-400' : ''}`}>{selectedGoal.title}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="px-3 py-1 rounded-full text-xs font-medium capitalize" style={{ backgroundColor: `${getCategoryColor(selectedGoal.category)}20`, color: getCategoryColor(selectedGoal.category) }}>
                                    {selectedGoal.category}
                                </span>
                                <span className="text-sm text-gray-400">{selectedGoal.timeframe}</span>
                                {selectedGoal.deadline && <span className="text-sm text-gray-400">Due {formatDate(selectedGoal.deadline, 'short')}</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedGoal(null)} className="p-2 hover:bg-bg-tertiary rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {selectedGoal.description && <p className="text-gray-300 mb-6 text-lg leading-relaxed">{selectedGoal.description}</p>}

                    {/* Progress Circle */}
                    <div className="glass-card rounded-xl p-6 mb-6 flex items-center justify-between">
                         <div>
                             <h3 className="font-semibold text-lg mb-1">Progress</h3>
                             <p className="text-sm text-gray-400">{selectedGoal.checklistItems.filter(i => i.completed).length} of {selectedGoal.checklistItems.length} tasks completed</p>
                         </div>
                         <div className="relative w-20 h-20 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-bg-tertiary" />
                                <circle 
                                    cx="40" cy="40" r="36" fill="transparent" stroke={getCategoryColor(selectedGoal.category)} strokeWidth="8" 
                                    strokeDasharray={2 * Math.PI * 36}
                                    strokeDashoffset={2 * Math.PI * 36 * (1 - getGoalProgress(selectedGoal) / 100)}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <span className="absolute text-lg font-bold">{getGoalProgress(selectedGoal)}%</span>
                         </div>
                    </div>

                    {/* Checklist */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Checklist</h3>
                            <span className="text-sm text-gray-400">{selectedGoal.checklistItems.filter(i => i.completed).length}/{selectedGoal.checklistItems.length}</span>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                value={newItemText} 
                                onChange={(e) => setNewItemText(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                                placeholder="Add a milestone or task..." 
                                className="flex-1 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none"
                            />
                            <button onClick={handleAddChecklistItem} className="bg-accent px-4 rounded-lg hover:bg-accent/80 transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {selectedGoal.checklistItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary/50 hover:bg-bg-tertiary transition-colors group">
                                    <button 
                                        onClick={() => handleToggleItem(idx)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-green-500'}`}
                                    >
                                        {item.completed && <Check size={14} className="text-white" />}
                                    </button>
                                    <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
                                    <button onClick={() => handleDeleteItem(idx)} className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-500/10 rounded">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {selectedGoal.checklistItems.length === 0 && <p className="text-center text-gray-500 py-4">No tasks yet.</p>}
                        </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-border flex justify-between bg-bg-secondary/50">
                    <button onClick={handleDeleteGoal} className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                        <Trash2 size={18} /> Delete
                    </button>
                    <div>
                        {!selectedGoal.completed ? (
                            <button onClick={() => handleGoalCompletion(true)} className="bg-gradient-to-r from-accent to-purple-600 px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center gap-2">
                                <Check size={18} /> Mark Complete
                            </button>
                        ) : (
                            <button onClick={() => handleGoalCompletion(false)} className="bg-bg-tertiary border border-border px-6 py-2 rounded-lg font-medium hover:border-white transition-all flex items-center gap-2">
                                <RotateCcw size={18} /> Reopen
                            </button>
                        )}
                    </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Goals;
