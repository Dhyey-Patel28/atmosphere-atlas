import type { Location } from '../types/weather';

const STORAGE_KEY = 'atmosphere-atlas-saved-places';

// ── Persistence helpers ──────────────────────────────────────────────────────
export function loadSavedPlaces(): Location[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Location[]) : [];
  } catch {
    return [];
  }
}

export function persistSavedPlaces(places: Location[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
  } catch {
    // ignore quota / SSR errors
  }
}

// ── Component ────────────────────────────────────────────────────────────────
interface SavedPlacesProps {
  places: Location[];
  selectedLocation: Location | null;
  onSelect: (location: Location) => void;
  onSave: () => void;
  onRemove: (id: number) => void;
}

export function SavedPlaces({
  places,
  selectedLocation,
  onSelect,
  onSave,
  onRemove,
}: SavedPlacesProps) {
  const alreadySaved = selectedLocation
    ? places.some((p) => p.id === selectedLocation.id)
    : false;

  // Nothing to show if no location selected and no saved places
  if (!selectedLocation && places.length === 0) return null;

  return (
    <div className="flex items-center gap-2 w-full min-w-0">
      {/* Save button — only shown when a location is selected and not yet saved */}
      {selectedLocation && !alreadySaved && (
        <button
          onClick={onSave}
          title="Save this place"
          className="
            shrink-0 flex items-center gap-1.5
            bg-cyan-500/15 hover:bg-cyan-500/30
            border border-cyan-500/30 hover:border-cyan-400/60
            text-cyan-400 hover:text-cyan-300
            text-xs font-semibold
            px-3 py-1.5 rounded-full
            transition-all duration-150 whitespace-nowrap
          "
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Save
        </button>
      )}

      {/* Saved place pills — horizontal scroll */}
      {places.length > 0 && (
        <div
          className="flex gap-1.5 overflow-x-auto min-w-0 pb-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {places.map((place) => {
            const isActive = selectedLocation?.id === place.id;
            return (
              <div
                key={place.id}
                className={`
                  shrink-0 flex items-center gap-1 rounded-full border text-xs font-medium
                  pl-3 pr-1.5 py-1.5
                  transition-all duration-150 cursor-pointer
                  ${isActive
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90 hover:border-white/20'
                  }
                `}
              >
                <button
                  onClick={() => onSelect(place)}
                  className="whitespace-nowrap focus:outline-none"
                >
                  {place.name}
                  {place.admin1 ? `, ${place.admin1}` : ''}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(place.id); }}
                  title="Remove"
                  className="
                    ml-0.5 w-4 h-4 flex items-center justify-center
                    rounded-full text-white/30 hover:text-white/80 hover:bg-white/10
                    transition-colors focus:outline-none
                  "
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
