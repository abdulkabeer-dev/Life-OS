/**
 * Design Tokens and Constants
 * Centralize all hardcoded values for easy theming and maintenance
 */

// Color Palette
export const colors = {
  // Primary
  accent: '#6366f1', // Indigo
  accentDark: '#4f46e5',
  accentLight: '#818cf8',

  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Background
  bgPrimary: '#0f172a',
  bgSecondary: '#1e293b',
  bgTertiary: '#334155',
  
  // Text
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  
  // Border
  border: '#475569',
};

// Typography Scale
export const typography = {
  h1: { size: '2.5rem', weight: 700, lineHeight: 1.2 },
  h2: { size: '2rem', weight: 700, lineHeight: 1.3 },
  h3: { size: '1.5rem', weight: 600, lineHeight: 1.4 },
  h4: { size: '1.25rem', weight: 600, lineHeight: 1.4 },
  body: { size: '1rem', weight: 400, lineHeight: 1.5 },
  sm: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
  xs: { size: '0.75rem', weight: 500, lineHeight: 1.5 },
};

// Spacing Scale
export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  6: '1.5rem',
  8: '2rem',
  12: '3rem',
  16: '4rem',
};

// Breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Z-index Scale
export const zIndex = {
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  toast: 60,
  tooltip: 70,
};

// Animation durations (ms)
export const duration = {
  fast: 150,
  base: 300,
  slow: 500,
};

// Transition timing functions
export const easing = {
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// Priority configuration
export const PRIORITY_CONFIG = {
  high: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'High' },
  medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Medium' },
  low: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Low' },
};

// Goal categories
export const GOAL_CATEGORIES = {
  personal: { icon: '👤', color: 'text-blue-500', label: 'Personal' },
  career: { icon: '💼', color: 'text-purple-500', label: 'Career' },
  health: { icon: '❤️', color: 'text-red-500', label: 'Health' },
  fitness: { icon: '💪', color: 'text-orange-500', label: 'Fitness' },
  learning: { icon: '📚', color: 'text-green-500', label: 'Learning' },
  finance: { icon: '💰', color: 'text-yellow-500', label: 'Finance' },
  other: { icon: '📌', color: 'text-gray-500', label: 'Other' },
};

// Timeframe configurations
export const TIMEFRAME_CONFIG = {
  weekly: { label: 'Weekly', days: 7 },
  monthly: { label: 'Monthly', days: 30 },
  quarterly: { label: 'Quarterly', days: 90 },
  yearly: { label: 'Yearly', days: 365 },
};

// Finance categories
export const FINANCE_CATEGORIES = [
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Work',
  'Education',
  'Other',
];

// Validation limits
export const VALIDATION_LIMITS = {
  taskTitleMax: 200,
  goalTitleMax: 200,
  habitNameMax: 100,
  descriptionMax: 5000,
  transactionMax: 1000000,
  timeSpentMax: 1440, // 24 hours in minutes
};

// Cache durations (ms)
export const CACHE_DURATION = {
  short: 5 * 60 * 1000, // 5 minutes
  medium: 30 * 60 * 1000, // 30 minutes
  long: 24 * 60 * 60 * 1000, // 24 hours
};

// Notification types
export const NOTIFICATION_TYPES = {
  system: 'System',
  deadline: 'Deadline',
  custom: 'Custom',
};
