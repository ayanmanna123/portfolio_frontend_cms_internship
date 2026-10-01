import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cmsApi } from '@/api/cmsApi';

export function AdminLayout({ activeTab, onSelectTab, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await cmsApi.getMessages();
        if (res.success && res.unreadCount !== undefined) {
          setUnreadMessages(res.unreadCount);
        }
      } catch {
        // silent catch
      }
    };
    fetchUnread();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        unreadMessages={unreadMessages}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeTitle={activeTab}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
