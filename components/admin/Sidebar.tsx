'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, MapPin, MessageSquare, Users,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, X, Flag, Trash2
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  requireSuperUser?: boolean;
  badge?: number;
}

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  isMobileDrawer?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ collapsed, onToggle, isMobileDrawer, onClose }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperUser = session?.user?.role === 'super_user';
  const [deleteRequestCount, setDeleteRequestCount] = useState(0);

  useEffect(() => {
    if (!isSuperUser) return;
    fetch('/api/delete-requests/count')
      .then(r => r.json())
      .then(d => setDeleteRequestCount(d.count ?? 0))
      .catch(() => {});
  }, [isSuperUser, pathname]);

  const navItems: NavItem[] = [
    { title: 'Dashboard',  href: '/admin/dashboard',  icon: <LayoutDashboard size={20} /> },
    { title: 'Places',     href: '/admin/places',     icon: <MapPin size={20} /> },
    { title: 'Reviews',    href: '/admin/reviews',    icon: <MessageSquare size={20} /> },
    { title: 'Reports',    href: '/admin/reports',    icon: <Flag size={20} /> },
    { title: 'Perm. Hapus', href: '/admin/delete-requests', icon: <Trash2 size={20} />, requireSuperUser: true, badge: deleteRequestCount },
    { title: 'Users',      href: '/admin/users',      icon: <Users size={20} />, requireSuperUser: true },
    { title: 'Analytics',  href: '/admin/analytics',  icon: <BarChart3 size={20} /> },
    { title: 'Settings',   href: '/admin/settings',   icon: <Settings size={20} />, requireSuperUser: true },
  ];

  const filtered = navItems.filter(item => !item.requireSuperUser || isSuperUser);
  const show = isMobileDrawer ? true : !collapsed;

  return (
    <aside className={`
      h-screen bg-gray-900 text-white flex flex-col transition-all duration-300
      ${isMobileDrawer ? 'w-72' : collapsed ? 'w-20' : 'w-64'}
      ${isMobileDrawer ? '' : 'fixed left-0 top-0 z-40'}
    `}>
      {/* Header */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        {show ? (
          <div>
            <h1 className="text-lg font-bold leading-tight">Singgah Sekejap</h1>
            <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
          </div>
        ) : (
          <div className="text-2xl mx-auto">🏝️</div>
        )}

        {isMobileDrawer ? (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
            <X size={20} />
          </button>
        ) : show && (
          <div className="text-xl">🏝️</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filtered.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobileDrawer ? onClose : undefined}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-sm
                ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                ${!show && !isMobileDrawer ? 'justify-center' : ''}
              `}
              title={!show && !isMobileDrawer ? item.title : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {(show || isMobileDrawer) && (
                <span className="flex items-center gap-2 flex-1">
                  {item.title}
                  {item.badge != null && item.badge > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-gray-800 space-y-2">
        {(show || isMobileDrawer) && session?.user && (
          <div className="px-3 py-3 bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                <p className="text-xs text-indigo-400 capitalize">
                  {session.user.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ redirect: true, callbackUrl: '/admin/login' })}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300
            hover:bg-red-600 hover:text-white transition-all text-sm
            ${!show && !isMobileDrawer ? 'justify-center' : ''}
          `}
          title={!show && !isMobileDrawer ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {(show || isMobileDrawer) && <span className="font-medium">Logout</span>}
        </button>

        {/* Collapse Toggle — desktop only */}
        {!isMobileDrawer && (
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-gray-800 transition-all"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>
    </aside>
  );
}
