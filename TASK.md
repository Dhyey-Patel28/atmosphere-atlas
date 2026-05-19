# Current Task

## Task

Polish search experience.

## Goal

Make location search faster and smoother without changing the weather or globe logic.

## Requirements

- Keep the existing Open-Meteo geocoding search.
- Do not add new APIs.
- Do not install packages.
- Add recent searches using localStorage.
- Show recent searches when the search input is focused and empty.
- Allow clicking a recent search to select that location again.
- Add a clear input button if useful.
- Improve empty/no-results state if needed.
- Prevent search results from being hidden behind other layout elements.
- Keep Saved Places working if already implemented.
- Keep current weather working.
- Keep air quality working.
- Keep globe marker and day/night lighting working.
- Keep Life Score, Weather Translator, Timeline Story, and Activity Planner working.
- Do not add historical comparison yet.
- Do not deploy.
- Do not delete files.

## Files likely to edit

- src/components/SearchBar.tsx
- src/App.tsx if needed
- src/types/weather.ts if needed

## Done when

- npm run dev works
- npm run build works
- Recent searches appear after selecting locations
- Recent searches persist after refresh
- Clicking a recent search loads that location
- Search results/dropdowns are not hidden behind layout elements
- Existing dashboard features still work