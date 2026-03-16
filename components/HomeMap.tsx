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
      className="relative pt-[50px] px-4 pb-[50px] md:pt-[80px] md:px-[40px] md:pb-[80px]"
      style={{ background: '#E8DCC4' }}
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

      {/* Map Container */}
      <div
        className="mx-auto relative"
        style={{
          maxWidth: '1200px',
          background: 'white',
          border: '8px solid #2C3E50',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '8px 8px 0px #95E1D3, 0 20px 60px rgba(0,0,0,0.2)',
          transform: 'rotate(-1deg)',
        }}
      >
        <MapInner places={places} />
      </div>
    </section>
  );
}
