import { useLifeOS } from '../context/LifeOSContext';
import { Goal, GoalCategory } from '../types';

/**
 * Custom hook for goal-related operations
 */
export const useGoals = () => {
  const { data, addGoal, updateGoal, deleteGoal } = useLifeOS();

  const getGoalStats = (category?: GoalCategory) => {
    let goals = data.goals;
    if (category) goals = goals.filter(g => g.category === category);

    return {
      total: goals.length,
      completed: goals.filter(g => g.completed).length,
      pending: goals.filter(g => !g.completed).length,
      completionRate: Math.round((goals.filter(g => g.completed).length / (goals.length || 1)) * 100),
    };
  };

  const getGoalsByCategory = (category: GoalCategory) => {
    return data.goals.filter(g => g.category === category);
  };

  const getActiveGoals = () => data.goals.filter(g => !g.completed);

  const getGoalProgress = (goalId: string) => {
    const goal = data.goals.find(g => g.id === goalId);
    if (!goal) return null;

    const completed = goal.checklistItems.filter(item => item.completed).length;
    const total = goal.checklistItems.length;
    const progress = total === 0 ? 0 : (completed / total) * 100;

    return { completed, total, progress };
  };

  return {
    goals: data.goals,
    stats: getGoalStats(),
    getGoalStats,
    getGoalsByCategory,
    getActiveGoals,
    getGoalProgress,
    createGoal: addGoal,
    updateGoal,
    deleteGoal,
  };
};
