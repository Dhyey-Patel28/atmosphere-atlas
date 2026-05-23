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
import { DailyForecastCard } from './DailyForecastCard';
import { WeatherBriefCard } from './WeatherBriefCard';
import { WeatherDetailsCard } from './WeatherDetailsCard';
import type { TemperatureUnit } from '../lib/units';
import { formatTemperatureCompact } from '../lib/units';

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
  unit: TemperatureUnit;
  onFocusSearch?: () => void;
  onUseCurrentLocation?: () => void;
  onStartPinMode?: () => void;
  isPinMode?: boolean;
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
  unit,
  onFocusSearch,
  onUseCurrentLocation,
  onStartPinMode,
  isPinMode = false,
}: WeatherPanelProps) {

  // ── Empty placeholder ──────────────────────────────────────────────────────
  if (!location && !isLoading && !error) {
    return (
      <aside className="w-full xl:h-full">
        <div className="w-full bg-slate-950/35 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-2xl flex flex-col gap-3 md:gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-cyan-300/70">
              Weather intelligence
            </p>
            <h2 className="mt-2 text-lg md:text-xl font-black tracking-tight text-white/90">
              {isPinMode ? 'Pin mode is active.' : 'Pick a place. We’ll explain the day.'}
            </h2>
            <p className="mt-1.5 md:mt-2 text-sm leading-relaxed text-white/50">
              {isPinMode
                ? 'Tap the globe above to load weather for that exact point.'
                : 'Start with search, your current location, or a point on the globe.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onFocusSearch}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center transition-all hover:border-cyan-300/35 hover:bg-cyan-400/10"
            >
              <span className="block text-xs font-bold text-white/85">Search</span>
              <span className="mt-1 hidden sm:block text-[11px] leading-relaxed text-white/40">Find a city.</span>
            </button>

            <button
              type="button"
              onClick={onUseCurrentLocation}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center transition-all hover:border-cyan-300/25 hover:bg-cyan-400/10"
            >
              <span className="block text-xs font-bold text-white/80">Near me</span>
              <span className="mt-1 hidden sm:block text-[11px] leading-relaxed text-white/40">Use location.</span>
            </button>

            <button
              type="button"
              onClick={onStartPinMode}
              className={`rounded-2xl border px-3 py-3 text-center transition-all ${
                isPinMode
                  ? 'border-cyan-300/45 bg-cyan-400/12 text-cyan-100'
                  : 'border-white/10 bg-white/[0.04] hover:border-cyan-300/25 hover:bg-cyan-400/10'
              }`}
            >
              <span className="block text-xs font-bold text-white/80">Drop pin</span>
              <span className="mt-1 hidden sm:block text-[11px] leading-relaxed text-white/40">
                {isPinMode ? 'Tap globe.' : 'Pick point.'}
              </span>
            </button>
          </div>
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
                {formatTemperatureCompact(weather.current.temperature_2m, unit)}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/45 text-[10px] uppercase tracking-widest font-bold">Feels like</span>
                <span className="text-cyan-400 font-extrabold text-2xl tracking-tight">
                  {formatTemperatureCompact(weather.current.apparent_temperature, unit)}
                </span>
              </div>
            </div>

            {/* ── Human-centered daily brief ─────────────────────────────── */}
            <WeatherBriefCard weather={weather} airQuality={airQuality} unit={unit} />

            {/* ── Life Score — always visible ──────────────────────────────── */}
            <LifeScoreCard {...calculateLifeScore(weather.current)} />

            {/* ── Collapsible secondary sections ──────────────────────────── */}
            <div className="mt-3 flex flex-col gap-1 border-t border-white/5 pt-2">

              <Section title="Weather Details" defaultOpen={false}>
                <WeatherDetailsCard
                  weather={weather}
                  unit={unit}
                  isDay={isDay}
                  currentProgress={currentProgress}
                  sunX={sunX}
                  sunY={sunY}
                />
              </Section>

              <Section title="Weather Translator" defaultOpen={false}>
                <WeatherAdviceCard advice={getWeatherAdvice(weather.current)} />
              </Section>

              <Section title="12-Hour Story" defaultOpen={false}>
                <TimelineStory events={generateTimeline(weather, unit)} />
              </Section>

              <Section title="5-Day Outlook" defaultOpen={false}>
                <DailyForecastCard weather={weather} unit={unit} />
              </Section>

              <Section title="Activity Planner" defaultOpen={false}>
                <ActivityPlanner weather={weather} unit={unit} />
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
