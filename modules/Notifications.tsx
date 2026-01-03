
import React, { useState } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { formatDate, getRelativeTime } from '../utils';
import { Bell, Clock, Check, Trash2, Plus, Calendar, AlertTriangle, MessageSquare, Info } from 'lucide-react';
import { Priority } from '../types';

const getPriorityColor = (p: Priority) => {
    if (p === 'high') return 'text-red-500 border-red-500/50 bg-red-500/10';
    if (p === 'medium') return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
    return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
}

const ReminderCard: React.FC<{ r: any, isHistory?: boolean }> = ({ r, isHistory = false }) => {
    const { deleteReminder, dismissReminder } = useLifeOS();
    
    return (
      <div className={`glass-card rounded-xl p-4 flex items-center justify-between group transition-all hover:border-accent/50 ${r.notified && !r.dismissed ? 'border-l-4 border-l-red-500' : ''}`}>
          <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${r.notified ? 'bg-red-500/20 text-red-500' : 'bg-bg-tertiary text-gray-400'}`}>
                  {r.notified ? <Bell size={18} className="animate-pulse" /> : <Clock size={18} />}
              </div>
              <div>
                  <h4 className={`font-medium ${r.dismissed ? 'line-through text-gray-500' : 'text-white'}`}>{r.text}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[10px] border ${getPriorityColor(r.priority)}`}>{r.priority}</span>
                      <span>{formatDate(r.time, 'short')} {new Date(r.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span>•</span>
                      <span>{getRelativeTime(r.time)}</span>
                  </div>
              </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isHistory && (
                 <button onClick={() => dismissReminder(r.id)} className="p-2 rounded-lg bg-bg-tertiary hover:bg-green-500/20 hover:text-green-500 transition-colors" title="Dismiss / Done">
                    <Check size={16} />
                 </button>
              )}
              {isHistory && !r.dismissed && (
                  <button onClick={() => dismissReminder(r.id)} className="p-2 rounded-lg bg-bg-tertiary hover:bg-gray-600 transition-colors" title="Archive">
                    <Check size={16} />
                 </button>
              )}
              <button onClick={() => deleteReminder(r.id)} className="p-2 rounded-lg bg-bg-tertiary hover:bg-red-500/20 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 size={16} />
              </button>
          </div>
      </div>
    );
};

const Notifications: React.FC = () => {
  const { data, addReminder } = useLifeOS();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [showAdd, setShowAdd] = useState(false);

  // Form State
  const [text, setText] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const now = new Date();

  const handleAdd = () => {
      if (!text || !dateTime) return;
      addReminder({
          text,
          time: new Date(dateTime).toISOString(),
          priority,
          type: 'custom'
      });
      setText(''); setDateTime(''); setPriority('medium'); setShowAdd(false);
  };

  const reminders = data.reminders.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // Filter Logic
  // Upcoming: Not dismissed, and time is in future OR (notified is false)
  const upcoming = reminders.filter(r => !r.dismissed && !r.notified);
  
  // History: Dismissed OR Notified
  const history = reminders.filter(r => r.dismissed || r.notified).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div>
                <h2 className="text-2xl font-bold">Notifications Center</h2>
                <p className="text-gray-400 text-sm">Manage your reminders and alerts.</p>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="bg-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors flex items-center gap-2">
                <Plus size={18} /> Set Reminder
            </button>
        </div>

        {/* Add Form */}
        {showAdd && (
            <div className="glass-card rounded-xl p-6 border border-accent/50 animate-fade-in">
                <h3 className="font-semibold mb-4">New Reminder</h3>
                <div className="space-y-4">
                    <input 
                        value={text} 
                        onChange={e => setText(e.target.value)} 
                        placeholder="What do you need to remember?" 
                        className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" 
                        autoFocus 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="datetime-local" 
                            value={dateTime} 
                            onChange={e => setDateTime(e.target.value)} 
                            className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" 
                        />
                        <select 
                            value={priority} 
                            onChange={e => setPriority(e.target.value as Priority)} 
                            className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none"
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-2">
                        <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg hover:bg-bg-tertiary text-gray-400">Cancel</button>
                        <button onClick={handleAdd} className="bg-accent px-6 py-2 rounded-lg font-medium">Set Reminder</button>
                    </div>
                </div>
            </div>
        )}

        {/* Tabs */}
        <div className="flex bg-bg-tertiary p-1 rounded-lg w-fit">
            <button onClick={() => setActiveTab('upcoming')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-bg-primary shadow text-white' : 'text-gray-400 hover:text-white'}`}>
                Upcoming <span className="ml-1 px-1.5 py-0.5 rounded-full bg-bg-tertiary text-[10px] border border-border">{upcoming.length}</span>
            </button>
            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-bg-primary shadow text-white' : 'text-gray-400 hover:text-white'}`}>
                History
            </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pb-6">
            {activeTab === 'upcoming' ? (
                upcoming.length > 0 ? (
                    upcoming.map(r => <ReminderCard key={r.id} r={r} />)
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Bell size={48} className="mb-4 opacity-20" />
                        <p>No upcoming reminders.</p>
                    </div>
                )
            ) : (
                history.length > 0 ? (
                    history.map(r => <ReminderCard key={r.id} r={r} isHistory />)
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Clock size={48} className="mb-4 opacity-20" />
                        <p>History is empty.</p>
                    </div>
                )
            )}
        </div>

        {/* Hints */}
        <div className="glass-card p-4 rounded-xl flex items-start gap-3 bg-blue-500/5 border-blue-500/20">
            <Info className="text-blue-500 mt-0.5" size={18} />
            <div className="text-sm text-gray-400">
                <p>Notifications require browser permissions to work in the background. Ensure permissions are allowed.</p>
            </div>
        </div>
    </div>
  );
};

export default Notifications;
