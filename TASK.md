# Current Task

## Task

Build milestone 6: Life Score.

## Goal

Add an outdoor comfort score that translates raw weather data into a meaningful 0-100 "Life Score."

## Requirements

- Create a reusable LifeScoreCard component.
- Create a weatherScore utility.
- Use current weather data from the selected location.
- Calculate a 0-100 score.
- Score should consider:
  - apparent temperature
  - humidity
  - wind speed
  - precipitation
  - weather condition if useful
- Show a label:
  - 90-100: Perfect outside
  - 75-89: Great
  - 55-74: Okay
  - 35-54: Uncomfortable
  - 0-34: Avoid long exposure
- Show a short explanation of why the score was given.
- Add the card to the weather panel.
- Keep existing search, weather, globe, marker, and day/night features working.
- Do not add Activity Planner yet.
- Do not add Timeline Story yet.
- Do not add Air Quality yet.
- Do not install packages.
- Do not delete files.

## Files likely to edit

- src/components/LifeScoreCard.tsx
- src/lib/weatherScore.ts
- src/components/WeatherPanel.tsx
- src/types/weather.ts if needed

## Done when

- npm run dev works
- npm run build works
- Selecting a city shows a Life Score in the weather panel
- Score changes based on weather conditions
- Explanation text appears
- Existing globe and weather behavior still works