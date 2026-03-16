import { queries } from '@/lib/db';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';

export default async function AnalyticsPage() {
  const [stats, popularPlaces, categoryData, recentEvents] = await Promise.all([
    queries.analytics.getDashboardStats(),
    queries.analytics.getPopularPlaces(10),
    queries.analytics.getPlacesByCategory(),
    queries.analytics.getRecentEvents(7),
  ]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Statistik dan performa website</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Places', value: stats?.total_places ?? 0, color: 'text-blue-600' },
          { label: 'Total Views', value: stats?.total_views ?? 0, color: 'text-green-600' },
          { label: 'Approved Reviews', value: stats?.approved_reviews ?? 0, color: 'text-purple-600' },
          { label: 'Avg Rating', value: stats?.average_rating ? Number(stats.average_rating).toFixed(1) : '0.0', color: 'text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <AnalyticsCharts
        popularPlaces={popularPlaces}
        categoryData={categoryData}
        recentEvents={recentEvents}
      />
    </div>
  );
}
