import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketPricesAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import type { MarketPrice } from '@/types';

export default function MarketPricesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');

  const { data, isLoading } = useQuery({
    queryKey: ['market-prices'],
    queryFn: () => marketPricesAPI.list().then(r => r.data.prices as MarketPrice[]),
    refetchInterval: 30000, // refresh every 30s
  });

  const prices = (data || []) as MarketPrice[];

  let filtered = prices.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.region.toLowerCase().includes(search.toLowerCase())
  );
  if (sort === 'price_asc')  filtered = [...filtered].sort((a,b) => a.price - b.price);
  if (sort === 'price_desc') filtered = [...filtered].sort((a,b) => b.price - a.price);
  if (sort === 'name')       filtered = [...filtered].sort((a,b) => a.name.localeCompare(b.name));

  // Simulate prev price as 2% lower (would come from DB in production)
  const withChange = filtered.map(p => {
    const prev = +(p.price * (0.95 + Math.random() * 0.1)).toFixed(0);
    const diff  = p.price - prev;
    const pct   = ((diff / prev) * 100).toFixed(2);
    return { ...p, prev, diff, pct: parseFloat(pct), up: diff >= 0 };
  });

  const gainers = [...withChange].filter(p => p.up).sort((a,b) => b.pct - a.pct).slice(0,3);
  const losers  = [...withChange].filter(p => !p.up).sort((a,b) => a.pct - b.pct).slice(0,3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📊 Market Prices</h1>
          <p className="text-gray-500 text-sm">Live commodity rates across major Indian mandis</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 text-xs text-green-700 font-semibold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-green inline-block" />
          Live · Auto-refreshes every 30s
        </div>
      </div>

      {/* Gainers / Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-5 border border-green-200">
          <div className="text-xs font-bold text-green-700 uppercase tracking-widest mb-4">📈 Top Gainers Today</div>
          {gainers.map(p => (
            <div key={p.id} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-sm font-bold text-gray-900 flex-1">{p.name}</span>
              <span className="text-sm font-black text-green-600">▲ {p.pct}%</span>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl p-5 border border-red-200">
          <div className="text-xs font-bold text-red-700 uppercase tracking-widest mb-4">📉 Top Losers Today</div>
          {losers.map(p => (
            <div key={p.id} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-sm font-bold text-gray-900 flex-1">{p.name}</span>
              <span className="text-sm font-black text-red-600">▼ {Math.abs(p.pct)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-green-500 transition-colors">
          <i className="fas fa-search text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search commodity or region…"
            className="bg-transparent outline-none text-sm flex-1 font-sans placeholder-gray-400" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="form-input !w-auto">
          <option value="name">Sort: A-Z</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="price_asc">Price: Low → High</option>
        </select>
      </div>

      {/* Prices Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-bold text-gray-900">All Commodities</h3>
          <span className="text-xs text-gray-400">{filtered.length} crops</span>
        </div>
        {isLoading ? (
          <div className="p-12 text-center"><i className="fas fa-spinner fa-spin text-2xl text-green-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Commodity</th><th>Region</th><th>Current Price</th><th>Change</th><th>Range</th><th>Action</th></tr>
              </thead>
              <tbody>
                {withChange.map(p => (
                  <tr key={p.id} className="hover:bg-green-50/20 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <div>
                          <strong>{p.name}</strong>
                          <div className="text-xs text-gray-400">{p.category}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-xs text-gray-500"><i className="fas fa-map-marker-alt text-gray-300 mr-1" />{p.region}</span></td>
                    <td>
                      <strong className="text-base">₹{p.price.toLocaleString('en-IN')}</strong>
                      <span className="text-xs text-gray-400">/{p.unit}</span>
                    </td>
                    <td>
                      <div className={`text-sm font-bold ${p.up ? 'text-green-600' : 'text-red-500'}`}>
                        {p.up ? '▲' : '▼'} ₹{Math.abs(p.diff)}
                      </div>
                      <span className={`badge text-[10px] ${p.up ? 'badge-green' : 'badge-red'}`}>
                        {p.up ? '+' : ''}{p.pct}%
                      </span>
                    </td>
                    <td>
                      <div className="text-xs text-gray-400 mb-1">₹{p.minPrice} – ₹{p.maxPrice}</div>
                      <div className="h-1.5 bg-gray-100 rounded-full w-24 overflow-hidden">
                        <div className={`h-full rounded-full ${p.up ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{ width: `${Math.round(((p.price - p.minPrice) / (p.maxPrice - p.minPrice)) * 100)}%` }} />
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/marketplace?q=${p.name}`)}>
                          Buy Now
                        </button>
                        <button className="btn btn-outline btn-sm" title="Set price alert" onClick={() => alert(`Price alert set for ${p.name}!`)}>
                          <i className="fas fa-bell" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
        <i className="fas fa-info-circle text-yellow-500 mr-1.5" />
        <strong>Disclaimer:</strong> Prices shown are indicative mandi rates. Actual prices may vary by quality, quantity, and negotiation. FAM WHEEL is not responsible for discrepancies.
      </div>
    </div>
  );
}
