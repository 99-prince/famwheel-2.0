import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usersAPI, reviewsAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Review } from '@/types';

const states = ['','Punjab','Maharashtra','UP','MP','Rajasthan','Gujarat','Karnataka','West Bengal','Kerala','Delhi','Himachal Pradesh','Other'];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
    state:     user?.state     || '',
    city:      user?.city      || '',
    bio:       user?.bio       || '',
  });
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersAPI.profile().then(r => r.data),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => user ? reviewsAPI.forUser(user.id).then(r => r.data) : Promise.resolve({ reviews:[], avgRating:null }),
    enabled: !!user,
  });

  const saveProfile = useMutation({
    mutationFn: () => usersAPI.updateProfile(form),
    onSuccess: (res) => {
      updateUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated! ✅');
    },
    onError: () => toast.error('Failed to save profile'),
  });

  const changePassword = useMutation({
    mutationFn: () => import('@/lib/api').then(m => m.authAPI.changePassword({ currentPassword: pwdForm.current, newPassword: pwdForm.next })),
    onSuccess: () => {
      toast.success('Password changed!');
      setPwdForm({ current:'', next:'', confirm:'' });
    },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to change password'),
  });

  const reviews = (reviewsData?.reviews || []) as Review[];
  const avgRating = reviewsData?.avgRating;
  const profile = profileData?.user || user;
  const stats = profileData?.user?._count || {};

  const roleConfig = {
    FARMER:    { icon:'👨‍🌾', color:'bg-green-100 text-green-700', label:'Farmer'    },
    BUYER:     { icon:'🛒',   color:'bg-blue-100 text-blue-700',   label:'Buyer'     },
    TRANSPORT: { icon:'🚚',   color:'bg-yellow-100 text-yellow-700',label:'Transport' },
    ADMIN:     { icon:'👨‍💼', color:'bg-purple-100 text-purple-700',label:'Admin'     },
  };
  const rc = roleConfig[user?.role || 'FARMER'];

  function f(field: string) { return (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => setForm(p => ({ ...p, [field]: e.target.value })); }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-800 to-[#1a3020] rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-green-400/10 blur-3xl pointer-events-none" />
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-4xl flex-shrink-0 shadow-glow-lg">
          {profile?.avatar || profile?.firstName?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0 relative z-10 text-center sm:text-left">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 ${rc.color}`}>
            {rc.icon} {rc.label} {profile?.verified ? '✅ Verified' : ''}
          </div>
          <h1 className="text-2xl font-black text-white">{profile?.firstName} {profile?.lastName}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-white/50 text-sm justify-center sm:justify-start">
            <span><i className="fas fa-envelope mr-1" />{profile?.email}</span>
            {profile?.phone && <span><i className="fas fa-phone mr-1" />{profile?.phone}</span>}
            {profile?.state && <span><i className="fas fa-map-marker-alt mr-1" />{profile?.city ? `${profile.city}, ` : ''}{profile.state}</span>}
            <span><i className="fas fa-calendar mr-1" />Joined {profile?.createdAt ? formatDate(profile.createdAt) : '—'}</span>
          </div>
        </div>
        <div className="relative z-10 text-center">
          <div className="text-3xl font-black text-green-400">{avgRating ? `★ ${avgRating}` : '—'}</div>
          <div className="text-white/40 text-xs">{reviews.length} reviews</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Crops Listed',  value: stats.crops ?? '—',              icon:'🌾', bg:'bg-green-100 text-green-600' },
          { label:'Orders Sold',   value: stats.ordersAsFarmer ?? '—',     icon:'📦', bg:'bg-blue-100 text-blue-600' },
          { label:'Orders Bought', value: stats.ordersAsBuyer ?? '—',      icon:'🛒', bg:'bg-yellow-100 text-yellow-600' },
          { label:'Rating',        value: avgRating ? `${avgRating} ★` : '—', icon:'⭐', bg:'bg-purple-100 text-purple-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><p className="text-xs font-semibold text-gray-400 uppercase mb-1">{s.label}</p><p className="text-2xl font-black text-gray-900">{s.value}</p></div>
            <div className={`stat-icon ${s.bg} text-xl`}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Profile */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="font-bold text-gray-900">✏️ Profile Information</h3>
            {!editing && <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm"><i className="fas fa-edit" /> Edit</button>}
          </div>
          <div className="card-body space-y-3">
            {editing ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={f('firstName')} /></div>
                  <div><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={f('lastName')} /></div>
                </div>
                <div><label className="form-label">Phone</label><input className="form-input" type="tel" value={form.phone} onChange={f('phone')} placeholder="+91 98765 43210" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="form-label">State</label><select className="form-input" value={form.state} onChange={f('state')}>{states.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div><label className="form-label">City</label><input className="form-input" value={form.city} onChange={f('city')} /></div>
                </div>
                <div><label className="form-label">Bio</label><textarea className="form-input min-h-[80px] resize-none" value={form.bio} onChange={f('bio')} placeholder="Tell others about yourself…" /></div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}
                    className="btn btn-primary flex-1 justify-center rounded-2xl py-2.5 font-bold disabled:opacity-60">
                    {saveProfile.isPending ? <><i className="fas fa-spinner fa-spin" /> Saving…</> : <><i className="fas fa-save" /> Save Changes</>}
                  </button>
                  <button onClick={() => { setEditing(false); }} className="btn btn-outline px-5 rounded-2xl">Cancel</button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Full Name', `${profile?.firstName} ${profile?.lastName}`],
                  ['Email', profile?.email || '—'],
                  ['Phone', profile?.phone || 'Not added'],
                  ['Role', `${rc.icon} ${rc.label}`],
                  ['State', profile?.state || 'Not set'],
                  ['City', profile?.city || 'Not set'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 font-semibold mb-1">{label}</div>
                    <div className="text-sm font-semibold text-gray-900">{val}</div>
                  </div>
                ))}
                {profile?.bio && (
                  <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 font-semibold mb-1">Bio</div>
                    <div className="text-sm text-gray-700 leading-relaxed">{profile.bio}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Security */}
          <div className="card">
            <div className="card-header"><h3 className="font-bold text-gray-900">🔒 Security</h3></div>
            <div className="card-body space-y-3">
              <div><label className="form-label">Current Password</label><input type="password" className="form-input" value={pwdForm.current} onChange={e=>setPwdForm(p=>({...p,current:e.target.value}))} placeholder="••••••" /></div>
              <div><label className="form-label">New Password</label><input type="password" className="form-input" value={pwdForm.next} onChange={e=>setPwdForm(p=>({...p,next:e.target.value}))} placeholder="Min 6 chars" /></div>
              <div><label className="form-label">Confirm New</label><input type="password" className="form-input" value={pwdForm.confirm} onChange={e=>setPwdForm(p=>({...p,confirm:e.target.value}))} placeholder="Repeat" /></div>
              <button onClick={() => {
                  if (pwdForm.next !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
                  if (pwdForm.next.length < 6) { toast.error('Min 6 characters'); return; }
                  changePassword.mutate();
                }}
                disabled={!pwdForm.current || !pwdForm.next || changePassword.isPending}
                className="btn btn-outline w-full justify-center disabled:opacity-60">
                {changePassword.isPending ? 'Updating…' : 'Update Password'}
              </button>
              <button onClick={logout} className="btn btn-danger w-full justify-center mt-1">
                <i className="fas fa-sign-out-alt" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="card">
        <div className="card-header"><h3 className="font-bold text-gray-900">⭐ Reviews ({reviews.length})</h3></div>
        {reviews.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-sm">No reviews yet. Complete orders to receive reviews.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map(r => (
              <div key={r.id} className="flex gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-xl flex-shrink-0">
                  {r.from?.avatar || r.from?.firstName?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">{r.from?.firstName} {r.from?.lastName}</span>
                    <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                    {r.cropName && <span className="badge badge-green text-[10px]">{r.cropName}</span>}
                    <span className="text-xs text-gray-300 ml-auto">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{r.comment}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
