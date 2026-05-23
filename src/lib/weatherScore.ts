import type { CurrentWeather } from '../types/weather';

interface LifeScoreResult {
  score: number;
  label: string;
  explanation: string;
}

function getLifeScoreLabel(score: number): string {
  if (score >= 90) return 'Perfect outside';
  if (score >= 75) return 'Great';
  if (score >= 55) return 'Okay';
  if (score >= 35) return 'Uncomfortable';
  return 'Avoid long exposure';
}

export function calculateLifeScore(weather: CurrentWeather): LifeScoreResult {
  let score = 100;
  const penalties: string[] = [];

  const temp = weather.apparent_temperature;

  if (temp < 18) {
    const diff = 18 - temp;
    score -= diff * 2;

    if (diff > 12) penalties.push('freezing conditions');
    else if (diff > 8) penalties.push('cold temperatures');
    else if (diff > 4) penalties.push('chilly weather');
  } else if (temp > 25) {
    const diff = temp - 25;
    score -= diff * 3;

    if (diff > 8) penalties.push('extreme heat');
    else if (diff > 4) penalties.push('very warm temperatures');
  }

  const precip = weather.precipitation;

  if (precip > 0) {
    score -= 15 + precip * 5;

    if (precip > 5) penalties.push('heavy precipitation');
    else penalties.push('precipitation');
  }

  const wind = weather.wind_speed_10m;

  if (wind > 20) {
    const diff = wind - 20;
    score -= diff * 1.5;

    if (wind > 40) penalties.push('strong winds');
    else if (wind > 25) penalties.push('breezy conditions');
  }

  const humidity = weather.relative_humidity_2m;

  if (temp > 22 && humidity > 60) {
    const diff = humidity - 60;
    score -= diff * 0.5;

    if (humidity > 80) penalties.push('high humidity');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const label = getLifeScoreLabel(score);

  let explanation = 'Conditions are ideal for outdoor activities.';

  if (penalties.length === 1) {
    explanation = `The score is lowered slightly by ${penalties[0]}.`;

    if (score < 55) {
      explanation = `It feels uncomfortable mainly due to ${penalties[0]}.`;
    }
  } else if (penalties.length > 1) {
    const listedPenalties = [...penalties];
    const last = listedPenalties.pop();

    explanation = `The score is impacted by ${listedPenalties.join(', ')} and ${last}.`;
  }

  if (score < 35) {
    explanation = `Severe conditions. Outdoor comfort is strongly reduced by ${
      penalties.length > 0 ? penalties.join(' and ') : 'extreme temperatures'
    }.`;
  }

  return {
    score,
    label,
    explanation,
  };
}