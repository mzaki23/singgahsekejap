'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

const BATAM_CENTER: [number, number] = [1.0456, 104.0305];

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:28px;height:28px;
    background:#4F46E5;
    border:3px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 2px 6px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export default function LocationPickerMap({
  lat, lng, onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);
  const hasCoords = lat !== null && lng !== null;

  useEffect(() => {
    if (markerRef.current && hasCoords) {
      markerRef.current.setLatLng([lat!, lng!]);
    }
  }, [lat, lng]);

  return (
    <MapContainer
      center={hasCoords ? [lat!, lng!] : BATAM_CENTER}
      zoom={15}
      style={{ width: '100%', height: '280px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ClickHandler onPick={onChange} />
      {hasCoords && (
        <Marker
          ref={markerRef}
          position={[lat!, lng!]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const pos = (e.target as L.Marker).getLatLng();
              onChange(+pos.lat.toFixed(6), +pos.lng.toFixed(6));
            },
          }}
        />
      )}
    </MapContainer>
  );
}
