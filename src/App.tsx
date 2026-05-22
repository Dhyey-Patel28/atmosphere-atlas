import { useState, useEffect, lazy, Suspense } from 'react';
import { SearchBar } from './components/SearchBar';
import { WeatherPanel } from './components/WeatherPanel';
import { SavedPlaces, loadSavedPlaces, persistSavedPlaces } from './components/SavedPlaces';
import { fetchWeather, fetchAirQuality } from './lib/openMeteo';
import type { Location, WeatherData, AirQualityData } from './types/weather';

const GlobeView = lazy(() =>
  import('./components/GlobeView').then((m) => ({ default: m.GlobeView }))
);

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

  useEffect(() => {
    persistSavedPlaces(savedPlaces);
  }, [savedPlaces]);

  function handleSelectLocation(location: Location) {
    setSelectedLocation({ ...location });

    setWeather(null);
    setWeatherError(null);
    setIsWeatherLoading(true);

    setAirQuality(null);
    setAqError(null);
    setIsAqLoading(true);
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
    const pinnedLocation: Location = {
      id: -Date.now(),
      name: 'Pinned location',
      latitude: Number(coords.lat.toFixed(4)),
      longitude: Number(coords.lng.toFixed(4)),
      admin1: 'Dropped pin',
      country: `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`,
      isPinned: true,
    };

    handleSelectLocation(pinnedLocation);
    setIsPinMode(false);
  }

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
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />

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
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md transition-all ${
                  isPinMode
                    ? 'border-cyan-300/70 bg-cyan-400/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                    : 'border-white/15 bg-slate-950/60 text-white/70 hover:border-cyan-400/50 hover:text-cyan-100'
                }`}
              >
                {isPinMode ? 'Cancel pin' : 'Drop pin'}
              </button>
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
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;