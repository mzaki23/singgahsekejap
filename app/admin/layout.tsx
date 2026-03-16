import { headers } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = headers().get('x-pathname') || '';

  // Login page — render tanpa shell, tanpa auth check
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/register')) {
    return <>{children}</>;
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/admin/login');
  }

  return <AdminShell>{children}</AdminShell>;
}
