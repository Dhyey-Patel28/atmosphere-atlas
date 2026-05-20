import { useEffect, useState, useCallback } from 'react';
import { fetchHistoricalWeather } from '../lib/openMeteo';

interface WeatherMemoryCardProps {
  latitude: number;
  longitude: number;
  todayTempMax: number;
  todayPrecip: number;
  todayDateStr: string;
}

interface HistoricalData {
  tempMax: number;
  precipitation: number;
}

export function WeatherMemoryCard({
  latitude,
  longitude,
  todayTempMax,
  todayPrecip,
  todayDateStr,
}: WeatherMemoryCardProps) {
  const [lastYearData, setLastYearData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute last year's calendar date
  const dateParts = todayDateStr.split('-');
  const lastYearDateStr = dateParts.length === 3 
    ? `${parseInt(dateParts[0]) - 1}-${dateParts[1]}-${dateParts[2]}`
    : '';

  const fetchData = useCallback(async () => {
    if (!lastYearDateStr || latitude == null || longitude == null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistoricalWeather(latitude, longitude, lastYearDateStr);
      setLastYearData(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load last year\'s weather memory.');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, lastYearDateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function formatDate(dateStr: string): string {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-white/40 bg-white/5 border border-white/10 rounded-2xl">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
        <span className="text-[10px] uppercase tracking-widest font-semibold">Retrieving archives...</span>
      </div>
    );
  }

  if (error || !lastYearData) {
    return (
      <div className="text-center py-5 px-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
        <p className="text-rose-400 text-xs">{error || 'Data unavailable'}</p>
        <button
          onClick={fetchData}
          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-white/70 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const tempDiff = todayTempMax - lastYearData.tempMax;
  const isWarmer = tempDiff > 0.5;
  const isColder = tempDiff < -0.5;

  let explanation = '';
  if (isWarmer) {
    explanation += `Today is warmer than last year, displaying a temperature rise of +${tempDiff.toFixed(1)}°C. `;
  } else if (isColder) {
    explanation += `Today is cooler than last year, displaying a temperature drop of ${tempDiff.toFixed(1)}°C. `;
  } else {
    explanation += `Today mirrors last year's temperature profile closely (within ${Math.abs(tempDiff).toFixed(1)}°C). `;
  }

  const todayWet = todayPrecip > 0.1;
  const lyWet = lastYearData.precipitation > 0.1;

  if (todayWet && !lyWet) {
    explanation += `Additionally, it is wetter today with ${todayPrecip.toFixed(1)} mm of precipitation compared to last year's dry spell.`;
  } else if (!todayWet && lyWet) {
    explanation += `Additionally, today is drier than last year, which experienced ${lastYearData.precipitation.toFixed(1)} mm of precipitation.`;
  } else if (todayWet && lyWet) {
    if (todayPrecip > lastYearData.precipitation) {
      explanation += `Both days had precipitation, but today is wetter (${todayPrecip.toFixed(1)} mm vs ${lastYearData.precipitation.toFixed(1)} mm last year).`;
    } else {
      explanation += `Both days had precipitation, but last year was wetter (${lastYearData.precipitation.toFixed(1)} mm vs ${todayPrecip.toFixed(1)} mm today).`;
    }
  } else {
    explanation += `Both days remained completely dry.`;
  }

  return (
    <div className="flex flex-col gap-4 text-sm mt-1 bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all shadow-lg">
      {/* Date Header Comparison */}
      <div className="flex justify-between items-center text-[10px] text-white/50 border-b border-white/5 pb-2">
        <div>
          <span className="text-cyan-400 font-semibold">LAST YEAR:</span> {formatDate(lastYearDateStr)}
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/30" />
        <div>
          <span className="text-white/80 font-semibold">TODAY:</span> {formatDate(todayDateStr)}
        </div>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Temp Max Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Peak Temp</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              tempDiff > 0 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : tempDiff < 0 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                  : 'bg-white/10 text-white/60'
            }`}>
              {tempDiff > 0 ? '+' : ''}{tempDiff.toFixed(1)}°C
            </span>
          </div>
          <div className="flex justify-between items-baseline mt-1">
            <div className="flex flex-col">
              <span className="text-white/40 text-[9px]">Last Year</span>
              <span className="text-white/70 font-semibold text-xs">{lastYearData.tempMax.toFixed(1)}°C</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white/40 text-[9px]">Today</span>
              <span className="text-white font-black text-lg">{todayTempMax.toFixed(1)}°C</span>
            </div>
          </div>
        </div>

        {/* Precipitation Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Rain / Snow</span>
            <span className="text-[9px] text-white/40">Daily Sum</span>
          </div>
          <div className="flex justify-between items-baseline mt-1">
            <div className="flex flex-col">
              <span className="text-white/40 text-[9px]">Last Year</span>
              <span className="text-white/70 font-semibold text-xs">{lastYearData.precipitation.toFixed(1)} mm</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white/40 text-[9px]">Today</span>
              <span className="text-white font-black text-lg">{todayPrecip.toFixed(1)} mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Explanation */}
      <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3">
        <p className="text-cyan-200/80 text-xs leading-relaxed font-medium">
          {explanation}
        </p>
      </div>
    </div>
  );
}
