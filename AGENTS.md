# AGENTS.md — Atmosphere Atlas

## Project

Atmosphere Atlas is a free weather dashboard web app.

The app helps users understand:
- What the weather is right now
- How it feels in real life
- What activities are best today
- How daylight, air quality, and comfort change across the day
- How the selected place appears on a 3D globe

## Tech Stack

Use only:

- Vite
- React
- TypeScript
- Tailwind CSS
- react-globe.gl
- three
- Open-Meteo APIs
- localStorage

Do not use:

- Paid APIs
- API keys
- Google Maps
- Mapbox
- OpenWeather
- Firebase
- Supabase
- Backend servers
- Authentication
- Databases
- AI API calls inside the app

## Current Development Priority

The app already has the core MVP features:

- Search
- Current weather
- Air quality
- 3D globe
- Selected location marker
- Day/night lighting
- Life Score
- Weather Translator
- Timeline Story
- Activity Planner

The current priority is no longer building the first MVP from scratch.

Current priorities:

1. Search autocomplete and local cache
2. Recent selected locations
3. Saved Places
4. Small layout fixes
5. Performance optimization
6. Today vs Last Year
7. Deployment prep

Avoid broad refactors unless explicitly requested.

## Current App Goal

Build a polished MVP with:

1. Location search
2. Current weather
3. 3D globe
4. Selected location marker
5. Day/night globe effect
6. Life Score
7. Weather Translator
8. Weather Timeline Story
9. Activity Planner
10. Air Quality
11. Saved Places
12. Today vs Last Year comparison
13. Responsive premium UI

## Working Style

Before editing code:

1. Explain the plan briefly.
2. List every file that will be created or modified.
3. Do not edit until the plan is clear.

When editing code:

1. Make small, focused changes.
2. Work on one milestone at a time.
3. Do not refactor unrelated code.
4. Do not delete files unless explicitly asked.
5. Do not rename files unless necessary.
6. Keep TypeScript types clean.
7. Keep components simple and readable.
8. Prefer working code over clever code.
9. Do not introduce unused dependencies.
10. Do not add environment variables unless absolutely necessary.

After editing code:

1. Tell me what changed.
2. Tell me how to test it.
3. Tell me which command to run.
4. Mention any known limitations.

## Change Size Rules

Default to small, focused changes.

Do not perform broad refactors unless the user explicitly says:

- "broad refactor approved"
- "rewrite the layout"
- "full redesign approved"

For normal tasks:

- Touch as few files as possible.
- Keep logic changes separate from styling changes.
- Keep UI changes separate from API changes.
- Do not change working features while improving unrelated areas.
- Do not rewrite large components unless necessary.
- Do not make more than one major product change in a single task.

If a task seems to require more than 5 files, stop and ask for confirmation before editing.

Do not combine:

- layout refactor + API changes
- search changes + weather panel redesign
- globe changes + activity planner changes
- performance optimization + feature work

## Safety Rules

Never run destructive commands automatically.

Do not run:

- rm -rf
- git reset --hard
- git clean -fd
- del /s
- Remove-Item -Recurse -Force
- npm audit fix --force
- force push
- commands that delete folders
- commands that overwrite large parts of the project

Ask before:

- Installing a new package
- Changing config files
- Editing package.json
- Changing build tooling
- Changing Git remotes
- Running deployment commands

## Git Rules

After a working milestone, suggest a commit message.

Use commit style:

- Add static app layout
- Add Open-Meteo geocoding search
- Add current weather panel
- Add 3D globe
- Add selected location marker
- Add day night globe effect
- Add outdoor Life Score
- Add weather translator
- Add activity planner
- Polish responsive UI

Do not commit automatically unless asked.

## Design Direction

Visual style:

- Dark
- Futuristic
- Atmospheric
- Premium
- Glassmorphism
- Spacious
- Smooth transitions
- Mobile responsive

Avoid:

- Crowded dashboards
- Generic weather app layout
- Too many charts
- Too many colors
- Tiny text
- Unclear icons

The app should feel like:

"A living planet dashboard that explains how weather affects real life."

## API Rules

Use Open-Meteo only.

Geocoding API:

https://geocoding-api.open-meteo.com/v1/search

Forecast API:

https://api.open-meteo.com/v1/forecast

Air Quality API:

https://air-quality-api.open-meteo.com/v1/air-quality

Historical Weather API:

https://archive-api.open-meteo.com/v1/archive

Always handle:

- loading state
- error state
- empty state
- missing API fields
- no search results
- network failure

## Search UX Rules

Search should feel fast and forgiving.

Preferred search behavior:

- Show suggestions while the user types.
- Use debounce before calling geocoding.
- Only search when query length is at least 3 characters.
- Keep Enter-to-search working.
- Use Open-Meteo Geocoding as the source of truth.
- Do not preload a giant global city database.
- Do not add paid search APIs.
- Cache previous query results in localStorage.
- Store recent selected locations in localStorage.
- Prevent duplicate recent locations.
- Keep dropdown above other layout elements.
- Keep mobile search usable.

Do not add fuzzy-search libraries unless explicitly approved.

## Recommended File Structure

Use this structure as the project grows:

src/
  components/
    GlobeView.tsx
    SearchBar.tsx
    WeatherPanel.tsx
    LifeScoreCard.tsx
    TimelineStory.tsx
    ActivityPlanner.tsx
    AirQualityCard.tsx
    SavedPlaces.tsx
    WeatherMemoryCard.tsx
  lib/
    openMeteo.ts
    weatherScore.ts
    weatherText.ts
    activityPlanner.ts
    time.ts
  types/
    weather.ts
  App.tsx
  index.css

## First Milestones

Build in this order:

1. Static layout
2. Location search
3. Current weather
4. 3D globe
5. Location marker
6. Day/night globe
7. Life Score
8. Weather Translator
9. Timeline Story
10. Activity Planner
11. Air Quality
12. Saved Places
13. Today vs Last Year
14. UI polish
15. Deploy

## Testing

After each milestone, run:

npm run dev

Also run before committing:

npm run build

If there is a TypeScript error, fix the smallest possible cause.

If there is a UI issue, explain what was tested and what still needs manual review.