import type { CurrentWeather } from '../types/weather';

export function calculateLifeScore(weather: CurrentWeather): { score: number, label: string, explanation: string } {
  let score = 100;
  const penalties: string[] = [];
  
  // Apparent Temperature Penalty
  // Ideal is ~22C (72F). Let's say 18C to 25C is perfect (0 penalty).
  const temp = weather.apparent_temperature;
  if (temp < 18) {
    const diff = 18 - temp;
    score -= diff * 2; // e.g., 0C -> 18 * 2 = 36 deduction
    if (diff > 12) penalties.push("freezing conditions");
    else if (diff > 8) penalties.push("cold temperatures");
    else if (diff > 4) penalties.push("chilly weather");
  } else if (temp > 25) {
    const diff = temp - 25;
    score -= diff * 3; // e.g., 35C -> 10 * 3 = 30 deduction
    if (diff > 8) penalties.push("extreme heat");
    else if (diff > 4) penalties.push("very warm temperatures");
  }

  // Precipitation Penalty
  // mm per hour. > 0 is bad, > 2 is moderate rain, > 5 is heavy rain.
  const precip = weather.precipitation;
  if (precip > 0) {
    score -= 15 + (precip * 5); // baseline 15 deduction for any rain, plus intensity
    if (precip > 5) penalties.push("heavy precipitation");
    else penalties.push("precipitation");
  }

  // Wind Penalty
  // km/h. < 15 is light breeze. > 20 starts getting annoying. > 40 is strong.
  const wind = weather.wind_speed_10m;
  if (wind > 20) {
    const diff = wind - 20;
    score -= diff * 1.5;
    if (wind > 40) penalties.push("strong winds");
    else if (wind > 25) penalties.push("breezy conditions");
  }

  // Humidity Penalty (only matters if it's warm)
  const humidity = weather.relative_humidity_2m;
  if (temp > 22 && humidity > 60) {
    const diff = humidity - 60;
    score -= diff * 0.5;
    if (humidity > 80) penalties.push("high humidity");
  }

  // Clamp score strictly between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine Label
  let label = "";
  if (score >= 90) label = "Perfect outside";
  else if (score >= 75) label = "Great";
  else if (score >= 55) label = "Okay";
  else if (score >= 35) label = "Uncomfortable";
  else label = "Avoid long exposure";

  // Generate Explanation
  let explanation = "Conditions are ideal for outdoor activities.";
  
  if (penalties.length === 1) {
    explanation = `The score is lowered slightly by ${penalties[0]}.`;
    if (score < 55) explanation = `It feels uncomfortable mainly due to ${penalties[0]}.`;
  } else if (penalties.length > 1) {
    const last = penalties.pop();
    explanation = `The score is impacted by ${penalties.join(", ")} and ${last}.`;
  }

  if (score < 35 && (penalties.length > 0 || temp < 18 || temp > 25)) {
    explanation = `Severe conditions! Affected strongly by ${penalties.length > 0 ? penalties.join(" and ") : "extreme temperatures"}.`;
  }

  return { score, label, explanation };
}
