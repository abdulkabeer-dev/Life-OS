import * as React from 'react';
import { useState, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import type { SearchResult } from '../hooks/useSearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    task: '✓',
    goal: '🎯',
    learning: '💡',
    transaction: '💰',
  };
  return icons[type] || '📌';
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    task: 'text-blue-400',
    goal: 'text-purple-400',
    learning: 'text-yellow-400',
    transaction: 'text-green-400',
  };
  return colors[type];
};

/**
 * Global search modal component
 * Opens with Cmd+K or Ctrl+K
 */
export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = React.useState('');
  const { search, getSearchSuggestions } = useSearch();

  const results = React.useMemo(() => {
    return query.trim() ? search(query) : [];
  }, [query, search]);

  const suggestions = React.useMemo(() => {
    return !query.trim() ? getSearchSuggestions(query) : [];
  }, [query, getSearchSuggestions]);

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult(result);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl mx-4 animate-scale-up" onClick={e => e.stopPropagation()}>
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
          {/* Search Input */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Search size={20} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tasks, goals, learning, finance..."
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-lg"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-bg-tertiary transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {results.length > 0 ? (
              <div className="divide-y divide-border">
                {results.map(result => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left p-4 hover:bg-bg-tertiary transition-colors group flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTypeIcon(result.type)}</span>
                        <h4 className="font-medium truncate group-hover:text-accent transition-colors">
                          {result.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full bg-bg-tertiary ${getTypeColor(result.type)}`}>
                          {result.type}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-sm text-gray-400 truncate">{result.description}</p>
                      )}
                      {result.metadata && (
                        <p className="text-xs text-gray-500 mt-1">{result.metadata}</p>
                      )}
                    </div>
                    <ArrowRight size={16} className="text-gray-500 group-hover:text-accent mt-1 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="p-8 text-center text-gray-500">
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              <div className="p-6">
                {suggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
                      Recent Searches
                    </p>
                    <div className="space-y-2">
                      {suggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => setQuery(suggestion)}
                          className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-bg-tertiary rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-gray-500 text-center">Type to search across all modules</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border text-xs text-gray-500 flex justify-between">
            <div className="flex gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
