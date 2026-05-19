import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { searchLocation } from '../lib/openMeteo';
import { getCache, setCache } from '../lib/searchCache';
import type { Location } from '../types/weather';

// ── localStorage helpers ─────────────────────────────────────────────────────
const RECENT_KEY = 'atmosphere-atlas-recent-searches';
const MAX_RECENT = 5;

function loadRecent(): Location[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as Location[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(location: Location): void {
  try {
    const prev = loadRecent();
    const deduped = prev.filter((p) => p.id !== location.id);
    const next = [location, ...deduped].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / SSR errors
  }
}

// ── Constants ────────────────────────────────────────────────────────────────
const DEBOUNCE_MS = 350;
const MIN_QUERY_LEN = 3;

// ── Component ────────────────────────────────────────────────────────────────
interface SearchBarProps {
  onLocationSelect: (location: Location) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [recentSearches, setRecentSearches] = useState<Location[]>(() => loadRecent());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track whether we've searched this query (to show "no results" only after a completed attempt)
  const [hasSearched, setHasSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Typeahead: debounced fetch on query change ─────────────────────────────
  useEffect(() => {
    const trimmed = query.trim();

    // If too short, clear results and stop
    if (trimmed.length < MIN_QUERY_LEN) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      setIsLoading(false);
      return;
    }

    // ── Cache hit: show results instantly, skip API call ────────────────────
    const cached = getCache(trimmed);
    if (cached !== null) {
      setResults(cached);
      setHasSearched(true);
      setError(null);
      setIsLoading(false);
      setIsOpen(true);
      return;
    }

    // Race-condition guard: if this effect re-runs, ignore the stale response
    let ignore = false;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      setIsOpen(true);

      try {
        const data = await searchLocation(trimmed);
        if (!ignore) {
          setResults(data);
          setHasSearched(true);
          setCache(trimmed, data);
        }
      } catch {
        if (!ignore) {
          setError('Search failed. Please try again.');
          setResults([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleFocus() {
    setIsOpen(true);
  }

  function handleInputChange(value: string) {
    setQuery(value);
    setIsOpen(true);
    if (value.trim() === '') {
      setResults([]);
      setHasSearched(false);
      setError(null);
    }
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
    setIsOpen(true);
    inputRef.current?.focus();
  }

  // Form submit: immediately open dropdown (debounce will have already or will fire soon).
  // If query is already long enough and results exist, this is a no-op UX-wise.
  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim().length < MIN_QUERY_LEN) return;
    setIsOpen(true);
  }

  function handleSelect(location: Location) {
    onLocationSelect(location);
    setIsOpen(false);
    setQuery(location.name);
    saveRecent(location);
    setRecentSearches(loadRecent());
  }

  function handleRemoveRecent(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    try {
      const updated = loadRecent().filter((p) => p.id !== id);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {
      // ignore
    }
  }

  // ── Derived display flags ──────────────────────────────────────────────────
  const trimmedQuery = query.trim();
  const queryIsLongEnough = trimmedQuery.length >= MIN_QUERY_LEN;
  const showRecent = isOpen && trimmedQuery === '' && recentSearches.length > 0;
  const showResults = isOpen && queryIsLongEnough;
  const showNoResults = showResults && !isLoading && !error && hasSearched && results.length === 0;
  const showTooShort = isOpen && trimmedQuery.length > 0 && !queryIsLongEnough;
  const dropdownVisible = showRecent || showResults || showTooShort;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <form onSubmit={handleSearch} className="relative w-full">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-2.5 md:px-4 md:py-3 shadow-xl flex items-center gap-2 transition-all focus-within:bg-white/15 hover:bg-white/12">
          {/* Search icon / submit */}
          <button
            type="submit"
            className="text-white/50 hover:text-white transition-colors shrink-0 flex items-center"
            aria-label="Search"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            )}
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search city…"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleFocus}
            autoComplete="off"
            spellCheck={false}
            className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/40 text-sm md:text-base min-w-0"
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="shrink-0 text-white/40 hover:text-white/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* ── Dropdown ─────────────────────────────────────────────────────────── */}
      {dropdownVisible && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[9999]">

          {/* ── "Keep typing" hint ─────────────────────────────────────────── */}
          {showTooShort && (
            <div className="px-4 py-3 text-white/35 text-xs">
              Keep typing to search…
            </div>
          )}

          {/* ── Recent searches ────────────────────────────────────────────── */}
          {showRecent && (
            <div>
              <div className="px-4 pt-3 pb-1">
                <span className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">Recent</span>
              </div>
              <ul className="flex flex-col pb-2">
                {recentSearches.map((loc) => (
                  <li key={loc.id}>
                    <div className="flex items-center pr-2 hover:bg-white/8 transition-colors border-b border-white/5 last:border-none group">
                      <button
                        onClick={() => handleSelect(loc)}
                        className="flex-1 text-left px-4 py-2.5 flex items-center gap-3"
                      >
                        <svg className="w-3.5 h-3.5 text-white/25 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex flex-col min-w-0">
                          <span className="text-white/90 font-medium text-sm truncate">{loc.name}</span>
                          <span className="text-white/40 text-xs truncate">
                            {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleRemoveRecent(e, loc.id)}
                        aria-label="Remove from recent"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Live suggestions ───────────────────────────────────────────── */}
          {showResults && (
            <>
              {isLoading && results.length === 0 ? (
                // Initial loading state (no stale results to show yet)
                <div className="p-5 flex items-center gap-3 text-white/50">
                  <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm">Finding locations…</span>
                </div>
              ) : error ? (
                <div className="px-4 py-4 text-red-400 text-sm">{error}</div>
              ) : showNoResults ? (
                <div className="px-4 py-4 text-white/40 text-sm">
                  No results for <span className="text-white/60">"{trimmedQuery}"</span>
                </div>
              ) : results.length > 0 ? (
                <ul className="flex flex-col py-1.5 max-h-72 overflow-y-auto">
                  {results.map((loc) => (
                    <li key={loc.id}>
                      <button
                        onClick={() => handleSelect(loc)}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/8 active:bg-white/12 transition-colors flex items-start gap-3 border-b border-white/5 last:border-none"
                      >
                        <svg className="w-3.5 h-3.5 mt-0.5 text-white/20 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex flex-col min-w-0">
                          <span className="text-white font-medium text-sm truncate">{loc.name}</span>
                          <span className="text-white/45 text-xs truncate">
                            {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}

        </div>
      )}
    </div>
  );
}
