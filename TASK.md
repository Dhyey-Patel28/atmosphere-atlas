# Current Task

## Task

Build milestone 5: Day/Night Globe.

## Goal

Add a simple day/night visual effect to the 3D globe so the app feels like a living planet dashboard.

## Requirements

- Keep the existing 3D globe working.
- Keep selected location marker working.
- Keep search and weather panel working.
- Add a simple day/night visual effect.
- Show which parts of Earth are in daylight and which parts are in darkness.
- Use current UTC time to estimate sun position.
- Keep the implementation understandable.
- Add comments for the sun/day-night calculation.
- Do not over-engineer a perfect scientific model.
- Do not add saved places yet.
- Do not add Life Score yet.
- Do not add Activity Planner yet.
- Do not install packages unless absolutely necessary.
- Do not delete files.
- Keep mobile scroll behavior working.

## Preferred Implementation

Start with a practical version:

- Keep the globe texture.
- Add or adjust lighting based on sun position.
- Add a subtle dark/night overlay if practical.
- Add a small sun indicator or directional light if simple.
- Avoid complex shader work unless it is stable and easy to understand.

## Files likely to edit

- src/components/GlobeView.tsx
- src/lib/time.ts if useful
- src/App.tsx only if needed
- src/index.css only if needed

## Done when

- npm run dev works
- npm run build works
- Globe still renders
- Marker still appears after selecting a location
- Search still works
- Weather panel still works
- Mobile page scrolling still works
- There is a visible day/night effect or sun-direction effect
- No console errors appear