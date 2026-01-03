import { Goal, GoalCategory } from "./types";

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export const formatDate = (date: string | Date, format: 'full' | 'short' | 'time' | 'monthYear' = 'full') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const options: Intl.DateTimeFormatOptions = 
    format === 'full' ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } :
    format === 'short' ? { month: 'short', day: 'numeric' } :
    format === 'time' ? { hour: '2-digit', minute: '2-digit' } :
    { month: 'long', year: 'numeric' };

  return d.toLocaleDateString('en-US', options);
};

export const getHijriDate = () => {
    try {
        return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(Date.now());
    } catch (e) {
        return "Islamic Date Unavailable";
    }
};

export const getRelativeTime = (date: string | Date) => {
  const now = new Date();
  const d = new Date(date);
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
  
  return formatDate(date, 'short');
};

export const getDaysRemaining = (date: string | Date) => {
  const now = new Date();
  const d = new Date(date);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const calculateStreak = (dates: string[]) => {
  if (!dates || dates.length === 0) return 0;
  
  // Normalize dates to midnight strings to avoid time conflicts
  const normalizedDates = Array.from(new Set(dates.map(d => new Date(d).toDateString()))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  let currentDate = new Date();
  
  // Check if today is logged
  const todayStr = currentDate.toDateString();
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // If latest date is today or yesterday, streak is alive
  if (!normalizedDates.includes(todayStr) && !normalizedDates.includes(yesterdayStr)) {
      return 0;
  }

  // Iterate backwards
  for (let i = 0; i < normalizedDates.length; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - (normalizedDates.includes(todayStr) ? i : i + 1));
      
      if (normalizedDates.includes(targetDate.toDateString())) {
          streak++;
      } else {
          break;
      }
  }
  return streak;
};

export const calculatePrayerStreak = (history: any[], current: any) => {
    // Helper to check if a day is perfect (all 5 prayers)
    const isPerfect = (entry: any) => entry.fajr && entry.dhuhr && entry.asr && entry.maghrib && entry.isha;

    // Combine and sort descending
    const allEntries = [...history, current].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Remove duplicates (keep latest)
    const uniqueEntries = Array.from(new Map(allEntries.map(item => [item.date, item])).values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    const todayStr = new Date().toDateString();
    
    // Logic: 
    // If today is perfect, start counting from today.
    // If today is NOT perfect, check yesterday. If yesterday is perfect, streak starts from yesterday.
    // If neither, streak is 0.
    
    let startIndex = 0;
    
    // If today is not in the list (shouldn't happen with current logic) or not perfect,
    // we check if the streak was broken *today* or *before*.
    // However, for a "current streak", if today isn't done yet, we usually count up to yesterday.
    // Let's adopt: Count consecutive perfect days starting from the most recent perfect day connected to today.

    // Simple approach: Iterate backwards from today/yesterday.
    const todayEntry = uniqueEntries.find(e => e.date === todayStr);
    
    if (todayEntry && isPerfect(todayEntry)) {
        streak++;
        startIndex = 1; // start checking previous
    } else {
        // Check yesterday
        const yest = new Date();
        yest.setDate(yest.getDate() - 1);
        const yestStr = yest.toDateString();
        const yestEntry = uniqueEntries.find(e => e.date === yestStr);
        
        if (yestEntry && !isPerfect(yestEntry)) return 0; // Streak broken yesterday
        // If yesterday is perfect (or missing but we assume broken if missing? No, let's look at recorded history)
        // If we strictly track history, missing entry = broken streak.
    }

    // Now count backwards from the last checked day
    // This requires continuous dates.
    for (let i = startIndex; i < uniqueEntries.length; i++) {
        const entry = uniqueEntries[i];
        
        // Ensure this entry is exactly 1 day before the previous processed entry
        // For simplicity in this logic, we just count consecutive perfect entries in the sorted history array
        // A gap in dates means a broken streak.
        
        const prevEntry = uniqueEntries[i-1]; // The one processed *before* in this loop (which is actually a later date)
        if (prevEntry) {
            const d1 = new Date(prevEntry.date);
            const d2 = new Date(entry.date);
            const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
            if (Math.round(diff) > 1) break; // Gap in dates
        } else if (startIndex === 1 && i === 1) {
            // Check gap between today (index 0) and this one (index 1)
             const d1 = new Date(uniqueEntries[0].date);
             const d2 = new Date(entry.date);
             const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
             if (Math.round(diff) > 1) break;
        }

        if (isPerfect(entry)) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
};

export const formatCurrency = (amount: number) => {
  // Changed to Indian Rupee (INR) and en-IN locale
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export const getGoalProgress = (goal: Goal) => {
  const items = goal.checklistItems || [];
  if (items.length === 0) return 0;
  const completed = items.filter(i => i.completed).length;
  return Math.round((completed / items.length) * 100);
};

export const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    health: '#10b981',
    career: '#3b82f6',
    learning: '#8b5cf6',
    finance: '#f59e0b',
    personal: '#ec4899',
    fitness: '#ef4444',
    other: '#6b7280'
  };
  return colors[category] || '#6b7280';
};

export const getCategoryIcon = (category: string) => {
  // Mapping for FontAwesome to generic names used in the UI component
  const icons: Record<string, string> = {
    health: 'heart',
    career: 'briefcase',
    learning: 'book',
    finance: 'wallet',
    personal: 'user',
    fitness: 'dumbbell',
    other: 'flag'
  };
  return icons[category] || 'flag';
};

/**
 * Debounce function for performance optimization
 * Limits function calls during rapid events (e.g., typing, scrolling)
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function for performance optimization
 * Ensures function is called at most once per specified interval
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memoize function results
 * Cache results based on function arguments
 */
export const memoize = <T extends (...args: any[]) => any>(func: T) => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Check if date is within a range
 */
export const isDateInRange = (date: string | Date, startDate: string | Date, endDate: string | Date): boolean => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return d >= start && d <= end;
};

/**
 * Group items by a key
 */
export const groupBy = <T>(items: T[], key: keyof T): Record<string, T[]> => {
  return items.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Safe JSON parse with error handling
 */
export const safeParse = (json: string, fallback: any = null) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('JSON parse error:', e);
    return fallback;
  }
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};