import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { SearchBar } from './components/SearchBar';
import { WeatherPanel } from './components/WeatherPanel';
import { SavedPlaces, loadSavedPlaces, persistSavedPlaces } from './components/SavedPlaces';
import { fetchWeather, fetchAirQuality } from './lib/openMeteo';
import type { Location, WeatherData, AirQualityData } from './types/weather';
import { getStoredTemperatureUnit, persistTemperatureUnit, toggleTemperatureUnit } from './lib/units';
import type { TemperatureUnit } from './lib/units';
import { getWeatherAmbience } from './lib/ambience';
import { loadLastSelectedLocation, persistLastSelectedLocation } from './lib/locationMemory';

const GlobeView = lazy(() =>
  import('./components/GlobeView').then((m) => ({ default: m.GlobeView }))
);

type AppToast = {
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

function getFriendlyLocationName(location: Location): string {
  if (location.name === 'Pinned location') return 'Pinned spot';
  if (location.name === 'Shared location') return 'Shared spot';
  if (location.name === 'Current location') return 'Near me';

  return location.name;
}

function getSavedLocationCopy(location: Location): Location {
  const isCoordinateLocation =
    location.isPinned ||
    location.name === 'Pinned location' ||
    location.name === 'Shared location' ||
    location.name === 'Current location';

  if (!isCoordinateLocation) {
    return location;
  }

  return {
    ...location,
    name: getFriendlyLocationName(location),
    admin1: buildCoordinateLabel(location.latitude, location.longitude),
    country: 'Saved coordinates',
  };
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
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'failed'>('idle');
  const [appToast, setAppToast] = useState<AppToast | null>(null);
  const toastResetTimer = useRef<number | null>(null);
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
      if (toastResetTimer.current !== null) {
        window.clearTimeout(toastResetTimer.current);
      }
    };
  }, []);

  function scheduleToastReset(delayMs: number) {
    if (toastResetTimer.current !== null) {
      window.clearTimeout(toastResetTimer.current);
    }

    toastResetTimer.current = window.setTimeout(() => {
      setShareStatus('idle');
      setGeoStatus('idle');
      setAppToast(null);
      toastResetTimer.current = null;
    }, delayMs);
  }

  function handleToggleTemperatureUnit() {
    setTemperatureUnit((currentUnit: TemperatureUnit) => toggleTemperatureUnit(currentUnit));
  }

  function handleFocusSearch() {
    const input = document.getElementById('location-search-input') as HTMLInputElement | null;

    if (!input) return;

    input.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    window.setTimeout(() => {
      input.focus();
      input.select();
    }, 180);
  }

  function handleStartPinMode() {
    setIsPinMode(true);
    setAppToast({
      type: 'success',
      title: 'Pin mode active',
      detail: 'Click anywhere on the globe to load weather for that point.',
    });
    scheduleToastReset(3200);
  }

  function handleTogglePinMode() {
    setIsPinMode((current) => {
      const next = !current;

      if (next) {
        setAppToast({
          type: 'success',
          title: 'Pin mode active',
          detail: 'Click anywhere on the globe to load weather for that point.',
        });
        scheduleToastReset(3200);
      } else {
        setAppToast(null);
      }

      return next;
    });
  }

  function handleSelectLocation(location: Location, options: { updateUrl?: boolean } = {}) {
    const shouldUpdateUrl = options.updateUrl ?? true;

    setSelectedLocation({ ...location });
    persistLastSelectedLocation(location);

    setWeather(null);
    setWeatherError(null);
    setIsWeatherLoading(true);

    setAirQuality(null);
    setAqError(null);
    setIsAqLoading(true);

    setShareStatus('idle');
    setAppToast(null);

    if (shouldUpdateUrl) {
      syncUrlToLocation(location);
    }
  }

  function handleSave() {
    if (!selectedLocation) return;

    const savedLocation = getSavedLocationCopy(selectedLocation);

    setSavedPlaces((prev) => {
      if (prev.some((place) => place.id === selectedLocation.id)) {
        setAppToast({
          type: 'success',
          title: 'Already saved',
          detail: `${getFriendlyLocationName(selectedLocation)} is already in your saved places.`,
        });
        scheduleToastReset(2200);

        return prev;
      }

      if (prev.length >= 10) {
        setAppToast({
          type: 'error',
          title: 'Saved places are full',
          detail: 'Remove a saved place before adding another one.',
        });
        scheduleToastReset(3200);

        return prev;
      }

      setAppToast({
        type: 'success',
        title: 'Place saved',
        detail: `${getFriendlyLocationName(selectedLocation)} was added to your saved places.`,
      });
      scheduleToastReset(2400);

      return [savedLocation, ...prev];
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

  function handleUseCurrentLocation() {
    if (!('geolocation' in navigator)) {
      setGeoStatus('failed');
      setAppToast({
        type: 'error',
        title: 'Location unavailable',
        detail: 'Your browser does not support current-location lookup.',
      });
      scheduleToastReset(3600);
      return;
    }

    setGeoStatus('locating');
    setAppToast({
      type: 'success',
      title: 'Locating you',
      detail: 'Allow location access to load nearby weather.',
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(4));
        const longitude = Number(position.coords.longitude.toFixed(4));

        const currentLocation: Location = {
          id: buildCoordinateId(latitude, longitude),
          name: 'Current location',
          latitude,
          longitude,
          admin1: 'Browser location',
          country: buildCoordinateLabel(latitude, longitude),
          isPinned: true,
        };

        handleSelectLocation(currentLocation);
        setGeoStatus('idle');
        setAppToast({
          type: 'success',
          title: 'Current location loaded',
          detail: 'Weather is now synced to your approximate browser location.',
        });
        scheduleToastReset(2800);
      },
      (geoError) => {
        setGeoStatus('failed');

        const denied = geoError.code === geoError.PERMISSION_DENIED;

        setAppToast({
          type: 'error',
          title: denied ? 'Location access is blocked' : 'Could not find your location',
          detail: denied
            ? 'Use the lock icon in the address bar to allow location access, or search/drop a pin instead.'
            : 'Search a city or drop a pin instead.',
        });
        scheduleToastReset(5200);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 10 * 60 * 1000,
      }
    );
  }

  async function handleShareLocation() {
    if (!selectedLocation) return;

    const shareUrl = buildShareUrl(selectedLocation);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('copied');
      setAppToast({
        type: 'success',
        title: 'Share link copied',
        detail: 'Paste it anywhere to reopen this exact weather view.',
      });
      scheduleToastReset(2600);
    } catch {
      setShareStatus('failed');
      setAppToast({
        type: 'error',
        title: 'Copy failed',
        detail: 'Your browser blocked clipboard access. Copy the address from the URL bar instead.',
      });
      scheduleToastReset(3600);
    }
  }

  useEffect(() => {
    const sharedLocation = parseSharedLocationFromUrl();
    const rememberedLocation = sharedLocation ? null : loadLastSelectedLocation();

    if (!sharedLocation && !rememberedLocation) return;

    const timeoutId = window.setTimeout(() => {
      if (sharedLocation) {
        handleSelectLocation(sharedLocation);

        // Normalize older verbose or ?at= URLs to the clean ?loc= format.
        syncUrlToLocation(sharedLocation);
        return;
      }

      if (rememberedLocation) {
        handleSelectLocation(rememberedLocation, { updateUrl: false });
      }
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

      <header className="relative z-50 w-full border-b border-white/5 bg-slate-950/45 backdrop-blur-xl shrink-0">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src="/logo-mark-256.png"
                alt="Atmosphere Atlas Logo"
                className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0"
              />
              <h1 className="text-sm md:text-base font-black tracking-[0.2em] sm:tracking-[0.25em] text-white/90 uppercase whitespace-nowrap bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent truncate">
                ATMOSPHERE ATLAS
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTemperatureUnit}
                className="rounded-full border border-white/15 bg-slate-950/50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70 backdrop-blur-md transition-all hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-100"
                aria-label={`Switch temperature unit to ${
                  temperatureUnit === 'C' ? 'Fahrenheit' : 'Celsius'
                }`}
                title={`Switch to ${temperatureUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
              >
                °{temperatureUnit}
              </button>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoStatus === 'locating'}
                className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] backdrop-blur-md transition-all disabled:cursor-wait disabled:opacity-70 ${
                  geoStatus === 'locating'
                    ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100'
                    : 'border-white/15 bg-slate-950/50 text-white/70 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-100'
                }`}
                aria-label="Use my current location"
                title="Use browser location"
              >
                <span className="sm:hidden">{geoStatus === 'locating' ? '...' : 'Near'}</span>
                <span className="hidden sm:inline">{geoStatus === 'locating' ? 'Locating' : 'Near me'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-2.5 min-w-0">
            <div className="w-full lg:max-w-md">
              <SearchBar onLocationSelect={handleSelectLocation} />
            </div>

            {(savedPlaces.length > 0 || selectedLocation) && (
              <div className="flex items-center min-w-0 lg:flex-1 lg:justify-end">
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

      <main className="relative z-10 flex-1 min-h-0 w-full max-w-[1800px] mx-auto px-3 md:px-6 lg:px-8 py-3 md:py-4 flex flex-col overflow-y-auto xl:overflow-hidden">
        <div className="flex-1 flex flex-col xl:flex-row gap-3 md:gap-4 xl:gap-6 min-h-0 h-full">
          <div
            className="relative flex-none xl:flex-1 flex flex-col rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-900/10 border border-white/5 shadow-2xl backdrop-blur-sm
                       h-[310px] sm:h-[360px]
                       xl:h-full xl:max-h-none xl:min-h-0"
          >
            <div className="absolute left-3 top-3 md:left-4 md:top-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePinMode}
                aria-pressed={isPinMode}
                aria-label={isPinMode ? 'Cancel drop pin mode' : 'Enter drop pin mode'}
                title={isPinMode ? 'Cancel drop pin mode' : 'Drop a weather pin on the globe'}
                className={`rounded-full border px-2.5 md:px-3 py-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md transition-all ${
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
                  className={`rounded-full border px-2.5 md:px-3 py-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md transition-all ${
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
              <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 z-20 rounded-2xl border border-cyan-400/20 bg-slate-950/80 px-3 md:px-4 py-2.5 md:py-3 text-[11px] md:text-xs text-cyan-100 shadow-2xl backdrop-blur-xl">
                Tap the globe to place a weather pin. Cancel pin mode to scroll normally.
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
                savedPlaces={savedPlaces}
                isPinMode={isPinMode}
                onPinLocation={handlePinLocation}
                onSavedLocationSelect={handleSelectLocation}
              />
            </Suspense>

            {!selectedLocation && !isPinMode && (
              <div className="absolute inset-0 z-10 hidden md:flex items-center justify-center pointer-events-none px-4">
                <div className="pointer-events-auto w-full max-w-md rounded-[1.75rem] border border-white/10 bg-slate-950/55 px-5 py-5 text-center shadow-2xl backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300/80">
                    Start with a place
                  </p>
                  <h2 className="mt-2 text-lg md:text-xl font-black tracking-tight text-white/95">
                    See weather as a living map.
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/50">
                    Search a city, use your location, or choose any point on Earth.
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleFocusSearch}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white/80 transition-all hover:border-cyan-300/45 hover:bg-cyan-400/10 hover:text-cyan-100"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white/80 transition-all hover:border-cyan-300/45 hover:bg-cyan-400/10 hover:text-cyan-100"
                    >
                      Near me
                    </button>
                    <button
                      type="button"
                      onClick={handleStartPinMode}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white/80 transition-all hover:border-cyan-300/45 hover:bg-cyan-400/10 hover:text-cyan-100"
                    >
                      Drop pin
                    </button>
                  </div>
                </div>
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
              onFocusSearch={handleFocusSearch}
              onUseCurrentLocation={handleUseCurrentLocation}
              onStartPinMode={handleStartPinMode}
              isPinMode={isPinMode}
            />
          </div>
        </div>
      </main>

      {appToast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-5 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                appToast.type === 'success'
                  ? 'bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.75)]'
                  : 'bg-rose-300 shadow-[0_0_18px_rgba(253,164,175,0.75)]'
              }`}
            />
            <div className="min-w-0">
              <p className="font-semibold tracking-wide text-white/90">{appToast.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/55">{appToast.detail}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;