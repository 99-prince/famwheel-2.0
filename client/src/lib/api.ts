// ── AXIOS API CLIENT ────────────────────────────────────────────────────────
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST INTERCEPTOR – attach JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── RESPONSE INTERCEPTOR – handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fw_token');
      localStorage.removeItem('fw_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (email: string, password: string) => api.post('/auth/login', { email, password }),
  register:       (data: Record<string, string>)    => api.post('/auth/register', data),
  me:             ()                                 => api.get('/auth/me'),
  logout:         ()                                 => api.post('/auth/logout'),
  changePassword: (data: Record<string, string>)    => api.post('/auth/change-password', data),
};

// ── CROPS ─────────────────────────────────────────────────────────────────────
export const cropsAPI = {
  list:     (params?: Record<string, string>) => api.get('/crops', { params }),
  get:      (id: number)                      => api.get(`/crops/${id}`),
  myCrops:  ()                                => api.get('/crops/farmer/my'),
  create:   (data: Record<string, unknown>)   => api.post('/crops', data),
  update:   (id: number, data: Record<string, unknown>) => api.put(`/crops/${id}`, data),
  delete:   (id: number)                      => api.delete(`/crops/${id}`),
};

// ── ORDERS ────────────────────────────────────────────────────────────────────
export const ordersAPI = {
  list:       (params?: Record<string, string>) => api.get('/orders', { params }),
  get:        (id: string)                      => api.get(`/orders/${id}`),
  create:     (data: Record<string, unknown>)   => api.post('/orders', data),
  updateStatus: (id: string, status: string)   => api.patch(`/orders/${id}/status`, { status }),
  stats:      ()                                => api.get('/orders/stats/summary'),
};

// ── OFFERS ────────────────────────────────────────────────────────────────────
export const offersAPI = {
  list:    (params?: Record<string, string>) => api.get('/offers', { params }),
  create:  (data: Record<string, unknown>)   => api.post('/offers', data),
  respond: (id: number, action: string, counterPrice?: number) =>
    api.patch(`/offers/${id}/respond`, { action, counterPrice }),
};

// ── MESSAGES ──────────────────────────────────────────────────────────────────
export const messagesAPI = {
  conversations: ()               => api.get('/messages/conversations'),
  thread:        (partnerId: number, params?: Record<string,string>) => api.get(`/messages/${partnerId}`, { params }),
  send:          (toId: number, text: string) => api.post('/messages', { toId, text }),
  unreadCount:   ()               => api.get('/messages/unread/count'),
};

// ── TRANSPORT ─────────────────────────────────────────────────────────────────
export const transportAPI = {
  list:         (params?: Record<string, string>) => api.get('/transport', { params }),
  create:       (data: Record<string, unknown>)   => api.post('/transport', data),
  bid:          (id: number, bidAmount: number)   => api.patch(`/transport/${id}/bid`, { bidAmount }),
  updateStatus: (id: number, status: string)     => api.patch(`/transport/${id}/status`, { status }),
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  list:       () => api.get('/notifications'),
  markRead:   (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead:() => api.patch('/notifications/read-all'),
  delete:     (id: number) => api.delete(`/notifications/${id}`),
};

// ── MARKET PRICES ─────────────────────────────────────────────────────────────
export const marketPricesAPI = {
  list:   (params?: Record<string, string>) => api.get('/market-prices', { params }),
  update: (id: number, data: Record<string, number>) => api.put(`/market-prices/${id}`, data),
};

// ── USERS ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  profile:       ()                                 => api.get('/users/profile'),
  updateProfile: (data: Record<string, string>)    => api.put('/users/profile', data),
  getUser:       (id: number)                      => api.get(`/users/${id}`),
  list:          (params?: Record<string, string>) => api.get('/users', { params }),
  verify:        (id: number)                      => api.patch(`/users/${id}/verify`),
};

// ── REVIEWS ───────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  forUser: (userId: number) => api.get(`/reviews/${userId}`),
  submit:  (data: Record<string, unknown>) => api.post('/reviews', data),
};

export default api;
