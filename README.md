# 🌍 Atmosphere Atlas

**Atmosphere Atlas** is a futuristic weather intelligence dashboard that helps people understand how weather affects real life.

It combines live weather data, air quality, an interactive 3D globe, day/night lighting, comfort scoring, activity recommendations, saved places, and shareable weather pins into one human-centered weather experience.

## 🔗 Live Demo

[https://atmosphere-atlas.vercel.app/](https://atmosphere-atlas.vercel.app/)

---

## ✨ Features

### 🌐 Interactive 3D Globe
- Explore locations on a WebGL-powered globe.
- Selected places appear as glowing markers.
- The globe includes dynamic day/night lighting based on estimated sun position.
- The heavy globe bundle is lazy-loaded for better initial performance.

### 🔍 Fast Location Search
- Search locations using the Open-Meteo Geocoding API.
- Debounced autocomplete suggestions appear while typing.
- Search results are cached locally for faster repeat searches.
- Recent searches are stored in localStorage.

### 📌 Saved Places
- Save up to 10 favorite places.
- Quickly switch between saved locations.
- Saved places persist after refresh using localStorage.

### 📍 Drop Pin Weather Lookup
- Drop a pin on the globe to fetch weather for exact coordinates.
- Shared links use compact coordinate URLs like `?loc=42.3314,-83.0458`.
- Opening a shared link loads weather for that coordinate automatically.

### 🌦️ Current Weather
- View current temperature, apparent temperature, humidity, wind, precipitation, and condition labels.
- Includes daily high/low temperature, sunrise, and sunset.

### ☀️ Solar Arc
- Visual daylight arc showing sunrise, sunset, and current solar progression.
- Helps users understand where they are in the day at the selected location.

### 🧭 Life Score
- A 0–100 outdoor comfort score.
- Uses apparent temperature, humidity, wind, precipitation, and weather conditions.
- Includes a plain-English explanation of why the score was given.

### 🎭 Weather Translator
- Turns raw weather data into practical guidance:
  - Clothing
  - Commute
  - Outdoor activity
  - Health and comfort

### 🕒 Timeline Story
- Creates a 12-hour weather story from hourly forecast data.
- Highlights useful changes like temperature peaks, rain risk, wind shifts, and sunset.

### 🏃 Activity Planner
- Recommends the best time for:
  - Walk
  - Run
  - Bike
  - Drive
  - Photography
  - Stargazing

### 🌫️ Air Quality
- Displays air quality data including:
  - US AQI
  - PM2.5
  - PM10
  - Ozone
- Includes a simple health label and advice sentence.

---

## 🛠️ Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js + react-globe.gl
- **Data**: Open-Meteo APIs
- **Storage**: localStorage
- **Deployment**: Vercel

---

## 📡 APIs Used

Atmosphere Atlas uses free, keyless Open-Meteo APIs:

| API | Purpose |
|---|---|
| Open-Meteo Geocoding API | Location search |
| Open-Meteo Forecast API | Current, daily, and hourly weather |
| Open-Meteo Air Quality API | AQI, PM2.5, PM10, ozone |

No API keys, paid services, backend servers, or user accounts are required.

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

Preview the production build locally:

```bash
npm run preview
```

---

## 📦 Deployment

Atmosphere Atlas is deployed on Vercel:

[https://atmosphere-atlas.vercel.app/](https://atmosphere-atlas.vercel.app/)

Deployment settings:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## 🧪 QA Checklist

Before pushing major changes, verify:

- `npm run build` completes successfully.
- Search autocomplete works.
- Search dropdown closes after selecting a location.
- Weather data loads after selecting a location.
- Globe loads and marker moves to the selected place.
- Shared `?loc=lat,lon` links load weather and focus the globe.
- Drop pin creates a pinned weather location.
- Day/night lighting appears on the globe.
- Saved places persist after refresh.
- Life Score appears.
- Weather Translator appears.
- Timeline Story appears.
- Activity Planner buttons are visible and usable.
- Air Quality card loads.
- Mobile scrolling works naturally when pin mode is off.
- Search dropdown remains readable above the layout.

---

## 📁 Project Structure

```txt
src/
  components/
    ActivityPlanner.tsx
    AirQualityCard.tsx
    GlobeView.tsx
    LifeScoreCard.tsx
    SavedPlaces.tsx
    SearchBar.tsx
    TimelineStory.tsx
    WeatherAdviceCard.tsx
    WeatherPanel.tsx

  lib/
    activityPlanner.ts
    openMeteo.ts
    searchCache.ts
    time.ts
    timelineStory.ts
    weatherScore.ts
    weatherText.ts

  types/
    weather.ts

  App.tsx
  index.css
```

---

## 🧠 Design Philosophy

Atmosphere Atlas is designed to feel less like a traditional weather app and more like a **living planet dashboard**.

The goal is not only to show weather data, but to explain:

- how it feels outside,
- what it means for daily life,
- what activities make sense,
- how daylight changes through the day,
- and how the selected place fits into the larger planet.

---

## 🗺️ Future Ideas

Potential next improvements:

- Stable Today vs Last Year comparison using historical weather data
- Weather-based background ambience
- More advanced accessibility pass
- PWA install polish
- Optional nearby-city labels for dropped pins
- More detailed activity explanations
- More refined SVG logo system

---

## 📄 License

This project is currently maintained as a personal portfolio project.
