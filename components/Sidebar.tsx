
import React from 'react';
import { 
  LayoutDashboard, Target, CheckSquare, Calendar, BookOpen, 
  Trophy, Heart, Briefcase, Laptop2, Wallet, UserCircle, 
  Moon, Sun, Settings, RefreshCw, Infinity, MoonStar, Bell, X
} from 'lucide-react';
import { ModuleType } from '../types';
import { useLifeOS } from '../context/LifeOSContext';

interface SidebarProps {
  currentModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentModule, onNavigate, isOpen, onClose }) => {
  const { data, toggleTheme, saveData } = useLifeOS();
  const [syncing, setSyncing] = React.useState(false);

  const handleSync = () => {
    setSyncing(true);
    saveData();
    setTimeout(() => setSyncing(false), 1000);
  };

  // Calculate pending notifications
  const pendingCount = data.reminders.filter(r => !r.dismissed && !r.notified).length;

  const MenuItem = ({ module, icon: Icon, label, isNew = false, badge = 0 }: { module: ModuleType, icon: any, label: string, isNew?: boolean, badge?: number }) => (
    <div 
      onClick={() => {
          onNavigate(module);
          if (window.innerWidth < 768) onClose();
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
        currentModule === module 
          ? 'bg-gradient-to-r from-accent-glow to-transparent border-l-2 border-accent text-white' 
          : 'text-gray-400 hover:bg-bg-tertiary hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
      {badge > 0 && <span className="ml-auto text-[10px] bg-red-500 px-2 py-0.5 rounded-full text-white">{badge}</span>}
      {isNew && !badge && <span className="ml-auto text-[10px] bg-accent px-2 py-0.5 rounded-full text-white">New</span>}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-card border-r border-border flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Infinity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">LifeOS</h1>
              <p className="text-xs text-gray-400">Personal System</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 space-y-1">
          <div className="px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</div>
          <div className="px-2 space-y-1">
            <MenuItem module="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <MenuItem module="notifications" icon={Bell} label="Notifications" badge={pendingCount} />
            <MenuItem module="goals" icon={Target} label="Goals" isNew />
            <MenuItem module="tasks" icon={CheckSquare} label="Tasks" />
            <MenuItem module="calendar" icon={Calendar} label="Calendar" />
            <MenuItem module="islam" icon={MoonStar} label="Islam" isNew />
          </div>

          <div className="px-6 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking</div>
          <div className="px-2 space-y-1">
            <MenuItem module="learning" icon={BookOpen} label="Learning Log" />
            <MenuItem module="achievements" icon={Trophy} label="Achievements" />
            <MenuItem module="health" icon={Heart} label="Health & Fitness" />
            <MenuItem module="career" icon={Briefcase} label="Career" />
            <MenuItem module="freelance" icon={Laptop2} label="Freelance" />
          </div>

          <div className="px-6 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Finance & Brand</div>
          <div className="px-2 space-y-1">
            <MenuItem module="finance" icon={Wallet} label="Finance" />
            <MenuItem module="portfolio" icon={UserCircle} label="Portfolio" />
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between text-gray-400">
            <button 
              onClick={() => toggleTheme()} 
              className="p-2 rounded-lg hover:bg-bg-tertiary hover:text-white transition-all"
              title="Toggle Theme"
            >
              {data.settings.theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => { onNavigate('settings'); if(window.innerWidth < 768) onClose(); }}
              className={`p-2 rounded-lg hover:bg-bg-tertiary hover:text-white transition-all ${currentModule === 'settings' ? 'text-accent bg-bg-tertiary' : ''}`}
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <button onClick={handleSync} className="p-2 rounded-lg hover:bg-bg-tertiary hover:text-white transition-all" title="Sync / Save">
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
