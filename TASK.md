# Current Task

## Task

Build milestone 8: Timeline Story.

## Goal

Use the already-fetched hourly forecast data to generate a short, human-readable timeline of the next 12 hours.

## Requirements

- Create a TimelineStory component.
- Create a timeline utility if useful.
- Use hourly weather data already fetched from Open-Meteo.
- Do not make a new API call unless absolutely necessary.
- Generate 4 to 6 timeline events.
- Each event should include:
  - time
  - short title
  - one-sentence explanation
- Detect useful events such as:
  - best comfort window
  - rain starting or rain risk increasing
  - wind picking up
  - temperature peak
  - temperature drop later
  - sunset or nighttime transition if available
- Add the timeline to the weather panel or below the weather panel.
- Keep Life Score working.
- Keep Weather Translator working.
- Keep search, weather fetching, globe, marker, and day/night features working.
- Do not add Activity Planner yet.
- Do not add Air Quality yet.
- Do not install packages.
- Do not delete files.

## Files likely to edit

- src/components/TimelineStory.tsx
- src/lib/timelineStory.ts
- src/components/WeatherPanel.tsx
- src/types/weather.ts if needed

## Done when

- npm run dev works
- npm run build works
- Selecting a city shows a 4 to 6 item timeline
- Timeline updates when selecting a different city
- Timeline uses hourly data
- Existing Life Score and Weather Translator still work
- Existing globe and weather behavior still works