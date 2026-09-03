import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cropsAPI } from '@/lib/api';
import { formatMoney, categoryBg } from '@/lib/utils';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import type { Crop, Category } from '@/types';

const categories: Category[] = ['GRAIN','VEGETABLE','FRUIT','PULSE','OILSEED','SPICE','DAIRY','OTHER'];
const qualities = ['Grade A','Grade B','Premium','Fresh','Organic','Export Quality'];
const units = ['kg','qtl','ton','dozen'];

const EMPTY_FORM = { name:'', emoji:'🌱', category:'VEGETABLE' as Category, quality:'Grade A', description:'', price:'', unit:'kg', quantity:'', minOrderQty:'', isAvailable: true };

export default function MyListingsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-crops'],
    queryFn: () => cropsAPI.myCrops().then(r => r.data.crops as Crop[]),
    enabled: user?.role === 'FARMER' || user?.role === 'ADMIN',
  });

  const saveCrop = useMutation({
    mutationFn: () => {
      const payload = { ...form, price: parseFloat(form.price), quantity: parseFloat(form.quantity), minOrderQty: parseFloat(form.minOrderQty) || 1 };
      return editingId ? cropsAPI.update(editingId, payload) : cropsAPI.create(payload);
    },
    onSuccess: () => {
      toast.success(editingId ? 'Listing updated!' : 'Listing added to marketplace! 🌾');
      setShowModal(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      qc.invalidateQueries({ queryKey: ['my-crops'] });
    },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save listing'),
  });

  const deleteCrop = useMutation({
    mutationFn: (id: number) => cropsAPI.delete(id),
    onSuccess: () => { toast.success('Listing removed'); qc.invalidateQueries({ queryKey: ['my-crops'] }); },
    onError: () => toast.error('Failed to remove listing'),
  });

  const toggleAvail = useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) => cropsAPI.update(id, { isAvailable }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-crops'] }),
  });

  function openAdd() { setEditingId(null); setForm({ ...EMPTY_FORM }); setShowModal(true); }
  function openEdit(c: Crop) {
    setEditingId(c.id);
    setForm({ name:c.name, emoji:c.emoji, category:c.category, quality:c.quality, description:c.description, price:String(c.price), unit:c.unit, quantity:String(c.quantity), minOrderQty:String(c.minOrderQty), isAvailable:c.isAvailable });
    setShowModal(true);
  }
  function f(field: string) { return (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => setForm(p => ({ ...p, [field]: e.target.value })); }

  const crops = (data || []) as Crop[];
  const filtered = crops.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const activeCount = crops.filter(c => c.isAvailable).length;
  const totalVal = crops.filter(c => c.isAvailable).reduce((s,c) => s + c.price * c.quantity, 0);

  if (user?.role !== 'FARMER' && user?.role !== 'ADMIN') {
    return (
      <div className="card p-16 text-center">
        <div className="text-5xl mb-3">🌾</div>
        <h3 className="text-xl font-bold text-gray-900">Farmer Access Only</h3>
        <p className="text-gray-500 mt-2">My Listings is available for Farmer accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🌾 My Listings</h1>
          <p className="text-gray-500 text-sm">Manage your crops on the marketplace</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary"><i className="fas fa-plus" /> Add New Listing</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Listings', value: crops.length, icon:'🌱', bg:'bg-green-100 text-green-600' },
          { label:'Active Listings', value: activeCount, icon:'✅', bg:'bg-blue-100 text-blue-600' },
          { label:'Total Orders', value: crops.reduce((s,c) => s+(c._count?.orders||0),0), icon:'📦', bg:'bg-yellow-100 text-yellow-600' },
          { label:'Estimated Value', value: formatMoney(totalVal), icon:'₹', bg:'bg-purple-100 text-purple-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><p className="text-xs font-semibold text-gray-400 uppercase mb-1">{s.label}</p><p className="text-2xl font-black text-gray-900">{s.value}</p></div>
            <div className={`stat-icon ${s.bg} text-xl`}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-bold text-gray-900">All Listings</h3>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="form-input !w-48" />
        </div>
        {isLoading ? (
          <div className="p-12 text-center"><i className="fas fa-spinner fa-spin text-2xl text-green-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">🌾</div>
            <h3 className="text-lg font-bold text-gray-900">No listings yet</h3>
            <p className="text-gray-500 text-sm mb-4">Add your first crop to the marketplace</p>
            <button onClick={openAdd} className="btn btn-primary">+ Add Listing</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Crop</th><th>Category</th><th>Price</th><th>Qty</th><th>Quality</th><th>Orders</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryBg(c.category)} flex items-center justify-center text-2xl flex-shrink-0`}>{c.emoji}</div>
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{c.category}</span></td>
                    <td><strong>{formatMoney(c.price)}</strong><span className="text-xs text-gray-400">/{c.unit}</span></td>
                    <td>{c.quantity} {c.unit}</td>
                    <td><span className="badge badge-green">{c.quality}</span></td>
                    <td>{c._count?.orders || 0}</td>
                    <td>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={c.isAvailable}
                          onChange={e => toggleAvail.mutate({ id: c.id, isAvailable: e.target.checked })}
                          className="accent-green-500 w-4 h-4" />
                        <span className={`text-xs font-bold ${c.isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                          {c.isAvailable ? 'Active' : 'Paused'}
                        </span>
                      </label>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}><i className="fas fa-edit" /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => { if(confirm('Delete listing?')) deleteCrop.mutate(c.id); }}><i className="fas fa-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-gray-900">{editingId ? '✏️ Edit Listing' : '➕ Add New Listing'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3"><label className="form-label">Crop Name *</label><input className="form-input" value={form.name} onChange={f('name')} placeholder="e.g. Wheat, Tomato…" /></div>
                <div><label className="form-label">Emoji</label><input className="form-input text-2xl text-center" value={form.emoji} onChange={f('emoji')} maxLength={2} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Category *</label><select className="form-input" value={form.category} onChange={f('category')}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label className="form-label">Quality Grade</label><select className="form-input" value={form.quality} onChange={f('quality')}>{qualities.map(q=><option key={q}>{q}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="form-label">Price *</label><input type="number" className="form-input" value={form.price} onChange={f('price')} placeholder="0" /></div>
                <div><label className="form-label">Unit</label><select className="form-input" value={form.unit} onChange={f('unit')}>{units.map(u=><option key={u}>{u}</option>)}</select></div>
                <div><label className="form-label">Quantity *</label><input type="number" className="form-input" value={form.quantity} onChange={f('quantity')} placeholder="0" /></div>
              </div>
              <div><label className="form-label">Min Order Qty</label><input type="number" className="form-input" value={form.minOrderQty} onChange={f('minOrderQty')} placeholder="1" /></div>
              <div>
                <label className="form-label">Description *</label>
                <textarea className="form-input min-h-[80px] resize-none" value={form.description} onChange={f('description')}
                  placeholder="Describe quality, farming method, harvest date, storage…" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => saveCrop.mutate()} disabled={!form.name || !form.price || !form.quantity || !form.description || saveCrop.isPending}
                className="btn btn-primary flex-1 justify-center py-3 font-bold rounded-2xl disabled:opacity-60">
                {saveCrop.isPending ? <><i className="fas fa-spinner fa-spin" /> Saving…</> : <><i className="fas fa-save" /> {editingId ? 'Update Listing' : 'Add to Marketplace'}</>}
              </button>
              <button onClick={() => setShowModal(false)} className="btn btn-outline px-5 py-3 rounded-2xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
