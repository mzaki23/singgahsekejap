import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';
import Link from 'next/link';
import { MapPin, MessageSquare, Eye, Star, Plus, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [stats, popularPlaces, recentAudit] = await Promise.all([
    queries.analytics.getDashboardStats(),
    queries.analytics.getPopularPlaces(5),
    queries.audit.getRecent(8),
  ]);

  const statCards = [
    {
      label: 'Total Places',
      value: stats?.total_places ?? 0,
      icon: <MapPin size={24} />,
      color: 'bg-blue-500',
      href: '/admin/places',
    },
    {
      label: 'Pending Reviews',
      value: stats?.pending_reviews ?? 0,
      icon: <MessageSquare size={24} />,
      color: 'bg-yellow-500',
      href: '/admin/reviews?status=pending',
    },
    {
      label: 'Total Views',
      value: stats?.total_views ?? 0,
      icon: <Eye size={24} />,
      color: 'bg-green-500',
      href: '/admin/analytics',
    },
    {
      label: 'Avg Rating',
      value: stats?.average_rating ? Number(stats.average_rating).toFixed(1) : '0.0',
      icon: <Star size={24} />,
      color: 'bg-purple-500',
      href: '/admin/analytics',
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Selamat datang, {session?.user?.name}</p>
        </div>
        <Link
          href="/admin/places/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          <Plus size={18} />
          <span>Add Place</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} text-white p-3 rounded-lg`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Places */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Popular Places</h2>
            <Link href="/admin/places" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {popularPlaces.length === 0 && (
              <p className="text-sm text-gray-400">Belum ada data.</p>
            )}
            {popularPlaces.map((place: any, i: number) => (
              <div key={place.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{place.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{place.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{place.views_count} views</p>
                  <p className="text-xs text-yellow-500">⭐ {place.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentAudit.length === 0 && (
              <p className="text-sm text-gray-400">Belum ada aktivitas.</p>
            )}
            {recentAudit.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{log.user_name || 'System'}</span>
                    {' '}{log.action} {log.resource_type ? `${log.resource_type} #${log.resource_id}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Place', href: '/admin/places/new', emoji: '📍' },
            { label: 'Review Ulasan', href: '/admin/reviews?status=pending', emoji: '💬' },
            { label: 'Lihat Analytics', href: '/admin/analytics', emoji: '📊' },
            { label: 'Kelola Users', href: '/admin/users', emoji: '👥' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center"
            >
              <span className="text-2xl">{action.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
