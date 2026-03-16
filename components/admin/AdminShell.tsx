'use client';

import { useState } from 'react';
import AdminSidebar from './Sidebar';
import MobileHeader from './MobileHeader';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`
        fixed top-0 left-0 h-full z-50 md:hidden transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar
          collapsed={false}
          onToggle={() => setSidebarOpen(false)}
          isMobileDrawer
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main className={`
        flex-1 flex flex-col min-h-screen transition-all duration-300
        ${collapsed ? 'md:ml-20' : 'md:ml-64'}
      `}>
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
