import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { WeatherPanel } from './components/WeatherPanel';
import { GlobeView } from './components/GlobeView';
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
      } catch (err) {
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
      } catch (err) {
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
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none"></div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen p-4 md:p-6 lg:p-8 gap-8 w-full max-w-[1800px] mx-auto">
        
        {/* Header Navigation */}
        <header className="grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-3 items-center gap-6 w-full z-30">
          {/* Header Title */}
          <div className="flex justify-center md:justify-start">
            <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white/90 drop-shadow-md whitespace-nowrap">
              ATMOSPHERE ATLAS
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center md:justify-end lg:justify-center w-full">
            <SearchBar onLocationSelect={setSelectedLocation} />
          </div>
          
          {/* Spacer for large screens to keep search centered */}
          <div className="hidden lg:block"></div>
        </header>

        {/* Main Globe Area & Weather Panel */}
        <main className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-12 w-full pb-8 xl:pb-0 z-10">
          
          {/* Globe Area */}
          <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[50vh] xl:min-h-0 relative">
            <GlobeView location={selectedLocation} />
            
            {!selectedLocation && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                <p className="text-white/50 text-lg md:text-xl tracking-wide font-light bg-slate-950/50 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 animate-pulse">
                  Search a city to begin.
                </p>
              </div>
            )}
          </div>

          {/* Weather Panel Component */}
          <WeatherPanel 
            location={selectedLocation} 
            weather={weather} 
            isLoading={isWeatherLoading} 
            error={weatherError} 
            airQuality={airQuality}
            isAqLoading={isAqLoading}
            aqError={aqError}
          />

        </main>
      </div>
    </div>
  )
}

export default App
