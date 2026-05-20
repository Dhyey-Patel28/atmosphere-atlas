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

  // Saved places — initialised from localStorage
  const [savedPlaces, setSavedPlaces] = useState<Location[]>(() => loadSavedPlaces());

  // Persist whenever savedPlaces changes
  useEffect(() => {
    persistSavedPlaces(savedPlaces);
  }, [savedPlaces]);

  // Save the current location (guard duplicates, max 10)
  function handleSave() {
    if (!selectedLocation) return;
    setSavedPlaces((prev) => {
      if (prev.some((p) => p.id === selectedLocation.id)) return prev;
      return [...prev, selectedLocation].slice(0, 10);
    });
  }

  // Remove a saved place by id
  function handleRemove(id: number) {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
  }

  // Fetch weather + air quality whenever location changes
  useEffect(() => {
    if (!selectedLocation) {
      setWeather(null);
      setAirQuality(null);
      return;
    }

    const loc = selectedLocation;

    async function loadWeather() {
      setIsWeatherLoading(true);
      setWeatherError(null);
      try {
        const data = await fetchWeather(loc.latitude, loc.longitude);
        setWeather(data);
      } catch {
        setWeatherError('Failed to retrieve weather data.');
      } finally {
        setIsWeatherLoading(false);
      }
    }

    async function loadAirQuality() {
      setIsAqLoading(true);
      setAqError(null);
      try {
        const data = await fetchAirQuality(loc.latitude, loc.longitude);
        setAirQuality(data);
      } catch {
        setAqError('Failed to retrieve air quality data.');
      } finally {
        setIsAqLoading(false);
      }
    }

    loadWeather();
    loadAirQuality();
  }, [selectedLocation]);

  return (
    <div className="relative w-full h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="relative z-50 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-xl shrink-0">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <h1 className="text-sm md:text-base font-black tracking-[0.25em] text-white/90 uppercase whitespace-nowrap bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              ATMOSPHERE ATLAS
            </h1>
          </div>

          {/* Search bar & Saved places row */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 min-w-0">
            <div className="w-full md:max-w-xs lg:max-w-sm">
              <SearchBar onLocationSelect={setSelectedLocation} />
            </div>

            {(savedPlaces.length > 0 || selectedLocation) && (
              <div className="flex items-center min-w-0">
                <SavedPlaces
                  places={savedPlaces}
                  selectedLocation={selectedLocation}
                  onSelect={setSelectedLocation}
                  onSave={handleSave}
                  onRemove={handleRemove}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col overflow-y-auto xl:overflow-hidden">
        <div className="flex-1 flex flex-col xl:flex-row gap-4 xl:gap-6 min-h-0 h-full">

          {/* Globe Container */}
          <div className="relative flex-none xl:flex-1 flex flex-col rounded-[2rem] overflow-hidden bg-slate-900/10 border border-white/5 shadow-2xl backdrop-blur-sm
                          h-[45vw] max-h-[300px]
                          xl:h-full xl:max-h-none xl:min-h-0">
            <Suspense fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-sm">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">Initializing Globe System...</p>
              </div>
            }>
              <GlobeView location={selectedLocation} />
            </Suspense>
            {!selectedLocation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <p className="text-white/50 text-sm md:text-base tracking-widest font-light
                               bg-slate-950/60 px-5 py-2.5 rounded-full backdrop-blur-md
                               border border-white/10 animate-pulse uppercase">
                  Search a city to begin
                </p>
              </div>
            )}
          </div>

          {/* Weather Panel Container */}
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
