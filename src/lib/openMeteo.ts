import type { Location, WeatherData, AirQualityData } from '../types/weather';

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

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability,cloud_cover&timezone=auto`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw new Error('Failed to fetch weather data');
  }
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,ozone&timezone=auto`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching air quality:", error);
    throw new Error('Failed to fetch air quality data');
  }
}

export interface HistoricalWeatherResult {
  tempMax: number;
  precipitation: number;
}

export async function fetchHistoricalWeather(lat: number, lon: number, dateStr: string): Promise<HistoricalWeatherResult> {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,precipitation_sum&timezone=auto`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Historical weather response was not ok');
    }
    const data = await res.json();
    if (!data.daily || !data.daily.temperature_2m_max || data.daily.temperature_2m_max[0] == null) {
      throw new Error('No historical data found for this location and date');
    }
    return {
      tempMax: data.daily.temperature_2m_max[0] as number,
      precipitation: (data.daily.precipitation_sum ? data.daily.precipitation_sum[0] : 0) as number,
    };
  } catch (error) {
    console.error("Error fetching historical weather:", error);
    throw new Error('Failed to fetch historical weather data');
  }
}
