# Current Task

## Task

Polish search with typeahead autocomplete.

## Goal

Make location search feel instant and forgiving by showing location suggestions while the user types.

## Current Problem

Right now search is a two-step process:
1. User types a city name.
2. Nothing appears until they press Enter.
3. Results appear.
4. User selects a result.

This feels slow and unclear.

## Requirements

- Keep using the free Open-Meteo Geocoding API.
- Do not add a new API.
- Do not install packages.
- Show search suggestions automatically while the user types.
- Use a small debounce so the API is not called on every keystroke.
- Suggested debounce: 300-500ms.
- Only search when query length is at least 2 or 3 characters.
- Show loading state while suggestions are loading.
- Show no-results state when nothing is found.
- User can still press Enter to search.
- User can click a suggestion to select it.
- Basic typo tolerance should rely on Open-Meteo results if available.
- Keep dropdown above other layout elements.
- Make dropdown mobile-friendly.
- Do not change weather fetching logic.
- Do not change globe logic.
- Do not change Life Score, Weather Translator, Timeline, Activity Planner, or Air Quality logic.
- Do not delete files.

## Files likely to edit

- src/components/SearchBar.tsx
- src/lib/openMeteo.ts if needed
- src/types/weather.ts if needed

## Done when

- npm run dev works
- npm run build works
- Suggestions appear while typing
- Pressing Enter still works
- Clicking a suggestion selects the location
- Search does not spam API requests on every keystroke
- Search dropdown is not hidden behind layout
- Existing dashboard features still work