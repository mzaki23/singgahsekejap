import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { redirect } from 'next/navigation';
import SettingsForm from '@/components/admin/SettingsForm';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'super_user') {
    redirect('/admin/dashboard');
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Kelola profil dan keamanan akun</p>
      </div>

      <SettingsForm user={session?.user} />
    </div>
  );
}
