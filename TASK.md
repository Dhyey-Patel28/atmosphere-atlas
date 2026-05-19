# Current Task

## Task

Fix UX polish issues after dashboard redesign.

## Goal

Fix small but important usability problems introduced or revealed by the latest UI polish pass.

## Requirements

- Fix Activity Planner activity buttons so all activities are visible.
- Activity buttons should wrap to a second line gracefully if they cannot fit.
- Photography and Stargazing must not be clipped or hidden.
- Fix search dropdown background so results are readable.
- Search dropdown must appear above the weather panel and globe.
- Search dropdown should have an opaque or near-opaque glass background.
- Keep search autocomplete/cache working.
- Keep saved places working.
- Keep current weather working.
- Keep air quality working.
- Keep 3D globe working.
- Keep selected location marker working.
- Keep day/night lighting working.
- Keep Life Score working.
- Keep Weather Translator working.
- Keep Timeline Story working.
- Keep Activity Planner logic working.
- Do not add the pin tool yet.
- Do not add logos/favicon yet.
- Do not install packages.
- Do not delete files.
- Do not deploy.
- Do not run git commands.

## Files likely to edit

- src/components/ActivityPlanner.tsx
- src/components/SearchBar.tsx
- src/components/WeatherPanel.tsx if needed
- src/index.css if needed

## Done when

- npm run dev works
- npm run build works
- Activity buttons wrap cleanly
- Walk, Run, Bike, Drive, Photography, and Stargazing are all visible
- Search dropdown results are readable
- Search dropdown is not transparent over the weather panel
- Existing dashboard features still work