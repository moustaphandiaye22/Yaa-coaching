import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const vierzon: [number, number] = [47.221, 2.069];
const googleDirectionsUrl =
  'https://www.google.com/maps/dir/?api=1&destination=Vierzon%2C%20France';

export default function ServiceAreaMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let map: import('leaflet').Map | undefined;
    let observer: IntersectionObserver | undefined;

    async function loadMap() {
      const leaflet = await import('leaflet');
      if (disposed || !container) return;

      map = leaflet.map(container, { scrollWheelZoom: false }).setView(vierzon, 12);
      leaflet
        .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })
        .addTo(map);
      leaflet
        .circleMarker(vierzon, {
          radius: 9,
          color: '#fffefa',
          weight: 3,
          fillColor: '#244b3d',
          fillOpacity: 1,
        })
        .addTo(map)
        .bindPopup('Vierzon et alentours — secteur indicatif');
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            void loadMap();
          }
        },
        { rootMargin: '200px' },
      );
      observer.observe(container);
    } else {
      void loadMap();
    }

    return () => {
      disposed = true;
      observer?.disconnect();
      map?.remove();
    };
  }, []);

  return (
    <div className="service-area-map">
      <div className="service-area-map-heading">
        <b>Carte indicative du secteur</b>
        <a href={googleDirectionsUrl} target="_blank" rel="noopener noreferrer">
          Itinéraire sur Google Maps <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
      <div
        ref={containerRef}
        className="service-area-map-canvas"
        role="region"
        aria-label="Carte interactive de Vierzon et des alentours"
      />
    </div>
  );
}
