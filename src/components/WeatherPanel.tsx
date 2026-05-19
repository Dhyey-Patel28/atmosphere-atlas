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
    <div className="border-t border-white/5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 px-1 text-left group focus:outline-none"
      >
        <span className="text-white/50 uppercase tracking-widest text-[10px] font-semibold group-hover:text-white/70 transition-colors">
          {title}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-3">{children}</div>}
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

  // ── Panel shell — scrollable on desktop ────────────────────────────────────
  return (
    <aside className="w-full xl:h-full flex flex-col">
      <div
        className="
          w-full flex-1
          bg-slate-900/50 backdrop-blur-3xl border border-white/10
          rounded-[2rem] shadow-2xl
          flex flex-col
          relative overflow-hidden
          xl:overflow-y-auto xl:overscroll-contain
          [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]
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
          <div className="flex flex-col p-5 gap-0">

            {/* ── Location & condition header ──────────────────────────────── */}
            <div className="flex justify-between items-start pt-1 pb-4">
              <div>
                <h2 className="text-white text-xl font-bold leading-tight">{location.name}</h2>
                <p className="text-white/45 text-xs mt-0.5">
                  {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/90 text-sm font-medium capitalize">
                  {getWeatherDescription(weather.current.weather_code)}
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {weather.current.is_day ? 'Daytime' : 'Nighttime'}
                </p>
              </div>
            </div>

            {/* ── Temperature hero ────────────────────────────────────────── */}
            <div className="flex items-baseline gap-4 pb-4">
              <span className="text-7xl font-extralight text-white tracking-tighter leading-none">
                {Math.round(weather.current.temperature_2m)}°
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/40 text-[10px] uppercase tracking-widest">Feels like</span>
                <span className="text-white/90 font-semibold text-2xl">
                  {Math.round(weather.current.apparent_temperature)}°
                </span>
              </div>
            </div>

            {/* ── Core metrics 2×2 grid ───────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-2 pb-3">
              {[
                { label: 'Humidity', value: `${weather.current.relative_humidity_2m}%` },
                { label: 'Wind', value: `${weather.current.wind_speed_10m} km/h` },
                {
                  label: 'High / Low',
                  value: `${Math.round(weather.daily.temperature_2m_max[0])}° / ${Math.round(weather.daily.temperature_2m_min[0])}°`,
                },
                { label: 'Precipitation', value: `${weather.current.precipitation} mm` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-0.5 hover:bg-white/8 transition-colors">
                  <span className="text-white/40 text-[10px] uppercase tracking-wider">{label}</span>
                  <span className="text-white font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>

            {/* ── Sunrise / Sunset row ─────────────────────────────────────── */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between items-center mb-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-white/40 text-[10px] uppercase tracking-wider">Sunrise</span>
                <span className="text-white font-medium text-sm">
                  {new Date(weather.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/20">
                <div className="w-12 h-px bg-white/10" />
                <span className="text-xs">☀</span>
                <div className="w-12 h-px bg-white/10" />
              </div>
              <div className="flex flex-col gap-0.5 text-right">
                <span className="text-white/40 text-[10px] uppercase tracking-wider">Sunset</span>
                <span className="text-white font-medium text-sm">
                  {new Date(weather.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* ── Life Score — always visible ──────────────────────────────── */}
            <LifeScoreCard {...calculateLifeScore(weather.current)} />

            {/* ── Collapsible secondary sections ──────────────────────────── */}
            <div className="mt-1 flex flex-col">

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
