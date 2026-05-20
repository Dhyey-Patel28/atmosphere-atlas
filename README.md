# 🌍 Atmosphere Atlas

**Atmosphere Atlas** is a premium, futuristic weather intelligence dashboard that explains how weather affects real life. Combining real-time meteorological data with an interactive 3D globe, daylight mapping, and personalized activity metrics, Atmosphere Atlas gives users a high-fidelity window into our planet's atmosphere.

---

## ✨ Features

- **🗺️ Interactive 3D Globe**: Visually trace chosen locations on a WebGL globe with real-time day/night lighting shadows and location pin markers.
- **🔍 Fast Geocoding Search**: Forgiving autocomplete search query cache with debounced inputs and local storage querying.
- **📌 Saved Places**: Add up to 10 favorite cities to a floating glassmorphic quick-access bar.
- **📊 Life Score**: A smart scoring index that determines outdoor comfort levels using real-time humidity, temperature, wind, and conditions.
- **🎭 Weather Translator**: Human-friendly summaries translating abstract weather metrics into daily lifestyle terms.
- **☀️ Interactive Solar Arc**: A real-time SVG daylight mapping curve showing sunrise, sunset, and solar progression with an animated sun tracker.
- **🏃 Activity Planner**: High-fidelity condition analyzer evaluating activities like Running, Cycling, Photography, Stargazing, Hiking, and Picnic.
- **🎛️ Today vs Last Year**: Connects to the Historical Archive API to compare today's forecast with the exact same calendar date one year ago.
- **⚡ Performance Code Splitting**: Utilizes React dynamic loading (`React.lazy` and `<Suspense>`) to extract heavy 3D globe bundles, reducing initial payload size by **88%** (from 2.07 MB down to 241 KB).

---

## 🛠️ Tech Stack

- **Framework**: React 18, Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Graphics**: Three.js, react-globe.gl
- **State & Caching**: LocalStorage, React Context/Hooks

---

## 📡 APIs Used

All weather data is fetched in real-time using key-less, public **Open-Meteo APIs**:
1. **Geocoding API**: `https://geocoding-api.open-meteo.com/v1/search`
2. **Forecast API**: `https://api.open-meteo.com/v1/forecast`
3. **Air Quality API**: `https://air-quality-api.open-meteo.com/v1/air-quality`
4. **Historical Weather Archive API**: `https://archive-api.open-meteo.com/v1/archive`

---

## 🚀 Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Dhyey-Patel28/atmosphere-atlas.git
   cd atmosphere-atlas
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📦 Deployment Settings

Atmosphere Atlas is a fully client-side static site, which can be deployed to any static host.

### 🔺 Vercel / 🟢 Netlify
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **SPA Routing**: 
  - For Vercel, ensure a `vercel.json` exists or is configured to route all paths to `index.html`.
  - For Netlify, add a `_redirects` file to the public folder containing `/* /index.html 200`.

### 🐙 GitHub Pages
Since Vite builds relative paths by default, if deploying to a repository subdirectory (e.g. `username.github.io/atmosphere-atlas`), update `vite.config.ts` to include:
```ts
export default defineConfig({
  base: '/atmosphere-atlas/',
  plugins: [react()],
})
```
