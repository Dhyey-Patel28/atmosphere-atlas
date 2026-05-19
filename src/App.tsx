import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { WeatherPanel } from './components/WeatherPanel';
import { GlobeView } from './components/GlobeView';
import { SavedPlaces, loadSavedPlaces, persistSavedPlaces } from './components/SavedPlaces';
import { fetchWeather, fetchAirQuality } from './lib/openMeteo';
import type { Location, WeatherData, AirQualityData } from './types/weather';

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

  // Save the current location (guard duplicates)
  function handleSave() {
    if (!selectedLocation) return;
    setSavedPlaces((prev) => {
      if (prev.some((p) => p.id === selectedLocation.id)) return prev;
      return [...prev, selectedLocation];
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
    <div className="relative w-full min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black z-0 pointer-events-none" />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8">
          {/* Top row: logo + search */}
          <div className="flex items-center gap-4 py-3">
            <h1 className="text-base md:text-lg font-bold tracking-[0.2em] text-white/90 whitespace-nowrap shrink-0">
              ATMOSPHERE ATLAS
            </h1>
            <div className="flex-1 flex justify-center">
              <SearchBar onLocationSelect={setSelectedLocation} />
            </div>
          </div>

          {/* Saved places row — only rendered when there's something to show */}
          {(savedPlaces.length > 0 || selectedLocation) && (
            <div className="pb-2.5 flex items-center gap-2 overflow-hidden">
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
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 w-full max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 xl:h-[calc(100vh-5rem)]">

          {/* Globe */}
          <div className="relative flex-1 flex flex-col rounded-[2rem] overflow-hidden bg-slate-900/20 border border-white/5 shadow-2xl
                          h-[56vw] max-h-[420px]
                          xl:h-auto xl:max-h-none xl:min-h-0">
            <GlobeView location={selectedLocation} />
            {!selectedLocation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-white/50 text-base md:text-lg tracking-wide font-light
                               bg-slate-950/60 px-5 py-2.5 rounded-full backdrop-blur-md
                               border border-white/10 animate-pulse">
                  Search a city to begin.
                </p>
              </div>
            )}
          </div>

          {/* Weather Panel */}
          <div className="w-full xl:w-[420px] xl:shrink-0 xl:h-full">
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
