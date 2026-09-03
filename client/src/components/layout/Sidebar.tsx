import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/store';
import { capitalize } from '@/lib/utils';

const navItems = [
  { to:'/dashboard',     icon:'fas fa-th-large',     label:'Dashboard'   },
  { to:'/marketplace',   icon:'fas fa-store',         label:'Marketplace' },
  { to:'/my-listings',   icon:'fas fa-seedling',      label:'My Listings', roles:['FARMER','ADMIN'] },
  { to:'/orders',        icon:'fas fa-shopping-bag',  label:'Orders'      },
  { to:'/offers',        icon:'fas fa-handshake',     label:'Offers',     roles:['FARMER','BUYER'] },
  { to:'/transport',     icon:'fas fa-truck',         label:'Transport'   },
  { to:'/messages',      icon:'fas fa-comments',      label:'Messages'    },
  { to:'/notifications', icon:'fas fa-bell',          label:'Notifications'},
  { to:'/market-prices', icon:'fas fa-chart-line',    label:'Market Prices'},
  { to:'/profile',       icon:'fas fa-user-cog',      label:'Profile'     },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const navigate = useNavigate();

  if (!user) return null;

  const filtered = navItems.filter(n => !n.roles || n.roles.includes(user.role));

  return (
    <aside className={`fixed top-0 left-0 h-full w-64 bg-dark-900 z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2.5 text-xl font-black text-white">
          <span>🚜</span>
          <span>FAM<span className="text-green-400">WHEEL</span></span>
        </button>
      </div>

      {/* User card */}
      <div className="px-4 py-3.5 border-b border-white/5 bg-green-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-xl flex-shrink-0">
            {user.avatar || user.firstName[0]}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-green-400 font-semibold">{capitalize(user.role)} {user.verified ? '✅' : ''}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        <div className="px-5 py-2 text-[10px] font-bold text-white/25 uppercase tracking-widest">Main</div>
        {filtered.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <i className={`${item.icon} w-4 text-center text-sm flex-shrink-0`} />
            {item.label}
          </NavLink>
        ))}

        <div className="px-5 py-2 mt-4 text-[10px] font-bold text-white/25 uppercase tracking-widest">Account</div>
        <button
          onClick={() => navigate('/')}
          className="sidebar-link w-full text-left"
        >
          <i className="fas fa-home w-4 text-center text-sm" /> Home
        </button>
        <button
          onClick={logout}
          className="sidebar-link w-full text-left !text-red-400 hover:!text-red-300"
        >
          <i className="fas fa-sign-out-alt w-4 text-center text-sm" /> Logout
        </button>
      </nav>

      {/* Version */}
      <div className="px-5 py-3 text-[10px] text-white/20">FAM WHEEL v2.0 · Full Stack</div>
    </aside>
  );
}
