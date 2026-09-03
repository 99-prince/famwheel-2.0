/* =============================================
   FAM WHEEL – AUTH.JS
   Simulates login/register/logout with localStorage
   ============================================= */

const Auth = (() => {
  const KEY = 'famwheel_user';

  const DEMO_USERS = [
    { id: 1, firstName: 'Rajesh', lastName: 'Kumar', email: 'farmer@demo.com', password: 'demo123', role: 'farmer', phone: '+91 98765 43210', state: 'Punjab', avatar: '👨‍🌾', verified: true, joinedDate: '2025-03-15', rating: 4.8, totalSales: 124500, totalOrders: 47 },
    { id: 2, firstName: 'Priya',  lastName: 'Sharma', email: 'buyer@demo.com',  password: 'demo123', role: 'buyer',  phone: '+91 87654 32109', state: 'Maharashtra', avatar: '👩‍💼', verified: true, joinedDate: '2025-04-10', rating: 4.6, totalPurchases: 85000, totalOrders: 32 },
    { id: 3, firstName: 'Mohan',  lastName: 'Singh',  email: 'transport@demo.com', password: 'demo123', role: 'transport', phone: '+91 76543 21098', state: 'Delhi', avatar: '🚚', verified: true, joinedDate: '2025-02-20', rating: 4.9, totalDeliveries: 128, totalEarnings: 64000 },
    { id: 4, firstName: 'Admin',  lastName: 'User',   email: 'admin@demo.com',   password: 'admin123', role: 'admin', phone: '+91 99999 00000', state: 'Delhi', avatar: '👨‍💼', verified: true, joinedDate: '2024-01-01' },
  ];

  function getUser() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  }

  function setUser(user) {
    localStorage.setItem(KEY, JSON.stringify(user));
  }

  function login(email, password) {
    const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      const safe = { ...user };
      delete safe.password;
      setUser(safe);
      return { success: true, user: safe };
    }
    // Allow any new registered user
    const registered = JSON.parse(localStorage.getItem('famwheel_registered') || '[]');
    const regUser = registered.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (regUser) {
      const safe = { ...regUser };
      delete safe.password;
      setUser(safe);
      return { success: true, user: safe };
    }
    return { success: false, error: 'Invalid email or password' };
  }

  function register(data) {
    const registered = JSON.parse(localStorage.getItem('famwheel_registered') || '[]');
    const exists = DEMO_USERS.find(u => u.email.toLowerCase() === data.email.toLowerCase())
      || registered.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) return { success: false, error: 'Email already registered' };
    const newUser = {
      id: Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role || 'farmer',
      phone: data.phone || '',
      state: data.state || '',
      avatar: data.role === 'buyer' ? '🛒' : data.role === 'transport' ? '🚚' : data.role === 'admin' ? '👨‍💼' : '👨‍🌾',
      verified: false,
      joinedDate: new Date().toISOString().split('T')[0],
      rating: 0,
      totalSales: 0,
      totalOrders: 0
    };
    registered.push(newUser);
    localStorage.setItem('famwheel_registered', JSON.stringify(registered));
    const safe = { ...newUser }; delete safe.password;
    setUser(safe);
    return { success: true, user: safe };
  }

  function logout() {
    localStorage.removeItem(KEY);
    window.location.href = 'index.html';
  }

  function requireAuth(redirectTo = 'login.html') {
    const user = getUser();
    if (!user) { window.location.href = redirectTo; return null; }
    return user;
  }

  function redirectIfLoggedIn(to = 'dashboard.html') {
    const user = getUser();
    if (user) window.location.href = to;
  }

  return { login, register, logout, getUser, requireAuth, redirectIfLoggedIn };
})();

window.Auth = Auth;
