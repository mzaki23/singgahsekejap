'use client';

import dynamic from 'next/dynamic';

interface MapPlace {
  name: string;
  category: string;
  lat: number;
  lng: number;
  image_url: string | null;
  slug: string;
}

interface Props {
  places: MapPlace[];
}

const MapInner = dynamic(() => import('./HomeMapInner'), { ssr: false, loading: () => (
  <div style={{ width: '100%', height: 'clamp(300px, 60vh, 600px)', background: '#E8F1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontFamily: 'Fredoka, sans-serif', color: '#6B9CFF' }}>
    🗺️ Memuat peta...
  </div>
)});

export default function HomeMap({ places }: Props) {
  return (
    <section
      id="peta"
      className="relative pt-[50px] px-4 pb-[50px] md:pt-[80px] md:px-[40px] md:pb-[80px]"
      style={{ background: '#E8DCC4', zIndex: 0, isolation: 'isolate' }}
    >
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(139,69,19,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Header */}
      <div className="text-center mb-12 relative">
        <h2
          className="font-serif text-text-dark inline-block relative"
          style={{
            fontSize: 'clamp(38px, 6vw, 56px)',
            fontWeight: 700,
            background: 'white',
            padding: '15px 35px',
            border: '5px solid #2C3E50',
            borderRadius: '15px',
            boxShadow: '5px 5px 0px #2C3E50',
            letterSpacing: '1px',
          }}
        >
          Peta{' '}
          <span style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif', fontSize: '48px', verticalAlign: 'middle', margin: '0 6px' }}>
            🗺️
          </span>{' '}
          Seru!
          <span
            className="absolute hidden md:block"
            style={{ left: '-80px', top: '50%', transform: 'translateY(-50%) rotate(-10deg)', fontSize: '50px', color: '#2C3E50' }}
          >
            →
          </span>
        </h2>
        <p className="font-script text-text-dark mt-3" style={{ fontSize: '24px', fontWeight: 700 }}>
          Klik-klik buat explore tempat di sekitarmu!
        </p>
      </div>

      {/* Map + Legend */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">

        {/* Map */}
        <div
          className="w-full lg:flex-1 relative"
          style={{
            background: 'white',
            border: '8px solid #2C3E50',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '8px 8px 0px #95E1D3, 0 20px 60px rgba(0,0,0,0.2)',
          }}
        >
          <MapInner places={places} />
        </div>

        {/* Legend */}
        <div
          className="w-full lg:w-[220px] shrink-0"
          style={{
            background: 'white',
            border: '5px solid #2C3E50',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '5px 5px 0px #2C3E50',
            transform: 'rotate(1deg)',
            fontFamily: "'Fredoka', sans-serif",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '17px', color: '#2C3E50', marginBottom: '14px', borderBottom: '3px dashed #2C3E50', paddingBottom: '10px' }}>
            🗺️ Keterangan Peta
          </div>

          {/* Categories */}
          {[
            { color: '#FF6B6B', icon: '🍔', label: 'Makanan' },
            { color: '#4ECDC4', icon: '🏖️', label: 'Pantai' },
            { color: '#95E1D3', icon: '🌳', label: 'Taman' },
            { color: '#FFB3D9', icon: '🛍️', label: 'Shopping' },
            { color: '#FFE66D', icon: '🎡', label: 'Wisata' },
          ].map(({ color, icon, label }) => (
            <div key={label} className="flex items-center gap-3 mb-3">
              {/* Marker preview */}
              <div style={{
                width: '20px', height: '20px', flexShrink: 0,
                background: color,
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                border: '3px solid #2C3E50',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
              }} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#2C3E50' }}>
                {icon} {label}
              </span>
            </div>
          ))}

          {/* Divider */}
          <div style={{ borderTop: '3px dashed #2C3E50', margin: '14px 0' }} />

          {/* User location */}
          <div className="flex items-center gap-3">
            <div style={{
              width: '16px', height: '16px', flexShrink: 0,
              background: '#4A83F6',
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 0 0 3px rgba(74,131,246,0.4), 2px 2px 0px rgba(0,0,0,0.2)',
            }} />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#2C3E50' }}>
              📍 Lokasi Kamu
            </span>
          </div>

          {/* Tip */}
          <div style={{
            marginTop: '16px', background: '#FFFEF0',
            border: '2px dashed #FFB300', borderRadius: '10px',
            padding: '10px', fontSize: '12px', color: '#7A6000', lineHeight: 1.5,
          }}>
            💡 Klik marker di peta untuk lihat detail tempat!
          </div>
        </div>

      </div>
    </section>
  );
}
