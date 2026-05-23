import type { WeatherData } from '../types/weather';
import type { TemperatureUnit } from '../lib/units';
import { formatTemperatureCompact, formatWindSpeed } from '../lib/units';

export type ActivityType = 'Walk' | 'Run' | 'Bike' | 'Drive' | 'Photography' | 'Stargazing';

export interface ActivityRecommendation {
  activity: ActivityType;
  timeLabel: string;
  reason: string;
}

export function getBestActivityTime(
  activity: ActivityType,
  weather: WeatherData,
  unit: TemperatureUnit = 'C'
): ActivityRecommendation {
  const hourly = weather.hourly;
  const now = new Date();
  const currentHourTime = now.getTime();
  
  if (!hourly || !hourly.time || hourly.time.length === 0) {
    return { activity, timeLabel: "N/A", reason: "Weather data unavailable." };
  }

  // Find start index (current hour)
  let startIndex = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    if (new Date(hourly.time[i]).getTime() > currentHourTime) {
      startIndex = Math.max(0, i - 1);
      break;
    }
  }

  // Look ahead up to 24 hours (or end of available data)
  const endIndex = Math.min(startIndex + 24, hourly.time.length);
  
  let bestScore = -9999;
  let bestIndex = -1;
  const fallbackReason = "Conditions are not ideal today.";

  const sunrise = weather.daily.sunrise[0] ? new Date(weather.daily.sunrise[0]).getTime() : 0;
  const sunset = weather.daily.sunset[0] ? new Date(weather.daily.sunset[0]).getTime() : 0;

  for (let i = startIndex; i < endIndex; i++) {
    const temp = hourly.temperature_2m[i];
    const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
    const wind = hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : 0;
    const clouds = hourly.cloud_cover ? hourly.cloud_cover[i] : 0;
    const timeVal = new Date(hourly.time[i]).getTime();

    // Rough check for day/night
    const isDay = timeVal >= sunrise && timeVal < sunset;

    let score = 100;

    switch (activity) {
      case 'Walk':
        score -= precipProb * 2;
        score -= wind * 1.5;
        if (temp < 15) score -= (15 - temp) * 2;
        if (temp > 25) score -= (temp - 25) * 3;
        break;

      case 'Run':
        score -= precipProb * 2;
        if (wind > 20) score -= (wind - 20) * 1.5;
        if (temp < 10) score -= (10 - temp) * 2;
        if (temp > 18) score -= (temp - 18) * 3;
        break;

      case 'Bike':
        score -= precipProb * 3;
        score -= wind * 2.5;
        if (temp < 10) score -= (10 - temp) * 2;
        if (temp > 28) score -= (temp - 28) * 2;
        if (!isDay) score -= 20; 
        break;

      case 'Drive':
        score -= precipProb * 1.5;
        if (wind > 40) score -= (wind - 40) * 2;
        break;

      case 'Photography': {
        const diffSunrise = Math.abs(timeVal - sunrise) / 3600000;
        const diffSunset = Math.abs(timeVal - sunset) / 3600000;
        const isGoldenHour = diffSunrise <= 1.5 || diffSunset <= 1.5;
        
        if (isGoldenHour) score += 50;
        else if (!isDay) score -= 50;
        
        score -= precipProb * 2;
        // Moderate clouds are great, totally clear or totally overcast is less ideal
        if (clouds < 20 || clouds > 80) score -= 20;
        break;
      }

      case 'Stargazing':
        if (isDay) {
          score -= 200; 
        } else {
          score -= precipProb * 3;
          score -= clouds * 2; 
        }
        break;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  let reason = fallbackReason;
  let timeLabel = "N/A";

  if (bestIndex !== -1) {
    const bestTemp = hourly.temperature_2m[bestIndex];
    const bestWind = hourly.wind_speed_10m ? hourly.wind_speed_10m[bestIndex] : 0;
    const bestClouds = hourly.cloud_cover ? hourly.cloud_cover[bestIndex] : 0;
    const bestPrecip = hourly.precipitation_probability ? hourly.precipitation_probability[bestIndex] : 0;
    timeLabel = new Date(hourly.time[bestIndex]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (bestScore < 0) {
      timeLabel = "Not Recommended";
      if (activity === 'Stargazing') reason = "Too cloudy or raining tonight.";
      else reason = "Severe weather makes this activity unsafe today.";
    } else {
      switch (activity) {
        case 'Walk':
          if (bestPrecip === 0 && bestWind < 15 && bestTemp > 10 && bestTemp < 28) reason = `Perfect conditions: ${formatTemperatureCompact(bestTemp, unit)} and clear.`;
          else reason = `Most comfortable window: ${formatTemperatureCompact(bestTemp, unit)} and ${formatWindSpeed(bestWind, unit)} wind.`;
          break;
        case 'Run':
          reason = `Optimal running conditions: cooler at ${formatTemperatureCompact(bestTemp, unit)}.`;
          break;
        case 'Bike':
          if (bestWind < 15) reason = `Low winds (${formatWindSpeed(bestWind, unit)}) make this the smoothest ride.`;
          else reason = `Best available window, but expect ${formatWindSpeed(bestWind, unit)} winds.`;
          break;
        case 'Drive':
          if (bestPrecip === 0) reason = `Clear roads and low precipitation risk.`;
          else reason = `Safest driving window, though some precipitation is possible.`;
          break;
        case 'Photography':
          if (bestClouds > 20 && bestClouds < 80) reason = "Great natural lighting with interesting cloud cover.";
          else reason = "Best available natural light.";
          break;
        case 'Stargazing':
          if (bestClouds < 20) reason = "Very clear night skies ahead.";
          else reason = `Clearest window tonight, though ${Math.round(bestClouds)}% cloud cover.`;
          break;
      }
    }
    
    // If the best time is exactly the current hour
    if (bestIndex === startIndex && bestScore > 0) {
      timeLabel = "Right Now";
      reason = "Conditions are currently perfect. " + reason;
    }
  }

  return { activity, timeLabel, reason };
}
