import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { ordersAPI, notificationsAPI, marketPricesAPI, cropsAPI } from '@/lib/api';
import { formatMoney, formatDate, timeAgo, orderStatusColor } from '@/lib/utils';
import type { Order, Notification, MarketPrice, Crop } from '@/types';

function StatCard({ icon, label, value, change, to, bg }: { icon: string; label: string; value: string; change?: string; to?: string; bg: string }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => to && navigate(to)} className={`stat-card ${to ? 'cursor-pointer' : ''}`}>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        {change && <p className="text-xs text-green-600 font-semibold mt-1">{change}</p>}
      </div>
      <div className={`stat-icon ${bg} text-xl`}>{icon}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: statsData } = useQuery({ queryKey: ['order-stats'], queryFn: () => ordersAPI.stats().then(r => r.data.stats) });
  const { data: ordersData } = useQuery({ queryKey: ['recent-orders'], queryFn: () => ordersAPI.list({ limit: '5' }).then(r => r.data) });
  const { data: notifData }  = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsAPI.list().then(r => r.data) });
  const { data: pricesData } = useQuery({ queryKey: ['market-prices'], queryFn: () => marketPricesAPI.list().then(r => r.data.prices) });
  const { data: cropsData }  = useQuery({ queryKey: ['crops-preview'], queryFn: () => cropsAPI.list({ limit: '6' }).then(r => r.data) });

  const stats  = statsData || { total:0, delivered:0, inTransit:0, pending:0, revenue:0 };
  const orders = (ordersData?.orders || []) as Order[];
  const notifs = (notifData?.notifications || []) as Notification[];
  const prices = (pricesData || []) as MarketPrice[];
  const crops  = (cropsData?.crops || []) as Crop[];

  const quickActions = [
    { icon:'🌾', label:'Add Crop Listing',  to:'/my-listings',  roles:['FARMER'] },
    { icon:'🛒', label:'Browse Marketplace', to:'/marketplace',  roles:['FARMER','BUYER','TRANSPORT','ADMIN'] },
    { icon:'📦', label:'View Orders',        to:'/orders',        roles:['FARMER','BUYER','TRANSPORT','ADMIN'] },
    { icon:'📊', label:'Market Prices',      to:'/market-prices', roles:['FARMER','BUYER','TRANSPORT','ADMIN'] },
    { icon:'💬', label:'Messages',           to:'/messages',      roles:['FARMER','BUYER','TRANSPORT','ADMIN'] },
    { icon:'🚚', label:'Transport',          to:'/transport',     roles:['FARMER','BUYER','TRANSPORT','ADMIN'] },
  ].filter(a => a.roles.includes(user?.role || ''));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-800 to-[#1a3020] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-green-400/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white mb-1">
            Welcome back, {user?.firstName} {user?.avatar} 🎉
          </h2>
          <p className="text-white/60 text-sm">
            Your {user?.role?.toLowerCase()} dashboard is ready. <span className="text-green-400 font-semibold">{stats.pending} orders</span> need attention.
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button onClick={() => navigate('/marketplace')} className="btn btn-sm" style={{ background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)' }}>
            <i className="fas fa-store" /> Browse Market
          </button>
          <button onClick={() => navigate(user?.role === 'FARMER' ? '/my-listings' : '/orders')} className="btn btn-primary btn-sm">
            {user?.role === 'FARMER' ? '+ Add Listing' : 'View Orders'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Total Revenue" value={formatMoney(stats.revenue)} change="+12% this month" to="/orders" bg="bg-green-100 text-green-600" />
        <StatCard icon="📦" label="Total Orders" value={stats.total.toString()} change={`${stats.pending} pending`} to="/orders" bg="bg-blue-100 text-blue-600" />
        <StatCard icon="🚚" label="In Transit" value={stats.inTransit.toString()} to="/transport" bg="bg-yellow-100 text-yellow-600" />
        <StatCard icon="✅" label="Delivered" value={stats.delivered.toString()} to="/orders" bg="bg-purple-100 text-purple-600" />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header"><h3 className="font-bold text-gray-900">⚡ Quick Actions</h3></div>
        <div className="card-body">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map(a => (
              <button key={a.to} onClick={() => navigate(a.to)}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-green-50 hover:border-green-200 hover:-translate-y-1 transition-all group">
                <span className="text-3xl group-hover:scale-110 transition-transform">{a.icon}</span>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-green-700 text-center">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="font-bold text-gray-900">📦 Recent Orders</h3>
            <button onClick={() => navigate('/orders')} className="text-xs font-semibold text-green-600 hover:underline">View All →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Crop</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">No orders yet</td></tr>}
                {orders.map(o => (
                  <tr key={o.id} className="cursor-pointer" onClick={() => navigate('/orders')}>
                    <td><span className="font-semibold">{o.crop?.emoji} {o.crop?.name}</span></td>
                    <td><strong>{formatMoney(o.totalAmount)}</strong></td>
                    <td><span className={`badge ${orderStatusColor(o.status)}`}>{o.status.replace('_',' ')}</span></td>
                    <td className="text-xs">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-bold text-gray-900">🔔 Notifications</h3>
            <button onClick={() => navigate('/notifications')} className="text-xs font-semibold text-green-600 hover:underline">All →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {notifs.slice(0,5).map(n => (
              <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-green-50/30' : ''}`}
                onClick={() => navigate(n.link || '/notifications')}>
                <span className="text-xl flex-shrink-0">{n.icon}</span>
                <div className="min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'} truncate`}>{n.title}</p>
                  <p className="text-xs text-gray-400 truncate">{n.text}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />}
              </div>
            ))}
            {notifs.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>}
          </div>
        </div>
      </div>

      {/* Market Prices */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">📊 Live Market Prices</h3>
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-green inline-block" /> Live
            </span>
          </div>
          <button onClick={() => navigate('/market-prices')} className="text-xs font-semibold text-green-600 hover:underline">Full Report →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-5">
          {prices.slice(0,8).map(p => {
            const prevPrice = p.price * 0.98;
            const up = p.price > prevPrice;
            return (
              <div key={p.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-green-200 transition-colors cursor-pointer" onClick={() => navigate('/market-prices')}>
                <div className="text-2xl mb-2">{p.emoji}</div>
                <div className="text-sm font-bold text-gray-900">{p.name}</div>
                <div className="text-base font-black text-gray-900">₹{p.price.toLocaleString('en-IN')}<span className="text-xs text-gray-400 font-normal">/{p.unit}</span></div>
                <div className={`text-xs font-bold mt-1 ${up ? 'text-green-600' : 'text-red-500'}`}>
                  {up ? '▲' : '▼'} {p.region}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Listings Preview */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-bold text-gray-900">🌾 Fresh on Marketplace</h3>
          <button onClick={() => navigate('/marketplace')} className="text-xs font-semibold text-green-600 hover:underline">Browse All →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-5">
          {crops.map(c => (
            <div key={c.id} onClick={() => navigate('/marketplace')} className="crop-card p-4 text-center cursor-pointer">
              <div className="text-3xl mb-2">{c.emoji}</div>
              <div className="text-xs font-bold text-gray-900 truncate">{c.name}</div>
              <div className="text-sm font-black text-green-600">{formatMoney(c.price)}<span className="text-xs text-gray-400 font-normal">/{c.unit}</span></div>
              <div className="text-xs text-gray-400 truncate">{c.farmer?.city || c.farmer?.state || ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
