# 🌍 Atmosphere Atlas

**Atmosphere Atlas** is a futuristic weather intelligence dashboard that explains how weather affects real life.

It combines live weather data, air quality, a 3D globe, saved places, drop-pin weather lookup, shareable coordinate links, and human-centered weather guidance into one polished interactive experience.

## 🔗 Live Demo

**Live app:** https://atmosphere-atlas.vercel.app/  
**GitHub:** https://github.com/Dhyey-Patel28/atmosphere-atlas

---

## 📸 Screenshots

### Desktop Dashboard

![Atmosphere Atlas desktop dashboard](docs/screenshots/desktop-dashboard.png)

### Mobile Dashboard

![Atmosphere Atlas mobile dashboard](docs/screenshots/mobile-dashboard.png)

### Drop Pin Weather Lookup

![Atmosphere Atlas drop pin workflow](docs/screenshots/drop-pin.png)

### Saved Places and Globe Markers

![Atmosphere Atlas saved places and globe markers](docs/screenshots/saved-places.png)

---

## ✨ Features

### 🌐 Interactive 3D Globe

- WebGL-powered globe built with `react-globe.gl` and Three.js.
- Selected locations appear as prominent cyan markers.
- Saved places appear as secondary globe markers.
- Day/night lighting updates from estimated sun position.
- Globe is lazy-loaded to keep the initial app bundle smaller.
- A graceful error boundary keeps the app usable if WebGL/globe rendering fails.

### 🔍 Human-Friendly Location Search

- Debounced city search using the Open-Meteo Geocoding API.
- Autocomplete suggestions appear while typing.
- Search results are cached locally for faster repeat searches.
- Recent searches are saved in localStorage.
- Search dropdown closes after selecting a location.

### 📍 Drop Pin Weather Lookup

- Drop a pin anywhere on the globe.
- Fetch weather and air quality for exact coordinates.
- Pin mode is designed to avoid interfering with normal mobile scrolling.
- Shareable links use clean coordinate URLs like:

```txt
?loc=42.3314,-83.0458
```

### 📌 Saved Places

- Save up to 10 places locally.
- Saved places persist after refresh.
- Responsive saved-place display:
  - 2 visible places on phone
  - 3 visible places on tablet
  - 5 visible places on desktop
- Extra saved places move into a compact overflow menu.
- Saved locations are also shown on the globe.

### 🌦️ Weather Intelligence

- Current temperature and feels-like temperature.
- Condition labels.
- Humidity, wind, high/low, precipitation, sunrise, and sunset.
- 5-day outlook.
- 12-hour timeline story.
- Today-at-a-glance summary.

### 🧭 Life Score

- A 0–100 outdoor comfort score.
- Explains whether the day is comfortable, risky, hot, cold, windy, or rainy.
- Designed to reduce raw-number overload and help users make decisions faster.

### 🎭 Weather Translator

Transforms weather metrics into practical human advice:

- Clothing
- Commute
- Outdoor plans
- Health and comfort

### 🏃 Activity Planner

Recommends better times for:

- Walk
- Run
- Bike
- Drive
- Photography
- Stargazing

### 🌫️ Air Quality

Displays:

- US AQI
- PM2.5
- PM10
- Ozone
- Health label
- Short advice sentence

### 🌡️ Unit Toggle

- Switch between Celsius and Fahrenheit.
- Converts temperature, wind speed, and precipitation units.
- Preference persists in localStorage.

### 🧠 Remembered Location

- The app remembers the last selected location.
- Returning users land back on their most recent weather view.
- Share links still take priority over remembered locations.

---

## 🛠️ Tech Stack

| Area | Tools |
|---|---|
| Frontend | React, Vite, TypeScript |
| Styling | Tailwind CSS |
| 3D Globe | Three.js, react-globe.gl |
| APIs | Open-Meteo Geocoding, Forecast, Air Quality |
| State / Persistence | React state, localStorage |
| Deployment | Vercel |

---

## 📡 APIs Used

Atmosphere Atlas uses free, keyless Open-Meteo APIs:

| API | Purpose |
|---|---|
| Open-Meteo Geocoding API | Location search |
| Open-Meteo Forecast API | Current, hourly, and daily weather |
| Open-Meteo Air Quality API | AQI, PM2.5, PM10, ozone |

No API keys, paid services, accounts, backend servers, or databases are required.

---

## 🚀 Running Locally

Clone the repository:

```bash
git clone https://github.com/Dhyey-Patel28/atmosphere-atlas.git
cd atmosphere-atlas
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

---

## 📦 Deployment

Atmosphere Atlas is deployed on Vercel.

Recommended Vercel settings:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## 🧪 QA Checklist

Before pushing major changes:

- `npm run lint` passes.
- `npm run build` passes.
- Search autocomplete works.
- Search dropdown closes after selecting a place.
- Weather loads after selecting a city.
- Globe focuses on selected location.
- Shared `?loc=lat,lon` links load the correct place.
- Drop pin mode works.
- Saved places persist after refresh.
- Saved places overflow menu works.
- Saved globe markers do not block pin mode.
- Unit toggle works.
- Air Quality loads.
- 5-Day Outlook loads.
- Mobile layout feels usable.
- Globe fallback does not break the rest of the app.

---

## 🧠 Product / UX Decisions

Atmosphere Atlas was designed around one central idea:

> Weather apps should not just show numbers. They should explain what the weather means for real life.

Key UX decisions:

- Keep the main weather panel calm and readable.
- Put detailed metrics in secondary/collapsible sections.
- Make first-time actions obvious: Search, Near me, Drop pin.
- Use saved places and remembered location to reduce repeated work.
- Keep share URLs short and coordinate-based to avoid ambiguous city names.
- Lazy-load the heavy globe bundle to improve initial load performance.
- Preserve mobile scrolling behavior by making pin mode explicit.

---

## 🗺️ Future Ideas

Potential future improvements:

- Optional Journey Mode showing recent visited places as a route.
- Better named labels for dropped pins using reverse geocoding.
- More polished PWA install experience.
- Stable Today vs Last Year comparison using historical weather.
- More advanced accessibility audit.
- Additional visual ambience tied to weather conditions.

---

## 📄 License

This project is currently maintained as a personal portfolio project.
