import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import type { Location } from '../types/weather';

interface GlobeViewProps {
  location: Location | null;
}

export function GlobeView({ location }: GlobeViewProps) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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
  const markerData = location ? [{
    lat: location.latitude,
    lng: location.longitude,
    name: location.name,
    size: 20
  }] : [];

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
          htmlElement={() => {
            const el = document.createElement('div');
            el.innerHTML = `
              <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div class="absolute w-8 h-8 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
                <div class="relative w-4 h-4 bg-cyan-300 rounded-full shadow-[0_0_20px_rgba(34,211,238,1)]"></div>
              </div>
            `;
            return el;
          }}
        />
      )}
    </div>
  );
}
