export function getWeatherDescription(code: number): string {
  const codeMap: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };

  return codeMap[code] || "Unknown condition";
}

import type { CurrentWeather } from '../types/weather';

export interface WeatherAdvice {
  clothing: string;
  commute: string;
  outdoor: string;
  health: string;
}

export function getWeatherAdvice(weather: CurrentWeather): WeatherAdvice {
  const { 
    temperature_2m: temp, 
    apparent_temperature: feelsLike, 
    relative_humidity_2m: humidity, 
    wind_speed_10m: wind, 
    precipitation: precip,
    is_day: isDay,
    weather_code: code
  } = weather;

  const advice: WeatherAdvice = {
    clothing: "",
    commute: "",
    outdoor: "",
    health: ""
  };

  // Clothing
  if (temp < 0) {
    advice.clothing = "Heavy winter coat, thermal layers, gloves, and a warm hat.";
  } else if (temp < 10) {
    advice.clothing = "A warm jacket or thick sweater is recommended.";
  } else if (temp < 18) {
    advice.clothing = "Light layers or a light jacket; it might feel brisk.";
  } else if (temp < 28) {
    advice.clothing = "Short sleeves, shorts, or light breathable fabrics.";
  } else {
    advice.clothing = "Extremely light clothing. Wear a hat and sunglasses.";
  }

  if (precip > 0) {
    advice.clothing += precip > 5 ? " Wear waterproof gear and boots." : " Bring an umbrella or raincoat.";
  }

  // Commute
  if (precip > 5 || code === 75 || code === 95 || code === 99) {
    advice.commute = "Expect significant delays. Roads will be hazardous.";
  } else if (precip > 0) {
    advice.commute = "Roads may be slick. Drive carefully and leave early.";
  } else if (wind > 40) {
    advice.commute = "Strong crosswinds; be cautious on bridges and open roads.";
  } else if (code === 45 || code === 48) {
    advice.commute = "Fog limits visibility. Use low-beam headlights.";
  } else {
    advice.commute = "Clear conditions. No weather-related transit delays expected.";
  }

  // Outdoor Activity
  if (temp < -10 || temp > 35 || precip > 10 || wind > 50 || code > 90) {
    advice.outdoor = "Stay indoors. Conditions are too severe for outdoor activities.";
  } else if (precip > 0 || wind > 25) {
    advice.outdoor = "Not ideal for extended outdoor plans. Consider indoor alternatives.";
  } else if (temp > 18 && temp < 28 && humidity < 70 && isDay) {
    advice.outdoor = "Perfect conditions for a run, hike, or park visit.";
  } else if (!isDay) {
    advice.outdoor = "It's nighttime. Bring a flashlight or reflective gear if running.";
  } else {
    advice.outdoor = "Acceptable conditions for going out, but dress appropriately.";
  }

  // Health & Comfort
  if (feelsLike > 32) {
    advice.health = "High risk of heat exhaustion. Stay hydrated and avoid direct sun.";
  } else if (feelsLike < -5) {
    advice.health = "Frostbite risk on exposed skin. Limit time outside.";
  } else if (humidity > 80 && temp > 22) {
    advice.health = "High humidity makes it feel sticky and restricts sweat evaporation.";
  } else if (humidity < 30) {
    advice.health = "Dry air. Use moisturizer and drink plenty of water.";
  } else {
    advice.health = "Comfortable baseline. No major weather-related health risks.";
  }

  return advice;
}
