import React, { useState } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { Briefcase, Building, Clock, CheckCircle, XCircle, Plus, Trash2, Globe, MoreHorizontal } from 'lucide-react';
import { ApplicationStatus } from '../types';
import { formatDate } from '../utils';

const Career: React.FC = () => {
  const { data, addApplication, updateApplicationStatus, deleteApplication } = useLifeOS();
  const [showAdd, setShowAdd] = useState(false);

  // App Form
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [link, setLink] = useState('');

  const handleAddApp = () => {
      if (!role || !company) return;
      addApplication({ role, company, link });
      setRole(''); setCompany(''); setLink(''); setShowAdd(false);
  };

  const apps = data.career.applications;
  
  const columns: { id: ApplicationStatus, label: string, color: string }[] = [
      { id: 'applied', label: 'Applied', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      { id: 'interviewing', label: 'Interviewing', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      { id: 'offer', label: 'Offer', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      { id: 'rejected', label: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold">Job Hunt Board</h2>
                <p className="text-gray-400 text-sm">Manage your applications pipeline.</p>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="bg-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors flex items-center gap-2">
                <Plus size={18} /> Track Application
            </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-xs uppercase">Total</p>
                    <p className="text-2xl font-bold">{apps.length}</p>
                </div>
                <Briefcase className="text-gray-600" />
            </div>
            <div className="glass-card p-4 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-xs uppercase">Active</p>
                    <p className="text-2xl font-bold text-blue-500">{apps.filter(a => ['applied', 'interviewing'].includes(a.status)).length}</p>
                </div>
                <Clock className="text-blue-500/50" />
            </div>
            <div className="glass-card p-4 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-xs uppercase">Interviews</p>
                    <p className="text-2xl font-bold text-yellow-500">{apps.filter(a => a.status === 'interviewing').length}</p>
                </div>
                <Building className="text-yellow-500/50" />
            </div>
             <div className="glass-card p-4 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-xs uppercase">Offers</p>
                    <p className="text-2xl font-bold text-green-500">{apps.filter(a => a.status === 'offer').length}</p>
                </div>
                <CheckCircle className="text-green-500/50" />
            </div>
        </div>

        {/* Add Form */}
        {showAdd && (
            <div className="glass-card rounded-xl p-6 border border-accent/50 mb-6 animate-fade-in">
                <h3 className="font-semibold mb-4">Add Job Application</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={role} onChange={e => setRole(e.target.value)} placeholder="Role Title (e.g. Frontend Engineer)" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" autoFocus />
                    <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company Name" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                    <input value={link} onChange={e => setLink(e.target.value)} placeholder="Job Posting URL" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none md:col-span-2" />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                     <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg hover:bg-bg-tertiary text-gray-400">Cancel</button>
                     <button onClick={handleAddApp} className="bg-accent px-6 py-2 rounded-lg font-medium">Save</button>
                </div>
            </div>
        )}

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 min-w-[1000px] h-full">
                {columns.map(col => (
                    <div key={col.id} className="flex-1 flex flex-col glass-card rounded-xl bg-bg-secondary/30 border-0">
                        <div className={`p-4 border-b border-border flex justify-between items-center ${col.color} bg-opacity-10`}>
                            <h3 className="font-bold">{col.label}</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-bg-primary bg-opacity-50">{apps.filter(a => a.status === col.id).length}</span>
                        </div>
                        <div className="p-3 flex-1 overflow-y-auto space-y-3">
                            {apps.filter(a => a.status === col.id).map(app => (
                                <div key={app.id} className="glass-card bg-bg-primary p-4 rounded-lg hover:border-accent/50 group shadow-sm transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm">{app.role}</h4>
                                        <div className="relative group/menu">
                                            <button className="text-gray-500 hover:text-white"><MoreHorizontal size={16} /></button>
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-bg-tertiary border border-border rounded-lg shadow-xl overflow-hidden hidden group-hover/menu:block z-10">
                                                {columns.filter(c => c.id !== app.status).map(c => (
                                                    <button key={c.id} onClick={() => updateApplicationStatus(app.id, c.id)} className="w-full text-left px-3 py-2 text-xs hover:bg-accent hover:text-white">Move to {c.label}</button>
                                                ))}
                                                <div className="border-t border-border"></div>
                                                <button onClick={() => deleteApplication(app.id)} className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/20">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                        <Building size={12} /> {app.company}
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                                        <span>{formatDate(app.date, 'short')}</span>
                                        {app.link && <a href={app.link} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1"><Globe size={10} /> Link</a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Career;