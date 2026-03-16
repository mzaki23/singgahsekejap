import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { queries } from '@/lib/db';
import { redirect } from 'next/navigation';
import DeleteRequestsTable from '@/components/admin/DeleteRequestsTable';

export const metadata = { title: 'Permintaan Hapus – Admin' };

export default async function DeleteRequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'super_user') redirect('/admin/dashboard');

  const requests = await queries.deleteRequests.getAll();

  const pending = requests.filter((r: any) => r.status === 'pending');
  const processed = requests.filter((r: any) => r.status !== 'pending');

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Permintaan Hapus Place</h1>
        <p className="text-gray-500 mt-1">
          {pending.length} menunggu persetujuan
        </p>
      </div>

      {pending.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-400">Tidak ada permintaan yang menunggu persetujuan</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Menunggu Persetujuan</h2>
          <DeleteRequestsTable requests={pending} />
        </div>
      )}

      {processed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Riwayat</h2>
          <DeleteRequestsTable requests={processed} readOnly />
        </div>
      )}
    </div>
  );
}
