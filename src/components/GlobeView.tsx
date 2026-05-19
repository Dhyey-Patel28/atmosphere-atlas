import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import type { Location } from '../types/weather';
import { getSunPosition } from '../lib/time';

interface GlobeViewProps {
  location: Location | null;
}

export function GlobeView({ location }: GlobeViewProps) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sunPos, setSunPos] = useState(getSunPosition());

  // Handle responsive resizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Update sun position periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSunPos(getSunPosition());
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  // Apply Day/Night Lighting
  useEffect(() => {
    if (!globeEl.current) return;
    
    const applyLighting = () => {
      const scene = globeEl.current.scene();
      if (!scene) return;
      
      scene.children.forEach((child: any) => {
        if (child.type === 'AmbientLight') {
          // Dim ambient light drastically for the night side
          child.intensity = 0.2; // Keeps the night side visible but dark
        }
        if (child.type === 'DirectionalLight') {
          // Position the directional light at the sun's coordinates
          const coords = globeEl.current.getCoords(sunPos.lat, sunPos.lng, 10);
          if (coords) {
            child.position.set(coords.x, coords.y, coords.z);
            child.intensity = 3; // Bright sun casting realistic shadow
          }
        }
      });
    };

    // Small delay ensures scene is fully initialized before we modify lights
    setTimeout(applyLighting, 200);
  }, [sunPos, dimensions.width]);

  // Smooth camera animation to location
  useEffect(() => {
    if (location && globeEl.current) {
      globeEl.current.pointOfView({ 
        lat: location.latitude, 
        lng: location.longitude, 
        altitude: 1.5 
      }, 1500); // 1.5s animation
    } else if (globeEl.current && !location) {
        globeEl.current.pointOfView({ 
            lat: 20, 
            lng: 0, 
            altitude: 2.5 
          }, 1500);
    }
  }, [location]);

  // Marker data
  const locationMarker = location ? {
    type: 'location',
    lat: location.latitude,
    lng: location.longitude,
    name: location.name
  } : null;
  
  const sunMarker = {
    type: 'sun',
    lat: sunPos.lat,
    lng: sunPos.lng,
    name: 'Sun'
  };
  
  const markerData = locationMarker ? [locationMarker, sunMarker] : [sunMarker];

  return (
    <div ref={containerRef} className="w-full h-full min-h-[40vh] xl:min-h-[600px] flex items-center justify-center pointer-events-none lg:pointer-events-auto lg:cursor-grab lg:active:cursor-grabbing">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          htmlElementsData={markerData}
          htmlElement={(d: any) => {
            const el = document.createElement('div');
            
            if (d.type === 'location') {
              el.innerHTML = `
                <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div class="absolute w-8 h-8 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
                  <div class="relative w-4 h-4 bg-cyan-300 rounded-full shadow-[0_0_20px_rgba(34,211,238,1)]"></div>
                </div>
              `;
            } else if (d.type === 'sun') {
              el.innerHTML = `
                <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80">
                  <div class="absolute w-12 h-12 bg-yellow-500 rounded-full animate-pulse opacity-30 blur-sm"></div>
                  <div class="relative w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.8)]"></div>
                </div>
              `;
            }
            
            return el;
          }}
        />
      )}
    </div>
  );
}
