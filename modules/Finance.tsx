import React, { useState, useMemo } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { formatCurrency, formatDate } from '../utils';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, ArrowUpRight, ArrowDownRight, PieChart, BarChart3, Activity } from 'lucide-react';

const Finance: React.FC = () => {
  const { data, addTransaction, deleteTransaction } = useLifeOS();
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>('transactions');
  const [showAdd, setShowAdd] = useState(false);
  
  // Form
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('other');

  const transactions = [...data.finance.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Analytics Data Calculation
  const analyticsData = useMemo(() => {
    // 1. Spending by Category (Current Month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'expense';
    });

    const categoryTotals: Record<string, number> = {};
    thisMonthTxns.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categoryData = Object.entries(categoryTotals)
        .map(([cat, amount]) => ({ cat, amount }))
        .sort((a, b) => b.amount - a.amount);
    
    const maxCatAmount = Math.max(...categoryData.map(d => d.amount), 1);

    // 2. Monthly Cashflow (Last 6 Months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = d.toLocaleString('default', { month: 'short' });
        const mIdx = d.getMonth();
        const y = d.getFullYear();

        const monthTxns = transactions.filter(t => {
            const td = new Date(t.date);
            return td.getMonth() === mIdx && td.getFullYear() === y;
        });

        const inc = monthTxns.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
        const exp = monthTxns.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
        
        monthlyData.push({ month: monthKey, income: inc, expense: exp });
    }

    const maxMonthlyVal = Math.max(...monthlyData.map(m => Math.max(m.income, m.expense)), 1);

    return { categoryData, monthlyData, maxCatAmount, maxMonthlyVal };
  }, [transactions]);

  const handleSubmit = () => {
      if (!desc || !amount) return;
      addTransaction({
          description: desc,
          amount: parseFloat(amount),
          type,
          category,
          date: new Date().toISOString()
      });
      setDesc(''); setAmount(''); setShowAdd(false);
  };

  const CATEGORY_COLORS: Record<string, string> = {
      food: 'bg-orange-500',
      transport: 'bg-blue-500',
      utilities: 'bg-yellow-500',
      entertainment: 'bg-purple-500',
      shopping: 'bg-pink-500',
      health: 'bg-red-500',
      other: 'bg-gray-500'
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex bg-bg-tertiary p-1 rounded-lg w-fit">
                <button 
                    onClick={() => setActiveTab('transactions')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'transactions' ? 'bg-bg-primary shadow text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <Wallet size={16} /> Transactions
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-bg-primary shadow text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <BarChart3 size={16} /> Analytics
                </button>
            </div>
            
            <button onClick={() => setShowAdd(!showAdd)} className="bg-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors flex items-center gap-2">
                <Plus size={18} /> Add Transaction
            </button>
        </div>

        {/* Stats Cards - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="kpi-card rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-1">Total Balance</p>
                <h3 className={`text-3xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-500'}`}>{formatCurrency(balance)}</h3>
                <div className="mt-4 flex items-center text-sm text-gray-400">
                    <Wallet size={16} className="mr-2" /> Available
                </div>
            </div>
            <div className="kpi-card rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-1">Income</p>
                <h3 className="text-3xl font-bold text-green-500">{formatCurrency(totalIncome)}</h3>
                <div className="mt-4 flex items-center text-sm text-green-500 bg-green-500/10 px-2 py-1 rounded w-fit">
                    <ArrowUpRight size={16} className="mr-1" /> +{transactions.filter(t => t.type === 'income').length} txns
                </div>
            </div>
            <div className="kpi-card rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-1">Expenses</p>
                <h3 className="text-3xl font-bold text-red-500">{formatCurrency(totalExpense)}</h3>
                <div className="mt-4 flex items-center text-sm text-red-500 bg-red-500/10 px-2 py-1 rounded w-fit">
                    <ArrowDownRight size={16} className="mr-1" /> -{transactions.filter(t => t.type === 'expense').length} txns
                </div>
            </div>
        </div>

        {/* Add Form */}
        {showAdd && (
            <div className="glass-card rounded-xl p-6 animate-fade-in border border-accent/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="text-xs text-gray-400 mb-1 block">Description</label>
                        <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" placeholder="e.g. Groceries" autoFocus />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Amount</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" placeholder="0.00" />
                    </div>
                     <div>
                        <label className="text-xs text-gray-400 mb-1 block">Type</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none">
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                     <label className="text-xs text-gray-400 mb-1 block">Category</label>
                     <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none capitalize">
                        {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                     <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg hover:bg-bg-tertiary text-gray-400">Cancel</button>
                     <button onClick={handleSubmit} className="bg-accent px-6 py-2 rounded-lg font-medium">Save</button>
                </div>
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
            {activeTab === 'transactions' ? (
                <div className="glass-card rounded-xl overflow-hidden h-full flex flex-col">
                    <div className="p-4 border-b border-border bg-bg-tertiary/20">
                        <h3 className="font-bold text-lg">Recent History</h3>
                    </div>
                    <div className="overflow-y-auto scrollbar-thin flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-bg-tertiary/50 border-b border-border text-gray-400 text-sm sticky top-0 backdrop-blur-md">
                                    <th className="p-4 font-medium">Description</th>
                                    <th className="p-4 font-medium">Category</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium text-right">Amount</th>
                                    <th className="p-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No transactions recorded</td></tr>
                                ) : (
                                    transactions.map(t => (
                                        <tr key={t.id} className="border-b border-border/50 hover:bg-bg-tertiary/30 transition-colors group">
                                            <td className="p-4 flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                </div>
                                                <span className="font-medium">{t.description}</span>
                                            </td>
                                            <td className="p-4 text-gray-400 capitalize">
                                                <span className={`px-2 py-0.5 rounded text-xs ${CATEGORY_COLORS[t.category] || 'bg-gray-500'} bg-opacity-20 text-white`}>
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400">{formatDate(t.date, 'short')}</td>
                                            <td className={`p-4 text-right font-medium ${t.type === 'income' ? 'text-green-500' : 'text-white'}`}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => deleteTransaction(t.id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto scrollbar-thin pb-6">
                    {/* Spending Breakdown */}
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                             <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500"><PieChart size={20} /></div>
                             <div>
                                 <h3 className="font-bold text-lg">Spending by Category</h3>
                                 <p className="text-xs text-gray-400">This Month</p>
                             </div>
                        </div>
                        <div className="space-y-4">
                            {analyticsData.categoryData.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No expenses this month.</p>
                            ) : (
                                analyticsData.categoryData.map(item => (
                                    <div key={item.cat}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize text-gray-300">{item.cat}</span>
                                            <span className="font-mono">{formatCurrency(item.amount)}</span>
                                        </div>
                                        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden flex items-center">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${CATEGORY_COLORS[item.cat] || 'bg-gray-500'}`} 
                                                style={{ width: `${(item.amount / analyticsData.maxCatAmount) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="glass-card rounded-xl p-6 flex flex-col">
                         <div className="flex items-center gap-2 mb-6">
                             <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><Activity size={20} /></div>
                             <div>
                                 <h3 className="font-bold text-lg">Cashflow Trend</h3>
                                 <p className="text-xs text-gray-400">Last 6 Months</p>
                             </div>
                        </div>
                        
                        <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px] border-b border-border/50 pb-2">
                             {analyticsData.monthlyData.map(m => (
                                 <div key={m.month} className="flex-1 flex flex-col justify-end gap-1 group relative">
                                     {/* Tooltip */}
                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-bg-secondary border border-border px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                         <div className="text-green-500">In: {formatCurrency(m.income)}</div>
                                         <div className="text-red-500">Out: {formatCurrency(m.expense)}</div>
                                     </div>
                                     
                                     <div className="w-full flex gap-1 h-40 items-end justify-center">
                                         <div 
                                            className="w-1/2 bg-green-500/50 hover:bg-green-500 rounded-t-sm transition-all"
                                            style={{ height: `${(m.income / analyticsData.maxMonthlyVal) * 100}%` }}
                                         ></div>
                                         <div 
                                            className="w-1/2 bg-red-500/50 hover:bg-red-500 rounded-t-sm transition-all"
                                            style={{ height: `${(m.expense / analyticsData.maxMonthlyVal) * 100}%` }}
                                         ></div>
                                     </div>
                                     <div className="text-[10px] text-gray-500 text-center uppercase">{m.month}</div>
                                 </div>
                             ))}
                        </div>
                        <div className="flex justify-center gap-6 mt-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500/50 rounded-sm"></div> <span>Income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500/50 rounded-sm"></div> <span>Expense</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Finance;