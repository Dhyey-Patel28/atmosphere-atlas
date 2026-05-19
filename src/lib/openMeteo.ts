import type { Location } from '../types/weather';

export async function searchLocation(query: string): Promise<Location[]> {
  if (!query.trim()) return [];
  
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Error searching location:", error);
    throw new Error('Failed to fetch location data');
  }
}
