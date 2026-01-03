import { useLifeOS } from '../context/LifeOSContext';
import { Task } from '../types';

/**
 * Custom hook for task-related operations
 * Encapsulates all task logic and computations
 */
export const useTasks = () => {
  const { data, addTask, toggleTask, deleteTask } = useLifeOS();

  const getTaskStats = () => ({
    total: data.tasks.length,
    completed: data.tasks.filter(t => t.completed).length,
    pending: data.tasks.filter(t => !t.completed).length,
    overdue: data.tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length,
    completionRate: Math.round((data.tasks.filter(t => t.completed).length / (data.tasks.length || 1)) * 100),
  });

  const getTasksByFilter = (filter: 'all' | 'today' | 'week' | 'overdue' | 'completed') => {
    const now = new Date();
    const todayStr = now.toDateString();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let filtered = [...data.tasks];

    switch (filter) {
      case 'today':
        filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === todayStr);
        break;
      case 'week':
        filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) <= weekEnd && new Date(t.dueDate) >= now);
        break;
      case 'overdue':
        filtered = filtered.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now);
        break;
      case 'completed':
        filtered = filtered.filter(t => t.completed);
        break;
    }

    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pOrder = { high: 0, medium: 1, low: 2 };
      return pOrder[a.priority] - pOrder[b.priority];
    });
  };

  const createTask = (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    if (!task.title?.trim()) throw new Error('Task title is required');
    addTask(task);
  };

  return {
    tasks: data.tasks,
    stats: getTaskStats(),
    getTasksByFilter,
    createTask,
    toggleTask,
    deleteTask,
  };
};
