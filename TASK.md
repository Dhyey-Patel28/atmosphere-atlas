# Current Task

## Task

Build milestone 3: Current Weather.

## Goal

Fetch and display current weather for the selected location using the free Open-Meteo Forecast API.

## Requirements

- Use the selected location from Milestone 2.
- Create or extend the Open-Meteo API helper.
- Fetch current weather after a location is selected.
- Do not fetch weather until a location is selected.
- Show loading state while weather is loading.
- Show error state if weather fetch fails.
- Show current weather data in the dashboard panel.
- Display:
  - selected city name
  - region/state if available
  - country
  - current temperature
  - apparent temperature
  - humidity
  - wind speed
  - wind direction if available
  - precipitation
  - weather condition label from weather_code
  - whether it is day or night
- Also fetch daily data for:
  - high temperature
  - low temperature
  - sunrise
  - sunset
- Also fetch hourly data for later milestones, but do not build charts yet.
- Keep the UI premium and readable.
- Do not add the real globe yet.
- Do not add Life Score yet.
- Do not add Activity Planner yet.
- Do not install packages.
- Do not delete files.

## Files likely to edit

- src/App.tsx
- src/lib/openMeteo.ts
- src/types/weather.ts
- src/components/WeatherPanel.tsx

## Done when

- npm run dev works
- npm run build works
- Searching and selecting "Detroit", "London", "Tokyo", and "Mumbai" fetches weather
- Weather panel updates after a location is selected
- Loading state appears while weather is being fetched
- Invalid or failed weather fetch shows a graceful error