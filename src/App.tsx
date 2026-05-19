import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { WeatherPanel } from './components/WeatherPanel';
import { fetchWeather } from './lib/openMeteo';
import type { Location, WeatherData } from './types/weather';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeather() {
      if (!selectedLocation) return;
      
      setIsWeatherLoading(true);
      setWeatherError(null);
      
      try {
        const data = await fetchWeather(selectedLocation.latitude, selectedLocation.longitude);
        setWeather(data);
      } catch (err) {
        setWeatherError('Failed to retrieve weather data.');
      } finally {
        setIsWeatherLoading(false);
      }
    }

    loadWeather();
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
          <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[40vh] xl:min-h-0">
            {selectedLocation ? (
              <div className="text-center animate-fade-in flex flex-col items-center justify-center">
                <div className="w-48 h-48 md:w-80 md:h-80 rounded-full border border-cyan-500/30 bg-cyan-900/20 backdrop-blur-sm flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(6,182,212,0.1)] transition-all">
                   <span className="text-cyan-400/50 text-6xl md:text-8xl">&#127757;</span>
                </div>
                <h2 className="text-white text-3xl md:text-5xl font-semibold tracking-tight mb-2">
                  {selectedLocation.name}
                </h2>
                <p className="text-white/60 text-lg md:text-xl font-light mt-2">
                  {selectedLocation.admin1 ? `${selectedLocation.admin1}, ` : ''}{selectedLocation.country}
                </p>
              </div>
            ) : (
              <div className="text-center animate-pulse flex flex-col items-center justify-center">
                <div className="w-48 h-48 md:w-80 md:h-80 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(255,255,255,0.03)] transition-all">
                  <span className="text-white/10 text-6xl md:text-8xl">&#127758;</span>
                </div>
                <p className="text-white/60 text-lg md:text-xl tracking-wide font-light mt-2">Search a city to begin.</p>
              </div>
            )}
          </div>

          {/* Weather Panel Component */}
          <WeatherPanel 
            location={selectedLocation} 
            weather={weather} 
            isLoading={isWeatherLoading} 
            error={weatherError} 
          />

        </main>
      </div>
    </div>
  )
}

export default App
