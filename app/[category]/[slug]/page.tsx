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

  // Track view
  await queries.places.incrementViews(place.id).catch(() => {});

  const reviews = await queries.reviews.getAll({ place_id: place.id, status: 'approved' });

  const avgRating = reviews.length > 0
    ? Math.round(reviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / reviews.length * 10) / 10
    : parseFloat(place.rating) || 0;

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      {/* Back */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <Link href={`/${params.category}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-cute text-sm transition-colors">
          ← {config.breadcrumb}
        </Link>
      </div>

      {/* Hero Image */}
      <div className="relative h-72 md:h-96 mt-4 mx-6 max-w-5xl md:mx-auto rounded-3xl overflow-hidden border-4 border-black">
        {place.image_url ? (
          <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-8xl">{config.icon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-sm font-bold">
            {place.category_badge || place.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-4 border-black rounded-3xl p-6">
              <h1 className="font-display text-4xl text-text-dark">{place.name}</h1>
              <p className="font-cute text-gray-500 mt-2">📍 {place.location}</p>

              <div className="flex items-center gap-4 mt-4">
                <span className="font-cute font-semibold text-yellow-600 text-lg">
                  ⭐ {avgRating} {reviews.length > 0 && <span className="text-gray-400 text-sm font-normal">{t.reviewCount(reviews.length)}</span>}
                </span>
                <span className="text-gray-300">|</span>
                <span className="font-cute text-gray-500 text-sm">
                  {place.views_count} views
                </span>
                <DistanceBadge lat={place.latitude} lng={place.longitude} fallback={place.distance} variant="header" />
              </div>

              {/* Tags */}
              {place.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {place.tags.map((tag: string) => (
                    <span key={tag} className="bg-accent-yellow/60 border-2 border-black rounded-full px-3 py-1 text-sm font-cute font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {(place.short_description || place.full_description) && (
              <div className="bg-white border-4 border-black rounded-3xl p-6">
                <h2 className="font-display text-2xl text-text-dark mb-3">{t.about}</h2>
                <p className="font-cute text-gray-700 leading-relaxed">
                  {place.full_description || place.short_description}
                </p>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white border-4 border-black rounded-3xl p-6">
              <h2 className="font-display text-2xl text-text-dark mb-4">
                {t.reviews(reviews.length)}
              </h2>

              {reviews.length === 0 ? (
                <p className="font-cute text-gray-400 text-center py-6">
                  {t.noReviews}
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-2 border-gray-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-cute font-semibold text-text-dark">{review.user_name}</span>
                        <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                      </div>
                      {review.comment && (
                        <p className="font-cute text-gray-600 text-sm">{review.comment}</p>
                      )}
                      <p className="font-cute text-xs text-gray-400 mt-2">
                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <ReviewForm placeId={place.id} />
            </div>

            {/* Report */}
            <div className="flex justify-end">
              <ReportButton placeId={place.id} placeName={place.name} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Map placeholder */}
            <div className="bg-white border-4 border-black rounded-3xl p-6">
              <h3 className="font-display text-xl text-text-dark mb-3">{t.location}</h3>
              {place.latitude && place.longitude ? (
                <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📍</div>
                    <p className="font-cute text-sm text-gray-600">{place.location}</p>
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
                </div>
              ) : (
                <p className="font-cute text-sm text-gray-400">{t.noCoords}</p>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-accent-yellow border-4 border-black rounded-3xl p-6">
              <h3 className="font-display text-xl text-text-dark mb-3">{t.infoTitle}</h3>
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

            {/* Back to Category */}
            <Link href={`/${params.category}`}
              className="block bg-white border-4 border-black rounded-3xl p-4 text-center font-display text-lg hover:bg-gray-50 transition-all hover:shadow-[4px_4px_0px_#2C3E50] hover:-translate-x-0.5 hover:-translate-y-0.5">
              {config.icon} Lihat {config.title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
