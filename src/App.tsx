function App() {
  return (
    <div className="relative w-full min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none"></div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen p-4 md:p-6 lg:p-8 gap-8 w-full max-w-[1800px] mx-auto">
        
        {/* Header Navigation */}
        <header className="grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-3 items-center gap-6 w-full">
          {/* Header Title */}
          <div className="flex justify-center md:justify-start">
            <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white/90 drop-shadow-md whitespace-nowrap">
              ATMOSPHERE ATLAS
            </h1>
          </div>

          {/* Search Bar Placeholder */}
          <div className="flex justify-center md:justify-end lg:justify-center w-full">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 md:p-4 shadow-xl flex items-center gap-3 transition-all hover:bg-white/15 cursor-not-allowed">
              <span className="text-white/60 text-lg md:text-xl ml-2">&#8981;</span>
              <input 
                type="text" 
                placeholder="Search city..." 
                className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/50 text-sm md:text-base cursor-not-allowed"
                disabled
              />
            </div>
          </div>
          
          {/* Spacer for large screens to keep search centered */}
          <div className="hidden lg:block"></div>
        </header>

        {/* Main Globe Area & Weather Panel */}
        <main className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-12 w-full pb-8 xl:pb-0">
          
          {/* Globe Area */}
          <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[40vh] xl:min-h-0">
            <div className="text-center animate-pulse flex flex-col items-center justify-center">
              <div className="w-48 h-48 md:w-80 md:h-80 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(255,255,255,0.03)] transition-all">
                <span className="text-white/10 text-6xl md:text-8xl">&#127758;</span>
              </div>
              <p className="text-white/60 text-lg md:text-xl tracking-wide font-light">Search a city to begin.</p>
            </div>
          </div>

          {/* Weather Panel Placeholder */}
          <aside className="w-full max-w-md xl:max-w-none xl:w-[400px] shrink-0 opacity-50 flex flex-col items-center xl:items-stretch justify-center">
            <div className="w-full bg-slate-900/30 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl h-64 xl:h-[75vh] flex flex-col gap-4">
              <div className="h-6 w-1/3 bg-white/10 rounded-full"></div>
              <div className="flex-1 bg-white/5 rounded-2xl border border-white/5"></div>
              <div className="h-32 bg-white/5 rounded-2xl border border-white/5"></div>
            </div>
          </aside>

        </main>
      </div>
    </div>
  )
}

export default App
