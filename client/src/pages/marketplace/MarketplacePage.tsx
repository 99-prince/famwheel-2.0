import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cropsAPI, offersAPI } from '@/lib/api';
import { formatMoney, categoryBg } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Crop } from '@/types';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store';

const categories = ['All','GRAIN','VEGETABLE','FRUIT','PULSE','OILSEED','SPICE','DAIRY'];

export default function MarketplacePage() {
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [sort, setSort]           = useState('createdAt');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [offerForm, setOfferForm] = useState({ qty: '', price: '', message: '' });
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const q = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['crops', search || q, category, sort],
    queryFn: () => cropsAPI.list({
      ...(search || q ? { search: search || q } : {}),
      ...(category ? { category } : {}),
      sortBy: sort,
    }).then(r => r.data),
  });

  const offerMutation = useMutation({
    mutationFn: () => offersAPI.create({ cropId: selectedCrop!.id, offerPrice: parseFloat(offerForm.price), quantity: parseFloat(offerForm.qty), message: offerForm.message }),
    onSuccess: () => {
      toast.success('Offer sent to farmer! 🤝');
      setSelectedCrop(null);
      setOfferForm({ qty:'', price:'', message:'' });
      qc.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to send offer'),
  });

  const crops = (data?.crops || []) as Crop[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🛒 Marketplace</h1>
          <p className="text-gray-500 text-sm">{data?.total || 0} crops available from verified farmers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-green-500 transition-colors">
          <i className="fas fa-search text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crops, category, location…"
            className="bg-transparent outline-none text-sm flex-1 font-sans text-gray-900 placeholder-gray-400" />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xs" /></button>}
        </div>
        <select value={category} onChange={e => setCategory(e.target.value === 'All' ? '' : e.target.value)}
          className="form-input !w-auto">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="form-input !w-auto">
          <option value="createdAt">Newest First</option>
          <option value="price">Price: Low → High</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c === 'All' ? '' : c)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${(c === 'All' && !category) || c === category ? 'bg-green-500 text-white shadow-glow' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-72 animate-pulse bg-gray-100" />)}
        </div>
      ) : crops.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-3">🌱</div>
          <h3 className="text-lg font-bold text-gray-900">No crops found</h3>
          <p className="text-gray-500 text-sm">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {crops.map(crop => (
            <div key={crop.id} className="crop-card animate-fade-in" onClick={() => setSelectedCrop(crop)}>
              <div className={`h-32 bg-gradient-to-br ${categoryBg(crop.category)} flex items-center justify-center`}>
                <span className="text-6xl">{crop.emoji}</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{crop.name}</h3>
                    <p className="text-xs text-gray-500">{crop.farmer?.city}, {crop.farmer?.state}</p>
                  </div>
                  <span className="badge badge-blue text-[10px]">{crop.category}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{crop.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-green-600">{formatMoney(crop.price)}</span>
                    <span className="text-xs text-gray-400">/{crop.unit}</span>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setSelectedCrop(crop); }}>
                    Make Offer
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-yellow-400 text-xs">★★★★☆</span>
                  <span className="text-xs text-gray-400">({crop._count?.orders || 0} orders)</span>
                  {crop.farmer?.verified && <span className="text-xs text-green-600 font-semibold ml-auto">✅ Verified</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crop Detail Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedCrop(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className={`h-48 bg-gradient-to-br ${categoryBg(selectedCrop.category)} flex items-center justify-center rounded-t-3xl relative`}>
              <span className="text-8xl">{selectedCrop.emoji}</span>
              <button onClick={() => setSelectedCrop(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-600 hover:bg-white">✕</button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedCrop.name}</h2>
                  <p className="text-sm text-gray-500">{selectedCrop.quality} · {selectedCrop.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-green-600">{formatMoney(selectedCrop.price)}<span className="text-sm text-gray-400 font-normal">/{selectedCrop.unit}</span></div>
                  <div className="text-xs text-gray-400">{selectedCrop.quantity} {selectedCrop.unit} available</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">{selectedCrop.description}</p>

              <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                    {selectedCrop.farmer?.avatar || '👨‍🌾'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{selectedCrop.farmer?.firstName} {selectedCrop.farmer?.lastName}</div>
                    <div className="text-xs text-gray-500">{selectedCrop.farmer?.city}, {selectedCrop.farmer?.state}</div>
                  </div>
                  {selectedCrop.farmer?.verified && <span className="ml-auto badge badge-green">✅ Verified</span>}
                </div>
              </div>

              {user?.role === 'BUYER' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900">Make an Offer</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label">Quantity ({selectedCrop.unit})</label>
                      <input className="form-input" type="number" min={selectedCrop.minOrderQty} max={selectedCrop.quantity}
                        value={offerForm.qty} onChange={e => setOfferForm(f => ({ ...f, qty: e.target.value }))}
                        placeholder={`Min ${selectedCrop.minOrderQty}`} />
                    </div>
                    <div>
                      <label className="form-label">Your Price (₹/{selectedCrop.unit})</label>
                      <input className="form-input" type="number" min={1}
                        value={offerForm.price} onChange={e => setOfferForm(f => ({ ...f, price: e.target.value }))}
                        placeholder={`Listed: ${selectedCrop.price}`} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Message (optional)</label>
                    <input className="form-input" value={offerForm.message} onChange={e => setOfferForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell the farmer about your requirements…" />
                  </div>
                  {offerForm.qty && offerForm.price && (
                    <div className="bg-green-50 rounded-xl p-3 text-sm">
                      <strong>Total offer:</strong> {formatMoney(parseFloat(offerForm.qty) * parseFloat(offerForm.price))}
                    </div>
                  )}
                  <button onClick={() => offerMutation.mutate()} disabled={offerMutation.isPending || !offerForm.qty || !offerForm.price}
                    className="btn btn-primary w-full justify-center py-3 text-sm font-bold rounded-2xl disabled:opacity-60">
                    {offerMutation.isPending ? <><i className="fas fa-spinner fa-spin" /> Sending…</> : '🤝 Send Offer'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
