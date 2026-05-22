import { useState } from 'react';
import type { Location, WeatherData, AirQualityData } from '../types/weather';
import { getWeatherDescription, getWeatherAdvice } from '../lib/weatherText';
import { calculateLifeScore } from '../lib/weatherScore';
import { generateTimeline } from '../lib/timelineStory';
import { LifeScoreCard } from './LifeScoreCard';
import { WeatherAdviceCard } from './WeatherAdviceCard';
import { TimelineStory } from './TimelineStory';
import { ActivityPlanner } from './ActivityPlanner';
import { AirQualityCard } from './AirQualityCard';

// ── Collapsible section wrapper ─────────────────────────────────────────────
function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 last:border-none">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 px-2 text-left group focus:outline-none transition-all hover:bg-white/[0.02] rounded-lg"
      >
        <span className="text-white/45 uppercase tracking-[0.15em] text-[10px] font-bold group-hover:text-cyan-400 transition-colors">
          {title}
        </span>
        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-cyan-500/10 group-hover:text-cyan-300 transition-colors">
          <svg
            className={`w-3 h-3 text-white/40 transition-transform duration-200 ${open ? 'rotate-180 text-cyan-400' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && <div className="px-2 pb-4 pt-1 animate-[fadeIn_0.2s_ease-out]">{children}</div>}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
interface WeatherPanelProps {
  location: Location | null;
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  airQuality: AirQualityData | null;
  isAqLoading: boolean;
  aqError: string | null;
}

// ── Component ────────────────────────────────────────────────────────────────
export function WeatherPanel({
  location,
  weather,
  isLoading,
  error,
  airQuality,
  isAqLoading,
  aqError,
}: WeatherPanelProps) {

  // ── Empty placeholder ──────────────────────────────────────────────────────
  if (!location && !isLoading && !error) {
    return (
      <aside className="w-full xl:h-full">
        <div className="w-full h-full min-h-[120px] bg-slate-900/20 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-2xl opacity-30 flex flex-col gap-4">
          <div className="h-4 w-1/3 bg-white/10 rounded-full" />
          <div className="flex-1 bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
        </div>
      </aside>
    );
  }

  // ── Solar calculations ─────────────────────────────────────────────────────
  let isDay = true;
  let currentProgress = 0.5;
  let sunX = 50;
  let sunY = 15;

  if (weather) {
    const sunriseTime = new Date(weather.daily.sunrise[0]).getTime();
    const sunsetTime = new Date(weather.daily.sunset[0]).getTime();
    const currentTime = new Date(weather.current.time).getTime();
    const totalDaylight = sunsetTime - sunriseTime;
    currentProgress = totalDaylight > 0 ? (currentTime - sunriseTime) / totalDaylight : 0.5;
    isDay = currentProgress >= 0 && currentProgress <= 1;

    if (isDay) {
      const t = Math.max(0, Math.min(1, currentProgress));
      // Quadratic Bezier formula for M 10 26 Q 50 4 90 26
      sunX = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 50 + t * t * 90;
      sunY = (1 - t) * (1 - t) * 26 + 2 * (1 - t) * t * 4 + t * t * 26;
    }
  }

  // ── Panel shell — scrollable on desktop ────────────────────────────────────
  return (
    <aside className="w-full xl:h-full flex flex-col">
      <div
        className="
          w-full flex-1
          bg-slate-950/40 backdrop-blur-3xl border border-white/10
          rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]
          flex flex-col
          relative overflow-hidden
          xl:overflow-y-auto xl:overscroll-contain
          [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.05)_transparent]
        "
        style={{ minHeight: 0 }}
      >

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-[2rem]">
            <span className="animate-spin text-4xl mb-4 text-cyan-400">⧗</span>
            <p className="text-white/70 animate-pulse tracking-widest text-sm uppercase">Syncing atmosphere…</p>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center rounded-[2rem]">
            <span className="text-4xl mb-4 text-red-400">⚠</span>
            <p className="text-white font-medium mb-2">Weather Sync Failed</p>
            <p className="text-red-400/80 text-sm">{error}</p>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {weather && location && (
          <div className="flex flex-col p-6 gap-0">

            {/* ── Location & condition header ──────────────────────────────── */}
            <div className="flex justify-between items-start pt-1 pb-4">
              <div>
                <h2 className="text-white text-2xl font-black tracking-tight leading-tight">{location.name}</h2>
                <p className="text-white/45 text-xs mt-0.5 uppercase tracking-wider font-semibold">
                  {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 capitalize">
                  {getWeatherDescription(weather.current.weather_code)}
                </span>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1.5">
                  {weather.current.is_day ? 'Daytime' : 'Nighttime'}
                </p>
              </div>
            </div>

            {/* ── Temperature hero ────────────────────────────────────────── */}
            <div className="flex items-baseline gap-4 pb-5 pt-2">
              <span className="text-7xl font-thin text-white tracking-tighter leading-none bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-transparent">
                {Math.round(weather.current.temperature_2m)}°
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/45 text-[10px] uppercase tracking-widest font-bold">Feels like</span>
                <span className="text-cyan-400 font-extrabold text-2xl tracking-tight">
                  {Math.round(weather.current.apparent_temperature)}°
                </span>
              </div>
            </div>

            {/* ── Core metrics 2×2 grid ───────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-2 pb-4">
              {[
                { 
                  label: 'Humidity', 
                  value: `${weather.current.relative_humidity_2m}%`, 
                  icon: (
                    <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.105-7.5 11.25-7.5 11.25S4.5 17.605 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  )
                },
                { 
                  label: 'Wind Speed', 
                  value: `${weather.current.wind_speed_10m} km/h`, 
                  icon: (
                    <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5h16.5M3.75 4.5h16.5m-16.5 4.5h16.5m-16.5 9h16.5" />
                    </svg>
                  )
                },
                {
                  label: 'High / Low',
                  value: `${Math.round(weather.daily.temperature_2m_max[0])}° / ${Math.round(weather.daily.temperature_2m_min[0])}°`,
                  icon: (
                    <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m9-5.25L12 16.5m0 0l-4.5-4.5M12 16.5V3" />
                    </svg>
                  )
                },
                { 
                  label: 'Precipitation', 
                  value: `${weather.current.precipitation} mm`, 
                  icon: (
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.02 12.02l.707-.707" />
                    </svg>
                  )
                },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 flex flex-col gap-1 hover:bg-white/[0.06] hover:border-white/10 transition-all relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">{label}</span>
                    <span className="opacity-50 group-hover:opacity-100 transition-opacity duration-200">{icon}</span>
                  </div>
                  <span className="text-white font-extrabold text-base tracking-tight">{value}</span>
                </div>
              ))}
            </div>

            {/* ── Solar Arc (Sunrise / Sunset) ─────────────────────────────── */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 mb-4 relative overflow-hidden group hover:bg-white/[0.06] hover:border-white/10 transition-all">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-white/40 font-bold">
                <span>Solar Cycle</span>
                <span className="text-cyan-400/90 font-mono">
                  {isDay 
                    ? `${Math.round(currentProgress * 100)}% through daylight` 
                    : 'Sun below horizon'}
                </span>
              </div>
              
              <div className="relative h-12 flex items-end justify-between px-1">
                {/* Sunrise label */}
                <div className="flex flex-col mb-[-4px]">
                  <span className="text-white font-semibold text-xs">
                    {new Date(weather.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Sunrise</span>
                </div>

                {/* Solar Arc Graphic */}
                <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center pointer-events-none">
                  <svg className="w-full h-full max-w-[200px]" viewBox="0 0 100 32" fill="none">
                    {/* Background dashed arc */}
                    <path
                      d="M 10 26 Q 50 4 90 26"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="2"
                      strokeDasharray="2 2"
                    />
                    
                    {/* Active daytime daylight arc path */}
                    {isDay && (
                      <path
                        d="M 10 26 Q 50 4 90 26"
                        stroke="url(#solar-gradient)"
                        strokeWidth="2"
                        strokeDasharray="100"
                        strokeDashoffset={100 - currentProgress * 100}
                        style={{
                          transition: 'stroke-dashoffset 0.5s ease'
                        }}
                      />
                    )}

                    <defs>
                      <linearGradient id="solar-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#facc15" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>

                    {/* Glowing Sun node */}
                    {isDay && (
                      <g transform={`translate(${sunX}, ${sunY})`}>
                        <circle r="3.5" fill="#facc15" />
                        <circle r="1.5" fill="#fff" />
                        <circle r="6" fill="#facc15" opacity="0.3" className="animate-ping" style={{ animationDuration: '3s' }} />
                      </g>
                    )}
                  </svg>
                </div>

                {/* Sunset label */}
                <div className="flex flex-col mb-[-4px] text-right">
                  <span className="text-white font-semibold text-xs">
                    {new Date(weather.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Sunset</span>
                </div>
              </div>
            </div>

            {/* ── Life Score — always visible ──────────────────────────────── */}
            <LifeScoreCard {...calculateLifeScore(weather.current)} />

            {/* ── Collapsible secondary sections ──────────────────────────── */}
            <div className="mt-3 flex flex-col gap-1 border-t border-white/5 pt-2">

              <Section title="Weather Translator" defaultOpen={false}>
                <WeatherAdviceCard advice={getWeatherAdvice(weather.current)} />
              </Section>

              <Section title="12-Hour Story" defaultOpen={false}>
                <TimelineStory events={generateTimeline(weather)} />
              </Section>

              <Section title="Activity Planner" defaultOpen={false}>
                <ActivityPlanner weather={weather} />
              </Section>

              <Section title="Air Quality" defaultOpen={false}>
                <AirQualityCard airQuality={airQuality} isLoading={isAqLoading} error={aqError} />
              </Section>

            </div>

          </div>
        )}
      </div>
    </aside>
  );
}
