import type { WeatherData } from '../types/weather';
import type { TemperatureUnit } from '../lib/units';
import { formatPrecipitation, formatTemperature, formatTemperatureCompact, formatWindSpeed } from '../lib/units';

interface WeatherDetailsCardProps {
  weather: WeatherData;
  unit: TemperatureUnit;
  isDay: boolean;
  currentProgress: number;
  sunX: number;
  sunY: number;
}

export function WeatherDetailsCard({
  weather,
  unit,
  isDay,
  currentProgress,
  sunX,
  sunY,
}: WeatherDetailsCardProps) {
  const metrics = [
    {
      label: 'Humidity',
      value: `${weather.current.relative_humidity_2m}%`,
    },
    {
      label: 'Wind',
      value: formatWindSpeed(weather.current.wind_speed_10m, unit),
    },
    {
      label: 'High / Low',
      value: `${formatTemperatureCompact(weather.daily.temperature_2m_max[0], unit)} / ${formatTemperature(
        weather.daily.temperature_2m_min[0],
        unit
      )}`,
    },
    {
      label: 'Precipitation',
      value: formatPrecipitation(weather.current.precipitation, unit),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-white/8 bg-white/[0.035] p-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
              {metric.label}
            </p>
            <p className="mt-1 text-sm font-black text-white/90">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/40">
          <span>Solar cycle</span>
          <span className="text-cyan-400/90">
            {isDay ? `${Math.round(currentProgress * 100)}% through daylight` : 'Sun below horizon'}
          </span>
        </div>

        <div className="relative mt-3 flex h-12 items-end justify-between px-1">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">
              {new Date(weather.daily.sunrise[0]).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
              Sunrise
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 flex items-center justify-center">
            <svg className="h-full w-full max-w-[200px]" viewBox="0 0 100 32" fill="none">
              <path
                d="M 10 26 Q 50 4 90 26"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="2 2"
                strokeWidth="2"
              />

              {isDay && (
                <path
                  d="M 10 26 Q 50 4 90 26"
                  stroke="url(#weather-details-solar-gradient)"
                  strokeDasharray="100"
                  strokeDashoffset={100 - currentProgress * 100}
                  strokeWidth="2"
                  style={{
                    transition: 'stroke-dashoffset 0.5s ease',
                  }}
                />
              )}

              <defs>
                <linearGradient id="weather-details-solar-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#facc15" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {isDay && (
                <g transform={`translate(${sunX}, ${sunY})`}>
                  <circle r="3.5" fill="#facc15" />
                  <circle r="1.5" fill="#fff" />
                  <circle r="6" fill="#facc15" opacity="0.3" />
                </g>
              )}
            </svg>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-white">
              {new Date(weather.daily.sunset[0]).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
              Sunset
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
