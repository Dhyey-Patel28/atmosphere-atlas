export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  relative_humidity_2m: number;
}

export interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  precipitation_sum?: number[];
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  wind_speed_10m?: number[];
  precipitation_probability?: number[];
  cloud_cover?: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyWeather;
  hourly: HourlyWeather;
  timezone: string;
}

export interface AirQualityData {
  current: {
    us_aqi?: number;
    pm10?: number;
    pm2_5?: number;
    ozone?: number;
  };
}
