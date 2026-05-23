import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { SearchBar } from './components/SearchBar';
import { WeatherPanel } from './components/WeatherPanel';
import { SavedPlaces, loadSavedPlaces, persistSavedPlaces } from './components/SavedPlaces';
import { fetchWeather, fetchAirQuality } from './lib/openMeteo';
import type { Location, WeatherData, AirQualityData } from './types/weather';
import { getStoredTemperatureUnit, persistTemperatureUnit, toggleTemperatureUnit } from './lib/units';
import type { TemperatureUnit } from './lib/units';
import { getWeatherAmbience } from './lib/ambience';

const GlobeView = lazy(() =>
  import('./components/GlobeView').then((m) => ({ default: m.GlobeView }))
);

type ShareToast = {
  type: 'success' | 'error';
  title: string;
  detail: string;
};

function formatCoordinate(value: number): string {
  return value.toFixed(4).replace(/\.?0+$/, '');
}

function buildCoordinateId(latitude: number, longitude: number): number {
  return -Math.abs(Math.round((latitude + 90) * 100000 + (longitude + 180) * 1000));
}

function buildCoordinateLabel(latitude: number, longitude: number): string {
  return `${formatCoordinate(latitude)}°, ${formatCoordinate(longitude)}°`;
}

function parseLocationParam(rawValue: string | null): Location | null {
  if (!rawValue) return null;

  const [rawLat, rawLon] = rawValue.split(',');
  const latitude = Number(rawLat);
  const longitude = Number(rawLon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    id: buildCoordinateId(latitude, longitude),
    name: 'Shared location',
    latitude,
    longitude,
    admin1: 'Shared coordinates',
    country: buildCoordinateLabel(latitude, longitude),
    isPinned: true,
  };
}

function parseSharedLocationFromUrl(): Location | null {
  const params = new URLSearchParams(window.location.search);

  const compactLocation = parseLocationParam(params.get('loc'));

  if (compactLocation) {
    return compactLocation;
  }

  // Backward compatibility for older compact share URLs.
  const oldCompactLocation = parseLocationParam(params.get('at'));

  if (oldCompactLocation) {
    return oldCompactLocation;
  }

  // Backward compatibility for older verbose share URLs.
  const rawLat = params.get('lat');
  const rawLon = params.get('lon');

  if (rawLat && rawLon) {
    const latitude = Number(rawLat);
    const longitude = Number(rawLon);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return {
        id: buildCoordinateId(latitude, longitude),
        name: params.get('name') || 'Shared location',
        latitude,
        longitude,
        admin1: params.get('admin1') || 'Shared coordinates',
        country:
          params.get('country') ||
          buildCoordinateLabel(latitude, longitude),
        isPinned: params.get('pinned') === 'true',
      };
    }
  }

  return null;
}

function buildShareUrl(location: Location): string {
  const latitude = formatCoordinate(location.latitude);
  const longitude = formatCoordinate(location.longitude);

  return `${window.location.origin}${window.location.pathname}?loc=${latitude},${longitude}`;
}

function syncUrlToLocation(location: Location) {
  const nextUrl = buildShareUrl(location);

  window.history.replaceState(null, '', nextUrl);
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isAqLoading, setIsAqLoading] = useState(false);
  const [aqError, setAqError] = useState<string | null>(null);

  const [savedPlaces, setSavedPlaces] = useState<Location[]>(() => loadSavedPlaces());
  const [isPinMode, setIsPinMode] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [shareToast, setShareToast] = useState<ShareToast | null>(null);
  const shareResetTimer = useRef<number | null>(null);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>(() =>
    getStoredTemperatureUnit()
  );

  const ambience = getWeatherAmbience(weather?.current ?? null);

  useEffect(() => {
    persistSavedPlaces(savedPlaces);
  }, [savedPlaces]);

  useEffect(() => {
    persistTemperatureUnit(temperatureUnit);
  }, [temperatureUnit]);

  useEffect(() => {
    return () => {
      if (shareResetTimer.current !== null) {
        window.clearTimeout(shareResetTimer.current);
      }
    };
  }, []);

  function scheduleShareFeedbackReset(delayMs: number) {
    if (shareResetTimer.current !== null) {
      window.clearTimeout(shareResetTimer.current);
    }

    shareResetTimer.current = window.setTimeout(() => {
      setShareStatus('idle');
      setShareToast(null);
      shareResetTimer.current = null;
    }, delayMs);
  }

  function handleToggleTemperatureUnit() {
    setTemperatureUnit((currentUnit: TemperatureUnit) => toggleTemperatureUnit(currentUnit));
  }

  function handleSelectLocation(location: Location, options: { updateUrl?: boolean } = {}) {
    const shouldUpdateUrl = options.updateUrl ?? true;

    setSelectedLocation({ ...location });

    setWeather(null);
    setWeatherError(null);
    setIsWeatherLoading(true);

    setAirQuality(null);
    setAqError(null);
    setIsAqLoading(true);

    setShareStatus('idle');
    setShareToast(null);

    if (shouldUpdateUrl) {
      syncUrlToLocation(location);
    }
  }

  function handleSave() {
    if (!selectedLocation) return;

    setSavedPlaces((prev) => {
      if (prev.some((place) => place.id === selectedLocation.id)) return prev;
      return [...prev, selectedLocation].slice(0, 10);
    });
  }

  function handleRemove(id: number) {
    setSavedPlaces((prev) => prev.filter((place) => place.id !== id));
  }

  function handlePinLocation(coords: { lat: number; lng: number }) {
    const latitude = Number(coords.lat.toFixed(4));
    const longitude = Number(coords.lng.toFixed(4));

    const pinnedLocation: Location = {
      id: -Date.now(),
      name: 'Pinned location',
      latitude,
      longitude,
      admin1: 'Dropped pin',
      country: buildCoordinateLabel(latitude, longitude),
      isPinned: true,
    };

    handleSelectLocation(pinnedLocation);
    setIsPinMode(false);
  }

  async function handleShareLocation() {
    if (!selectedLocation) return;

    const shareUrl = buildShareUrl(selectedLocation);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('copied');
      setShareToast({
        type: 'success',
        title: 'Share link copied',
        detail: 'Paste it anywhere to reopen this exact weather view.',
      });
      scheduleShareFeedbackReset(2600);
    } catch {
      setShareStatus('failed');
      setShareToast({
        type: 'error',
        title: 'Copy failed',
        detail: 'Your browser blocked clipboard access. Copy the address from the URL bar instead.',
      });
      scheduleShareFeedbackReset(3600);
    }
  }

  useEffect(() => {
    const sharedLocation = parseSharedLocationFromUrl();

    if (!sharedLocation) return;

    const timeoutId = window.setTimeout(() => {
      handleSelectLocation(sharedLocation);

      // Normalize older verbose or ?at= URLs to the clean ?loc= format.
      syncUrlToLocation(sharedLocation);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!selectedLocation) return;

    const loc = selectedLocation;
    let ignore = false;

    fetchWeather(loc.latitude, loc.longitude)
      .then((data) => {
        if (ignore) return;
        setWeather(data);
        setWeatherError(null);
      })
      .catch(() => {
        if (ignore) return;
        setWeather(null);
        setWeatherError('Failed to retrieve weather data.');
      })
      .finally(() => {
        if (ignore) return;
        setIsWeatherLoading(false);
      });

    fetchAirQuality(loc.latitude, loc.longitude)
      .then((data) => {
        if (ignore) return;
        setAirQuality(data);
        setAqError(null);
      })
      .catch(() => {
        if (ignore) return;
        setAirQuality(null);
        setAqError('Failed to retrieve air quality data.');
      })
      .finally(() => {
        if (ignore) return;
        setIsAqLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectedLocation]);

  return (
    <div className="relative w-full h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-all duration-[1800ms] ease-in-out"
        style={ambience.backgroundStyle}
      />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_30%)]" />

      <header className="relative z-50 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-xl shrink-0">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/logo-mark-256.png"
              alt="Atmosphere Atlas Logo"
              className="w-5 h-5 md:w-6 md:h-6 object-contain"
            />
            <h1 className="text-sm md:text-base font-black tracking-[0.25em] text-white/90 uppercase whitespace-nowrap bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              ATMOSPHERE ATLAS
            </h1>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 min-w-0">
            <div className="w-full md:max-w-xs lg:max-w-sm">
              <SearchBar onLocationSelect={handleSelectLocation} />
            </div>

            <button
              type="button"
              onClick={handleToggleTemperatureUnit}
              className="shrink-0 rounded-full border border-white/15 bg-slate-950/50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70 backdrop-blur-md transition-all hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-100"
              aria-label={`Switch temperature unit to ${
                temperatureUnit === 'C' ? 'Fahrenheit' : 'Celsius'
              }`}
              title={`Switch to ${temperatureUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
            >
              °{temperatureUnit}
            </button>

            {(savedPlaces.length > 0 || selectedLocation) && (
              <div className="flex items-center min-w-0">
                <SavedPlaces
                  places={savedPlaces}
                  selectedLocation={selectedLocation}
                  onSelect={handleSelectLocation}
                  onSave={handleSave}
                  onRemove={handleRemove}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 min-h-0 w-full max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col overflow-y-auto xl:overflow-hidden">
        <div className="flex-1 flex flex-col xl:flex-row gap-4 xl:gap-6 min-h-0 h-full">
          <div
            className="relative flex-none xl:flex-1 flex flex-col rounded-[2rem] overflow-hidden bg-slate-900/10 border border-white/5 shadow-2xl backdrop-blur-sm
                       h-[45vw] max-h-[300px]
                       xl:h-full xl:max-h-none xl:min-h-0"
          >
            <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPinMode((prev) => !prev)}
                aria-pressed={isPinMode}
                aria-label={isPinMode ? 'Cancel drop pin mode' : 'Enter drop pin mode'}
                title={isPinMode ? 'Cancel drop pin mode' : 'Drop a weather pin on the globe'}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md transition-all ${
                  isPinMode
                    ? 'border-cyan-300/70 bg-cyan-400/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                    : 'border-white/15 bg-slate-950/60 text-white/70 hover:border-cyan-400/50 hover:text-cyan-100'
                }`}
              >
                {isPinMode ? 'Cancel pin' : 'Drop pin'}
              </button>

              {selectedLocation && (
                <button
                  type="button"
                  onClick={handleShareLocation}
                  aria-label="Copy share link for current location"
                  title="Copy share link"
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md transition-all ${
                    shareStatus === 'copied'
                      ? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-100'
                      : shareStatus === 'failed'
                        ? 'border-rose-300/60 bg-rose-400/15 text-rose-100'
                        : 'border-white/15 bg-slate-950/60 text-white/70 hover:border-cyan-400/50 hover:text-cyan-100'
                  }`}
                >
                  <span aria-live="polite">
                    {shareStatus === 'copied'
                      ? 'Copied'
                      : shareStatus === 'failed'
                        ? 'Copy failed'
                        : 'Share'}
                  </span>
                </button>
              )}
            </div>

            {isPinMode && (
              <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-cyan-400/20 bg-slate-950/80 px-4 py-3 text-xs text-cyan-100 shadow-2xl backdrop-blur-xl">
                Click the globe to drop a weather pin. On mobile, cancel pin mode to resume normal scrolling.
              </div>
            )}

            <Suspense
              fallback={
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-sm">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">
                    Initializing Globe System...
                  </p>
                </div>
              }
            >
              <GlobeView
                location={selectedLocation}
                isPinMode={isPinMode}
                onPinLocation={handlePinLocation}
              />
            </Suspense>

            {!selectedLocation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <p
                  className="text-white/50 text-sm md:text-base tracking-widest font-light
                             bg-slate-950/60 px-5 py-2.5 rounded-full backdrop-blur-md
                             border border-white/10 animate-pulse uppercase"
                >
                  Search a city to begin
                </p>
              </div>
            )}
          </div>

          <div className="w-full xl:w-[420px] xl:shrink-0 xl:h-full min-h-0">
            <WeatherPanel
              location={selectedLocation}
              weather={weather}
              isLoading={isWeatherLoading}
              error={weatherError}
              airQuality={airQuality}
              isAqLoading={isAqLoading}
              aqError={aqError}
              unit={temperatureUnit}
            />
          </div>
        </div>
      </main>

      {shareToast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-5 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                shareToast.type === 'success'
                  ? 'bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.75)]'
                  : 'bg-rose-300 shadow-[0_0_18px_rgba(253,164,175,0.75)]'
              }`}
            />
            <div className="min-w-0">
              <p className="font-semibold tracking-wide text-white/90">{shareToast.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/55">{shareToast.detail}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;