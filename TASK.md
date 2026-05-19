# Current Task

## Task

Build milestone 9: Activity Planner.

## Goal

Recommend the best time today for common activities using the hourly forecast data already fetched from Open-Meteo.

## Requirements

- Create an ActivityPlanner component.
- Create an activity planning utility if useful.
- Use hourly weather data already fetched from Open-Meteo.
- Do not make a new API call unless absolutely necessary.
- Add activity buttons:
  - Walk
  - Run
  - Bike
  - Drive
  - Photography
  - Stargazing
- When an activity is selected, recommend the best time today.
- Show:
  - selected activity
  - best time
  - short reason
- Use simple scoring rules:
  - Walk: comfortable temperature, low rain, low wind
  - Run: cooler temperature, low rain, moderate wind okay
  - Bike: low wind, low rain
  - Drive: low precipitation, low wind
  - Photography: near sunrise/sunset, low precipitation
  - Stargazing: after sunset/night, low precipitation, lower cloud/rain risk if available
- Keep Life Score working.
- Keep Weather Translator working.
- Keep Timeline Story working.
- Keep search, weather fetching, globe, marker, and day/night features working.
- Do not add Air Quality yet.
- Do not install packages.
- Do not delete files.

## Files likely to edit

- src/components/ActivityPlanner.tsx
- src/lib/activityPlanner.ts
- src/components/WeatherPanel.tsx
- src/types/weather.ts if needed
- src/lib/openMeteo.ts if additional existing-hourly fields are needed

## Done when

- npm run dev works
- npm run build works
- Activity buttons appear
- Selecting an activity shows a best time and reason
- Recommendations update when selecting a different city
- Existing Life Score, Weather Translator, and Timeline Story still work
- Existing globe and weather behavior still works