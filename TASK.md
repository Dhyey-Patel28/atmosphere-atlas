# Current Task

## Task

Build Today vs Last Year weather memory.

## Goal

Compare today’s weather for the selected location with the same date last year using Open-Meteo historical weather.

## Requirements

- Use selected location from app state.
- Use Open-Meteo Historical Weather API.
- Do not use API keys.
- Do not install packages.
- Fetch historical weather only after a location is selected.
- Compare today’s forecast/current conditions with the same calendar date last year.
- Display:
  - today’s high temperature
  - last year’s high temperature
  - temperature difference
  - today’s precipitation if available
  - last year’s precipitation if available
  - short human-readable explanation
- Create a WeatherMemoryCard component.
- Keep the card compact.
- Add it to the weather panel as a collapsible or secondary section.
- Keep search autocomplete/cache working.
- Keep saved places working.
- Keep current weather working.
- Keep air quality working.
- Keep 3D globe working.
- Keep selected location marker working.
- Keep day/night lighting working.
- Keep Life Score working.
- Keep Weather Translator working.
- Keep Timeline Story working.
- Keep Activity Planner working.
- Do not change layout broadly.
- Do not deploy.
- Do not delete files.

## Files likely to edit

- src/components/WeatherMemoryCard.tsx
- src/lib/openMeteo.ts
- src/types/weather.ts
- src/components/WeatherPanel.tsx
- src/App.tsx

## Done when

- npm run dev works
- npm run build works
- Selecting a city fetches historical comparison
- Weather memory card appears
- Explanation is human-readable
- Existing dashboard features still work