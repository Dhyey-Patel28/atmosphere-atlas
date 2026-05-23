export type TemperatureUnit = 'C' | 'F';

export function getStoredTemperatureUnit(): TemperatureUnit {
  try {
    const stored = localStorage.getItem('atmosphere-atlas-temperature-unit');
    return stored === 'F' ? 'F' : 'C';
  } catch {
    return 'C';
  }
}

export function persistTemperatureUnit(unit: TemperatureUnit): void {
  try {
    localStorage.setItem('atmosphere-atlas-temperature-unit', unit);
  } catch {
    // Ignore localStorage quota / privacy-mode errors.
  }
}

export function toggleTemperatureUnit(unit: TemperatureUnit): TemperatureUnit {
  return unit === 'C' ? 'F' : 'C';
}

export function celsiusToFahrenheit(value: number): number {
  return value * 1.8 + 32;
}

export function kmhToMph(value: number): number {
  return value * 0.621371;
}

export function mmToInches(value: number): number {
  return value / 25.4;
}

export function formatTemperature(valueC: number, unit: TemperatureUnit): string {
  const value = unit === 'F' ? celsiusToFahrenheit(valueC) : valueC;
  return `${Math.round(value)}°${unit}`;
}

export function formatTemperatureCompact(valueC: number, unit: TemperatureUnit): string {
  const value = unit === 'F' ? celsiusToFahrenheit(valueC) : valueC;
  return `${Math.round(value)}°`;
}

export function formatWindSpeed(valueKmh: number, unit: TemperatureUnit): string {
  if (unit === 'F') {
    return `${Math.round(kmhToMph(valueKmh))} mph`;
  }

  return `${Math.round(valueKmh)} km/h`;
}

export function formatPrecipitation(valueMm: number, unit: TemperatureUnit): string {
  if (unit === 'F') {
    const inches = mmToInches(valueMm);
    return `${inches < 0.1 ? inches.toFixed(2) : inches.toFixed(1)} in`;
  }

  return `${Number(valueMm.toFixed(1))} mm`;
}
