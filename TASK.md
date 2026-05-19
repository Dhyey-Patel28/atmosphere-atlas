# Current Task

## Task

Build milestone 2: Location Search.

## Goal

Implement city search using the free Open-Meteo Geocoding API.

## Requirements

- Create a reusable search component.
- Create an Open-Meteo API helper.
- User can type a city name.
- User can submit the search.
- Show up to 5 location results.
- Each result should show city, region/state if available, and country.
- User can select a result.
- Store selected location in App state.
- Show selected location name in the dashboard.
- Do not fetch weather forecast yet.
- Do not add the real globe yet.
- Do not install packages.
- Do not delete files.
- Handle loading state.
- Handle error state.
- Handle no results state.

## Files likely to edit

- src/App.tsx
- src/components/SearchBar.tsx
- src/lib/openMeteo.ts
- src/types/weather.ts
- src/index.css if needed

## Done when

- npm run dev works
- npm run build works
- Searching "Detroit", "London", "Tokyo", and "Mumbai" returns selectable results
- Selecting a result updates the dashboard with that location