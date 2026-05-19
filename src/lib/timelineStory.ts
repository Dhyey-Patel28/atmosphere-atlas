import type { WeatherData } from '../types/weather';

export interface TimelineEvent {
  id: string;
  timeLabel: string;
  timestamp: number;
  title: string;
  description: string;
  iconType: 'peak' | 'drop' | 'rain' | 'wind' | 'sun' | 'info';
}

export function generateTimeline(weather: WeatherData): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const hourly = weather.hourly;
  if (!hourly || !hourly.time || hourly.time.length === 0) return events;

  // Find the index corresponding to the current time (or next hour)
  const now = new Date();
  let startIndex = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    if (new Date(hourly.time[i]).getTime() > now.getTime()) {
      startIndex = Math.max(0, i - 1);
      break;
    }
  }

  // Look ahead 12 hours
  const endIndex = Math.min(startIndex + 12, hourly.time.length);
  
  let peakTemp = -999;
  let peakIndex = -1;
  let rainIndex = -1;
  let windIndex = -1;
  
  // Sunset detection
  const sunsetTime = weather.daily.sunset[0] ? new Date(weather.daily.sunset[0]).getTime() : 0;
  let sunsetEventAdded = false;

  // 1. Scan for key events
  for (let i = startIndex; i < endIndex; i++) {
    const temp = hourly.temperature_2m[i];
    const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
    const wind = hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : 0;
    const timeVal = new Date(hourly.time[i]).getTime();

    // Track highest temperature
    if (temp > peakTemp) {
      peakTemp = temp;
      peakIndex = i;
    }

    // Rain risk
    if (precipProb > 40 && rainIndex === -1) {
      rainIndex = i;
      events.push({
        id: `rain-${i}`,
        timeLabel: "",
        timestamp: timeVal,
        title: "Rain Risk Increases",
        description: `Precipitation chance rises to ${precipProb}%.`,
        iconType: 'rain'
      });
    }

    // Wind picking up
    if (wind > 25 && windIndex === -1 && i > startIndex) {
      const prevWind = hourly.wind_speed_10m ? hourly.wind_speed_10m[i-1] : 0;
      if (wind > prevWind + 5) {
        windIndex = i;
        events.push({
          id: `wind-${i}`,
          timeLabel: "",
          timestamp: timeVal,
          title: "Wind Picking Up",
          description: `Breezes strengthening to ${Math.round(wind)} km/h.`,
          iconType: 'wind'
        });
      }
    }

    // Sunset transition
    if (!sunsetEventAdded && sunsetTime > 0 && timeVal >= sunsetTime && timeVal < sunsetTime + 3600000) {
      sunsetEventAdded = true;
      events.push({
        id: `sunset-${i}`,
        timeLabel: "",
        timestamp: sunsetTime,
        title: "Sunset",
        description: "Daylight ends. Temperatures may begin to drop.",
        iconType: 'sun'
      });
    }
  }

  // 2. Add Peak and Drop events based on scanned data
  if (peakIndex >= startIndex) {
    const timeVal = new Date(hourly.time[peakIndex]).getTime();
    events.push({
      id: `peak-${peakIndex}`,
      timeLabel: "",
      timestamp: timeVal,
      title: "Temperature Peak",
      description: `High point of the next 12 hours at ${Math.round(peakTemp)}°.`,
      iconType: 'peak'
    });

    // Look for a significant drop after the peak
    for (let i = peakIndex + 1; i < endIndex; i++) {
      if (hourly.temperature_2m[i] < peakTemp - 4) {
        events.push({
          id: `drop-${i}`,
          timeLabel: "",
          timestamp: new Date(hourly.time[i]).getTime(),
          title: "Cooling Down",
          description: `Temperature drops significantly to ${Math.round(hourly.temperature_2m[i])}°.`,
          iconType: 'drop'
        });
        break; // Only capture the first significant drop
      }
    }
  }

  // 3. Ensure we have at least 4 events to tell a good story
  if (events.length < 4) {
      events.push({
        id: `start-${startIndex}`,
        timeLabel: "",
        timestamp: new Date(hourly.time[startIndex]).getTime(),
        title: "Current Trend",
        description: `Starting the period at ${Math.round(hourly.temperature_2m[startIndex])}°.`,
        iconType: 'info'
      });
      
      const midIndex = Math.floor((startIndex + endIndex) / 2);
      events.push({
        id: `mid-${midIndex}`,
        timeLabel: "",
        timestamp: new Date(hourly.time[midIndex]).getTime(),
        title: "Midpoint Check",
        description: `Continuing steady at ${Math.round(hourly.temperature_2m[midIndex])}°.`,
        iconType: 'info'
      });
  }

  // 4. Sort chronologically and deduplicate
  const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());
  uniqueEvents.sort((a, b) => a.timestamp - b.timestamp);
  
  // Cap at 6 events maximum
  const finalEvents = uniqueEvents.slice(0, 6);

  // Format the time strings for the UI
  return finalEvents.map(e => ({
    ...e,
    timeLabel: new Date(e.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }));
}
