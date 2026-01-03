import { useLifeOS } from '../context/LifeOSContext';
import { Task, Goal, LearningLog, Transaction } from '../types';

export interface SearchResult {
  type: 'task' | 'goal' | 'learning' | 'transaction';
  id: string;
  title: string;
  description?: string;
  metadata?: string;
  score: number; // Relevance score 0-1
}

/**
 * Hook for global search functionality
 * Searches across all modules for matching terms
 */
export const useSearch = () => {
  const { data } = useLifeOS();

  const calculateScore = (text: string, query: string): number => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // Exact match gets highest score
    if (lowerText === lowerQuery) return 1;
    
    // Starts with query gets high score
    if (lowerText.startsWith(lowerQuery)) return 0.8;
    
    // Contains query
    if (lowerText.includes(lowerQuery)) return 0.6;
    
    // Partial word match (e.g., "project" matches "pro")
    if (lowerQuery.length >= 3 && lowerText.includes(lowerQuery)) return 0.5;
    
    return 0;
  };

  const search = (query: string, limit: number = 20): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];

    // Search Tasks
    data.tasks.forEach(task => {
      const titleScore = calculateScore(task.title, query);
      const descScore = calculateScore(task.description || '', query);
      const score = Math.max(titleScore, descScore);
      
      if (score > 0) {
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          description: task.description,
          metadata: `Priority: ${task.priority}`,
          score,
        });
      }
    });

    // Search Goals
    data.goals.forEach(goal => {
      const titleScore = calculateScore(goal.title, query);
      const descScore = calculateScore(goal.description || '', query);
      const score = Math.max(titleScore, descScore);
      
      if (score > 0) {
        results.push({
          type: 'goal',
          id: goal.id,
          title: goal.title,
          description: goal.description,
          metadata: `Category: ${goal.category}`,
          score,
        });
      }
    });

    // Search Learning Logs
    data.learnings.forEach(log => {
      const topicScore = calculateScore(log.topic, query);
      const detailScore = calculateScore(log.details || '', query);
      const score = Math.max(topicScore, detailScore);
      
      if (score > 0) {
        results.push({
          type: 'learning',
          id: log.id,
          title: log.topic,
          description: log.details,
          metadata: `${log.timeSpent} minutes`,
          score,
        });
      }
    });

    // Search Finance
    data.finance.transactions.forEach(transaction => {
      const descScore = calculateScore(transaction.description, query);
      const catScore = calculateScore(transaction.category, query);
      const score = Math.max(descScore, catScore);
      
      if (score > 0) {
        results.push({
          type: 'transaction',
          id: transaction.id,
          title: transaction.description,
          description: `${transaction.type === 'income' ? '+' : '-'}$${transaction.amount}`,
          metadata: `Category: ${transaction.category}`,
          score,
        });
      }
    });

    // Sort by relevance score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };

  const getSearchSuggestions = (query: string): string[] => {
    if (query.length < 2) return [];

    const suggestions = new Set<string>();

    // From task titles
    data.tasks.forEach(t => {
      const words = t.title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.startsWith(query.toLowerCase())) {
          suggestions.add(word);
        }
      });
    });

    // From goal titles
    data.goals.forEach(g => {
      const words = g.title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.startsWith(query.toLowerCase())) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  };

  return { search, getSearchSuggestions };
};
