# Current Task

## Task

Build milestone 7: Weather Translator.

## Goal

Add human-friendly weather advice that translates raw weather conditions into practical real-life guidance.

## Requirements

- Create a weatherText/advice utility or extend the existing weatherText utility.
- Create a WeatherAdviceCard component if useful.
- Use current weather data from the selected location.
- Generate short advice for:
  - clothing
  - commute
  - outdoor activity
  - health/comfort
- Advice should be specific, not generic.
- Use temperature, apparent temperature, humidity, wind, precipitation, weather code, and day/night if useful.
- Add the advice to the weather panel.
- Keep the Life Score card working.
- Keep search, weather fetching, globe, marker, and day/night features working.
- Do not add Activity Planner yet.
- Do not add Timeline Story yet.
- Do not add Air Quality yet.
- Do not install packages.
- Do not delete files.

## Files likely to edit

- src/lib/weatherText.ts
- src/components/WeatherAdviceCard.tsx
- src/components/WeatherPanel.tsx
- src/types/weather.ts if needed

## Done when

- npm run dev works
- npm run build works
- Selecting a city shows practical weather advice
- Advice updates when selecting a new city
- Advice includes clothing, commute, outdoor, and comfort/health guidance
- Existing Life Score and weather panel still work