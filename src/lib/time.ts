/**
 * Approximates the sun's current position (latitude and longitude).
 * 
 * - Longitude is based on UTC time (15 degrees per hour, with solar noon at UTC 12:00 over the prime meridian).
 * - Latitude is based on the day-of-year solar declination (oscillating between -23.44 and +23.44 degrees).
 * 
 * Note: This is a simple visual approximation for the dashboard, not a perfect scientific astronomy model.
 */
export function getSunPosition(date: Date = new Date()): { lat: number; lng: number } {
  // 1. Calculate Longitude based on UTC time.
  // The Earth rotates 360 degrees in 24 hours, which is 15 degrees per hour.
  // At 12:00 UTC, the sun is exactly at 0 degrees longitude.
  const hoursUTC = date.getUTCHours();
  const minutesUTC = date.getUTCMinutes();
  const secondsUTC = date.getUTCSeconds();
  
  const decimalHours = hoursUTC + minutesUTC / 60 + secondsUTC / 3600;
  // Offset by 12 hours so noon is at 0 degrees.
  let lng = (12 - decimalHours) * 15;
  
  // Wrap to -180..180
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;

  // 2. Calculate Latitude (Solar Declination) based on day of year.
  // Approximation formula for solar declination.
  const startOfYear = new Date(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Earth's axial tilt is ~23.44 degrees. 
  // Offset by ~10 days since the winter solstice is usually Dec 21, not Jan 1.
  const lat = -23.44 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));

  return { lat, lng };
}
