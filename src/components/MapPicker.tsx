import React, { useEffect, useRef, useState } from 'react';

type Props = {
  initialLat?: number | null;
  initialLng?: number | null;
  onSelect: (lat: number, lng: number) => void;
};

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
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      // Esperar un poco más para asegurar que L esté completamente disponible
      setTimeout(() => resolve(), 100);
    };
    script.onerror = () => reject(new Error('Failed to load script ' + src));
    
    // Verificar si el script ya existe
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      // Si ya existe, verificar si L está disponible
      if ((window as any).L) {
        resolve();
      } else {
        // Si existe pero L no está disponible, esperar
        existing.addEventListener('load', () => {
          setTimeout(() => resolve(), 100);
        });
      }
    } else {
      document.body.appendChild(script);
    }
  });
}

async function waitForLeaflet(maxAttempts = 50): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const L = (window as any).L;
    if (L && L.map && L.marker && L.tileLayer) {
      return L;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Leaflet no se cargó después de esperar');
}

const MapPicker: React.FC<Props> = ({ initialLat, initialLng, onSelect }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar CSS y JS
        await loadCss(LEAFLET_CSS);
        await loadScript(LEAFLET_JS);
        
        if (!isMounted) return;

        // Esperar a que Leaflet esté completamente disponible
        const L = await waitForLeaflet();
        
        if (!isMounted) return;

        // Esperar el contenedor
        let retries = 0;
        while (!containerRef.current && retries < 30 && isMounted) {
          await new Promise(resolve => setTimeout(resolve, 50));
          retries++;
        }

        if (!containerRef.current || !isMounted) return;

        const container = containerRef.current;

        // Limpiar mapa existente
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.off();
            mapInstanceRef.current.remove();
          } catch (e) {
            console.warn('Error al limpiar mapa:', e);
          }
          mapInstanceRef.current = null;
          markerInstanceRef.current = null;
        }

        // Limpiar el contenedor
        container.innerHTML = '';
        const containerAny = container as any;
        if (containerAny._leaflet_id) {
          delete containerAny._leaflet_id;
        }

        // Pequeña pausa antes de crear el nuevo mapa
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!isMounted) return;

        // Crear el mapa
        const lat = typeof initialLat === 'number' ? initialLat : 20;
        const lng = typeof initialLng === 'number' ? initialLng : 0;
        const zoom = typeof initialLat === 'number' && typeof initialLng === 'number' ? 13 : 2;

        const map = L.map(container, {
          center: [lat, lng],
          zoom: zoom,
        });

        mapInstanceRef.current = map;

        // Agregar tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Agregar marcador inicial si hay coordenadas
        if (typeof initialLat === 'number' && typeof initialLng === 'number') {
          markerInstanceRef.current = L.marker([initialLat, initialLng]).addTo(map);
        }

        // Event listener para clicks en el mapa
        map.on('click', (e: any) => {
          if (!isMounted) return;
          const { lat, lng } = e.latlng;
          
          if (markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([lat, lng]);
          } else {
            markerInstanceRef.current = L.marker([lat, lng]).addTo(map);
          }
          
          onSelect(lat, lng);
        });

        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error al cargar el mapa:', err);
        if (isMounted) {
          setError(err.message || 'No se pudo cargar el mapa');
          setLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignorar errores en cleanup
        }
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [initialLat, initialLng, onSelect]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const L = (window as any).L;
        
        if (mapInstanceRef.current && L) {
          mapInstanceRef.current.setView([lat, lng], 13);
          
          if (markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([lat, lng]);
          } else {
            markerInstanceRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
          }
          
          onSelect(lat, lng);
        }
      },
      (err) => {
        console.error('Error de geolocalización:', err);
        alert('No se pudo obtener tu ubicación');
      }
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={useMyLocation}
          disabled={loading || !!error}
        >
          Usar mi ubicación
        </button>
        <span className="text-sm text-gray-600">
          Haz clic en el mapa para seleccionar coordenadas
        </span>
      </div>

      <div style={{ position: 'relative', minHeight: 300 }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
            <div className="p-4 text-gray-700">Cargando mapa...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50">
            <div className="p-4 text-red-600 text-center">
              <div className="font-semibold mb-2">Error al cargar el mapa</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}
        <div 
          ref={containerRef} 
          style={{ height: 300, width: '100%' }} 
          className="rounded border border-gray-300" 
        />
      </div>
    </div>
  );
};

export default MapPicker;