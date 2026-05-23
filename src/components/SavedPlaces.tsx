/* eslint-disable react-refresh/only-export-components */

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
    // Ignore localStorage quota / privacy-mode errors.
  }
}

function formatCoordinate(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '');
}

function getPlaceLabel(place: Location): string {
  if (place.name === 'Pinned location') return 'Pinned spot';
  if (place.name === 'Shared location') return 'Shared spot';
  if (place.name === 'Current location') return 'Near me';

  return place.name;
}

function getPlaceDetail(place: Location): string {
  if (place.isPinned || place.name === 'Pinned spot' || place.name === 'Shared spot' || place.name === 'Near me') {
    return `${formatCoordinate(place.latitude)}, ${formatCoordinate(place.longitude)}`;
  }

  return place.admin1 || place.country;
}

function getSaveButtonLabel(location: Location): string {
  if (location.name === 'Pinned location' || location.name === 'Shared location') return 'Save pin';
  if (location.name === 'Current location') return 'Save near me';

  return 'Save';
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
    ? places.some((place) => place.id === selectedLocation.id)
    : false;

  if (!selectedLocation && places.length === 0) return null;

  return (
    <div className="flex items-center gap-2 w-full min-w-0">
      {selectedLocation && !alreadySaved && (
        <button
          type="button"
          onClick={onSave}
          title={getSaveButtonLabel(selectedLocation)}
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
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {getSaveButtonLabel(selectedLocation)}
        </button>
      )}

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
                  ${
                    isActive
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90 hover:border-white/20'
                  }
                `}
              >
                <button
                  type="button"
                  onClick={() => onSelect(place)}
                  className="flex items-center gap-1.5 whitespace-nowrap focus:outline-none"
                  title={`${getPlaceLabel(place)} — ${getPlaceDetail(place)}`}
                >
                  <span>{getPlaceLabel(place)}</span>
                  <span className="hidden sm:inline text-white/35">{getPlaceDetail(place)}</span>
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(place.id);
                  }}
                  title="Remove"
                  className="
                    ml-0.5 w-4 h-4 flex items-center justify-center
                    rounded-full text-white/30 hover:text-white/80 hover:bg-white/10
                    transition-colors focus:outline-none
                  "
                >
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
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