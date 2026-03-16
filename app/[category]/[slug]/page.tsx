import { notFound } from 'next/navigation';
import Link from 'next/link';
import { queries } from '@/lib/db';
import { CATEGORY_CONFIG } from '@/lib/data';
import ReviewForm from '@/components/ReviewForm';
import DistanceBadge from '@/components/DistanceBadge';
import ReportButton from '@/components/ReportButton';
import { getLang, translations } from '@/lib/i18n/server';

interface Props {
  params: { category: string; slug: string };
}

export default async function PlaceDetailPage({ params }: Props) {
  const lang = await getLang();
  const t = translations[lang].detail;
  const config = CATEGORY_CONFIG[params.category];
  if (!config) notFound();

  const place = await queries.places.getBySlug(params.slug);
  if (!place || place.status !== 'published') notFound();

  await queries.places.incrementViews(place.id).catch(() => {});

  const [reviews, allInCategory] = await Promise.all([
    queries.reviews.getAll({ place_id: place.id, status: 'approved' }),
    queries.places.getAll({ category: params.category, status: 'published' }),
  ]);

  const related = (allInCategory as any[])
    .filter((p: any) => p.id !== place.id)
    .sort((a: any, b: any) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
    .slice(0, 3);

  const avgRating = reviews.length > 0
    ? Math.round(reviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / reviews.length * 10) / 10
    : parseFloat(place.rating) || 0;

  return (
    <div className="min-h-screen bg-[#F5F5DC]">

      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-6">
        <Link
          href={`/${params.category}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-cute text-sm transition-colors"
        >
          ← {config.breadcrumb}
        </Link>
      </div>

      {/* Hero Image — full width within max-w-6xl */}
      <div className="max-w-6xl mx-auto px-0 md:px-8 mt-3 md:mt-4">
        <div className="relative h-56 md:h-[420px] w-full rounded-none md:rounded-3xl overflow-hidden border-y-4 md:border-4 border-black">
          {place.image_url ? (
            <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-8xl">{config.icon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-sm font-bold">
              {place.category_badge || place.category}
            </span>
          </div>
          <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/90 border-2 border-black rounded-full px-3 py-1">
            <span className="text-sm font-bold text-yellow-600">⭐ {avgRating}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 md:gap-8 items-start">

          {/* Main Column */}
          <div className="space-y-5 md:space-y-6 min-w-0">

            {/* Name + meta */}
            <div className="bg-white border-4 border-black rounded-2xl md:rounded-3xl p-5 md:p-7">
              <h1 className="font-display text-3xl md:text-4xl text-text-dark leading-tight">{place.name}</h1>
              <p className="font-cute text-gray-500 text-sm md:text-base mt-2">📍 {place.location}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                <span className="font-cute font-semibold text-yellow-600 text-base md:text-lg">
                  ⭐ {avgRating}
                  {reviews.length > 0 && (
                    <span className="text-gray-400 text-sm font-normal ml-1">{t.reviewCount(reviews.length)}</span>
                  )}
                </span>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="font-cute text-gray-500 text-sm">{place.views_count} views</span>
                <DistanceBadge lat={place.latitude} lng={place.longitude} fallback={place.distance} variant="header" />
              </div>

              {place.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {place.tags.map((tag: string) => (
                    <span key={tag} className="bg-accent-yellow/60 border-2 border-black rounded-full px-3 py-1 text-xs md:text-sm font-cute font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar — mobile only */}
            <div className="lg:hidden space-y-4">
              <div className="bg-accent-yellow border-4 border-black rounded-2xl p-5">
                <h3 className="font-display text-lg text-text-dark mb-3">{t.infoTitle}</h3>
                <div className="space-y-2 font-cute text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.infoCategory}</span>
                    <span className="font-semibold capitalize">{place.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.infoRating}</span>
                    <span className="font-semibold">⭐ {avgRating}</span>
                  </div>
                  <DistanceBadge lat={place.latitude} lng={place.longitude} fallback={place.distance} variant="info-row" />
                </div>
              </div>

              {place.latitude && place.longitude && (
                <div className="bg-white border-4 border-black rounded-2xl p-5">
                  <h3 className="font-display text-lg text-text-dark mb-2">{t.location}</h3>
                  <p className="font-cute text-sm text-gray-600">📍 {place.location}</p>
                  <p className="font-cute text-xs text-gray-400 mt-1">
                    {parseFloat(place.latitude).toFixed(4)}, {parseFloat(place.longitude).toFixed(4)}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs font-cute font-semibold text-indigo-600 hover:underline"
                  >
                    {t.openMaps}
                  </a>
                </div>
              )}
            </div>

            {/* Description */}
            {(place.short_description || place.full_description) && (
              <div className="bg-white border-4 border-black rounded-2xl md:rounded-3xl p-5 md:p-7">
                <h2 className="font-display text-xl md:text-2xl text-text-dark mb-3">{t.about}</h2>
                <p className="font-cute text-gray-700 text-sm md:text-base leading-relaxed">
                  {place.full_description || place.short_description}
                </p>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white border-4 border-black rounded-2xl md:rounded-3xl p-5 md:p-7">
              <h2 className="font-display text-xl md:text-2xl text-text-dark mb-5">
                {t.reviews(reviews.length)}
              </h2>

              {reviews.length === 0 ? (
                <p className="font-cute text-gray-400 text-center py-6">{t.noReviews}</p>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-2 border-gray-100 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-cute font-semibold text-text-dark text-sm md:text-base">{review.user_name}</span>
                        <span className="text-yellow-500 text-sm shrink-0">{'⭐'.repeat(review.rating)}</span>
                      </div>
                      {review.comment && (
                        <p className="font-cute text-gray-600 text-sm">{review.comment}</p>
                      )}
                      <p className="font-cute text-xs text-gray-400 mt-2">
                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <ReviewForm placeId={place.id} />
            </div>

            {/* Report */}
            <div className="flex justify-end pb-2">
              <ReportButton placeId={place.id} placeName={place.name} />
            </div>
          </div>

          {/* Sidebar — desktop only, sticky */}
          <div className="hidden lg:flex flex-col gap-5 sticky top-6 self-start">

            {/* Info Card */}
            <div className="bg-accent-yellow border-4 border-black rounded-3xl p-6">
              <h3 className="font-display text-xl text-text-dark mb-4">{t.infoTitle}</h3>
              <div className="space-y-3 font-cute text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.infoCategory}</span>
                  <span className="font-semibold capitalize bg-white border-2 border-black rounded-full px-3 py-0.5">
                    {place.category}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.infoRating}</span>
                  <span className="font-semibold">⭐ {avgRating}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">{place.views_count}</span>
                </div>
                <DistanceBadge lat={place.latitude} lng={place.longitude} fallback={place.distance} variant="info-row" />
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white border-4 border-black rounded-3xl p-6">
              <h3 className="font-display text-xl text-text-dark mb-3">{t.location}</h3>
              {place.latitude && place.longitude ? (
                <>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 text-center">
                    <div className="text-4xl mb-2">📍</div>
                    <p className="font-cute text-sm text-gray-700 font-semibold">{place.location}</p>
                    <p className="font-cute text-xs text-gray-400 mt-1">
                      {parseFloat(place.latitude).toFixed(4)}, {parseFloat(place.longitude).toFixed(4)}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 text-center text-sm font-cute font-semibold text-white bg-indigo-500 hover:bg-indigo-600 border-2 border-indigo-700 rounded-full py-2 transition-colors"
                  >
                    🗺️ {t.openMaps}
                  </a>
                </>
              ) : (
                <p className="font-cute text-sm text-gray-400">{t.noCoords}</p>
              )}
            </div>

            {/* Back to Category */}
            <Link
              href={`/${params.category}`}
              className="block bg-white border-4 border-black rounded-3xl p-4 text-center font-display text-lg hover:bg-gray-50 transition-all hover:shadow-[4px_4px_0px_#2C3E50] hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              {config.icon} Lihat {config.title}
            </Link>
          </div>

        </div>

        {/* Back — mobile only */}
        <div className="lg:hidden mt-5">
          <Link
            href={`/${params.category}`}
            className="block bg-white border-4 border-black rounded-2xl p-4 text-center font-display text-base hover:bg-gray-50 transition-all"
          >
            {config.icon} Lihat {config.title}
          </Link>
        </div>
      </div>

      {/* Related Places */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
          <div className="border-t-4 border-black pt-8">
            <h2 className="font-display text-2xl md:text-3xl text-text-dark mb-6">
              {config.icon} Lainnya di {config.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/${p.category}/${p.slug}`}
                  className="group bg-white border-4 border-black rounded-2xl md:rounded-3xl overflow-hidden hover:shadow-[6px_6px_0px_#2C3E50] hover:-translate-x-1 hover:-translate-y-1 transition-all"
                >
                  <div className="relative h-40 md:h-48 overflow-hidden bg-gray-100">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl">{config.icon}</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 border-2 border-black rounded-full px-2 py-1">
                      <span className="text-xs font-bold text-yellow-600">⭐ {p.rating || '0.0'}</span>
                    </div>
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="font-display text-lg md:text-xl text-text-dark leading-tight">{p.name}</h3>
                    <p className="font-cute text-sm text-gray-500 mt-1">📍 {p.location}</p>
                    {p.short_description && (
                      <p className="font-cute text-sm text-gray-600 mt-2 line-clamp-2">{p.short_description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-xs bg-accent-yellow/50 border border-black rounded-full px-2 py-0.5 font-cute">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
