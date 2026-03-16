import { queries } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import PlaceForm from '@/components/admin/PlaceForm';
import PlaceAuditHistory from '@/components/admin/PlaceAuditHistory';

interface Props {
  params: { id: string };
}

export default async function EditPlacePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const place = await queries.places.getById(parseInt(params.id));

  if (!place) notFound();

  const isSuperUser = session?.user?.role === 'super_user';
  const auditHistory = isSuperUser
    ? await queries.audit.getByResource('place', parseInt(params.id))
    : [];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/places" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Place</h1>
          <p className="text-gray-500 mt-1">{place.name}</p>
        </div>
      </div>

      <PlaceForm place={place} userId={session?.user?.id || '1'} />

      {isSuperUser && <PlaceAuditHistory history={auditHistory} />}
    </div>
  );
}
