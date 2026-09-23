import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { GlobalSearchService, SearchResult, SearchCategory } from '../services/GlobalSearchService';
import { Store } from '../store/useStore';

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
  onNavigate: (page: string, data?: any) => void;
}

export function GlobalSearchDialog({ isOpen, onClose, store, onNavigate }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchCategory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Flatten all results for keyboard navigation
  const allResults = results.flatMap(cat => cat.results);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoading(true);

    debounceTimerRef.current = setTimeout(() => {
      const searchResults = GlobalSearchService.search(query, store);
      setResults(searchResults);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, isOpen, store]);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (allResults[selectedIndex]) {
          handleSelectResult(allResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [allResults, selectedIndex, onClose]);

  const handleSelectResult = (result: SearchResult) => {
    onNavigate(result.route || 'dashboard', result.data);
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  let globalIndex = 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-200">
        {/* Search Input */}
        <div className="flex items-center border-b border-slate-200 px-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search anything..."
            className="flex-1 px-4 py-4 text-base outline-none focus:outline-none focus:ring-0 border-0 focus:border-0 placeholder:text-slate-400 bg-transparent global-search-input"
            style={{ outline: 'none' }}
          />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <kbd className="px-2 py-1 bg-slate-100 rounded border border-slate-200">ESC</kbd>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : query.trim() === '' ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">Start typing to search customers, suppliers, vehicles, slips, payments, expenses...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-2">Try searching for:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Customer name</li>
                <li>• Supplier name</li>
                <li>• Vehicle number</li>
                <li>• Slip number (SAL-, PUR-, EXP-)</li>
                <li>• Transaction ID (TXN-)</li>
              </ul>
            </div>
          ) : (
            <div className="py-2">
              {results.map((category) => (
                <div key={category.name}>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-y border-slate-200">
                    {category.name}
                  </div>
                  {category.results.map((result) => {
                    const currentIndex = globalIndex++;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        data-index={currentIndex}
                        onClick={() => handleSelectResult(result)}
                        className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
                          currentIndex === selectedIndex
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : 'hover:bg-slate-50 border-l-4 border-transparent'
                        }`}
                      >
                        <span className="text-2xl flex-shrink-0">{result.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">{result.title}</div>
                          {result.subtitle && (
                            <div className="text-sm text-slate-500 truncate mt-0.5">{result.subtitle}</div>
                          )}
                        </div>
                        {result.type === 'navigation' && (
                          <span className="text-slate-400 text-sm flex-shrink-0">→</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-2 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200">↵</kbd> Select</span>
              <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200">esc</kbd> Close</span>
            </div>
            <span>{allResults.length} results</span>
          </div>
        )}
      </div>
    </div>
  );
}
