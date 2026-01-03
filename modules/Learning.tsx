import React, { useState } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { formatDate } from '../utils';
import { BookOpen, Clock, Trash2, Plus, Link, Video, FileText } from 'lucide-react';

const Learning: React.FC = () => {
  const { data, addLearning, deleteLearning } = useLifeOS();
  const [showAdd, setShowAdd] = useState(false);
  
  // Form
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [resource, setResource] = useState('');

  const logs = [...data.learnings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalMinutes = logs.reduce((acc, l) => acc + l.timeSpent, 0);
  const totalHours = Math.round(totalMinutes / 60);

  const handleSubmit = () => {
      if (!topic) return;
      addLearning({
          topic,
          details,
          resource,
          timeSpent: parseInt(timeSpent) || 0,
      });
      setTopic(''); setDetails(''); setTimeSpent(''); setResource(''); setShowAdd(false);
  };

  const getResourceIcon = (res: string) => {
      if (res.includes('youtube') || res.includes('video')) return <Video size={14} />;
      if (res.includes('http')) return <Link size={14} />;
      return <BookOpen size={14} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="lg:col-span-2 space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Learning Log</h2>
                <button onClick={() => setShowAdd(!showAdd)} className="bg-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors flex items-center gap-2">
                    <Plus size={18} /> Log Session
                </button>
            </div>

            {showAdd && (
                <div className="glass-card rounded-xl p-5 border border-accent/50 animate-fade-in">
                    <h3 className="font-semibold mb-4">New Entry</h3>
                    <div className="space-y-4">
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="What did you learn?" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" autoFocus />
                        <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Key takeaways..." className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none h-24" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={timeSpent} onChange={e => setTimeSpent(e.target.value)} placeholder="Time spent (minutes)" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                            <input type="text" value={resource} onChange={e => setResource(e.target.value)} placeholder="Resource/Link (optional)" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                        </div>
                        <div className="flex justify-end gap-3">
                             <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg hover:bg-bg-tertiary text-gray-400">Cancel</button>
                             <button onClick={handleSubmit} className="bg-accent px-6 py-2 rounded-lg font-medium">Save Log</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {logs.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 text-center text-gray-500">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No learning sessions logged yet.</p>
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="glass-card rounded-xl p-5 hover:border-accent/50 transition-colors group relative">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg">{log.topic}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Clock size={14} />
                                    <span>{log.timeSpent} min</span>
                                </div>
                            </div>
                            <p className="text-gray-400 mb-3 text-sm">{log.details}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-border pt-3 mt-2">
                                <div className="flex items-center gap-4">
                                    <span>{formatDate(log.date, 'full')}</span>
                                    {log.resource && (
                                        <a href={log.resource} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-accent hover:underline">
                                            {getResourceIcon(log.resource)} Resource
                                        </a>
                                    )}
                                </div>
                                <button onClick={() => deleteLearning(log.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-2 rounded transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="space-y-6">
            <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-3xl font-bold mb-1">{totalHours}</h3>
                <p className="text-gray-400 text-sm">Total Hours Invested</p>
            </div>
            
            <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-4">Recent Topics</h3>
                <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(logs.map(l => l.topic))).slice(0, 10).map(t => (
                        <span key={t} className="px-3 py-1 bg-bg-tertiary rounded-full text-xs text-gray-300">{t}</span>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Learning;