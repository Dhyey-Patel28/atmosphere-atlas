import type { AirQualityData } from '../types/weather';

interface AirQualityCardProps {
  airQuality: AirQualityData | null;
  isLoading: boolean;
  error: string | null;
}

export function AirQualityCard({ airQuality, isLoading, error }: AirQualityCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden mt-1 shadow-lg animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-white/10 rounded"></div>
          <div className="h-6 w-12 bg-white/10 rounded-full"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-12 bg-white/10 rounded"></div>
          <div className="h-10 w-px bg-white/10"></div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 w-20 bg-white/10 rounded"></div>
            <div className="h-3 w-40 bg-white/10 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-white/10">
          <div className="h-10 bg-white/10 rounded"></div>
          <div className="h-10 bg-white/10 rounded"></div>
          <div className="h-10 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 border border-red-500/20 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden mt-1 shadow-lg">
        <h4 className="text-white/60 uppercase tracking-widest text-xs font-semibold">Air Quality</h4>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!airQuality || !airQuality.current) return null;

  const { us_aqi, pm2_5, pm10, ozone } = airQuality.current;

  // Determine health category and color based on US AQI
  let aqiColor = 'text-green-400';
  let aqiBgGlow = 'from-green-500/20';
  let healthLabel = 'Good';
  let healthAdvice = 'Air quality is satisfactory, and air pollution poses little or no risk.';

  if (us_aqi !== undefined) {
    if (us_aqi <= 50) {
      aqiColor = 'text-green-400';
      aqiBgGlow = 'from-green-500/20';
      healthLabel = 'Good';
      healthAdvice = 'Air quality is satisfactory, and air pollution poses little or no risk.';
    } else if (us_aqi <= 100) {
      aqiColor = 'text-yellow-400';
      aqiBgGlow = 'from-yellow-500/20';
      healthLabel = 'Moderate';
      healthAdvice = 'Acceptable air quality. Unusually sensitive people should consider limiting prolonged outdoor exertion.';
    } else if (us_aqi <= 150) {
      aqiColor = 'text-orange-400';
      aqiBgGlow = 'from-orange-500/20';
      healthLabel = 'Sensitive Groups';
      healthAdvice = 'Sensitive groups may experience health effects. General public is not likely to be affected.';
    } else if (us_aqi <= 200) {
      aqiColor = 'text-red-400';
      aqiBgGlow = 'from-red-500/20';
      healthLabel = 'Unhealthy';
      healthAdvice = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.';
    } else if (us_aqi <= 300) {
      aqiColor = 'text-purple-400';
      aqiBgGlow = 'from-purple-500/20';
      healthLabel = 'Very Unhealthy';
      healthAdvice = 'Health alert: everyone may experience more serious health effects. Limit outdoor activity.';
    } else {
      aqiColor = 'text-red-600';
      aqiBgGlow = 'from-red-900/20';
      healthLabel = 'Hazardous';
      healthAdvice = 'Health warnings of emergency conditions. The entire population is more likely to be affected.';
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden transition-all hover:bg-white/10 mt-1 shadow-lg">
      {/* Background glow */}
      <div className={`absolute -right-16 -bottom-16 w-36 h-36 rounded-full bg-gradient-to-br ${aqiBgGlow} to-transparent blur-3xl pointer-events-none`}></div>
      
      <div className="flex justify-between items-center z-10">
        <h4 className="text-white/60 uppercase tracking-widest text-xs font-semibold">Air Quality</h4>
        {us_aqi !== undefined && (
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 ${aqiColor}`}>
            {healthLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-5 z-10">
        <div className="flex flex-col">
          <span className={`text-4xl font-extrabold tracking-tight ${aqiColor}`}>
            {us_aqi !== undefined ? us_aqi : '--'}
          </span>
          <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mt-1">US AQI</span>
        </div>

        <div className="h-10 w-px bg-white/10"></div>

        <div className="flex-1">
          <p className="text-white/80 text-sm leading-relaxed">
            {healthAdvice}
          </p>
        </div>
      </div>

      {/* Pollutant details grid */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-white/10 z-10 text-center md:text-left">
        <div className="flex flex-col gap-0.5">
          <span className="text-white/40 text-[10px] uppercase tracking-wider">PM2.5</span>
          <span className="text-white/90 text-sm font-semibold">
            {pm2_5 !== undefined ? `${pm2_5.toFixed(1)} µg/m³` : '--'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-white/40 text-[10px] uppercase tracking-wider">PM10</span>
          <span className="text-white/90 text-sm font-semibold">
            {pm10 !== undefined ? `${pm10.toFixed(1)} µg/m³` : '--'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-white/40 text-[10px] uppercase tracking-wider">Ozone</span>
          <span className="text-white/90 text-sm font-semibold">
            {ozone !== undefined ? `${ozone.toFixed(1)} µg/m³` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
