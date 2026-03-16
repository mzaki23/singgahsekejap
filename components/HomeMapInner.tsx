'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

interface MapPlace {
  name: string;
  category: string;
  lat: number;
  lng: number;
  image_url: string | null;
  slug: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  makanan:  '#FF6B6B',
  pantai:   '#4ECDC4',
  taman:    '#95E1D3',
  shopping: '#FFB3D9',
  wisata:   '#FFE66D',
};

const CATEGORY_ICON: Record<string, string> = {
  makanan:  '🍔',
  pantai:   '🏖️',
  taman:    '🌳',
  shopping: '🛍️',
  wisata:   '🎡',
};

function makeIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background:${color};
      width:35px;height:35px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:4px solid #2C3E50;
      box-shadow:3px 3px 0px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });
}

export default function HomeMapInner({ places }: { places: MapPlace[] }) {
  return (
    <MapContainer
      center={[1.0456, 104.0305]}
      zoom={12}
      style={{ width: '100%', height: 'clamp(300px, 60vh, 600px)' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {places.map((loc, i) => {
        const color = CATEGORY_COLORS[loc.category] ?? '#FF6B6B';
        const catIcon = CATEGORY_ICON[loc.category] ?? '📍';
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;

        return (
          <Marker key={i} position={[loc.lat, loc.lng]} icon={makeIcon(color)}>
            <Popup>
              <div style={{ fontFamily: "'Fredoka', sans-serif", padding: '6px', minWidth: '160px' }}>
                {loc.image_url ? (
                  <img
                    src={loc.image_url}
                    alt={loc.name}
                    style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '3px solid #2C3E50', marginBottom: '8px', display: 'block' }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '70px', background: '#E8F1FF', borderRadius: '8px', border: '3px solid #2C3E50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '8px' }}>
                    {catIcon}
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: '17px', color: '#FF6B6B', fontFamily: "'Permanent Marker', cursive", letterSpacing: '1px' }}>
                  {loc.name}
                </div>
                <div style={{ fontSize: '12px', color: '#4ECDC4', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>
                  {catIcon} {loc.category}
                </div>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', marginTop: '10px',
                    background: '#FFE66D', color: '#2C3E50', textDecoration: 'none',
                    padding: '6px 12px', borderRadius: '12px', border: '2px solid #2C3E50',
                    fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: '13px',
                    textAlign: 'center', boxShadow: '2px 2px 0px #2C3E50',
                  }}
                >
                  📍 BUKA DI MAPS
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
