import type { CSSProperties } from 'react';
import type { CurrentWeather } from '../types/weather';

interface WeatherAmbience {
  backgroundStyle: CSSProperties;
}

/**
 * Atmosphere Atlas ambience should feel like lighting, not a theme switch.
 * Every condition keeps the same deep navy base and only changes faint color washes.
 */
const BASE = 'linear-gradient(to bottom, #020617 0%, #020617 58%, #000000 100%)';

function makeBackground(primary: string, secondary: string): CSSProperties {
  return {
    background: [
      `radial-gradient(circle at 18% 8%, ${primary}, transparent 34%)`,
      `radial-gradient(circle at 82% 18%, ${secondary}, transparent 38%)`,
      'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.035), transparent 34%)',
      BASE,
    ].join(', '),
  };
}

const DEFAULT_BACKGROUND = makeBackground(
  'rgba(30, 41, 59, 0.18)',
  'rgba(15, 23, 42, 0.12)'
);

const NIGHT_BACKGROUND = makeBackground(
  'rgba(59, 130, 246, 0.08)',
  'rgba(99, 102, 241, 0.06)'
);

const CLEAR_BACKGROUND = makeBackground(
  'rgba(56, 189, 248, 0.10)',
  'rgba(14, 165, 233, 0.06)'
);

const CLOUD_BACKGROUND = makeBackground(
  'rgba(148, 163, 184, 0.10)',
  'rgba(71, 85, 105, 0.08)'
);

const RAIN_BACKGROUND = makeBackground(
  'rgba(14, 165, 233, 0.09)',
  'rgba(30, 64, 175, 0.08)'
);

const THUNDER_BACKGROUND = makeBackground(
  'rgba(168, 85, 247, 0.10)',
  'rgba(14, 165, 233, 0.07)'
);

const SNOW_BACKGROUND = makeBackground(
  'rgba(224, 242, 254, 0.10)',
  'rgba(125, 211, 252, 0.07)'
);

const FOG_BACKGROUND = makeBackground(
  'rgba(203, 213, 225, 0.09)',
  'rgba(148, 163, 184, 0.08)'
);

function isRainCode(code: number): boolean {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
}

function isSnowCode(code: number): boolean {
  return (code >= 71 && code <= 77) || code === 85 || code === 86;
}

function isThunderCode(code: number): boolean {
  return code >= 95;
}

function isFogCode(code: number): boolean {
  return code === 45 || code === 48;
}

export function getWeatherAmbience(current: CurrentWeather | null): WeatherAmbience {
  if (!current) {
    return {
      backgroundStyle: DEFAULT_BACKGROUND,
    };
  }

  const weatherCode = current.weather_code;
  const isNight = current.is_day === 0;

  if (isThunderCode(weatherCode)) {
    return {
      backgroundStyle: THUNDER_BACKGROUND,
    };
  }

  if (isSnowCode(weatherCode)) {
    return {
      backgroundStyle: SNOW_BACKGROUND,
    };
  }

  if (isRainCode(weatherCode) || current.precipitation > 0.2) {
    return {
      backgroundStyle: RAIN_BACKGROUND,
    };
  }

  if (isFogCode(weatherCode)) {
    return {
      backgroundStyle: FOG_BACKGROUND,
    };
  }

  if (isNight) {
    return {
      backgroundStyle: NIGHT_BACKGROUND,
    };
  }

  if (weatherCode >= 1 && weatherCode <= 3) {
    return {
      backgroundStyle: CLOUD_BACKGROUND,
    };
  }

  return {
    backgroundStyle: CLEAR_BACKGROUND,
  };
}
