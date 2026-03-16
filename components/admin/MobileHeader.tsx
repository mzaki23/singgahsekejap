'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/places': 'Places',
  '/admin/reviews': 'Reviews',
  '/admin/users': 'Users',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

export default function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const title = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? 'Admin';

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={22} className="text-gray-700" />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-lg">🏝️</span>
        <span className="font-semibold text-gray-900">{title}</span>
      </div>

      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
        {session?.user?.name?.charAt(0).toUpperCase() ?? '?'}
      </div>
    </header>
  );
}
