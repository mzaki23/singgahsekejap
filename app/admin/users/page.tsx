import { queries } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { redirect } from 'next/navigation';
import UsersTable from '@/components/admin/UsersTable';
import AddUserModal from '@/components/admin/AddUserModal';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'super_user') {
    redirect('/admin/dashboard');
  }

  const users = await queries.users.getAll();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500 mt-1">{users.length} user terdaftar</p>
        </div>
        <AddUserModal />
      </div>

      <UsersTable users={users} currentUserId={session?.user?.id} />
    </div>
  );
}
