import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import PlaceForm from '@/components/admin/PlaceForm';

export default async function NewPlacePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/places" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Place Baru</h1>
          <p className="text-gray-500 mt-1">Isi informasi tempat wisata / kuliner</p>
        </div>
      </div>

      <PlaceForm userId={session!.user.id} />
    </div>
  );
}
