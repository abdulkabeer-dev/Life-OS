
import React, { useState } from 'react';
import { LifeOSProvider } from './context/LifeOSContext';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './modules/Dashboard';
import Goals from './modules/Goals';
import Tasks from './modules/Tasks';
import Calendar from './modules/Calendar';
import Finance from './modules/Finance';
import Health from './modules/Health';
import Learning from './modules/Learning';
import Career from './modules/Career';
import Freelance from './modules/Freelance';
import Achievements from './modules/Achievements';
import Portfolio from './modules/Portfolio';
import Settings from './modules/Settings';
import Islam from './modules/Islam';
import Notifications from './modules/Notifications';
import { ModuleType } from './types';
import { Bell, Search, Plus, X, Menu, LogOut, Infinity } from 'lucide-react';
import { useLifeOS } from './context/LifeOSContext';
import { formatDate } from './utils';

// Helper for other modules
const PlaceholderModule: React.FC<{ title: string; desc: string; icon: string }> = ({ title, desc, icon }) => (
  <div className="glass-card rounded-xl p-12 text-center animate-fade-in flex flex-col items-center">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400 max-w-md">{desc}</p>
  </div>
);

type QuickAddType = 'menu' | 'task' | 'goal' | 'expense' | 'learning' | 'habit' | 'reminder';

// Quick Add Modal Component
const QuickAddModal: React.FC<{ initialType: QuickAddType; onClose: () => void }> = ({ initialType, onClose }) => {
    const { addGoal, addTask, addTransaction, addLearning, addHabit, addReminder } = useLifeOS();
    const [type, setType] = useState<QuickAddType>(initialType);
    
    // Form States
    const [formData, setFormData] = useState<any>({});
    
    const handleInput = (key: string, value: any) => setFormData({ ...formData, [key]: value });
    
    const submitTask = () => {
        if (!formData.title) return;
        addTask({ ...formData, priority: formData.priority || 'medium' });
        onClose();
    };

    const submitGoal = () => {
        if (!formData.title) return;
        addGoal({ ...formData, category: formData.category || 'personal', timeframe: formData.timeframe || 'monthly' });
        onClose();
    };
    
    const submit = (action: Function) => {
        action(formData);
        onClose();
    }

    const BackBtn = () => (
        <button onClick={() => setType('menu')} className="bg-bg-tertiary border border-border px-4 py-2 rounded-lg text-sm hover:border-accent transition-colors">
            Back
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="glass-card w-full max-w-lg rounded-2xl p-6 glow-border animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{type === 'menu' ? 'Quick Add' : `New ${type.charAt(0).toUpperCase() + type.slice(1)}`}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg"><X size={20}/></button>
                </div>

                {type === 'menu' && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'task', icon: '✅', color: 'text-indigo-500', label: 'Task' },
                            { id: 'goal', icon: '🎯', color: 'text-purple-500', label: 'Goal' },
                            { id: 'expense', icon: '💰', color: 'text-green-500', label: 'Expense' },
                            { id: 'learning', icon: '💡', color: 'text-yellow-500', label: 'Learning' },
                            { id: 'habit', icon: '🔥', color: 'text-orange-500', label: 'Habit' },
                            { id: 'reminder', icon: '⏰', color: 'text-blue-500', label: 'Reminder' },
                        ].map(item => (
                            <button key={item.id} onClick={() => setType(item.id as any)} className="p-4 rounded-xl border border-border hover:border-accent transition-all hover:bg-bg-tertiary flex flex-col items-center gap-2 group">
                                <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                <span className="text-sm font-medium text-gray-300">{item.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {type === 'task' && (
                    <div className="space-y-4">
                        <input autoFocus type="text" placeholder="Task title" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('title', e.target.value)} />
                        <div className="grid grid-cols-2 gap-3">
                            <select className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('priority', e.target.value)}>
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <input type="date" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('dueDate', e.target.value)} />
                        </div>
                        <textarea placeholder="Description" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none h-24" onChange={e => handleInput('description', e.target.value)} />
                        <div className="flex gap-3 pt-2">
                            {initialType === 'menu' && <BackBtn />}
                            <button onClick={submitTask} className="flex-1 bg-accent rounded-lg font-medium hover:bg-accent/80 transition-colors">Add Task</button>
                        </div>
                    </div>
                )}

                 {type === 'goal' && (
                    <div className="space-y-4">
                        <input autoFocus type="text" placeholder="Goal title" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('title', e.target.value)} />
                        <textarea placeholder="Why is this important?" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none h-20" onChange={e => handleInput('description', e.target.value)} />
                        <div className="grid grid-cols-2 gap-3">
                            <select className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('category', e.target.value)}>
                                <option value="personal">Personal</option>
                                <option value="career">Career</option>
                                <option value="health">Health</option>
                                <option value="finance">Finance</option>
                                <option value="learning">Learning</option>
                            </select>
                             <select className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('timeframe', e.target.value)}>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <input type="date" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('deadline', e.target.value)} />
                         <div className="flex gap-3 pt-2">
                            {initialType === 'menu' && <BackBtn />}
                            <button onClick={submitGoal} className="flex-1 bg-accent rounded-lg font-medium hover:bg-accent/80 transition-colors">Create Goal</button>
                        </div>
                    </div>
                )}

                 {type === 'expense' && (
                    <div className="space-y-4">
                        <input autoFocus type="text" placeholder="Description" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('description', e.target.value)} />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" placeholder="Amount" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('amount', parseFloat(e.target.value))} />
                             <select className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('type', e.target.value)}>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <select className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('category', e.target.value)}>
                            <option value="food">Food</option>
                            <option value="transport">Transport</option>
                            <option value="utilities">Utilities</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="other">Other</option>
                        </select>
                        <div className="flex gap-3 pt-2">
                            {initialType === 'menu' && <BackBtn />}
                            <button onClick={() => submit(addTransaction)} className="flex-1 bg-accent rounded-lg font-medium hover:bg-accent/80 transition-colors">Add Transaction</button>
                        </div>
                    </div>
                )}
                
                {['learning', 'habit', 'reminder'].includes(type) && (
                    <div className="text-center py-8">
                         <p className="mb-4 text-gray-400">Simple inputs for {type}</p>
                         <div className="space-y-4">
                            <input autoFocus type="text" placeholder={`Enter ${type} details`} className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput(type === 'habit' ? 'name' : type === 'reminder' ? 'text' : 'topic', e.target.value)} />
                            {type === 'reminder' && <input type="datetime-local" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" onChange={e => handleInput('time', e.target.value)} />}
                            <div className="flex gap-3 pt-2">
                                {initialType === 'menu' && <BackBtn />}
                                <button onClick={() => {
                                    if(type === 'learning') submit(addLearning);
                                    if(type === 'habit') submit(addHabit);
                                    if(type === 'reminder') submit(addReminder);
                                }} className="flex-1 bg-accent rounded-lg font-medium py-2 hover:bg-accent/80 transition-colors">Save</button>
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Global Notification Toast
const GlobalToast = () => {
    const { activeNotification, clearActiveNotification, dismissReminder } = useLifeOS();

    if (!activeNotification) return null;

    const handleDismiss = () => {
        dismissReminder(activeNotification.id);
        clearActiveNotification();
    };

    return (
        <div className="fixed top-6 right-6 z-[100] animate-fade-in w-80">
            <div className="glass-card bg-bg-secondary border-l-4 border-l-red-500 rounded-lg p-4 shadow-2xl flex flex-col gap-2 relative">
                <button onClick={clearActiveNotification} className="absolute top-2 right-2 text-gray-500 hover:text-white">
                    <X size={16} />
                </button>
                <div className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase tracking-wide">
                    <Bell size={16} className="animate-pulse" /> Reminder
                </div>
                <h3 className="font-bold text-lg leading-tight">{activeNotification.text}</h3>
                <p className="text-xs text-gray-400">{formatDate(activeNotification.time, 'time')}</p>
                <div className="mt-2 flex gap-2">
                    <button onClick={handleDismiss} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-md font-bold transition-colors">
                        Mark Done
                    </button>
                    <button onClick={clearActiveNotification} className="flex-1 bg-bg-tertiary hover:bg-bg-primary text-gray-400 hover:text-white text-xs py-2 rounded-md font-bold transition-colors">
                        Snooze
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Layout
const Layout: React.FC = () => {
  const { user, loading, logout } = useLifeOS();
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [quickAddType, setQuickAddType] = useState<QuickAddType | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  if (loading) {
      return (
          <div className="h-screen w-screen flex items-center justify-center bg-bg-primary">
              <div className="flex flex-col items-center gap-4">
                  <Infinity size={48} className="text-accent animate-pulse" />
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 text-sm">Initializing LifeOS...</p>
              </div>
          </div>
      );
  }

  // Show Auth screen if user is not logged in
  if (!user) {
      return <Auth />;
  }

  // Title mapping
  const titles: Record<ModuleType, string> = {
      dashboard: 'Dashboard', goals: 'Goals', tasks: 'Tasks', calendar: 'Calendar', 
      learning: 'Learning Log', achievements: 'Achievements', health: 'Health & Fitness',
      career: 'Career', freelance: 'Freelance', finance: 'Finance', portfolio: 'Portfolio',
      settings: 'Settings', islam: 'Islam & Spirituality', notifications: 'Notifications'
  };

  const renderContent = () => {
    switch (currentModule) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentModule} />;
      case 'goals': return <Goals onOpenQuickAdd={() => setQuickAddType('goal')} />;
      case 'tasks': return <Tasks />;
      case 'calendar': return <Calendar />;
      case 'finance': return <Finance />;
      case 'health': return <Health />;
      case 'learning': return <Learning />;
      case 'career': return <Career />;
      case 'freelance': return <Freelance />; 
      case 'achievements': return <Achievements />;
      case 'portfolio': return <Portfolio />;
      case 'settings': return <Settings />;
      case 'islam': return <Islam />;
      case 'notifications': return <Notifications />;
      default: return <PlaceholderModule title={titles[currentModule]} desc="Module under construction." icon="🚧" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary text-white font-sans transition-colors duration-300">
      <Sidebar 
        currentModule={currentModule} 
        onNavigate={setCurrentModule} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <GlobalToast />
        
        {/* Header */}
        <header className="sticky top-0 z-10 glass-card border-b border-border px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 rounded-lg hover:bg-bg-tertiary text-gray-400 hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white dark:text-white light:text-black truncate">{titles[currentModule]}</h2>
                    <p className="text-gray-400 text-sm hidden sm:block">{formatDate(new Date())}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
                <div className="relative hidden md:block">
                    <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-lg w-64 bg-bg-tertiary border border-border focus:border-accent outline-none text-sm transition-all focus:w-72" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
                <button onClick={() => setCurrentModule('notifications')} className="relative p-2 rounded-lg hover:bg-bg-tertiary transition-colors">
                    <Bell size={20} className="text-gray-300" />
                </button>
                <button onClick={() => setQuickAddType('menu')} className="bg-gradient-to-r from-accent to-purple-600 px-3 md:px-4 py-2 rounded-lg font-medium text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm md:text-base">
                    <Plus size={18} /> <span className="hidden sm:inline">Quick Add</span>
                </button>
                <button onClick={logout} className="p-2 hover:bg-bg-tertiary rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="Sign Out">
                    <LogOut size={20} />
                </button>
            </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 relative">
            {renderContent()}
        </div>

        {/* Modal */}
        {quickAddType && <QuickAddModal initialType={quickAddType} onClose={() => setQuickAddType(null)} />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LifeOSProvider>
      <Layout />
    </LifeOSProvider>
  );
};

export default App;
