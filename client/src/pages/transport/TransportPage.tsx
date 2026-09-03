import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transportAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import type { TransportRequest } from '@/types';

const statusColors: Record<string, string> = {
  OPEN:'badge-yellow', BIDDING:'badge-blue', ASSIGNED:'badge-purple',
  PICKED_UP:'badge-orange', DELIVERED:'badge-green', CANCELLED:'badge-red'
};

export default function TransportPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fromLocation:'', toLocation:'', distance:'', weight:'', requiredBy:'', notes:'' });

  const { data, isLoading } = useQuery({
    queryKey: ['transport'],
    queryFn: () => transportAPI.list().then(r => r.data.requests as TransportRequest[]),
  });

  const createReq = useMutation({
    mutationFn: () => transportAPI.create({ ...form }),
    onSuccess: () => {
      toast.success('🚚 Transport request posted! Providers will bid shortly.');
      setShowModal(false);
      setForm({ fromLocation:'', toLocation:'', distance:'', weight:'', requiredBy:'', notes:'' });
      qc.invalidateQueries({ queryKey: ['transport'] });
    },
    onError: () => toast.error('Failed to post request'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => transportAPI.updateStatus(id, status),
    onSuccess: () => { toast.success('Status updated!'); qc.invalidateQueries({ queryKey: ['transport'] }); },
  });

  const requests = (data || []) as TransportRequest[];

  // Find in-transit
  const active = requests.find(r => r.status === 'ASSIGNED' || r.status === 'PICKED_UP');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🚚 Transport</h1>
          <p className="text-gray-500 text-sm">Manage deliveries and track your shipments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <i className="fas fa-plus" /> New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Requests', value: requests.length, icon:'📋', bg:'bg-blue-100 text-blue-600' },
          { label:'Open', value: requests.filter(r=>r.status==='OPEN').length, icon:'🔓', bg:'bg-yellow-100 text-yellow-600' },
          { label:'In Transit', value: requests.filter(r=>r.status==='ASSIGNED'||r.status==='PICKED_UP').length, icon:'🚚', bg:'bg-purple-100 text-purple-600' },
          { label:'Delivered', value: requests.filter(r=>r.status==='DELIVERED').length, icon:'✅', bg:'bg-green-100 text-green-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><p className="text-xs font-semibold text-gray-400 uppercase mb-1">{s.label}</p><p className="text-2xl font-black text-gray-900">{s.value}</p></div>
            <div className={`stat-icon ${s.bg} text-xl`}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Active Delivery Tracker */}
      {active && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="font-bold text-gray-900">📡 Live Delivery Tracking</h3>
            <span className={`badge ${statusColors[active.status]}`}>{active.status.replace('_',' ')}</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                <div className="text-2xl mb-1">📦</div>
                <div className="text-xs text-gray-400 font-semibold mb-1">FROM</div>
                <div className="text-sm font-bold text-gray-900">{active.fromLocation}</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl animate-float">🚚</div>
                <div className="text-xs text-gray-400 mt-1">{active.distance ? `${active.distance} km` : 'En Route'}</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                <div className="text-2xl mb-1">🏭</div>
                <div className="text-xs text-gray-400 font-semibold mb-1">TO</div>
                <div className="text-sm font-bold text-gray-900">{active.toLocation}</div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                  style={{ width: active.status === 'PICKED_UP' ? '70%' : '40%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                <span>Picked Up</span><span>In Transit 🚚</span><span>Delivered</span>
              </div>
            </div>

            {active.provider && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  ['Driver', active.provider.user?.firstName + ' ' + active.provider.user?.lastName],
                  ['Vehicle', active.provider.vehicleNo || active.provider.vehicleType],
                  ['Freight', active.bidAmount ? `₹${active.bidAmount.toLocaleString('en-IN')}` : 'TBD'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-400 font-semibold mb-1">{label}</div>
                    <div className="text-sm font-bold text-gray-900">{val}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button className="btn btn-primary btn-sm" onClick={() => toast.success('Calling driver…')}><i className="fas fa-phone" /> Call Driver</button>
              <button className="btn btn-outline btn-sm" onClick={() => toast.success('Opening GPS tracking…')}><i className="fas fa-map-marker-alt" /> Track on Map</button>
              {user?.role === 'TRANSPORT' && active.status === 'ASSIGNED' && (
                <button className="btn btn-outline btn-sm" onClick={() => updateStatus.mutate({ id: active.id, status: 'PICKED_UP' })}>
                  Mark Picked Up
                </button>
              )}
              {user?.role === 'TRANSPORT' && active.status === 'PICKED_UP' && (
                <button className="btn btn-primary btn-sm" onClick={() => updateStatus.mutate({ id: active.id, status: 'DELIVERED' })}>
                  ✅ Mark Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Requests Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-bold text-gray-900">📋 All Transport Requests</h3>
        </div>
        {isLoading ? (
          <div className="p-12 text-center"><i className="fas fa-spinner fa-spin text-2xl text-green-500" /></div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">🚚</div>
            <h3 className="text-lg font-bold text-gray-900">No transport requests</h3>
            <p className="text-gray-500 text-sm mb-4">Create a request to arrange crop delivery</p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">+ New Request</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Route</th><th>Weight</th><th>Required By</th><th>Status</th><th>Provider</th><th>Bid</th><th>Actions</th></tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="text-sm">
                        <strong className="text-gray-900">{r.fromLocation}</strong>
                        <div className="text-gray-400 text-xs">→ {r.toLocation} {r.distance ? `· ${r.distance}km` : ''}</div>
                      </div>
                    </td>
                    <td>{r.weight ? `${r.weight} kg` : '—'}</td>
                    <td className="text-xs">{r.requiredBy ? formatDate(r.requiredBy) : '—'}</td>
                    <td><span className={`badge ${statusColors[r.status] || 'badge-yellow'}`}>{r.status.replace('_',' ')}</span></td>
                    <td className="text-sm">{r.provider?.user?.firstName ? `${r.provider.user.firstName} ${r.provider.user.lastName}` : <span className="text-gray-400">No bids yet</span>}</td>
                    <td>{r.bidAmount ? <strong className="text-green-600">₹{r.bidAmount.toLocaleString('en-IN')}</strong> : '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        {r.status === 'OPEN' && (
                          <button className="btn btn-outline btn-sm" onClick={() => toast.success('Showing provider bids…')}>View Bids</button>
                        )}
                        {(r.status === 'ASSIGNED' || r.status === 'PICKED_UP') && (
                          <button className="btn btn-outline btn-sm" onClick={() => toast.success('Opening tracking map…')}><i className="fas fa-map-marker-alt" /></button>
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

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-gray-900">🚚 New Transport Request</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">From *</label><input className="form-input" value={form.fromLocation} onChange={e => setForm(f=>({...f,fromLocation:e.target.value}))} placeholder="Farm/city" /></div>
                <div><label className="form-label">To *</label><input className="form-input" value={form.toLocation} onChange={e => setForm(f=>({...f,toLocation:e.target.value}))} placeholder="Buyer/market" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Weight (kg)</label><input type="number" className="form-input" value={form.weight} onChange={e => setForm(f=>({...f,weight:e.target.value}))} placeholder="500" /></div>
                <div><label className="form-label">Required By</label><input type="date" className="form-input" value={form.requiredBy} onChange={e => setForm(f=>({...f,requiredBy:e.target.value}))} min={new Date().toISOString().split('T')[0]} /></div>
              </div>
              <div><label className="form-label">Notes</label><input className="form-input" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Special instructions, refrigeration, etc." /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => createReq.mutate()} disabled={!form.fromLocation || !form.toLocation || createReq.isPending}
                className="btn btn-primary flex-1 justify-center py-3 font-bold rounded-2xl disabled:opacity-60">
                {createReq.isPending ? <><i className="fas fa-spinner fa-spin" /> Posting…</> : '📤 Post Request'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn btn-outline px-5 py-3 rounded-2xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
