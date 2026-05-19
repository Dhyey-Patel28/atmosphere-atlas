import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { searchLocation } from '../lib/openMeteo';
import type { Location } from '../types/weather';

interface SearchBarProps {
  onLocationSelect: (location: Location) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setIsLoading(true);
    setError(null);
    setIsOpen(true);
    
    try {
      const data = await searchLocation(trimmedQuery);
      setResults(data);
    } catch (err) {
      setError('Failed to find locations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (location: Location) => {
    onLocationSelect(location);
    setIsOpen(false);
    setQuery(location.name);
  };

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <form onSubmit={handleSearch} className="relative w-full">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 md:p-4 shadow-xl flex items-center gap-3 transition-all focus-within:bg-white/20 hover:bg-white/15">
          <button 
            type="submit" 
            className="text-white/60 hover:text-white transition-colors ml-2 cursor-pointer flex-shrink-0"
            aria-label="Search"
          >
            &#8981;
          </button>
          <input 
            type="text" 
            placeholder="Search city..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/50 text-sm md:text-base"
          />
        </div>
      </form>

      {isOpen && (query.trim() !== '') && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          {isLoading ? (
             <div className="p-6 flex items-center justify-center gap-3 text-white/70">
               <span className="animate-spin text-2xl">&#8987;</span>
               <span>Searching...</span>
             </div>
          ) : error ? (
            <div className="p-6 text-center text-red-400 font-medium">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-white/50">
              No results found for "{query}".
            </div>
          ) : (
            <ul className="flex flex-col py-2 max-h-80 overflow-y-auto">
              {results.map((loc) => (
                <li key={loc.id}>
                  <button
                    onClick={() => handleSelect(loc)}
                    className="w-full text-left px-5 py-3 hover:bg-white/10 transition-colors flex flex-col gap-1 border-b border-white/5 last:border-none"
                  >
                    <span className="text-white font-medium text-lg">{loc.name}</span>
                    <span className="text-white/50 text-sm">
                      {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
