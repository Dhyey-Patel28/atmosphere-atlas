import { useState } from 'react';
import type { WeatherData } from '../types/weather';
import { getBestActivityTime, type ActivityType } from '../lib/activityPlanner';

const ACTIVITIES: ActivityType[] = ['Walk', 'Run', 'Bike', 'Drive', 'Photography', 'Stargazing'];

interface ActivityPlannerProps {
  weather: WeatherData;
}

export function ActivityPlanner({ weather }: ActivityPlannerProps) {
  const [selected, setSelected] = useState<ActivityType>('Walk');

  const recommendation = getBestActivityTime(selected, weather);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden transition-all hover:bg-white/10 mt-1 shadow-lg">
      <h4 className="text-white/60 uppercase tracking-widest text-xs font-semibold">Activity Planner</h4>
      
      {/* Scrollable Pills */}
      <div 
        className="flex overflow-x-auto gap-2 pb-2 -mx-2 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
        <div className="flex gap-2 scrollbar-hide">
          {ACTIVITIES.map((act) => (
            <button
              key={act}
              onClick={() => setSelected(act)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                selected === act 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                  : 'bg-white/5 border-transparent text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      <div className="flex flex-col gap-1">
        <span className="text-white/50 text-xs uppercase tracking-wider">Best Time</span>
        <div className="flex items-baseline gap-3">
          <span className="text-white font-bold text-2xl tracking-tight">{recommendation.timeLabel}</span>
        </div>
        <p className="text-white/80 text-sm mt-2 leading-relaxed border-l-2 border-cyan-500/50 pl-3">
          {recommendation.reason}
        </p>
      </div>
    </div>
  );
}
