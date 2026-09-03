import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersAPI } from '@/lib/api';
import { formatMoney, formatDate, offerStatusColor } from '@/lib/utils';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import type { Offer } from '@/types';

export default function OffersPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: () => offersAPI.list().then(r => r.data.offers as Offer[]),
  });

  const respond = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) => offersAPI.respond(id, action),
    onSuccess: (_, { action }) => {
      toast.success(action === 'accept' ? 'Offer accepted! Order created 🎉' : 'Offer rejected');
      qc.invalidateQueries({ queryKey: ['offers'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => toast.error('Failed to respond to offer'),
  });

  const offers = (data || []) as Offer[];
  const incoming = offers.filter(o => o.toId === user?.id);
  const outgoing = offers.filter(o => o.fromId === user?.id);

  function OfferCard({ offer }: { offer: Offer }) {
    const isIncoming = offer.toId === user?.id;
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{offer.crop?.emoji}</div>
            <div>
              <div className="font-bold text-gray-900">{offer.crop?.name}</div>
              <div className="text-xs text-gray-400">
                {isIncoming ? `From: ${offer.from?.firstName} ${offer.from?.lastName}` : `To: ${offer.to?.firstName} ${offer.to?.lastName}`}
                · {formatDate(offer.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${offerStatusColor(offer.status)}`}>{offer.status}</span>
            <span className={`badge ${isIncoming ? 'badge-green' : 'badge-blue'}`}>{isIncoming ? '📩 Incoming' : '📤 Outgoing'}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-2xl p-4 mb-4">
          <div className="text-center"><div className="text-xs text-gray-400 font-semibold mb-1">OFFERED</div><div className="text-lg font-black text-green-600">{formatMoney(offer.offerPrice)}<span className="text-xs text-gray-400 font-normal">/{offer.crop?.unit}</span></div></div>
          <div className="text-center"><div className="text-xs text-gray-400 font-semibold mb-1">QUANTITY</div><div className="text-lg font-black text-gray-900">{offer.quantity} {offer.crop?.unit}</div></div>
          <div className="text-center"><div className="text-xs text-gray-400 font-semibold mb-1">TOTAL</div><div className="text-lg font-black text-gray-900">{formatMoney(offer.totalAmount)}</div></div>
        </div>

        {offer.message && (
          <div className="bg-yellow-50 rounded-xl p-3 mb-4 text-sm text-gray-600 italic border border-yellow-100">
            "{offer.message}"
          </div>
        )}

        {isIncoming && offer.status === 'PENDING' && (
          <div className="flex gap-3">
            <button className="btn btn-primary flex-1" onClick={() => { if(confirm('Accept this offer?')) respond.mutate({ id: offer.id, action: 'accept' }); }}>
              ✅ Accept Offer
            </button>
            <button className="btn btn-outline flex-1" onClick={() => respond.mutate({ id: offer.id, action: 'counter' })}>
              💬 Counter
            </button>
            <button className="btn btn-danger" onClick={() => { if(confirm('Reject this offer?')) respond.mutate({ id: offer.id, action: 'reject' }); }}>
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64"><i className="fas fa-spinner fa-spin text-2xl text-green-500" /></div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900">🤝 Offers</h1>
        <p className="text-gray-500 text-sm">Manage incoming and outgoing price offers</p>
      </div>

      {/* Incoming */}
      <div>
        <h2 className="text-base font-bold text-gray-700 mb-3">📩 Incoming Offers ({incoming.length})</h2>
        {incoming.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <div className="text-3xl mb-2">📩</div>
            <p className="text-sm">No incoming offers yet. List your crops to start receiving offers!</p>
          </div>
        ) : <div className="space-y-4">{incoming.map(o => <OfferCard key={o.id} offer={o} />)}</div>}
      </div>

      {/* Outgoing */}
      <div>
        <h2 className="text-base font-bold text-gray-700 mb-3">📤 Outgoing Offers ({outgoing.length})</h2>
        {outgoing.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <div className="text-3xl mb-2">📤</div>
            <p className="text-sm">You haven't sent any offers yet. Browse the marketplace!</p>
          </div>
        ) : <div className="space-y-4">{outgoing.map(o => <OfferCard key={o.id} offer={o} />)}</div>}
      </div>
    </div>
  );
}
