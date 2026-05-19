# Current Task

## Task

Polish search with autocomplete and local cache.

## Goal

Make location search feel faster, smoother, and more forgiving by showing suggestions while the user types and caching previous search results locally.

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
- Use debounce so the API is not called on every keystroke.
- Suggested debounce: 300-500ms.
- Only search when query length is at least 3 characters.
- Keep Enter-to-search behavior working.
- User can click a suggestion to select it.
- Show loading state while suggestions are loading.
- Show no-results state when query is long enough but no results exist.
- Add a small localStorage cache for search query results.
- Cache should map normalized query text to returned location results.
- Use cached results instantly when available.
- Limit cache size so localStorage does not grow forever.
- Suggested cache limit: 50 queries.
- Add recent selected locations using localStorage.
- Show recent locations when input is focused and empty.
- Prevent duplicate recent locations.
- Limit recent locations to 5.
- Make dropdown appear above other layout elements.
- Make dropdown mobile-friendly.
- Do not preload all global locations.
- Do not add a giant city database.
- Do not change weather fetching logic.
- Do not change globe logic.
- Do not change Life Score, Weather Translator, Timeline, Activity Planner, or Air Quality logic.
- Do not delete files.

## Files likely to edit

- src/components/SearchBar.tsx
- src/lib/searchCache.ts
- src/types/weather.ts if needed
- src/App.tsx if needed

## Done when

- npm run dev works
- npm run build works
- Suggestions appear while typing
- Pressing Enter still works
- Clicking a suggestion selects the location
- Search results are cached locally
- Recent selected locations appear when search is focused and empty
- Search does not spam API requests on every keystroke
- Search dropdown is not hidden behind layout
- Existing dashboard features still work