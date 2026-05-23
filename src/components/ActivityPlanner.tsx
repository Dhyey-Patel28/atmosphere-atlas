import { useState } from 'react';
import type { WeatherData } from '../types/weather';
import type { TemperatureUnit } from '../lib/units';
import { getBestActivityTime, type ActivityType } from '../lib/activityPlanner';

const ACTIVITIES: ActivityType[] = ['Walk', 'Run', 'Bike', 'Drive', 'Photography', 'Stargazing'];

interface ActivityPlannerProps {
  weather: WeatherData;
  unit: TemperatureUnit;
}

export function ActivityPlanner({ weather, unit }: ActivityPlannerProps) {
  const [selected, setSelected] = useState<ActivityType>('Walk');

  const recommendation = getBestActivityTime(selected, weather, unit);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden transition-all hover:bg-white/10 mt-1 shadow-lg">
      <h4 className="text-white/60 uppercase tracking-widest text-xs font-semibold">Activity Planner</h4>
      
      {/* Activity Selection Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {ACTIVITIES.map((act) => (
          <button
            key={act}
            onClick={() => setSelected(act)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              selected === act 
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10'
            }`}
          >
            {act}
          </button>
        ))}
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
