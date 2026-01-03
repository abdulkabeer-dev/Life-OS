import { useLifeOS } from '../context/LifeOSContext';
import { useGoals } from './useGoals';
import { useTasks } from './useTasks';
import { useFinance } from './useFinance';
import { calculateStreak } from '../utils';

export interface InsightMetrics {
  taskCompletionRate: number;
  goalProgressRate: number;
  financialBalance: number;
  learningHoursThisMonth: number;
  longestStreak: number;
  thisWeekStats: {
    tasksCompleted: number;
    goalsAdvanced: number;
    moneySpent: number;
    moneyEarned: number;
  };
}

/**
 * Hook for generating insights and analytics
 * Provides dashboard metrics and performance indicators
 */
export const useInsights = () => {
  const { data } = useLifeOS();
  const { stats: taskStats } = useTasks();
  const { stats: goalStats } = useGoals();
  const { stats: financeStats } = useFinance();

  const getInsightMetrics = (): InsightMetrics => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setMonth(now.getMonth() - 1);

    // Learning hours this month
    const learningHours = data.learnings
      .filter(log => new Date(log.date) >= monthStart)
      .reduce((sum, log) => sum + log.timeSpent, 0) / 60;

    // This week's stats
    const weekTasks = data.tasks.filter(t => new Date(t.createdAt) >= weekStart);
    const weekGoals = data.goals.filter(g => new Date(g.createdAt) >= weekStart);
    const weekTransactions = data.finance.transactions.filter(t => new Date(t.date) >= weekStart);

    const thisWeekStats = {
      tasksCompleted: weekTasks.filter(t => t.completed).length,
      goalsAdvanced: weekGoals.filter(g => g.completed).length,
      moneySpent: weekTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      moneyEarned: weekTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    };

    // Habit streaks
    const habitStreaks = data.health.habits.map(h => calculateStreak(h.completions));
    const longestStreak = habitStreaks.length > 0 ? Math.max(...habitStreaks) : 0;

    return {
      taskCompletionRate: taskStats.completionRate,
      goalProgressRate: goalStats.completionRate,
      financialBalance: financeStats.balance,
      learningHoursThisMonth: Math.round(learningHours),
      longestStreak,
      thisWeekStats,
    };
  };

  const getTrends = () => {
    const metrics = getInsightMetrics();
    
    return {
      // Check if completion rate is improving
      improving: {
        tasks: metrics.taskCompletionRate > 50,
        goals: metrics.goalProgressRate > 50,
        finance: metrics.financialBalance > 0,
      },
      // Calculate daily average
      daily: {
        tasksPerDay: metrics.thisWeekStats.tasksCompleted / 7,
        spendPerDay: metrics.thisWeekStats.moneySpent / 7,
        earnPerDay: metrics.thisWeekStats.moneyEarned / 7,
      },
      // Health check
      health: {
        isBalanced: Math.abs(metrics.thisWeekStats.moneyEarned - metrics.thisWeekStats.moneySpent) < metrics.thisWeekStats.moneyEarned * 0.1,
        savingsRate: metrics.thisWeekStats.moneyEarned > 0
          ? ((metrics.thisWeekStats.moneyEarned - metrics.thisWeekStats.moneySpent) / metrics.thisWeekStats.moneyEarned) * 100
          : 0,
      },
    };
  };

  const getRecommendations = (): string[] => {
    const metrics = getInsightMetrics();
    const recommendations: string[] = [];

    if (metrics.taskCompletionRate < 50) {
      recommendations.push('Try breaking down large tasks into smaller steps');
    }

    if (metrics.goalProgressRate < 30) {
      recommendations.push('Consider focusing on fewer, more achievable goals');
    }

    if (metrics.financialBalance < 0) {
      recommendations.push('Your spending exceeds your income. Review your expenses.');
    }

    if (metrics.learningHoursThisMonth < 5) {
      recommendations.push('Dedicate more time to learning and development');
    }

    if (metrics.longestStreak < 7) {
      recommendations.push('Build consistent habits by tracking daily activities');
    }

    return recommendations;
  };

  return {
    getInsightMetrics,
    getTrends,
    getRecommendations,
  };
};
