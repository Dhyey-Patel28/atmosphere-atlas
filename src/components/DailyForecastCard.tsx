import type { WeatherData } from '../types/weather';
import { getWeatherDescription } from '../lib/weatherText';
import type { TemperatureUnit } from '../lib/units';
import { formatPrecipitation, formatTemperatureCompact } from '../lib/units';

interface DailyForecastCardProps {
  weather: WeatherData;
  unit: TemperatureUnit;
}

function getDayLabel(dateText: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';

  return new Date(dateText).toLocaleDateString([], {
    weekday: 'short',
  });
}

function getDateLabel(dateText: string): string {
  return new Date(dateText).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

function getTemperatureRangePercent(min: number, max: number, rangeMin: number, rangeMax: number): {
  left: number;
  width: number;
} {
  const spread = Math.max(1, rangeMax - rangeMin);
  const left = ((min - rangeMin) / spread) * 100;
  const width = Math.max(8, ((max - min) / spread) * 100);

  return {
    left: Math.max(0, Math.min(92, left)),
    width: Math.max(8, Math.min(100 - left, width)),
  };
}

export function DailyForecastCard({ weather, unit }: DailyForecastCardProps) {
  const days = weather.daily.time.slice(0, 5);
  const maxTemps = weather.daily.temperature_2m_max.slice(0, 5);
  const minTemps = weather.daily.temperature_2m_min.slice(0, 5);
  const precipitation = weather.daily.precipitation_sum?.slice(0, 5) ?? [];
  const codes = weather.daily.weather_code?.slice(0, 5) ?? [];

  const rangeMin = Math.min(...minTemps);
  const rangeMax = Math.max(...maxTemps);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
            Daily outlook
          </p>
          <p className="mt-1 text-xs text-white/45">A quick look at the next few days.</p>
        </div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200">
          5 days
        </span>
      </div>

      <div className="flex flex-col divide-y divide-white/5">
        {days.map((day, index) => {
          const min = minTemps[index];
          const max = maxTemps[index];
          const rain = precipitation[index] ?? 0;
          const code = codes[index];
          const range = getTemperatureRangePercent(min, max, rangeMin, rangeMax);

          return (
            <div key={day} className="grid grid-cols-[76px_1fr_auto] items-center gap-3 py-3 first:pt-1 last:pb-0">
              <div>
                <p className="text-sm font-bold text-white/85">{getDayLabel(day, index)}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/30">
                  {getDateLabel(day)}
                </p>
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-white/55">
                    {typeof code === 'number' ? getWeatherDescription(code) : 'Forecast'}
                  </p>
                  <p className="shrink-0 text-[10px] text-white/35">{formatPrecipitation(rain, unit)}</p>
                </div>

                <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="absolute top-0 h-full rounded-full bg-gradient-to-r from-cyan-400/55 to-blue-500/70"
                    style={{
                      left: `${range.left}%`,
                      width: `${range.width}%`,
                    }}
                  />
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-black text-white">
                  {formatTemperatureCompact(max, unit)}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-white/35">
                  {formatTemperatureCompact(min, unit)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
