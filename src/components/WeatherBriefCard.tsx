import type { AirQualityData, WeatherData } from '../types/weather';
import type { TemperatureUnit } from '../lib/units';
import { formatTemperatureCompact } from '../lib/units';

interface WeatherBriefCardProps {
  weather: WeatherData;
  airQuality: AirQualityData | null;
  unit: TemperatureUnit;
}

function getComfortLabel(feelsLike: number): string {
  if (feelsLike < 0) return 'Freezing';
  if (feelsLike < 8) return 'Cold';
  if (feelsLike < 16) return 'Cool';
  if (feelsLike < 25) return 'Comfortable';
  if (feelsLike < 31) return 'Warm';
  return 'Hot';
}

function getRainLabel(currentPrecip: number, dailyPrecip: number): string {
  if (currentPrecip > 0.2) return 'Wet now';
  if (dailyPrecip >= 5) return 'Rain likely';
  if (dailyPrecip >= 1) return 'Some rain';
  return 'Mostly dry';
}

function getWindLabel(windSpeed: number): string {
  if (windSpeed >= 40) return 'Very windy';
  if (windSpeed >= 25) return 'Breezy';
  if (windSpeed >= 12) return 'Light wind';
  return 'Calm';
}

function getAqiLabel(aqi?: number): string {
  if (aqi == null) return 'Air loading';
  if (aqi <= 50) return 'Good air';
  if (aqi <= 100) return 'Moderate air';
  if (aqi <= 150) return 'Sensitive air';
  return 'Poor air';
}

function getHeadline(weather: WeatherData, airQuality: AirQualityData | null, unit: TemperatureUnit): string {
  const feelsLike = weather.current.apparent_temperature;
  const precipNow = weather.current.precipitation;
  const dailyPrecip = weather.daily.precipitation_sum?.[0] ?? 0;
  const aqi = airQuality?.current.us_aqi;

  if (precipNow > 0.2) return 'Weather is active right now — keep plans flexible.';
  if (aqi != null && aqi > 100) return 'Weather may feel okay, but air quality deserves attention.';
  if (feelsLike < 8) return `It feels ${formatTemperatureCompact(feelsLike, unit)}, so warmth matters more than sunshine.`;
  if (feelsLike > 31) return 'Heat is the main planning factor today.';
  if (dailyPrecip < 1 && weather.current.wind_speed_10m < 20) {
    return 'A low-friction weather day for getting outside.';
  }

  return 'A manageable day with a few details to watch.';
}

export function WeatherBriefCard({ weather, airQuality, unit }: WeatherBriefCardProps) {
  const feelsLike = weather.current.apparent_temperature;
  const dailyPrecip = weather.daily.precipitation_sum?.[0] ?? 0;
  const aqi = airQuality?.current.us_aqi;

  const signals = [
    getComfortLabel(feelsLike),
    getRainLabel(weather.current.precipitation, dailyPrecip),
    getWindLabel(weather.current.wind_speed_10m),
    getAqiLabel(aqi),
  ];

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/70">
        Today at a glance
      </p>

      <p className="mt-2 text-sm font-semibold leading-relaxed text-white/85">
        {getHeadline(weather, airQuality, unit)}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {signals.map((signal) => (
          <span
            key={signal}
            className="rounded-full border border-white/10 bg-slate-950/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white/55"
          >
            {signal}
          </span>
        ))}
      </div>
    </div>
  );
}
