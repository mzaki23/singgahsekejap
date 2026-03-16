import { redirect } from 'next/navigation';
import Link from 'next/link';
import { queries } from '@/lib/db';
import DistanceBadge from '@/components/DistanceBadge';
import { getLang, translations } from '@/lib/i18n/server';

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const lang = await getLang();
  const t = translations[lang].search;
  const q = searchParams.q?.trim();
  if (!q) redirect('/');

  const places = await queries.places.getAll({
    status: 'published',
    search: q,
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6B9CFF 0%, #BEEA9A 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="relative text-center px-6">
          <Link href="/" className="text-black/60 hover:text-black text-sm font-cute mb-4 inline-block">
            {t.backHome}
          </Link>
          <div className="text-5xl mb-2">🔍</div>
          <h1 className="font-display text-4xl md:text-5xl text-black">{t.title}</h1>
          <p className="font-cute text-lg text-black/70 mt-2">"{q}"</p>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {places.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😅</div>
            <h3 className="font-display text-3xl text-gray-500">{t.empty}</h3>
            <p className="font-cute text-gray-400 mt-2">{t.emptySub}</p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 bg-black text-white font-cute rounded-full border-2 border-black hover:bg-gray-800 transition-colors"
            >
              {t.backHome}
            </Link>
          </div>
        ) : (
          <>
            <p className="font-cute text-gray-500 mb-6">
              {t.found(places.length, q)}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place: any) => (
                <Link
                  key={place.id}
                  href={`/${place.category}/${place.slug}`}
                  className="group bg-white border-4 border-black rounded-3xl overflow-hidden hover:shadow-[6px_6px_0px_#2C3E50] hover:-translate-x-1 hover:-translate-y-1 transition-all"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {place.image_url && (
                      <img
                        src={place.image_url}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">
                        {place.category_badge || place.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 border-2 border-black rounded-full px-2 py-1">
                      <span className="text-xs font-bold text-yellow-600">⭐ {place.rating || '0.0'}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-xl text-text-dark">{place.name}</h3>
                    <p className="font-cute text-sm text-gray-500 mt-1">📍 {place.location}</p>
                    {place.short_description && (
                      <p className="font-cute text-sm text-gray-600 mt-2 line-clamp-2">{place.short_description}</p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {place.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs bg-accent-yellow/50 border border-black rounded-full px-2 py-0.5 font-cute">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <DistanceBadge lat={place.latitude} lng={place.longitude} fallback={place.distance} variant="card" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
