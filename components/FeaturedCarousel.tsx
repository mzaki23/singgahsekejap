'use client';

import { useRef } from 'react';
import Link from 'next/link';

interface Place {
  id: number;
  slug: string;
  name: string;
  category: string;
  category_badge: string;
  location: string;
  image_url: string | null;
  tags: string[];
  rating: number;
}

interface Props {
  places: Place[];
}

const CARD_EMOJI_BG: Record<string, { bg: string; emoji: string }> = {
  makanan:  { bg: 'linear-gradient(135deg, #FFB6B9 0%, #FEC8D8 100%)', emoji: '🍔' },
  pantai:   { bg: 'linear-gradient(135deg, #4ECDC4 0%, #95E1D3 100%)', emoji: '🏖️' },
  taman:    { bg: 'linear-gradient(135deg, #95E1D3 0%, #A8E6CF 100%)', emoji: '🌳' },
  shopping: { bg: 'linear-gradient(135deg, #FFB3D9 0%, #FFE66D 100%)', emoji: '🛍️' },
  wisata:   { bg: 'linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%)', emoji: '🎡' },
};

const BADGES = ['🔥 HOT!', '⭐ TOP!', '✨ NEW!', '💎 GEM!'];

export default function FeaturedCarousel({ places }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scroll(dir: number) {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: 350 * dir, behavior: 'smooth' });
  }

  if (places.length === 0) return null;

  return (
    <section
      id="hits"
      className="relative border-b-[5px] border-dashed border-text-dark pt-[50px] px-4 pb-[50px] md:pt-[80px] md:px-[40px] md:pb-[80px]"
      style={{ background: '#FFF8DC' }}
    >
      <div
        className="absolute top-5 left-0 w-full text-center opacity-10 pointer-events-none"
        style={{ fontSize: '30px', letterSpacing: '50px' }}
      >
        ⭐✨🌟💫⭐✨
      </div>

      {/* Header */}
      <div className="text-center mb-8 md:mb-[50px] relative">
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
          Lagi <span style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif', fontSize: '48px', verticalAlign: 'middle', margin: '0 6px' }}>🔥</span> Hits!
          <span
            className="absolute hidden md:block"
            style={{ left: '-80px', top: '50%', transform: 'translateY(-50%) rotate(-10deg)', fontSize: '50px', color: '#2C3E50' }}
          >
            →
          </span>
        </h2>
        <p className="font-script text-text-dark mt-3" style={{ fontSize: '24px', fontWeight: 700 }}>
          Tempat yang lagi rame dikunjungi minggu ini nih!
        </p>
      </div>

      {/* Carousel */}
      <div className="relative mx-auto px-[10px] md:px-[60px]" style={{ maxWidth: '1200px' }}>
        <button
          onClick={() => scroll(-1)}
          className="absolute top-1/2 left-0 z-10 hidden md:flex items-center justify-center cursor-pointer bg-white text-text-dark hover:bg-accent-yellow transition-all"
          style={{
            transform: 'translateY(-50%)',
            border: '4px solid #2C3E50',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '24px',
            boxShadow: '4px 4px 0px #2C3E50',
          }}
        >
          ←
        </button>
        <button
          onClick={() => scroll(1)}
          className="absolute top-1/2 right-0 z-10 hidden md:flex items-center justify-center cursor-pointer bg-white text-text-dark hover:bg-accent-yellow transition-all"
          style={{
            transform: 'translateY(-50%)',
            border: '4px solid #2C3E50',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '24px',
            boxShadow: '4px 4px 0px #2C3E50',
          }}
        >
          →
        </button>

        <div
          ref={carouselRef}
          className="flex overflow-x-auto"
          style={{
            gap: '30px',
            scrollBehavior: 'smooth',
            padding: '30px 10px 40px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {places.map((place, i) => {
            const visual = CARD_EMOJI_BG[place.category] ?? { bg: 'linear-gradient(135deg, #ccc, #eee)', emoji: '📍' };
            const rotations = ['-2deg', '1deg', '-1deg', '2deg'];
            const rot = rotations[i % rotations.length];

            return (
              <Link
                key={place.id}
                href={`/${place.category}/${place.slug}`}
                style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}
              >
                <div
                  className="bg-white cursor-pointer relative transition-all duration-400"
                  style={{
                    minWidth: 'min(280px, 80vw)',
                    maxWidth: 'min(280px, 80vw)',
                    border: '5px solid #2C3E50',
                    borderRadius: '15px',
                    overflow: 'visible',
                    boxShadow: '6px 6px 0px #2C3E50, 0 10px 30px rgba(0,0,0,0.15)',
                    transform: `rotate(${rot})`,
                    paddingBottom: '15px',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) translateY(-15px) scale(1.05)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '10px 10px 0px #2C3E50, 0 20px 40px rgba(0,0,0,0.2)';
                    (e.currentTarget as HTMLElement).style.zIndex = '10';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = `rotate(${rot})`;
                    (e.currentTarget as HTMLElement).style.boxShadow = '6px 6px 0px #2C3E50, 0 10px 30px rgba(0,0,0,0.15)';
                    (e.currentTarget as HTMLElement).style.zIndex = '1';
                  }}
                >
                  {/* Tape effect */}
                  <div
                    className="absolute z-[1]"
                    style={{
                      top: '-12px', left: '50%',
                      transform: 'translateX(-50%) rotate(2deg)',
                      width: '100px', height: '25px',
                      background: 'rgba(255,255,255,0.7)',
                      border: '2px solid rgba(0,0,0,0.1)',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    }}
                  />

                  {/* Image / Placeholder */}
                  <div className="relative" style={{ borderRadius: '10px 10px 0 0', overflow: 'hidden' }}>
                    {place.image_url ? (
                      <img
                        src={place.image_url}
                        alt={place.name}
                        style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%', height: '240px',
                          background: visual.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '80px',
                        }}
                      >
                        {visual.emoji}
                      </div>
                    )}

                    {/* Badge */}
                    <span
                      className="font-handwritten absolute"
                      style={{
                        top: '15px', right: '15px',
                        background: '#FFE66D',
                        color: '#2C3E50',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 700,
                        border: '3px solid #2C3E50',
                        boxShadow: '3px 3px 0px rgba(0,0,0,0.3)',
                        transform: 'rotate(-5deg)',
                      }}
                    >
                      {BADGES[i % BADGES.length]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="bg-white" style={{ padding: '20px' }}>
                    <div
                      className="font-cute text-primary uppercase font-bold"
                      style={{ fontSize: '14px', letterSpacing: '1px', marginBottom: '10px' }}
                    >
                      {place.category_badge || place.category}
                    </div>
                    <h3
                      className="font-handwritten text-text-dark"
                      style={{ fontSize: '26px', marginBottom: '10px', letterSpacing: '1px' }}
                    >
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-[5px] font-semibold text-text-dark" style={{ fontSize: '15px', marginBottom: '15px' }}>
                      📍 {place.location}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(place.tags ?? []).slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            background: '#FFB6C1',
                            padding: '6px 14px',
                            borderRadius: '15px',
                            fontSize: '13px',
                            color: '#2C3E50',
                            border: '2px solid #2C3E50',
                            fontWeight: 700,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
