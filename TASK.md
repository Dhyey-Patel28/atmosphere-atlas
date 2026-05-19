# Current Task

## Task

Build milestone 11: Saved Places.

## Goal

Let users save selected locations locally and quickly return to them.

## Requirements

- Create a SavedPlaces component.
- Use the selected location from the existing app state.
- User can save the currently selected location.
- Saved places persist in localStorage.
- User can click a saved place to select it again.
- User can remove a saved place.
- Saved places should be compact and not make the layout worse.
- Saved places should not duplicate the same city/location.
- Keep search working.
- Keep current weather working.
- Keep air quality working.
- Keep 3D globe working.
- Keep selected location marker working.
- Keep day/night lighting working.
- Keep Life Score working.
- Keep Weather Translator working.
- Keep Timeline Story working.
- Keep Activity Planner working.
- Do not add historical comparison yet.
- Do not install packages.
- Do not delete files.
- Do not deploy.

## Files likely to edit

- src/components/SavedPlaces.tsx
- src/App.tsx
- src/types/weather.ts if needed
- src/components/WeatherPanel.tsx if needed

## Done when

- npm run dev works
- npm run build works
- User can save the selected location
- Saved places remain after page refresh
- Clicking a saved place reloads that location
- Removing a saved place works
- Duplicate saved places are prevented
- Existing dashboard features still work