# Current Task

## Task

Build milestone 4: 3D Globe.

## Goal

Replace the globe placeholder with an actual interactive 3D globe using react-globe.gl.

## Requirements

- Create a reusable GlobeView component.
- Use react-globe.gl.
- Replace the current globe placeholder with the real globe component.
- Keep the existing search and weather panel working.
- Show the selected location as a marker on the globe.
- If no location is selected, show the globe with no marker.
- When a location is selected, update the marker position.
- Make the globe responsive.
- Keep the dark atmospheric visual style.
- Do not implement day/night shader yet.
- Do not add saved places yet.
- Do not add Life Score yet.
- Do not add Activity Planner yet.
- Do not install packages unless absolutely necessary.
- Do not delete files.

## Files likely to edit

- src/App.tsx
- src/components/GlobeView.tsx
- src/types/weather.ts if needed
- src/index.css if needed

## Done when

- npm run dev works
- npm run build works
- The app renders a real 3D globe
- Searching and selecting "Detroit", "London", "Tokyo", and "Mumbai" moves or updates the location marker
- Existing weather search and weather panel still work
- No console errors appear