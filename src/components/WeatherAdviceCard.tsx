import type { WeatherAdvice } from '../lib/weatherText';

interface WeatherAdviceProps {
  advice: WeatherAdvice;
}

export function WeatherAdviceCard({ advice }: WeatherAdviceProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all hover:bg-white/10 mt-1 shadow-lg">
      <h4 className="text-white/60 uppercase tracking-widest text-xs font-semibold">Weather Translator</h4>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col">
          <span className="text-cyan-400 text-xs font-medium uppercase tracking-wider mb-0.5">Clothing</span>
          <span className="text-white/90 text-sm leading-snug">{advice.clothing}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-orange-400 text-xs font-medium uppercase tracking-wider mb-0.5">Commute</span>
          <span className="text-white/90 text-sm leading-snug">{advice.commute}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-green-400 text-xs font-medium uppercase tracking-wider mb-0.5">Outdoor Activity</span>
          <span className="text-white/90 text-sm leading-snug">{advice.outdoor}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-pink-400 text-xs font-medium uppercase tracking-wider mb-0.5">Health & Comfort</span>
          <span className="text-white/90 text-sm leading-snug">{advice.health}</span>
        </div>
      </div>
    </div>
  );
}
