'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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

function FlyToUser({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo(pos, 15, { duration: 1.5 });
  }, [pos, map]);
  return null;
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;
    background:#4A83F6;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 4px rgba(74,131,246,0.35), 3px 3px 0px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

function makeIcon(color: string, emoji: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position:relative;
        width:38px;height:38px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid #2C3E50;
        box-shadow:3px 3px 0px rgba(0,0,0,0.4);
      ">
        <div style="
          position:absolute;inset:0;
          display:flex;align-items:center;justify-content:center;
          transform:rotate(45deg);
          font-size:18px;line-height:1;
        ">${emoji}</div>
      </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
}

export default function HomeMapInner({ places }: { places: MapPlace[] }) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');

  function getMyLocation() {
    if (!navigator.geolocation) {
      setLocError('Browser tidak mendukung geolocation');
      return;
    }
    setLocLoading(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLocLoading(false);
      },
      () => {
        setLocError('Izin lokasi ditolak');
        setLocLoading(false);
      }
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Tombol lokasi */}
      <button
        onClick={getMyLocation}
        disabled={locLoading}
        style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 1000,
          background: locLoading ? '#C0D4FF' : '#4A83F6',
          color: 'white', border: '3px solid #2C3E50',
          borderRadius: '12px', padding: '8px 16px',
          fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: '14px',
          cursor: locLoading ? 'default' : 'pointer',
          boxShadow: '3px 3px 0px #2C3E50',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        {locLoading ? '⏳ Mencari...' : '📍 Lokasi Saya'}
      </button>
      {locError && (
        <div style={{
          position: 'absolute', top: '55px', right: '12px', zIndex: 1000,
          background: '#FFE0E0', border: '2px solid #FF6B6B',
          borderRadius: '8px', padding: '6px 12px',
          fontFamily: "'Fredoka', sans-serif", fontSize: '13px', color: '#C0392B',
        }}>
          ⚠️ {locError}
        </div>
      )}
    <MapContainer
      center={[1.0456, 104.0305]}
      zoom={12}
      style={{ width: '100%', height: 'clamp(450px, 70vh, 750px)' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FlyToUser pos={userPos} />
      {userPos && (
        <Marker position={userPos} icon={userIcon}>
          <Popup>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: '15px', color: '#4A83F6' }}>
              📍 Lokasi Kamu
            </div>
          </Popup>
        </Marker>
      )}
      {places.map((loc, i) => {
        const color = CATEGORY_COLORS[loc.category] ?? '#FF6B6B';
        const catIcon = CATEGORY_ICON[loc.category] ?? '📍';
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;

        return (
          <Marker key={i} position={[loc.lat, loc.lng]} icon={makeIcon(color, catIcon)}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                  <a
                    href={`/${loc.category}/${loc.slug}`}
                    style={{
                      display: 'block',
                      background: '#4A83F6', color: 'white', textDecoration: 'none',
                      padding: '6px 12px', borderRadius: '12px', border: '2px solid #2C3E50',
                      fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: '13px',
                      textAlign: 'center', boxShadow: '2px 2px 0px #2C3E50',
                    }}
                  >
                    🔍 DETAIL TEMPAT
                  </a>
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      background: '#FFE66D', color: '#2C3E50', textDecoration: 'none',
                      padding: '6px 12px', borderRadius: '12px', border: '2px solid #2C3E50',
                      fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: '13px',
                      textAlign: 'center', boxShadow: '2px 2px 0px #2C3E50',
                    }}
                  >
                    📍 BUKA DI MAPS
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
    </div>
  );
}
