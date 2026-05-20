# Current Task

## Task

Optimize performance by lazy-loading the globe.

## Goal

Reduce the initial app bundle size by loading the heavy 3D globe code only when needed.

## Requirements

- Use React lazy/Suspense or a small equivalent approach.
- Lazy-load GlobeView so react-globe.gl and three are split out of the initial bundle if Vite supports it.
- Add a polished globe loading fallback.
- Keep the current visual layout stable while GlobeView loads.
- Keep selected location marker working.
- Keep day/night globe lighting working.
- Keep mobile globe scroll behavior working.
- Keep search autocomplete/cache working.
- Keep saved places working.
- Keep current weather working.
- Keep air quality working.
- Keep Life Score working.
- Keep Weather Translator working.
- Keep Timeline Story working.
- Keep Activity Planner working.
- Keep Today vs Last Year working.
- Do not install packages.
- Do not delete files.
- Do not deploy yet.
- Do not run git commands.

## Files likely to edit

- src/App.tsx
- src/components/GlobeView.tsx if needed

## Done when

- npm run dev works
- npm run build works
- Globe still renders
- Globe marker still works
- Day/night lighting still works
- Build output shows globe code split into a separate chunk if possible
- Existing dashboard features still work