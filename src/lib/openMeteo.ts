import type { Location, WeatherData, AirQualityData } from '../types/weather';

export interface HistoricalWeatherResult {
  tempMax: number;
  precipitation: number;
}

type FetchOptions = {
  signal?: AbortSignal;
};

async function fetchJson<T>(
  url: string,
  errorMessage: string,
  options: FetchOptions = {}
): Promise<T> {
  const res = await fetch(url, { signal: options.signal });

  if (!res.ok) {
    throw new Error(`${errorMessage} (${res.status})`);
  }

  return (await res.json()) as T;
}

export async function searchLocation(query: string): Promise<Location[]> {
  if (!query.trim()) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=5&language=en&format=json`;

    const data = await fetchJson<{ results?: Location[] }>(url, 'Failed to fetch location data');

    return data.results || [];
  } catch (error) {
    console.error('Error searching location:', error);

    throw new Error('Failed to fetch location data', {
      cause: error,
    });
  }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability,cloud_cover&timezone=auto`;

  try {
    return await fetchJson<WeatherData>(url, 'Failed to fetch weather data');
  } catch (error) {
    console.error('Error fetching weather:', error);

    throw new Error('Failed to fetch weather data', {
      cause: error,
    });
  }
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,ozone&timezone=auto`;

  try {
    return await fetchJson<AirQualityData>(url, 'Failed to fetch air quality data');
  } catch (error) {
    console.error('Error fetching air quality:', error);

    throw new Error('Failed to fetch air quality data', {
      cause: error,
    });
  }
}

type HistoricalApiResponse = {
  daily?: {
    temperature_2m_max?: Array<number | null>;
    precipitation_sum?: Array<number | null>;
  };
};

export async function fetchHistoricalWeather(
  lat: number,
  lon: number,
  dateStr: string,
  options: FetchOptions = {}
): Promise<HistoricalWeatherResult> {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,precipitation_sum&timezone=auto`;

  try {
    const data = await fetchJson<HistoricalApiResponse>(
      url,
      'Historical weather response was not ok',
      options
    );

    const tempMax = data.daily?.temperature_2m_max?.[0];

    if (tempMax == null) {
      throw new Error('No historical temperature data found for this location and date');
    }

    return {
      tempMax,
      precipitation: data.daily?.precipitation_sum?.[0] ?? 0,
    };
  } catch (error) {
    console.error('Error fetching historical weather:', error);

    throw new Error('Failed to fetch historical weather data', {
      cause: error,
    });
  }
}