import React, { useState } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { Project, ProjectStatus, Payment } from '../types';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils';
import { Briefcase, DollarSign, Clock, CheckCircle, Plus, Trash2, Calendar, User, MoreVertical, LayoutGrid, CalendarDays, Wallet, CreditCard } from 'lucide-react';

const Freelance: React.FC = () => {
    const { data, addProject, updateProject, deleteProject } = useLifeOS();
    const [showAdd, setShowAdd] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null); // Project ID
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentNote, setPaymentNote] = useState('');
    const [paymentPhase, setPaymentPhase] = useState('');

    // Project Form
    const [projName, setProjName] = useState('');
    const [client, setClient] = useState('');
    const [value, setValue] = useState('');
    const [advance, setAdvance] = useState('');
    const [deadline, setDeadline] = useState('');

    const projects = data.freelance.projects;
    const activeProjects = projects.filter(p => p.status === 'active');
    const completedProjects = projects.filter(p => p.status === 'completed');

    // Calculations
    const totalProjectValue = projects.reduce((acc, p) => acc + (p.value || 0), 0);

    const calculateReceived = (p: Project) => {
        const adv = p.advance || 0;
        const pays = p.payments?.reduce((sum, pay) => sum + pay.amount, 0) || 0;
        return adv + pays;
    };

    const totalReceived = projects.reduce((acc, p) => acc + calculateReceived(p), 0);
    const totalDue = totalProjectValue - totalReceived;

    const handleAddProj = () => {
        if (!projName || !client) return;
        addProject({
            name: projName,
            client,
            value: parseFloat(value) || 0,
            advance: parseFloat(advance) || 0,
            deadline: deadline || undefined,
            status: 'active',
            payments: []
        });
        setProjName(''); setClient(''); setValue(''); setAdvance(''); setDeadline(''); setShowAdd(false);
    };

    const handleAddPayment = () => {
        if (!showPaymentModal || !paymentAmount) return;
        const project = projects.find(p => p.id === showPaymentModal);
        if (!project) return;

        const newPayment: Payment = {
            id: Date.now().toString(),
            amount: parseFloat(paymentAmount),
            date: paymentDate,
            note: paymentNote,
            phase: paymentPhase || 'Installment'
        };

        updateProject({
            ...project,
            payments: [...(project.payments || []), newPayment]
        });

        setShowPaymentModal(null);
        setPaymentAmount(''); setPaymentNote(''); setPaymentPhase('');
    };

    const handleStatusToggle = (project: Project) => {
        updateProject({
            ...project,
            status: project.status === 'active' ? 'completed' : 'active'
        });
    };

    // Timeline Helper
    const timelineDays = 14;
    const timelineDates = Array.from({ length: timelineDays }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    return (
        <div className="space-y-6 animate-fade-in flex flex-col h-full relative">
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
                    <button onClick={() => setShowAdd(!showAdd)} className="bg-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors flex items-center gap-2">
                        <Plus size={18} /> New Project
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="kpi-card rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Active Projects</p>
                    <h3 className="text-3xl font-bold text-white">{activeProjects.length}</h3>
                    <div className="mt-4 flex items-center text-sm text-blue-400">
                        <Briefcase size={16} className="mr-2" /> In Progress
                    </div>
                </div>
                <div className="kpi-card rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Total Project Value</p>
                    <h3 className="text-3xl font-bold text-white">{formatCurrency(totalProjectValue)}</h3>
                    <div className="mt-4 flex items-center text-sm text-gray-400">
                        <DollarSign size={16} className="mr-2" /> All Time
                    </div>
                </div>
                <div className="kpi-card rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Total Received</p>
                    <h3 className="text-3xl font-bold text-green-500">{formatCurrency(totalReceived)}</h3>
                    <div className="mt-4 flex items-center text-sm text-green-500/80">
                        <Wallet size={16} className="mr-2" /> Advance + Payments
                    </div>
                </div>
                <div className="kpi-card rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Total Pending</p>
                    <h3 className="text-3xl font-bold text-yellow-500">{formatCurrency(totalDue)}</h3>
                    <div className="mt-4 flex items-center text-sm text-yellow-500/80">
                        <Clock size={16} className="mr-2" /> Outstanding
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card p-6 rounded-xl w-full max-w-md border border-accent/20">
                        <h3 className="text-xl font-bold mb-4">Record Payment</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Phase / Milestone Name</label>
                                <input value={paymentPhase} onChange={e => setPaymentPhase(e.target.value)} placeholder="e.g. Design Phase, Final Handoff" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" autoFocus />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Amount</label>
                                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Amount" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Date</label>
                                    <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Note (Optional)</label>
                                    <input value={paymentNote} onChange={e => setPaymentNote(e.target.value)} placeholder="Note" className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowPaymentModal(null)} className="px-4 py-2 rounded-lg hover:bg-bg-tertiary text-gray-400">Cancel</button>
                            <button onClick={handleAddPayment} className="bg-accent px-6 py-2 rounded-lg font-medium text-white">Save Payment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Form */}
            {showAdd && (
                <div className="glass-card rounded-xl p-6 border border-accent/50 animate-fade-in">
                    <h3 className="font-semibold mb-4">Create New Project</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input value={projName} onChange={e => setProjName(e.target.value)} placeholder="Project Name" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" autoFocus />
                        <input value={client} onChange={e => setClient(e.target.value)} placeholder="Client Name" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                        <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Total Value (₹)" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                        <input type="number" value={advance} onChange={e => setAdvance(e.target.value)} placeholder="Advance Received (₹)" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg hover:bg-bg-tertiary text-gray-400">Cancel</button>
                        <button onClick={handleAddProj} className="bg-accent px-6 py-2 rounded-lg font-medium">Create Project</button>
                    </div>
                </div>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
                <div className="glass-card rounded-xl overflow-hidden flex flex-col animate-fade-in">
                    <div className="p-4 border-b border-border">
                        <h3 className="font-bold">Project Timeline (Next 14 Days)</h3>
                    </div>
                    <div className="overflow-x-auto pb-2">
                        <div className="min-w-[800px]">
                            {/* Header Dates */}
                            <div className="flex border-b border-border">
                                <div className="w-48 p-4 shrink-0 bg-bg-tertiary/20 font-semibold text-sm text-gray-400 sticky left-0 backdrop-blur-md z-10 border-r border-border">Project</div>
                                {timelineDates.map(d => {
                                    const isToday = d.toDateString() === new Date().toDateString();
                                    return (
                                        <div key={d.toISOString()} className={`flex-1 min-w-[60px] p-2 text-center border-r border-border/30 ${isToday ? 'bg-accent/10' : ''}`}>
                                            <div className={`text-[10px] uppercase font-bold ${isToday ? 'text-accent' : 'text-gray-500'}`}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                            <div className={`text-sm ${isToday ? 'text-white font-bold' : 'text-gray-400'}`}>{d.getDate()}</div>
                                        </div>
                                    )
                                })}
                            </div>
                            {/* Rows */}
                            {activeProjects.map(p => {
                                const daysLeft = p.deadline ? getDaysRemaining(p.deadline) : null;
                                const isOverdue = daysLeft !== null && daysLeft < 0;

                                return (
                                    <div key={p.id} className="flex border-b border-border/30 hover:bg-bg-tertiary/10 transition-colors">
                                        <div className="w-48 p-3 shrink-0 sticky left-0 bg-bg-secondary/95 backdrop-blur-sm z-10 border-r border-border flex flex-col justify-center">
                                            <div className="font-medium text-sm truncate">{p.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{p.client}</div>
                                        </div>
                                        {timelineDates.map(d => {
                                            const dTime = d.getTime();
                                            const todayTime = new Date().setHours(0, 0, 0, 0);
                                            const deadlineTime = p.deadline ? new Date(p.deadline).setHours(0, 0, 0, 0) : null;

                                            // Logic for timeline bar
                                            // 1. If today <= date <= deadline: Active Bar
                                            // 2. If date == deadline: Deadline Marker

                                            let isActiveRange = false;
                                            let isDeadline = false;

                                            if (deadlineTime) {
                                                const checkTime = d.setHours(0, 0, 0, 0);
                                                if (checkTime >= todayTime && checkTime < deadlineTime) isActiveRange = true;
                                                if (checkTime === deadlineTime) isDeadline = true;
                                            }

                                            return (
                                                <div key={d.toISOString()} className={`flex-1 min-w-[60px] border-r border-border/30 relative flex items-center justify-center h-16`}>
                                                    {isActiveRange && (
                                                        <div className="absolute inset-x-0 h-2 bg-blue-500/20 top-1/2 -translate-y-1/2"></div>
                                                    )}
                                                    {isDeadline && (
                                                        <div className="absolute inset-y-2 w-1 bg-red-500 rounded-full left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(239,68,68,0.5)]" title="Deadline"></div>
                                                    )}
                                                    {isDeadline && (
                                                        <div className="absolute top-2 bg-red-500 text-[8px] px-1 rounded text-white font-bold">DUE</div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                            {activeProjects.length === 0 && (
                                <div className="p-8 text-center text-gray-500">No active projects to display on timeline.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div>
                    <h3 className="text-xl font-bold mb-4">Active Projects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeProjects.map(p => {
                            const received = calculateReceived(p);
                            const due = (p.value || 0) - received;

                            return (
                                <div key={p.id} className="glass-card rounded-xl p-5 hover:border-accent/50 transition-all group relative flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded uppercase font-bold">Active</span>
                                        <div className="relative group/menu">
                                            <button className="text-gray-500 hover:text-white"><MoreVertical size={16} /></button>
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-bg-tertiary border border-border rounded-lg shadow-xl overflow-hidden hidden group-hover/menu:block z-10">
                                                <button onClick={() => handleStatusToggle(p)} className="w-full text-left px-3 py-2 text-xs hover:bg-accent hover:text-white">Mark Complete</button>
                                                <div className="border-t border-border"></div>
                                                <button onClick={() => deleteProject(p.id)} className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/20">Delete</button>
                                            </div>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-lg mb-1">{p.name}</h4>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                        <User size={14} /> {p.client}
                                    </div>

                                    <div className="space-y-4 mb-6 flex-1">
                                        <div className="p-3 bg-bg-tertiary/50 rounded-lg space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Total Value</span>
                                                <span className="font-bold text-white">{formatCurrency(p.value || 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Received (Adv+Pay)</span>
                                                <span className="font-bold text-green-400">{formatCurrency(received)}</span>
                                            </div>
                                            <div className="h-px bg-border/50"></div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Due Amount</span>
                                                <span className="font-bold text-yellow-400">{formatCurrency(due)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={() => setShowPaymentModal(p.id)} className="w-full mb-4 py-2 rounded-lg bg-bg-tertiary hover:bg-bg-tertiary/80 text-sm font-medium text-accent border border-accent/20 hover:border-accent flex items-center justify-center gap-2 transition-all">
                                        <Plus size={14} /> Add Payment
                                    </button>

                                    <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-border">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} /> {p.deadline ? formatDate(p.deadline, 'short') : 'No Date'}
                                        </div>
                                        {p.payments && p.payments.length > 0 && (
                                            <span>{p.payments.length} Installments</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        {activeProjects.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500 glass-card rounded-xl border-dashed">
                                <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No active projects. Start hustling!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Completed Projects Table */}
            {completedProjects.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold mb-4 mt-8">Completed History</h3>
                    <div className="glass-card rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-bg-tertiary/50 border-b border-border text-xs uppercase text-gray-400">
                                <tr>
                                    <th className="p-4">Project</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4 text-right">Value</th>
                                    <th className="p-4 text-right">Received</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {completedProjects.map(p => {
                                    const received = calculateReceived(p);
                                    return (
                                        <tr key={p.id} className="border-b border-border/50 hover:bg-bg-tertiary/20 opacity-70 hover:opacity-100 transition-opacity">
                                            <td className="p-4 font-medium flex items-center gap-2">
                                                <CheckCircle size={14} className="text-green-500" /> {p.name}
                                            </td>
                                            <td className="p-4 text-gray-400">{p.client}</td>
                                            <td className="p-4 text-right font-mono text-white">{formatCurrency(p.value || 0)}</td>
                                            <td className="p-4 text-right font-mono text-green-500">{formatCurrency(received)}</td>
                                            <td className="p-4 text-center flex justify-center gap-2">
                                                <button onClick={() => handleStatusToggle(p)} className="p-2 hover:bg-bg-tertiary rounded text-blue-400" title="Reactivate">
                                                    <Clock size={16} />
                                                </button>
                                                <button onClick={() => deleteProject(p.id)} className="p-2 hover:bg-red-500/20 rounded text-red-500" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Freelance;