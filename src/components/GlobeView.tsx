import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import type { Location } from '../types/weather';
import { getSunPosition } from '../lib/time';

interface GlobeViewProps {
  location: Location | null;
  isPinMode?: boolean;
  onPinLocation?: (coords: { lat: number; lng: number }) => void;
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
  type: 'location' | 'sun';
  lat: number;
  lng: number;
  name: string;
};

export function GlobeView({ location, isPinMode = false, onPinLocation }: GlobeViewProps) {
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
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
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
  }, [sunPos, dimensions.width]);

  useEffect(() => {
    if (location && globeEl.current) {
      globeEl.current.pointOfView(
        {
          lat: location.latitude,
          lng: location.longitude,
          altitude: 1.5,
        },
        1500
      );

      return;
    }

    if (!location && globeEl.current) {
      globeEl.current.pointOfView(
        {
          lat: 20,
          lng: 0,
          altitude: 2.5,
        },
        1500
      );
    }
  }, [location]);

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

  const markerData: MarkerData[] = locationMarker ? [locationMarker, sunMarker] : [sunMarker];

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