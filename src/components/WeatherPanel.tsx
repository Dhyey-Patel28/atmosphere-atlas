import type { Location, WeatherData } from '../types/weather';
import { getWeatherDescription, getWeatherAdvice } from '../lib/weatherText';
import { calculateLifeScore } from '../lib/weatherScore';
import { generateTimeline } from '../lib/timelineStory';
import { LifeScoreCard } from './LifeScoreCard';
import { WeatherAdviceCard } from './WeatherAdviceCard';
import { TimelineStory } from './TimelineStory';
import { ActivityPlanner } from './ActivityPlanner';

interface WeatherPanelProps {
  location: Location | null;
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

export function WeatherPanel({ location, weather, isLoading, error }: WeatherPanelProps) {
  // Empty State Placeholder
  if (!location && !isLoading && !error) {
    return (
      <aside className="w-full max-w-md xl:max-w-none xl:w-[400px] shrink-0 opacity-30 flex flex-col items-center xl:items-stretch justify-center">
        <div className="w-full bg-slate-900/30 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl h-64 xl:h-[75vh] flex flex-col gap-4">
          <div className="h-6 w-1/3 bg-white/10 rounded-full"></div>
          <div className="flex-1 bg-white/5 rounded-2xl border border-white/5"></div>
          <div className="h-32 bg-white/5 rounded-2xl border border-white/5"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full max-w-md xl:max-w-none xl:w-[400px] shrink-0 flex flex-col items-center xl:items-stretch justify-center z-10">
      <div className="w-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-6 relative overflow-hidden min-h-[400px]">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-[2rem]">
            <span className="animate-spin text-4xl mb-4 text-cyan-400">&#8987;</span>
            <p className="text-white/70 animate-pulse tracking-widest text-sm uppercase">Syncing atmosphere...</p>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center rounded-[2rem]">
            <span className="text-4xl mb-4 text-red-400">&#9888;</span>
            <p className="text-white font-medium mb-2">Weather Sync Failed</p>
            <p className="text-red-400/80 text-sm">{error}</p>
          </div>
        )}

        {weather && location && (
          <>
            {/* Header: Location & Condition */}
            <div className="flex flex-col gap-1">
              <h3 className="text-white/60 uppercase tracking-widest text-xs font-semibold">Current Conditions</h3>
              <div className="flex justify-between items-start mt-2">
                <div>
                  <h2 className="text-white text-xl font-bold">{location.name}</h2>
                  <p className="text-white/50 text-sm">{location.admin1 ? `${location.admin1}, ` : ''}{location.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium capitalize">{getWeatherDescription(weather.current.weather_code)}</p>
                  <p className="text-white/50 text-sm">{weather.current.is_day ? 'Daytime' : 'Nighttime'}</p>
                </div>
              </div>
            </div>

            {/* Main Temperature */}
            <div className="flex items-baseline gap-3 py-4">
              <span className="text-6xl font-light text-white tracking-tighter">
                {Math.round(weather.current.temperature_2m)}&deg;
              </span>
              <div className="flex flex-col">
                <span className="text-white/50 text-sm uppercase tracking-wide">Feels like</span>
                <span className="text-white/90 font-medium text-lg">{Math.round(weather.current.apparent_temperature)}&deg;</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 transition-colors hover:bg-white/10">
                <span className="text-white/40 text-xs uppercase tracking-wider">Humidity</span>
                <span className="text-white font-medium">{weather.current.relative_humidity_2m}%</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 transition-colors hover:bg-white/10">
                <span className="text-white/40 text-xs uppercase tracking-wider">Wind</span>
                <span className="text-white font-medium">{weather.current.wind_speed_10m} km/h</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 transition-colors hover:bg-white/10">
                <span className="text-white/40 text-xs uppercase tracking-wider">High / Low</span>
                <span className="text-white font-medium">
                  {Math.round(weather.daily.temperature_2m_max[0])}&deg; / {Math.round(weather.daily.temperature_2m_min[0])}&deg;
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 transition-colors hover:bg-white/10">
                <span className="text-white/40 text-xs uppercase tracking-wider">Precipitation</span>
                <span className="text-white font-medium">{weather.current.precipitation} mm</span>
              </div>
            </div>

            {/* Sun Cycle */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center mt-1">
               <div className="flex flex-col gap-1">
                 <span className="text-white/40 text-xs uppercase tracking-wider">Sunrise</span>
                 <span className="text-white font-medium">
                   {new Date(weather.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
               </div>
               <div className="w-px h-8 bg-white/10"></div>
               <div className="flex flex-col gap-1 text-right">
                 <span className="text-white/40 text-xs uppercase tracking-wider">Sunset</span>
                 <span className="text-white font-medium">
                   {new Date(weather.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
               </div>
            </div>

            {/* Life Score */}
            <LifeScoreCard {...calculateLifeScore(weather.current)} />

            {/* Weather Translator Advice */}
            <WeatherAdviceCard advice={getWeatherAdvice(weather.current)} />

            {/* 12-Hour Timeline Story */}
            <TimelineStory events={generateTimeline(weather)} />

            {/* Activity Planner */}
            <ActivityPlanner weather={weather} />
          </>
        )}
      </div>
    </aside>
  );
}
