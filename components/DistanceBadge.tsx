'use client';

import { useEffect, useState } from 'react';

// Haversine formula — returns distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Module-level cache so geolocation is requested only once per page load
let cachedCoords: { lat: number; lng: number } | null = null;
let locationPromise: Promise<{ lat: number; lng: number }> | null = null;

function getUserLocation(): Promise<{ lat: number; lng: number }> {
  if (cachedCoords) return Promise.resolve(cachedCoords);
  if (locationPromise) return locationPromise;
  locationPromise = new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('not-supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cachedCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        locationPromise = null;
        resolve(cachedCoords);
      },
      (err) => {
        locationPromise = null;
        reject(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
  return locationPromise;
}

type Variant = 'card' | 'header' | 'info-row';

interface DistanceBadgeProps {
  lat?: number | string | null;
  lng?: number | string | null;
  fallback?: number | null;
  variant?: Variant;
}

export default function DistanceBadge({
  lat,
  lng,
  fallback,
  variant = 'card',
}: DistanceBadgeProps) {
  const [distance, setDistance] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  const placeLat = lat != null ? parseFloat(String(lat)) : null;
  const placeLng = lng != null ? parseFloat(String(lng)) : null;
  const hasCoords = placeLat !== null && !isNaN(placeLat) && placeLng !== null && !isNaN(placeLng);

  useEffect(() => {
    if (!hasCoords) {
      // No coords — show fallback if available
      setDistance(fallback ?? null);
      setReady(true);
      return;
    }

    getUserLocation()
      .then(({ lat: userLat, lng: userLng }) => {
        const d = haversine(userLat, userLng, placeLat!, placeLng!);
        setDistance(Math.round(d * 10) / 10); // 1 decimal
        setReady(true);
      })
      .catch(() => {
        // GPS denied / unavailable — fall back to stored distance
        setDistance(fallback ?? null);
        setReady(true);
      });
  }, [hasCoords, placeLat, placeLng, fallback]);

  if (!ready || distance === null) return null;

  const label = hasCoords && cachedCoords ? 'dari lokasimu' : 'dari pusat kota';
  const distStr = `${distance} km`;

  if (variant === 'card') {
    return (
      <p className="font-cute text-xs text-gray-400 mt-3">
        🚗 {distStr} {label}
      </p>
    );
  }

  if (variant === 'header') {
    return (
      <>
        <span className="text-gray-300">|</span>
        <span className="font-cute text-gray-500 text-sm">
          🚗 {distStr} {label}
        </span>
      </>
    );
  }

  // info-row
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">Jarak</span>
      <span className="font-semibold">{distStr} {label}</span>
    </div>
  );
}
