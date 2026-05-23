import type { Location } from '../types/weather';

const LAST_LOCATION_KEY = 'atmosphere-atlas-last-location';

function isValidLocation(value: unknown): value is Location {
  if (!value || typeof value !== 'object') return false;

  const location = value as Partial<Location>;

  return (
    typeof location.id === 'number' &&
    typeof location.name === 'string' &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    typeof location.country === 'string' &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude)
  );
}

export function loadLastSelectedLocation(): Location | null {
  try {
    const raw = localStorage.getItem(LAST_LOCATION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;

    return isValidLocation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function persistLastSelectedLocation(location: Location): void {
  try {
    localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
  } catch {
    // Ignore localStorage quota / privacy-mode errors.
  }
}

export function clearLastSelectedLocation(): void {
  try {
    localStorage.removeItem(LAST_LOCATION_KEY);
  } catch {
    // Ignore localStorage quota / privacy-mode errors.
  }
}
