import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import type { User } from '@/types';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore(s => s.setAuth);
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const demoAccounts = [
    { icon: '👨‍🌾', label: 'Farmer',    email: 'farmer@demo.com',    password: 'demo123' },
    { icon: '🛒',   label: 'Buyer',     email: 'buyer@demo.com',     password: 'demo123' },
    { icon: '🚚',   label: 'Transport', email: 'transport@demo.com', password: 'demo123' },
    { icon: '👨‍💼', label: 'Admin',     email: 'admin@demo.com',     password: 'admin123' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res  = await authAPI.login(form.email, form.password);
      const data = res.data;
      setAuth(data.user as User, data.token as string);
      toast.success(`Welcome back, ${data.user.firstName}! 🚜`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed. Try a demo account!';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email: string, password: string) {
    setForm({ email, password });
    setTimeout(() => handleSubmit({ preventDefault: () => {} } as React.FormEvent), 100);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT – Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-dark-900 via-dark-800 to-[#1a3020] p-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />

        <div className="text-2xl font-black text-white flex items-center gap-2.5 relative z-10">
          🚜 FAM<span className="text-green-400">WHEEL</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            India's Smartest<br /><span className="text-green-400">Agricultural</span><br />Marketplace
          </h2>
          <p className="text-white/60 text-base mb-10 leading-relaxed">
            Connect directly with farmers, buyers, and transport providers. Transparent prices, no middlemen, fair trade for all.
          </p>

          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">👇 Quick Demo Login</p>
          <div className="flex flex-col gap-3">
            {demoAccounts.map(a => (
              <button
                key={a.email}
                onClick={() => fillDemo(a.email, a.password)}
                className="flex items-center gap-3.5 bg-white/5 border border-white/10 hover:bg-green-500/15 hover:border-green-500/30 rounded-2xl px-4 py-3.5 text-left transition-all group"
              >
                <div className="w-10 h-10 bg-white/8 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {a.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Login as {a.label}</div>
                  <div className="text-xs text-white/40">{a.email}</div>
                </div>
                <i className="fas fa-arrow-right text-white/20 ml-auto text-sm group-hover:text-green-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8 relative z-10">
          {[['10K+','Farmers'],['5K+','Buyers'],['98%','Delivery Rate']].map(([v,l]) => (
            <div key={l}>
              <div className="text-2xl font-black text-green-400">{v}</div>
              <div className="text-xs text-white/40">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT – Form */}
      <div className="flex flex-col justify-center px-8 py-12 bg-white sm:px-16">
        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden text-2xl font-black text-gray-900 flex items-center gap-2 mb-8">
            🚜 FAM<span className="text-green-500">WHEEL</span>
          </div>

          <h2 className="text-3xl font-black text-gray-900 mb-1">Sign In 👋</h2>
          <p className="text-gray-500 text-sm mb-8">Enter your credentials to access your dashboard</p>

          {/* Mobile demo btns */}
          <div className="lg:hidden grid grid-cols-2 gap-2 mb-6">
            {demoAccounts.slice(0,2).map(a => (
              <button key={a.email} onClick={() => fillDemo(a.email, a.password)}
                className="text-xs font-semibold py-2 px-3 bg-green-50 border border-green-200 rounded-xl text-green-700 hover:bg-green-100 transition-colors">
                {a.icon} {a.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <input className="form-input !pl-10" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <input className="form-input !pl-10 !pr-10" type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPwd(!showPwd)}>
                  <i className={`fas fa-eye${showPwd ? '-slash' : ''} text-sm`} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn btn-primary w-full justify-center py-3 text-base font-bold rounded-2xl disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <><i className="fas fa-spinner fa-spin" /> Signing in…</> : <><i className="fas fa-sign-in-alt" /> Sign In</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-green-600 font-bold hover:underline">
              Create one free →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
