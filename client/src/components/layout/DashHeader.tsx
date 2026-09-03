import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/store';
import { useState } from 'react';

export default function DashHeader() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';

  function handleSearch(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(search)}`);
      setSearch('');
    }
  }

  if (!user) return null;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 lg:flex hidden">
          <i className="fas fa-bars text-base" />
        </button>
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 lg:hidden">
          <i className="fas fa-bars text-base" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">
            {greeting}, {user.firstName} {user.avatar}
          </h1>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
            {user.state ? ` · ${user.state}` : ''}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 focus-within:border-green-500 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] transition-all">
          <i className="fas fa-search text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search crops, buyers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent outline-none text-sm text-gray-900 w-44 font-sans placeholder-gray-400"
          />
        </div>

        {/* Notifications */}
        <button onClick={() => navigate('/notifications')} className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all">
          <i className="fas fa-bell text-sm" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
        </button>

        {/* Messages */}
        <button onClick={() => navigate('/messages')} className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all">
          <i className="fas fa-comments text-sm" />
        </button>

        {/* User */}
        <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-sm flex-shrink-0">
            {user.avatar || user.firstName[0]}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-semibold text-gray-900 leading-tight">{user.firstName}</div>
            <div className="text-xs text-green-600 font-semibold leading-tight capitalize">{user.role.toLowerCase()}</div>
          </div>
          <i className="fas fa-chevron-down text-[10px] text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
