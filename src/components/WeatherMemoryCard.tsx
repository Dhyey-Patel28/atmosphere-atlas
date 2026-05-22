import { useEffect, useMemo, useState } from 'react';
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

type MemoryStatus = 'idle' | 'loading' | 'success' | 'error';

const ARCHIVE_TIMEOUT_MS = 12000;

function getLastYearDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);

  if (!year || !month || !day) return '';

  const lastYear = new Date(year - 1, month - 1, day);

  // Handles Feb 29 by falling back to Feb 28 in non-leap years.
  if (month === 2 && day === 29 && lastYear.getMonth() !== 1) {
    return `${year - 1}-02-28`;
  }

  return [
    String(lastYear.getFullYear()),
    String(lastYear.getMonth() + 1).padStart(2, '0'),
    String(lastYear.getDate()).padStart(2, '0'),
  ].join('-');
}

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

function buildExplanation(todayTempMax: number, todayPrecip: number, lastYearData: HistoricalData): string {
  const tempDiff = todayTempMax - lastYearData.tempMax;
  const precipDiff = todayPrecip - lastYearData.precipitation;

  const tempSentence =
    tempDiff > 0.5
      ? `Today is ${tempDiff.toFixed(1)}°C warmer than this day last year.`
      : tempDiff < -0.5
        ? `Today is ${Math.abs(tempDiff).toFixed(1)}°C cooler than this day last year.`
        : `Today is very close to last year's temperature, within ${Math.abs(tempDiff).toFixed(1)}°C.`;

  const precipSentence =
    Math.abs(precipDiff) <= 0.1
      ? `Precipitation is nearly unchanged between both days.`
      : precipDiff > 0
        ? `It is also wetter today by ${precipDiff.toFixed(1)} mm.`
        : `It is drier today by ${Math.abs(precipDiff).toFixed(1)} mm.`;

  return `${tempSentence} ${precipSentence}`;
}

export function WeatherMemoryCard({
  latitude,
  longitude,
  todayTempMax,
  todayPrecip,
  todayDateStr,
}: WeatherMemoryCardProps) {
  const [lastYearData, setLastYearData] = useState<HistoricalData | null>(null);
  const [status, setStatus] = useState<MemoryStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const lastYearDateStr = useMemo(() => getLastYearDate(todayDateStr), [todayDateStr]);

  useEffect(() => {
    if (!lastYearDateStr || Number.isNaN(latitude) || Number.isNaN(longitude)) return;

    const controller = new AbortController();
    let ignore = false;

    // Schedule state updates instead of doing them synchronously in the effect body.
    const requestId = window.setTimeout(() => {
      setStatus('loading');
      setError(null);
      setLastYearData(null);

      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, ARCHIVE_TIMEOUT_MS);

      fetchHistoricalWeather(latitude, longitude, lastYearDateStr, {
        signal: controller.signal,
      })
        .then((data) => {
          if (ignore) return;
          setLastYearData(data);
          setStatus('success');
        })
        .catch((err) => {
          if (ignore) return;

          const isAbortError = err instanceof DOMException && err.name === 'AbortError';

          setLastYearData(null);
          setStatus('error');
          setError(
            isAbortError
              ? 'The weather archive took too long to respond. Please try again.'
              : 'Unable to load last year\'s weather memory.'
          );
        })
        .finally(() => {
          window.clearTimeout(timeoutId);
        });
    }, 0);

    return () => {
      ignore = true;
      controller.abort();
      window.clearTimeout(requestId);
    };
  }, [latitude, longitude, lastYearDateStr, retryCount]);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-white/40 bg-white/5 border border-white/10 rounded-2xl">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
        <span className="text-[10px] uppercase tracking-widest font-semibold">
          Retrieving archives...
        </span>
      </div>
    );
  }

  if (status === 'error' || !lastYearData) {
    return (
      <div className="text-center py-5 px-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
        <p className="text-rose-400 text-xs">
          {error || 'Historical weather memory is unavailable for this location.'}
        </p>
        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-white/70 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const tempDiff = todayTempMax - lastYearData.tempMax;
  const precipDiff = todayPrecip - lastYearData.precipitation;
  const explanation = buildExplanation(todayTempMax, todayPrecip, lastYearData);

  return (
    <div className="flex flex-col gap-4 text-sm mt-1 bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all shadow-lg">
      <div className="flex justify-between items-center text-[10px] text-white/50 border-b border-white/5 pb-2">
        <div>
          <span className="text-cyan-400 font-semibold">LAST YEAR:</span>{' '}
          {formatDate(lastYearDateStr)}
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/30" />
        <div>
          <span className="text-white/80 font-semibold">TODAY:</span> {formatDate(todayDateStr)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">
              Peak Temp
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tempDiff > 0
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : tempDiff < 0
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'bg-white/10 text-white/60'
              }`}
            >
              {tempDiff > 0 ? '+' : ''}
              {tempDiff.toFixed(1)}°C
            </span>
          </div>

          <div className="flex justify-between items-baseline mt-1">
            <div className="flex flex-col">
              <span className="text-white/40 text-[9px]">Last Year</span>
              <span className="text-white/70 font-semibold text-xs">
                {lastYearData.tempMax.toFixed(1)}°C
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white/40 text-[9px]">Today</span>
              <span className="text-white font-black text-lg">{todayTempMax.toFixed(1)}°C</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">
              Rain / Snow
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                precipDiff > 0.1
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  : precipDiff < -0.1
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-white/10 text-white/60'
              }`}
            >
              {precipDiff > 0 ? '+' : ''}
              {precipDiff.toFixed(1)} mm
            </span>
          </div>

          <div className="flex justify-between items-baseline mt-1">
            <div className="flex flex-col">
              <span className="text-white/40 text-[9px]">Last Year</span>
              <span className="text-white/70 font-semibold text-xs">
                {lastYearData.precipitation.toFixed(1)} mm
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white/40 text-[9px]">Today</span>
              <span className="text-white font-black text-lg">{todayPrecip.toFixed(1)} mm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3">
        <p className="text-cyan-200/80 text-xs leading-relaxed font-medium">{explanation}</p>
      </div>
    </div>
  );
}
