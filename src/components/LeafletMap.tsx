import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  pointsOfInterest: Array<{
    id: string;
    name: string;
    address: string;
    lat?: number;
    lng?: number;
  }>;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ pointsOfInterest }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([41.9028, 12.4964], 6); // Roma

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap.current);
    }

    // Rimuovi marker precedenti
    leafletMap.current.eachLayer((layer) => {
      if ((layer as any).options && (layer as any).options.pane === "markerPane") {
        leafletMap.current?.removeLayer(layer);
      }
    });

    // Aggiungi marker
    const bounds: L.LatLngTuple[] = [];
    pointsOfInterest.forEach((poi, idx) => {
    if (typeof poi.lat === 'number' && typeof poi.lng === 'number') {
      const marker = L.circleMarker([poi.lat, poi.lng], {
        radius: 8, // dimensione del cerchio
        fillColor: '#3388ff',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })
        .addTo(leafletMap.current!)
        .bindPopup(
          `<b>${poi.name}</b><br/>${poi.address}<br/><a href="https://maps.google.com/?q=${poi.lat},${poi.lng}" target="_blank">Apri in Google Maps</a>`
        );
      bounds.push([poi.lat, poi.lng]);
    }

  });

    // Fit bounds se ci sono marker
    if (bounds.length > 0) {
      leafletMap.current.fitBounds(bounds as any, { maxZoom: 15 });
    }

    // eslint-disable-next-line
  }, [pointsOfInterest]);

  return (
    <div className="w-full h-full" ref={mapRef} style={{ minHeight: 300, zIndex:1 }} />
  );

};

export default LeafletMap;