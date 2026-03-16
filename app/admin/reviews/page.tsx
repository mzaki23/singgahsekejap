import { queries } from '@/lib/db';
import Link from 'next/link';
import ReviewsTable from '@/components/admin/ReviewsTable';

interface Props {
  searchParams: { status?: string; place_id?: string };
}

export default async function ReviewsPage({ searchParams }: Props) {
  const reviews = await queries.reviews.getAll({
    status: searchParams.status,
    place_id: searchParams.place_id ? parseInt(searchParams.place_id) : undefined,
  });

  const pendingCount = reviews.filter((r: any) => r.status === 'pending').length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-gray-500 mt-1">
            {reviews.length} ulasan total
            {pendingCount > 0 && <span className="ml-2 text-yellow-600 font-medium">• {pendingCount} pending</span>}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map((status) => (
          <Link
            key={status}
            href={status ? `/admin/reviews?status=${status}` : '/admin/reviews'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${(searchParams.status || '') === status
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
          >
            {status === '' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Link>
        ))}
      </div>

      <ReviewsTable reviews={reviews} />
    </div>
  );
}
