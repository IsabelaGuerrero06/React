import React, { useEffect, useRef, useState } from 'react';

type Props = {
  initialLat?: number | null;
  initialLng?: number | null;
  onSelect: (lat: number, lng: number) => void;
};

// Dynamically load Leaflet CSS/JS from CDN and render a simple picker
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

function loadCss(href: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) return resolve();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error('Failed to load CSS ' + href));
    document.head.appendChild(link);
  });
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).L) return resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load script ' + src));
    document.body.appendChild(script);
  });
}

const MapPicker: React.FC<Props> = ({ initialLat, initialLng, onSelect }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadCss(LEAFLET_CSS), loadScript(LEAFLET_JS)])
      .then(async () => {
        if (!mounted) return;
        const L = (window as any).L;
        if (!L) throw new Error('Leaflet failed to load');

        // Wait for containerRef to be available (rare race in some setups)
        const waitForContainer = async (attempts = 10, delay = 50): Promise<HTMLElement | null> => {
          for (let i = 0; i < attempts; i++) {
            if (containerRef.current) return containerRef.current;
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, delay));
          }
          return containerRef.current;
        };

        const container = await waitForContainer(20, 50);
        if (!container) {
          throw new Error('Map container not found after waiting');
        }

        // create map
        mapRef.current = L.map(container, {
          center: initialLat && initialLng ? [initialLat, initialLng] : [20, 0],
          zoom: initialLat && initialLng ? 13 : 2,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapRef.current);

        if (typeof initialLat === 'number' && typeof initialLng === 'number') {
          markerRef.current = L.marker([initialLat, initialLng]).addTo(mapRef.current);
        }

        mapRef.current.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
          }
          onSelect(lat, lng);
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error('Map load error:', err);
        setLoading(false);
      });

    return () => {
      mounted = false;
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {
        // ignore
      }
    };
  }, [initialLat, initialLng, onSelect]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const L = (window as any).L;
        if (mapRef.current && L) {
          mapRef.current.setView([lat, lng], 13);
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
          else markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        }
        onSelect(lat, lng);
      },
      (err) => {
        console.error('Geolocation error', err);
        alert('Could not get your location.');
      }
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={useMyLocation}
        >
          Use my location
        </button>
        <span className="text-sm text-gray-600">Click on the map to pick coordinates</span>
      </div>

      {/* Always render the container so ref exists; show loading message on top while assets load */}
      <div style={{ position: 'relative' }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <div className="p-4">Loading map…</div>
          </div>
        )}
        <div ref={containerRef} style={{ height: 300 }} className="w-full rounded" />
      </div>
    </div>
  );
};

export default MapPicker;
