import { useLifeOS } from '../context/LifeOSContext';
import { Transaction, TransactionType } from '../types';

/**
 * Custom hook for finance-related operations
 */
export const useFinance = () => {
  const { data, addTransaction, deleteTransaction } = useLifeOS();

  const getFinanceStats = (period?: 'week' | 'month' | 'year') => {
    const now = new Date();
    let transactions = [...data.finance.transactions];

    if (period) {
      const startDate = new Date();
      if (period === 'week') startDate.setDate(now.getDate() - 7);
      if (period === 'month') startDate.setMonth(now.getMonth() - 1);
      if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

      transactions = transactions.filter(t => new Date(t.date) >= startDate);
    }

    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      count: transactions.length,
    };
  };

  const getCategoryBreakdown = () => {
    const breakdown: Record<string, number> = {};

    data.finance.transactions.forEach(t => {
      if (t.type === 'expense') {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      }
    });

    return breakdown;
  };

  const getTransactionsByType = (type: TransactionType) => {
    return data.finance.transactions.filter(t => t.type === type);
  };

  return {
    transactions: data.finance.transactions,
    stats: getFinanceStats(),
    getFinanceStats,
    getCategoryBreakdown,
    getTransactionsByType,
    addTransaction,
    deleteTransaction,
  };
};
