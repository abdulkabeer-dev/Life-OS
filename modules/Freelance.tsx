import React, { useState } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { Project, ProjectStatus } from '../types';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils';
import { Briefcase, DollarSign, Clock, CheckCircle, Plus, Trash2, Calendar, User, MoreVertical, LayoutGrid, CalendarDays, Edit2, X, Save } from 'lucide-react';

const Freelance: React.FC = () => {
  const { data, addProject, updateProject, deleteProject } = useLifeOS();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Project Form
  const [projName, setProjName] = useState('');
  const [client, setClient] = useState('');
  const [value, setValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');

  const projects = data.freelance.projects;
  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const totalValue = projects.reduce((acc, p) => acc + (p.value || 0), 0);
  const pipelineValue = activeProjects.reduce((acc, p) => acc + (p.value || 0), 0);

  // Load project for editing
  const loadEditProject = (project: Project) => {
    setProjName(project.name);
    setClient(project.client);
    setValue(String(project.value || 0));
    setDeadline(project.deadline || '');
    setStatus(project.status);
    setEditingId(project.id);
    setShowAdd(true);
  };

  // Save or update project
  const handleSaveProject = () => {
    if (!projName || !client) return;
    
    const projectData = { 
      name: projName, 
      client, 
      value: parseFloat(value) || 0,
      deadline: deadline || undefined,
      status
    };

    if (editingId) {
      updateProject({ ...projects.find(p => p.id === editingId)!, ...projectData });
      setEditingId(null);
    } else {
      addProject({ ...projectData, status: 'active' });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setProjName('');
    setClient('');
    setValue('');
    setDeadline('');
    setStatus('active');
    setShowAdd(false);
    setMenuOpen(null);
  };

  // Timeline Helper
  const timelineDays = 14;
  const timelineDates = Array.from({ length: timelineDays }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  // Status Badge
  const getStatusColor = (status: ProjectStatus) => {
    switch(status) {
      case 'active': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getDeadlineColor = (days: number | null) => {
    if (days === null) return 'text-gray-400';
    if (days < 0) return 'text-red-400 font-bold';
    if (days < 3) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Freelance Dashboard</h2>
          <p className="text-gray-400 text-sm">Manage projects, clients, and revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-bg-tertiary p-1 rounded-lg flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-bg-primary shadow text-white' : 'text-gray-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-bg-primary shadow text-white' : 'text-gray-400 hover:text-white'}`}
              title="Timeline View"
            >
              <CalendarDays size={18} />
            </button>
          </div>
          <button onClick={() => { resetForm(); setShowAdd(true); }} className="bg-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors flex items-center gap-2">
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="kpi-card rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Active Projects</p>
          <h3 className="text-3xl font-bold text-white">{activeProjects.length}</h3>
          <div className="mt-4 flex items-center text-sm text-blue-400">
            <Briefcase size={16} className="mr-2" /> In Progress
          </div>
        </div>
        <div className="kpi-card rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Pipeline Value</p>
          <h3 className="text-3xl font-bold text-yellow-500">{formatCurrency(pipelineValue)}</h3>
          <div className="mt-4 flex items-center text-sm text-yellow-500/80">
            <Clock size={16} className="mr-2" /> Pending Revenue
          </div>
        </div>
        <div className="kpi-card rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
          <h3 className="text-3xl font-bold text-green-500">{formatCurrency(totalValue)}</h3>
          <div className="mt-4 flex items-center text-sm text-green-500/80">
            <DollarSign size={16} className="mr-2" /> Lifetime Value
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <div className="glass-card rounded-xl p-6 border border-accent/50 animate-fade-in">
          <h3 className="font-semibold mb-4">{editingId ? 'Edit Project' : 'Create New Project'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={projName} onChange={e => setProjName(e.target.value)} placeholder="Project Name" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" autoFocus />
            <input value={client} onChange={e => setClient(e.target.value)} placeholder="Client Name" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
            <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Project Value (₹)" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
            <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none">
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={resetForm} className="px-4 py-2 rounded-lg hover:bg-bg-tertiary text-gray-400 flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSaveProject} className="bg-accent px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-accent/80">
              <Save size={16} /> {editingId ? 'Update' : 'Create'} Project
            </button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="font-bold text-lg mb-3">Active Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProjects.map(project => {
                const daysLeft = project.deadline ? getDaysRemaining(project.deadline) : null;
                const isOverdue = daysLeft !== null && daysLeft < 0;
                
                return (
                  <div key={project.id} className="glass-card rounded-xl p-6 border border-accent/30 hover:border-accent/60 transition-all group relative">
                    {/* Menu Button */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                      {menuOpen === project.id && (
                        <div className="absolute right-0 mt-2 bg-bg-tertiary border border-border rounded-lg shadow-xl z-10">
                          <button 
                            onClick={() => { loadEditProject(project); setMenuOpen(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-bg-primary flex items-center gap-2 text-blue-400 rounded-t-lg"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => { deleteProject(project.id); setMenuOpen(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-bg-primary flex items-center gap-2 text-red-400 rounded-b-lg"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg">{project.name}</h4>
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                          <User size={14} /> {project.client}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                        {project.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-xs uppercase">Value</p>
                        <p className="text-2xl font-bold text-green-500">{formatCurrency(project.value || 0)}</p>
                      </div>
                      {project.deadline && (
                        <div>
                          <p className="text-gray-400 text-xs uppercase">Deadline</p>
                          <p className={`font-semibold flex items-center gap-1 ${getDeadlineColor(daysLeft)}`}>
                            <Calendar size={14} /> {formatDate(project.deadline)}
                          </p>
                          <p className={`text-xs mt-1 ${getDeadlineColor(daysLeft)}`}>
                            {daysLeft === null ? '' : isOverdue ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {completedProjects.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-400">Completed Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedProjects.map(project => (
                  <div key={project.id} className="glass-card rounded-xl p-6 border border-green-500/20 opacity-75 group relative">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                      {menuOpen === project.id && (
                        <div className="absolute right-0 mt-2 bg-bg-tertiary border border-border rounded-lg shadow-xl z-10">
                          <button 
                            onClick={() => { loadEditProject(project); setMenuOpen(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-bg-primary flex items-center gap-2 text-blue-400 rounded-t-lg"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => { deleteProject(project.id); setMenuOpen(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-bg-primary flex items-center gap-2 text-red-400 rounded-b-lg"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg">{project.name}</h4>
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                          <User size={14} /> {project.client}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                        <CheckCircle size={12} /> Done
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(project.value || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center border border-border/50">
          <Briefcase size={48} className="mx-auto text-gray-500 mb-4 opacity-50" />
          <p className="text-gray-400 mb-4">No projects yet. Create your first freelance project.</p>
          <button onClick={() => setShowAdd(true)} className="bg-accent px-6 py-2 rounded-lg font-medium hover:bg-accent/80">
            Create Project
          </button>
        </div>
      )}
    </div>
  );
};

export default Freelance;
