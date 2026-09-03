import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Notification, NotificationType } from '@/types';

const typeColors: Record<string, string> = {
  OFFER: 'bg-green-50 border-green-100', ORDER: 'bg-blue-50 border-blue-100',
  TRANSPORT: 'bg-yellow-50 border-yellow-100', REVIEW: 'bg-purple-50 border-purple-100',
  PAYMENT: 'bg-emerald-50 border-emerald-100', SYSTEM: 'bg-gray-50 border-gray-100'
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('ALL');
  
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.list().then(r => r.data),
  });

  const markAll = useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => { toast.success('All marked as read'); qc.invalidateQueries({ queryKey: ['notifications'] }); }
  });

  const markOne = useMutation({
    mutationFn: (id: number) => notificationsAPI.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteOne = useMutation({
    mutationFn: (id: number) => notificationsAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); }
  });

  const notifs = (data?.notifications || []) as Notification[];
  const filtered = filter === 'ALL' ? notifs : notifs.filter(n => n.type === filter);
  const unread = notifs.filter(n => !n.isRead).length;

  const types: (string | NotificationType)[] = ['ALL','OFFER','ORDER','TRANSPORT','REVIEW','PAYMENT','SYSTEM'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🔔 Notifications</h1>
          <p className="text-gray-500 text-sm">{unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        <button onClick={() => markAll.mutate()} disabled={unread === 0 || markAll.isPending}
          className="btn btn-outline disabled:opacity-40">
          <i className="fas fa-check-double" /> Mark All Read
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${filter === t ? 'bg-green-500 text-white shadow-glow' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-gray-50">
        {isLoading && <div className="p-12 text-center"><i className="fas fa-spinner fa-spin text-2xl text-green-500" /></div>}
        {!isLoading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">🔔</div>
            <h3 className="text-lg font-bold text-gray-900">You're all caught up!</h3>
            <p className="text-gray-500 text-sm">No notifications</p>
          </div>
        )}
        {filtered.map(n => (
          <div key={n.id}
            className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-green-50/30' : ''}`}
            onClick={() => { markOne.mutate(n.id); if (n.link) navigate(n.link); }}>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 border ${typeColors[n.type] || 'bg-gray-50 border-gray-100'}`}>
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{n.title}</span>
                {!n.isRead && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />}
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{n.text}</p>
              <p className="text-xs text-gray-300 mt-1"><i className="fas fa-clock mr-1" />{timeAgo(n.createdAt)}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[10px] font-bold uppercase text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">{n.type}</span>
              <button onClick={e => { e.stopPropagation(); deleteOne.mutate(n.id); }} className="text-gray-300 hover:text-red-400 p-1 transition-colors"><i className="fas fa-times text-xs" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
