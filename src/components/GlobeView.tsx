import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import type { Location } from '../types/weather';
import { getSunPosition } from '../lib/time';

interface GlobeViewProps {
  location: Location | null;
  savedPlaces?: Location[];
  isPinMode?: boolean;
  onPinLocation?: (coords: { lat: number; lng: number }) => void;
  onSavedLocationSelect?: (location: Location) => void;
}

type GlobeClickCoords = {
  lat: number;
  lng: number;
};

type GlobeVector = {
  x: number;
  y: number;
  z: number;
};

type LightLike = {
  type?: string;
  intensity?: number;
  position?: {
    set: (x: number, y: number, z: number) => void;
  };
};

type MarkerData = {
  type: 'location' | 'saved' | 'sun';
  lat: number;
  lng: number;
  name: string;
  location?: Location;
};

const DEFAULT_VIEW = {
  lat: 20,
  lng: 0,
  altitude: 2.5,
};

const LOCATION_VIEW_ALTITUDE = 1.5;

function getSavedMarkerLabel(location: Location): string {
  if (location.name === 'Pinned spot') return 'Pinned spot';
  if (location.name === 'Shared spot') return 'Shared spot';
  if (location.name === 'Near me') return 'Near me';

  return location.name;
}

export function GlobeView({
  location,
  savedPlaces = [],
  isPinMode = false,
  onPinLocation,
  onSavedLocationSelect,
}: GlobeViewProps) {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sunPos, setSunPos] = useState(getSunPosition());

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;

      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSunPos(getSunPosition());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!globeEl.current) return;

    const applyLighting = () => {
      const globe = globeEl.current;
      if (!globe) return;

      const scene = globe.scene();
      if (!scene) return;

      const lights = scene.children as LightLike[];

      lights.forEach((child) => {
        if (child.type === 'AmbientLight') {
          child.intensity = 0.2;
        }

        if (child.type === 'DirectionalLight') {
          const coords = globe.getCoords(sunPos.lat, sunPos.lng, 10) as GlobeVector | null;

          if (coords && child.position) {
            child.position.set(coords.x, coords.y, coords.z);
            child.intensity = 3;
          }
        }
      });
    };

    const timeoutId = window.setTimeout(applyLighting, 200);

    return () => window.clearTimeout(timeoutId);
  }, [sunPos, dimensions.width, dimensions.height]);

  useEffect(() => {
    let cancelled = false;
    const timeouts: number[] = [];

    function focusGlobeOnLocation(attempt = 0) {
      if (cancelled) return;

      const globe = globeEl.current;

      if (!globe) {
        if (attempt < 12) {
          const timeoutId = window.setTimeout(() => focusGlobeOnLocation(attempt + 1), 150);
          timeouts.push(timeoutId);
        }

        return;
      }

      if (location) {
        globe.pointOfView(
          {
            lat: location.latitude,
            lng: location.longitude,
            altitude: LOCATION_VIEW_ALTITUDE,
          },
          attempt === 0 ? 1500 : 900
        );

        return;
      }

      globe.pointOfView(
        {
          ...DEFAULT_VIEW,
          altitude: isPinMode ? 2.0 : DEFAULT_VIEW.altitude,
        },
        attempt === 0 ? 1500 : 900
      );
    }

    if (dimensions.width > 0 && dimensions.height > 0) {
      const timeoutId = window.setTimeout(() => focusGlobeOnLocation(), 100);
      timeouts.push(timeoutId);
    }

    return () => {
      cancelled = true;
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [location, isPinMode, dimensions.width, dimensions.height]);

  const savedMarkerData: MarkerData[] = savedPlaces
    .filter((place) => place.id !== location?.id)
    .slice(0, 10)
    .map((place) => ({
      type: 'saved',
      lat: place.latitude,
      lng: place.longitude,
      name: getSavedMarkerLabel(place),
      location: place,
    }));

  const locationMarker: MarkerData | null = location
    ? {
        type: 'location',
        lat: location.latitude,
        lng: location.longitude,
        name: location.name,
      }
    : null;

  const sunMarker: MarkerData = {
    type: 'sun',
    lat: sunPos.lat,
    lng: sunPos.lng,
    name: 'Sun',
  };

  const markerData: MarkerData[] = [
    ...savedMarkerData,
    ...(locationMarker ? [locationMarker] : []),
    sunMarker,
  ];

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[200px] flex items-center justify-center ${
        isPinMode
          ? 'pointer-events-auto cursor-crosshair'
          : 'pointer-events-none lg:pointer-events-auto lg:cursor-grab lg:active:cursor-grabbing'
      }`}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          htmlElementsData={markerData}
          htmlElement={(data: object) => {
            const marker = data as MarkerData;

            if (marker.type === 'saved') {
              const el = document.createElement('button');
              el.type = 'button';
              el.title = `Open saved place: ${marker.name}`;
              el.setAttribute('aria-label', `Open saved place: ${marker.name}`);
              el.style.pointerEvents = isPinMode ? 'none' : 'auto';
              el.className =
                'relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 bg-slate-950/70 p-1 shadow-[0_0_18px_rgba(148,163,184,0.35)] backdrop-blur-md transition-transform hover:scale-125 hover:border-cyan-200/80 hover:bg-cyan-300/15';

              el.innerHTML = `
                <span class="block h-2.5 w-2.5 rounded-full bg-white/75 shadow-[0_0_14px_rgba(255,255,255,0.55)]"></span>
              `;

              const selectSavedPlace = (event: Event) => {
                event.stopPropagation();

                if (isPinMode || !marker.location) return;

                onSavedLocationSelect?.(marker.location);
              };

              el.addEventListener('click', selectSavedPlace);
              el.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;

                event.preventDefault();
                selectSavedPlace(event);
              });

              return el;
            }

            const el = document.createElement('div');

            if (marker.type === 'location') {
              el.innerHTML = `
                <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div class="absolute w-8 h-8 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
                  <div class="relative w-4 h-4 bg-cyan-300 rounded-full shadow-[0_0_20px_rgba(34,211,238,1)]"></div>
                </div>
              `;
            }

            if (marker.type === 'sun') {
              el.innerHTML = `
                <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80">
                  <div class="absolute w-12 h-12 bg-yellow-500 rounded-full animate-pulse opacity-30 blur-sm"></div>
                  <div class="relative w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.8)]"></div>
                </div>
              `;
            }

            return el;
          }}
          onGlobeClick={(coords) => {
            if (!isPinMode || !onPinLocation) return;

            const point = coords as GlobeClickCoords;

            onPinLocation({
              lat: point.lat,
              lng: point.lng,
            });
          }}
        />
      )}
    </div>
  );
}
