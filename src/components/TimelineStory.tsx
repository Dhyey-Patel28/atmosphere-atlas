import type { TimelineEvent } from '../lib/timelineStory';

interface TimelineStoryProps {
  events: TimelineEvent[];
}

export function TimelineStory({ events }: TimelineStoryProps) {
  if (!events || events.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden transition-all hover:bg-white/10 mt-1 shadow-lg">
      <h4 className="text-white/60 uppercase tracking-widest text-xs font-semibold mb-2">12-Hour Story</h4>
      
      <div className="relative pl-5 ml-1 mt-1 border-l-2 border-white/10 flex flex-col gap-6">
        {events.map((event) => {
          let dotColor = "bg-white/50 shadow-white/30";
          if (event.iconType === 'rain') dotColor = "bg-blue-400 shadow-blue-400/50";
          if (event.iconType === 'wind') dotColor = "bg-gray-300 shadow-gray-300/50";
          if (event.iconType === 'peak') dotColor = "bg-orange-400 shadow-orange-400/50";
          if (event.iconType === 'drop') dotColor = "bg-cyan-400 shadow-cyan-400/50";
          if (event.iconType === 'sun') dotColor = "bg-yellow-400 shadow-yellow-400/50";

          // Extract color class for text styling
          const textColor = dotColor.split(' ')[0].replace('bg-', 'text-');

          return (
            <div key={event.id} className="relative flex flex-col">
              {/* Timeline Glowing Node */}
              <div className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full ${dotColor} shadow-[0_0_10px_var(--tw-shadow-color)]`}></div>
              
              <div className="flex flex-col mb-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-white/80 font-bold text-sm min-w-[70px]">{event.timeLabel}</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{event.title}</span>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{event.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
