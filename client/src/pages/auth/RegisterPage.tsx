import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import type { Role, User } from '@/types';

const roles: { value: Role; icon: string; title: string; desc: string }[] = [
  { value:'FARMER',    icon:'👨‍🌾', title:'Farmer',    desc:'List & sell your crops' },
  { value:'BUYER',     icon:'🛒',   title:'Buyer',     desc:'Source fresh produce'   },
  { value:'TRANSPORT', icon:'🚚',   title:'Transport', desc:'Provide delivery service'},
  { value:'ADMIN',     icon:'👨‍💼', title:'Admin',     desc:'Platform management'    },
];

const states = ['Andhra Pradesh','Bihar','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal','Delhi','Himachal Pradesh','Other'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore(s => s.setAuth);
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole]       = useState<Role>('FARMER');
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', state:'', city:'', password:'', confirm:'' });

  function f(field: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [field]: e.target.value })); }

  function pwdStrength(p: string): { label: string; color: string; pct: number } {
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const map = [
      { label:'Too weak', color:'bg-red-400', pct:20 },
      { label:'Weak', color:'bg-orange-400', pct:40 },
      { label:'Fair', color:'bg-yellow-400', pct:60 },
      { label:'Strong', color:'bg-green-400', pct:80 },
      { label:'Very Strong', color:'bg-green-600', pct:100 },
    ];
    return map[Math.max(0, s-1)] || map[0];
  }

  function validateStep2(): boolean {
    if (!form.firstName || !form.lastName) { toast.error('First and last name required'); return false; }
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) { toast.error('Valid email required'); return false; }
    if (!form.phone) { toast.error('Phone number required'); return false; }
    return true;
  }

  async function handleSubmit() {
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register({ ...form, role });
      setAuth(res.data.user as User, res.data.token as string);
      toast.success('Account created! Welcome to FAM WHEEL 🎉');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const pwd = pwdStrength(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 to-[#1a3020] p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-dark-900 to-dark-800 px-8 py-6">
          <div className="text-xl font-black text-white flex items-center gap-2 mb-2">🚜 FAM<span className="text-green-400">WHEEL</span></div>
          <h2 className="text-2xl font-black text-white">Create Your Account</h2>
          {/* Step progress */}
          <div className="flex items-center gap-0 mt-4">
            {['Role','Details','Password'].map((label, i) => (
              <div key={label} className="flex items-center">
                <div className={`flex items-center gap-2 ${i > 0 ? 'ml-2' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i+1 ? 'bg-green-400 text-white' : step === i+1 ? 'bg-green-500 text-white' : 'bg-white/15 text-white/40'}`}>
                    {step > i+1 ? '✓' : i+1}
                  </div>
                  <span className={`text-xs font-semibold ${step === i+1 ? 'text-green-400' : 'text-white/40'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-2 w-8 ${step > i+1 ? 'bg-green-400' : 'bg-white/15'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* STEP 1: Role */}
          {step === 1 && (
            <div>
              <p className="text-sm text-gray-500 mb-5">Choose how you'll use FAM WHEEL</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {roles.map(r => (
                  <button key={r.value} onClick={() => setRole(r.value)}
                    className={`border-2 rounded-2xl p-4 text-left transition-all ${role === r.value ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="text-3xl mb-2">{r.icon}</div>
                    <div className="text-sm font-bold text-gray-900">{r.title}</div>
                    <div className="text-xs text-gray-500">{r.desc}</div>
                    {role === r.value && <div className="text-green-600 text-xs font-bold mt-1">✓ Selected</div>}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="btn btn-primary w-full justify-center py-3 text-base font-bold rounded-2xl">
                Continue <i className="fas fa-arrow-right" />
              </button>
            </div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="form-label">First Name *</label><input className="form-input" value={form.firstName} onChange={f('firstName')} placeholder="Rajesh" /></div>
                <div><label className="form-label">Last Name *</label><input className="form-input" value={form.lastName} onChange={f('lastName')} placeholder="Kumar" /></div>
              </div>
              <div className="mb-3"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={f('email')} placeholder="you@example.com" /></div>
              <div className="mb-3"><label className="form-label">Phone *</label><input className="form-input" type="tel" value={form.phone} onChange={f('phone')} placeholder="+91 98765 43210" /></div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div><label className="form-label">State</label><select className="form-input" value={form.state} onChange={f('state')}><option value="">Select state</option>{states.map(s=><option key={s}>{s}</option>)}</select></div>
                <div><label className="form-label">City</label><input className="form-input" value={form.city} onChange={f('city')} placeholder="Your city" /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn btn-outline flex-none py-3 px-5 rounded-2xl"><i className="fas fa-arrow-left" /></button>
                <button onClick={() => { if (validateStep2()) setStep(3); }} className="btn btn-primary flex-1 justify-center py-3 text-base font-bold rounded-2xl">Continue <i className="fas fa-arrow-right" /></button>
              </div>
            </div>
          )}

          {/* STEP 3: Password */}
          {step === 3 && (
            <div>
              <div className="mb-3">
                <label className="form-label">Create Password *</label>
                <input className="form-input" type="password" value={form.password} onChange={f('password')} placeholder="Minimum 6 characters" />
                {form.password && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div className={`h-full ${pwd.color} rounded-full transition-all`} style={{ width:`${pwd.pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{pwd.label}</span>
                  </div>
                )}
              </div>
              <div className="mb-6">
                <label className="form-label">Confirm Password *</label>
                <input className="form-input" type="password" value={form.confirm} onChange={f('confirm')} placeholder="Repeat password" />
                {form.confirm && form.password !== form.confirm && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn btn-outline flex-none py-3 px-5 rounded-2xl"><i className="fas fa-arrow-left" /></button>
                <button onClick={handleSubmit} disabled={loading} className="btn btn-primary flex-1 justify-center py-3 text-base font-bold rounded-2xl disabled:opacity-70">
                  {loading ? <><i className="fas fa-spinner fa-spin" /> Creating…</> : <><i className="fas fa-user-plus" /> Create Account</>}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-green-600 font-bold hover:underline">Sign in →</button>
          </p>
        </div>
      </div>
    </div>
  );
}
