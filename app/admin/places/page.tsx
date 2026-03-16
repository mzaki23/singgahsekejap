import { queries } from '@/lib/db';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import PlacesViewToggle from '@/components/admin/PlacesViewToggle';
import CsvImportExport from '@/components/admin/CsvImportExport';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';

interface Props {
  searchParams: { category?: string; status?: string; search?: string };
}

export default async function PlacesPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const places = await queries.places.getAll({
    category: searchParams.category,
    status: searchParams.status,
    search: searchParams.search,
  });

  const categories = ['makanan', 'pantai', 'taman', 'shopping', 'wisata'];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Places Management</h1>
          <p className="text-gray-500 mt-1">{places.length} tempat ditemukan</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvImportExport places={places} />
          <Link
            href="/admin/places/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 md:px-4 rounded-lg transition-all text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Place</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form className="flex flex-col sm:flex-row flex-wrap gap-3">
          <input
            name="search"
            defaultValue={searchParams.search}
            placeholder="Cari nama / lokasi..."
            className="w-full sm:flex-1 sm:min-w-48 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <select
            name="category"
            defaultValue={searchParams.category || ''}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={searchParams.status || ''}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-all"
          >
            Filter
          </button>
          <Link
            href="/admin/places"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-all"
          >
            Reset
          </Link>
        </form>
      </div>

      {/* Table / Map toggle */}
      <PlacesViewToggle places={places} role={session?.user?.role} />
    </div>
  );
}
