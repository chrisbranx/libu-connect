import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import OfflineBanner from './OfflineBanner';

export default function Layout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      <Sidebar
        isOpen={sidebarExpanded}
        mobileOpen={mobileSidebarOpen}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-[256px]' : 'lg:ml-[72px]'}`}>
        <OfflineBanner />
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <Outlet />
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
