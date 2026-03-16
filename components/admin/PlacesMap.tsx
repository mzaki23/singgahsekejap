'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { renderToString } from 'react-dom/server';

const CATEGORY_EMOJI: Record<string, string> = {
  makanan: '🍔', pantai: '🏖️', taman: '🌳', shopping: '🛍️', wisata: '🎡',
};

const CATEGORY_COLOR: Record<string, string> = {
  makanan: '#F59E0B',
  pantai:  '#3B82F6',
  taman:   '#10B981',
  shopping:'#8B5CF6',
  wisata:  '#EF4444',
};

interface Place {
  id: number;
  name: string;
  category: string;
  location?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  rating?: number | string | null;
  status?: string;
  slug?: string;
}

function pinSvg(color: string, emoji: string) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
      <ellipse cx="18" cy="42" rx="6" ry="2.5" fill="rgba(0,0,0,0.2)"/>
      <path d="M18 2 C9.2 2 2 9.2 2 18 C2 28 18 42 18 42 C18 42 34 28 34 18 C34 9.2 26.8 2 18 2Z"
        fill="${color}" filter="url(#shadow)" stroke="white" stroke-width="2"/>
      <text x="18" y="22" text-anchor="middle" font-size="14">${emoji}</text>
    </svg>`;
}

export default function PlacesMap({ places }: { places: Place[] }) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mapped = places.filter(p => {
    const lat = parseFloat(String(p.latitude));
    const lng = parseFloat(String(p.longitude));
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });

  const noCoords = places.filter(p => {
    const lat = parseFloat(String(p.latitude));
    const lng = parseFloat(String(p.longitude));
    return isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0);
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import — Leaflet requires browser
    import('leaflet').then(L => {
      // Fix default icon path issue in webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Center on Batam
      const map = L.map(containerRef.current!, {
        center: [1.1301, 104.0529],
        zoom: 12,
        zoomControl: true,
      });

      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapped.forEach(place => {
        const lat = parseFloat(String(place.latitude));
        const lng = parseFloat(String(place.longitude));
        const color = CATEGORY_COLOR[place.category] ?? '#6B7280';
        const emoji = CATEGORY_EMOJI[place.category] ?? '📍';

        const icon = L.divIcon({
          html: pinSvg(color, emoji),
          iconSize: [36, 44],
          iconAnchor: [18, 44],
          popupAnchor: [0, -44],
          className: '',
        });

        const popup = `
          <div style="min-width:180px;font-family:sans-serif">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#111">${place.name}</div>
            <div style="font-size:12px;color:#666;margin-bottom:2px;text-transform:capitalize">
              ${emoji} ${place.category}${place.location ? ` · ${place.location}` : ''}
            </div>
            <div style="font-size:12px;color:#CA8A04;margin-bottom:10px">⭐ ${place.rating || '0.0'}</div>
            <a
              href="/admin/places/${place.id}/edit"
              style="display:inline-flex;align-items:center;gap:6px;background:#4F46E5;color:white;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:600;text-decoration:none"
            >
              ✏️ Edit Place
            </a>
          </div>`;

        L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(popup, { maxWidth: 260, minWidth: 200 });
      });

      // Auto-fit bounds if there are markers
      if (mapped.length > 0) {
        const bounds = L.latLngBounds(
          mapped.map(p => [parseFloat(String(p.latitude)), parseFloat(String(p.longitude))] as [number, number])
        );
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
          📍 {mapped.length} tempat terpetakan
        </span>
        {noCoords.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full font-medium">
            ⚠️ {noCoords.length} tanpa koordinat
          </span>
        )}
        <div className="flex flex-wrap gap-2 ml-auto">
          {Object.entries(CATEGORY_COLOR).map(([cat, color]) => (
            <span key={cat} className="inline-flex items-center gap-1 text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full" style={{ background: color }} />
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <div ref={containerRef} style={{ height: '560px', width: '100%', background: '#e8f0f7' }} />
      </div>

      {/* No-coordinates list */}
      {noCoords.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">
            Tempat tanpa koordinat (tidak tampil di peta):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {noCoords.map(p => (
              <Link
                key={p.id}
                href={`/admin/places/${p.id}/edit`}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-yellow-200 rounded-lg hover:border-yellow-400 text-sm transition-colors"
              >
                <span>{CATEGORY_EMOJI[p.category] ?? '📍'}</span>
                <span className="truncate text-gray-700">{p.name}</span>
                <span className="ml-auto text-xs text-indigo-500 flex-shrink-0">Edit →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
