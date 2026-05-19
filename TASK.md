# Current Task

## Task

Build milestone 10: Air Quality.

## Goal

Fetch and display air quality data for the selected location using the free Open-Meteo Air Quality API.

## Requirements

- Use the selected location from the existing app state.
- Create an AirQualityCard component.
- Extend the Open-Meteo API helper with an air quality fetch function.
- Fetch air quality after a location is selected.
- Do not fetch air quality until a location is selected.
- Show loading state while air quality is loading.
- Show graceful error state if air quality fetch fails.
- Display:
  - US AQI if available
  - PM2.5
  - PM10
  - ozone if available
  - simple health label
  - short advice sentence
- Keep Current Weather working.
- Keep Life Score working.
- Keep Weather Translator working.
- Keep Timeline Story working.
- Keep Activity Planner working.
- Keep search, globe, marker, and day/night features working.
- Do not add saved places yet.
- Do not add historical comparison yet.
- Do not install packages.
- Do not delete files.

## Files likely to edit

- src/components/AirQualityCard.tsx
- src/lib/openMeteo.ts
- src/types/weather.ts
- src/components/WeatherPanel.tsx
- src/App.tsx

## Done when

- npm run dev works
- npm run build works
- Selecting a city fetches air quality data
- Air quality card appears in the weather panel
- Air quality updates when selecting a different city
- Existing dashboard features still work