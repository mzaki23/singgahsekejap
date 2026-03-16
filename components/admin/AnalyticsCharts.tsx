'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const CATEGORY_EMOJI: Record<string, string> = {
  makanan: '🍔', pantai: '🏖️', taman: '🌳', shopping: '🛍️', wisata: '🎡',
};

export default function AnalyticsCharts({ popularPlaces, categoryData, recentEvents }: {
  popularPlaces: any[];
  categoryData: any[];
  recentEvents: any[];
}) {
  const pieData = categoryData.map((d: any) => ({
    name: `${CATEGORY_EMOJI[d.category] || ''} ${d.category}`,
    value: parseInt(d.count),
  }));

  const barData = popularPlaces.slice(0, 8).map((p: any) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
    views: p.views_count,
    reviews: parseInt(p.review_count),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Popular Places Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Top Places by Views</h2>
        {barData.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada data views.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} name="Views" />
              <Bar dataKey="reviews" fill="#10b981" radius={[4, 4, 0, 0]} name="Reviews" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Places per Kategori</h2>
        {pieData.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada data.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Popular Places Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
        <h2 className="font-semibold text-gray-900 mb-4">Ranking Tempat Populer</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Views</th>
                <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {popularPlaces.map((place: any, i: number) => (
                <tr key={place.id}>
                  <td className="py-3 text-sm font-bold text-gray-400">{i + 1}</td>
                  <td className="py-3 text-sm font-medium text-gray-900">{place.name}</td>
                  <td className="py-3 text-sm text-gray-500 capitalize">
                    {CATEGORY_EMOJI[place.category]} {place.category}
                  </td>
                  <td className="py-3 text-sm text-yellow-500">⭐ {place.rating}</td>
                  <td className="py-3 text-sm text-gray-700">{place.views_count}</td>
                  <td className="py-3 text-sm text-gray-700">{place.review_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
