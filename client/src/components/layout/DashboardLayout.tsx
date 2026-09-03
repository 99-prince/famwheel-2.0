import { Outlet } from 'react-router-dom';
import { useUIStore } from '@/store';
import Sidebar from './Sidebar';
import DashHeader from './DashHeader';

export default function DashboardLayout() {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => useUIStore.getState().setSidebarOpen(false)}
      />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <DashHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
