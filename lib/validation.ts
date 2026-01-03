import { Task, Goal, Transaction, LearningLog, Habit, Reminder } from '../types';

/**
 * Validation utilities for all data types
 * Ensures data integrity before storing
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateTask = (task: Partial<Task>): task is Partial<Task> => {
  if (!task.title || !task.title.trim()) {
    throw new ValidationError('Task title is required and cannot be empty');
  }
  if (task.title.length > 200) {
    throw new ValidationError('Task title must be less than 200 characters');
  }
  if (task.dueDate && isNaN(new Date(task.dueDate).getTime())) {
    throw new ValidationError('Invalid due date');
  }
  if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
    throw new ValidationError('Invalid priority level');
  }
  return true;
};

export const validateGoal = (goal: Partial<Goal>): goal is Partial<Goal> => {
  if (!goal.title || !goal.title.trim()) {
    throw new ValidationError('Goal title is required');
  }
  if (goal.title.length > 200) {
    throw new ValidationError('Goal title must be less than 200 characters');
  }
  if (goal.category && !['personal', 'career', 'health', 'fitness', 'learning', 'finance', 'other'].includes(goal.category)) {
    throw new ValidationError('Invalid goal category');
  }
  if (goal.timeframe && !['weekly', 'monthly', 'quarterly', 'yearly'].includes(goal.timeframe)) {
    throw new ValidationError('Invalid timeframe');
  }
  return true;
};

export const validateTransaction = (transaction: Partial<Transaction>): transaction is Partial<Transaction> => {
  if (!transaction.description || !transaction.description.trim()) {
    throw new ValidationError('Transaction description is required');
  }
  if (typeof transaction.amount !== 'number' || transaction.amount < 0) {
    throw new ValidationError('Transaction amount must be a positive number');
  }
  if (transaction.amount > 1000000) {
    throw new ValidationError('Transaction amount exceeds maximum limit');
  }
  if (transaction.type && !['expense', 'income'].includes(transaction.type)) {
    throw new ValidationError('Invalid transaction type');
  }
  if (transaction.date && isNaN(new Date(transaction.date).getTime())) {
    throw new ValidationError('Invalid transaction date');
  }
  return true;
};

export const validateLearning = (log: Partial<LearningLog>): log is Partial<LearningLog> => {
  if (!log.topic || !log.topic.trim()) {
    throw new ValidationError('Topic is required');
  }
  if (typeof log.timeSpent !== 'number' || log.timeSpent < 0) {
    throw new ValidationError('Time spent must be a positive number');
  }
  if (log.timeSpent > 1440) {
    throw new ValidationError('Time spent cannot exceed 24 hours');
  }
  return true;
};

export const validateHabit = (habit: Partial<Habit>): habit is Partial<Habit> => {
  if (!habit.name || !habit.name.trim()) {
    throw new ValidationError('Habit name is required');
  }
  if (habit.name.length > 100) {
    throw new ValidationError('Habit name must be less than 100 characters');
  }
  return true;
};

export const validateReminder = (reminder: Partial<Reminder>): reminder is Partial<Reminder> => {
  if (!reminder.text || !reminder.text.trim()) {
    throw new ValidationError('Reminder text is required');
  }
  if (reminder.time && isNaN(new Date(reminder.time).getTime())) {
    throw new ValidationError('Invalid reminder time');
  }
  return true;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove dangerous characters
    .trim()
    .substring(0, 500); // Limit length
};

// Safe parse JSON
export const safeJsonParse = (json: string, fallback: any = null) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return fallback;
  }
};
