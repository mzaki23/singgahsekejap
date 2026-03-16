import Link from 'next/link';
import { CATEGORY_CONFIG } from '@/lib/data';
import { queries } from '@/lib/db';
import { getLang, translations } from '@/lib/i18n/server';

export const metadata = {
  title: 'Jelajah Semua Kategori – Singgah Sekejap',
  description: 'Temukan semua tempat menarik di Batam: makanan, pantai, taman, shopping, dan wisata.',
};

const CATEGORIES = ['makanan', 'pantai', 'taman', 'shopping', 'wisata'] as const;

export default async function JelajahPage() {
  const lang = await getLang();
  const t = translations[lang].jelajah;
  let categoryCounts: Record<string, number> = {};

  try {
    const rows = await queries.analytics.getPlacesByCategory();
    for (const row of rows) {
      categoryCounts[row.category] = Number(row.count);
    }
  } catch {
    // DB unavailable — show 0 counts
  }

  return (
    <main className="min-h-screen" style={{ background: '#FFFEF7' }}>
      {/* Hero */}
      <section
        className="text-center py-16 px-6 border-b-4 border-black"
        style={{ background: 'linear-gradient(135deg, #FFE66D 0%, #4ECDC4 100%)' }}
      >
        <h1
          className="font-display text-black"
          style={{
            fontSize: 'clamp(36px, 7vw, 64px)',
            textShadow: '4px 4px 0px rgba(0,0,0,0.15)',
            letterSpacing: '2px',
          }}
        >
          {t.title}
        </h1>
        <p className="font-cute text-black/70 mt-3 text-lg">
          {t.subtitle}
        </p>
        <Link
          href="/"
          className="inline-block mt-6 font-cute font-bold text-black border-3 border-black rounded-full px-6 py-2 bg-white/80 hover:bg-white transition-all"
          style={{ border: '3px solid #2C3E50' }}
        >
          {t.backHome}
        </Link>
      </section>

      {/* Category Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const count = categoryCounts[cat] ?? 0;
            return (
              <Link
                key={cat}
                href={`/${cat}`}
                className="group block border-4 border-black rounded-3xl overflow-hidden transition-all hover:-translate-x-1 hover:-translate-y-1"
                style={{
                  background: config.heroGradient,
                  boxShadow: '4px 4px 0px #2C3E50',
                }}
                onMouseEnter={undefined}
              >
                <div className="p-8 text-center">
                  <div style={{ fontSize: '72px', lineHeight: 1 }} className="mb-4">
                    {config.icon}
                  </div>
                  <h2
                    className="font-display text-black"
                    style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}
                  >
                    {config.title}
                  </h2>
                  <p className="font-cute text-black/70 mt-2 text-sm">{config.subtitle}</p>
                  <div
                    className="mt-5 inline-block font-cute text-sm font-bold rounded-full px-5 py-1.5"
                    style={{
                      background: 'rgba(255,255,255,0.85)',
                      border: '2px solid #2C3E50',
                    }}
                  >
                    {t.placesCount(count)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
