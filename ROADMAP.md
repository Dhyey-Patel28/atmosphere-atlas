# Atmosphere Atlas Roadmap

## Current Project State

The core MVP features are implemented:

- Static layout
- Location search
- Current weather
- 3D globe
- Selected location marker
- Day/night globe lighting
- Life Score
- Weather Translator
- Timeline Story
- Activity Planner
- Air Quality

Current focus:

- Search autocomplete and local cache
- Recent selected locations
- Saved Places
- UI polish in small, safe passes
- Performance optimization
- Deployment

## MVP Phase

### 1. Static Layout

Goal:
Create the first polished dashboard layout.

Includes:
- App shell
- Header
- Search bar placeholder
- Globe area placeholder
- Weather panel placeholder
- Empty state

Status:
Done

---

### 2. Location Search

Goal:
Search for cities using Open-Meteo Geocoding API.

Includes:
- Search input
- Submit behavior
- Result list
- Selected location state
- No results state
- Error state

Status:
Done

---

### 3. Current Weather

Goal:
Fetch and display current weather for selected location.

Includes:
- Current temperature
- Apparent temperature
- Humidity
- Wind speed
- Weather code label
- Daily high and low
- Sunrise and sunset

Status:
Done

---

### 4. 3D Globe

Goal:
Render interactive globe using react-globe.gl.

Includes:
- Globe component
- Dark space background
- Auto rotation
- Responsive sizing

Status:
Done

---

### 5. Location Marker

Goal:
Show selected and saved locations on the globe.

Includes:
- Selected city marker
- Saved place markers
- Clickable marker labels
- Camera movement to selected location

Status:
Done

---

### 6. Day/Night Globe

Goal:
Show actual day and night on Earth.

Includes:
- Sun position calculation
- Day/night visual effect
- Optional sun marker
- Optional terminator effect

Status:
Done

---

### 7. Life Score

Goal:
Calculate outdoor comfort score.

Includes:
- 0 to 100 score
- Score label
- Explanation
- Uses temp, apparent temp, humidity, wind, rain, UV

Status:
Done

---

### 8. Weather Translator

Goal:
Convert raw weather data into useful human advice.

Includes:
- Clothing advice
- Commute advice
- Outdoor advice
- Health advice

Status:
Done

---

### 9. Timeline Story

Goal:
Explain the next 12 hours as a story.

Includes:
- 4 to 6 timeline events
- Rain changes
- Wind changes
- Temperature peak/drop
- Best outdoor window

Status:
Done

---

### 10. Activity Planner

Goal:
Recommend best time for activities.

Activities:
- Walk
- Run
- Bike
- Drive
- Photography
- Stargazing

Status:
Done

---

### 11. Air Quality

Goal:
Fetch and explain air quality.

Includes:
- PM2.5
- PM10
- Ozone
- US AQI
- Simple health label

Status:
Done

---

### 12. Saved Places

Goal:
Let users save places locally.

Includes:
- Save current location
- Remove saved location
- Persist to localStorage
- Show saved markers on globe

Status:
Not started

---

### 13. Today vs Last Year

Goal:
Compare today's weather with same date last year.

Includes:
- Historical weather fetch
- Temperature comparison
- Precipitation comparison
- Simple explanation

Status:
Not started

---

### 14. UI Polish

Goal:
Make the app feel premium.

Includes:
- Responsive layout
- Better spacing
- Loading states
- Error states
- Weather-based background
- Smooth transitions

Status:
In Progress