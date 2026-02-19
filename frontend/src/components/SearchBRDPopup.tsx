import { useState, useEffect, useMemo } from 'react';
import { Search, FileText, X } from 'lucide-react';

export interface BRDListItem {
  id: string;
  name: string;
  updated?: string;
  description?: string;
}

interface SearchBRDPopupProps {
  open: boolean;
  onClose: () => void;
  items: BRDListItem[];
  onSelectItem?: (id: string) => void;
}

const filterItems = (items: BRDListItem[], query: string): BRDListItem[] => {
  if (!query.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false)
  );
};

export function SearchBRDPopup({
  open,
  onClose,
  items,
  onSelectItem,
}: SearchBRDPopupProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => filterItems(items, query), [items, query]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (id: string) => {
    onSelectItem?.(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 sm:pt-[20vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-brd-title"
    >
      {/* Backdrop: glassmorphism */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: glassmorphism */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-white/85 shadow-2xl shadow-slate-900/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3">
          <h2
            id="search-brd-title"
            className="text-sm font-semibold text-slate-800"
          >
            Search BRDs
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/80 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full rounded-xl border border-slate-200/90 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="mt-3 max-h-[min(60vh,320px)] overflow-y-auto rounded-xl border border-slate-200/80 bg-white/60">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-10 w-10 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  {query.trim()
                    ? 'No BRDs match your search.'
                    : 'Enter a search term to find BRDs.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200/80">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-100/90 focus:bg-slate-100/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-slate-800">
                          {item.name}
                        </span>
                        {item.updated && (
                          <span className="ml-2 text-xs text-slate-500">
                            {item.updated}
                          </span>
                        )}
                        {item.description && (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
