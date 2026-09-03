import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '@/lib/api';
import { formatMoney, formatDate, orderStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Order } from '@/types';

const statusTabs = ['All','Pending','Confirmed','In_Transit','Delivered','Cancelled'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [selected, setSelected] = useState<Order | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', activeTab],
    queryFn: () => ordersAPI.list(activeTab !== 'All' ? { status: activeTab.toUpperCase() } : {}).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersAPI.updateStatus(id, status),
    onSuccess: (_, { status }) => {
      toast.success(`Order ${status.toLowerCase()}!`);
      setSelected(null);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order-stats'] });
    },
    onError: () => toast.error('Failed to update order'),
  });

  const orders = (data?.orders || []) as Order[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900">📦 Orders</h1>
        <p className="text-gray-500 text-sm">Track and manage all your crop orders</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === t ? 'bg-green-500 text-white shadow-glow' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}>
            {t.replace('_',' ')}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400"><i className="fas fa-spinner fa-spin text-2xl text-green-500" /></div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">📦</div>
            <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
            <p className="text-gray-500 text-sm">Your orders will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Order</th><th>Crop</th><th>Qty</th><th>Amount</th><th>Status</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><strong className="text-green-600 cursor-pointer hover:underline" onClick={() => setSelected(o)}>{o.id.slice(0,8)}…</strong></td>
                    <td><span className="font-semibold">{o.crop?.emoji} {o.crop?.name}</span></td>
                    <td>{o.quantity} {o.crop?.unit}</td>
                    <td><strong>{formatMoney(o.totalAmount)}</strong></td>
                    <td><span className={`badge ${orderStatusColor(o.status)}`}>{o.status.replace('_',' ')}</span></td>
                    <td><span className={`badge ${o.paymentStatus === 'PAID' ? 'badge-green' : 'badge-yellow'}`}>{o.paymentStatus}</span></td>
                    <td className="text-xs whitespace-nowrap">{formatDate(o.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(o)}><i className="fas fa-eye" /></button>
                        {o.status === 'PENDING' && (
                          <button className="btn btn-primary btn-sm" onClick={() => updateStatus.mutate({ id: o.id, status: 'CONFIRMED' })}>Accept</button>
                        )}
                        {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                          <button className="btn btn-danger btn-sm" onClick={() => { if(confirm('Cancel this order?')) updateStatus.mutate({ id: o.id, status: 'CANCELLED' }); }}>
                            <i className="fas fa-times" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-in p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div><h2 className="font-black text-gray-900 text-lg">{selected.id.slice(0,12)}…</h2><p className="text-xs text-gray-400">Placed {formatDate(selected.createdAt)}</p></div>
              <div className="flex items-center gap-2">
                <span className={`badge ${orderStatusColor(selected.status)}`}>{selected.status.replace('_',' ')}</span>
                <button onClick={() => setSelected(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">✕</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                ['Crop', `${selected.crop?.emoji} ${selected.crop?.name}`],
                ['Quantity', `${selected.quantity} ${selected.crop?.unit}`],
                ['Price/Unit', formatMoney(selected.pricePerUnit)],
                ['Total', formatMoney(selected.totalAmount)],
                ['Payment', selected.paymentStatus],
                ['Farmer', `${selected.farmer?.firstName} ${selected.farmer?.lastName}`],
                ['Buyer', `${selected.buyer?.firstName} ${selected.buyer?.lastName}`],
              ].map(([label, val]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">{label}</div>
                  <div className="text-sm font-semibold text-gray-900">{val}</div>
                </div>
              ))}
            </div>
            {selected.deliveryAddress && (
              <div className="bg-yellow-50 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-400 font-bold mb-1">DELIVERY ADDRESS</div>
                <div className="text-sm text-gray-700">{selected.deliveryAddress}</div>
              </div>
            )}
            <div className="flex gap-3">
              {selected.status === 'PENDING' && <button className="btn btn-primary flex-1" onClick={() => updateStatus.mutate({ id: selected.id, status: 'CONFIRMED' })}>✅ Accept</button>}
              {selected.status !== 'CANCELLED' && selected.status !== 'DELIVERED' && (
                <button className="btn btn-danger flex-1" onClick={() => { if(confirm('Cancel?')) updateStatus.mutate({ id: selected.id, status: 'CANCELLED' }); }}>Cancel Order</button>
              )}
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
