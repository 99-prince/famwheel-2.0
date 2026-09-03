/* =============================================
   FAM WHEEL – SHARED-UI.JS
   Shared sidebar, header, toast, modal — used by ALL dashboard pages
   ============================================= */

/* ── SIDEBAR HTML ──────────────────────────────── */
function renderSidebar(activePage) {
  const user = Auth.getUser();
  if (!user) return;

  const links = [
    { href:'dashboard.html',    icon:'fas fa-th-large',       label:'Dashboard',    pages:['dashboard'] },
    { href:'marketplace.html',  icon:'fas fa-store',          label:'Marketplace',  pages:['marketplace'] },
    { href:'my-listings.html',  icon:'fas fa-seedling',       label:'My Listings',  pages:['my-listings'], roles:['farmer','admin'] },
    { href:'orders.html',       icon:'fas fa-shopping-bag',   label:'Orders',       pages:['orders'],    badge: getOrderBadge() },
    { href:'offers.html',       icon:'fas fa-handshake',      label:'Offers',       pages:['offers'],    roles:['farmer','buyer'] },
    { href:'transport.html',    icon:'fas fa-truck',          label:'Transport',    pages:['transport'] },
    { href:'messages.html',     icon:'fas fa-comments',       label:'Messages',     pages:['messages'],  badge: getMsgBadge() },
    { href:'notifications.html',icon:'fas fa-bell',           label:'Notifications',pages:['notifications'], badge: getNotifBadge() },
    { href:'market-prices.html',icon:'fas fa-chart-line',     label:'Market Prices',pages:['market-prices'] },
    { href:'profile.html',      icon:'fas fa-user-cog',       label:'My Profile',   pages:['profile'] },
  ];

  if (user.role === 'admin') {
    links.push({ href:'admin.html', icon:'fas fa-user-shield', label:'Admin Panel', pages:['admin'] });
  }

  const html = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <a href="index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;">
        <span>🚜</span> FAM<span class="logo-accent">WHEEL</span>
      </a>
    </div>

    <div class="sidebar-user-card">
      <div class="su-avatar">${user.avatar || user.firstName[0]}</div>
      <div class="su-info">
        <strong>${user.firstName} ${user.lastName}</strong>
        <span class="su-role">${capitalize(user.role)} ${user.verified ? '✅' : ''}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-label">Main</div>
      ${links.filter(l => !l.roles || l.roles.includes(user.role)).map(l => `
        <a class="sidebar-link ${l.pages.includes(activePage) ? 'active' : ''}" href="${l.href}">
          <i class="${l.icon}"></i> ${l.label}
          ${l.badge ? `<span class="sb-badge">${l.badge}</span>` : ''}
        </a>
      `).join('')}
      <div class="nav-section-label" style="margin-top:16px;">Account</div>
      <a class="sidebar-link" href="index.html"><i class="fas fa-home"></i> Back to Home</a>
      <a class="sidebar-link" href="#" onclick="Auth.logout();return false;" style="color:#f87171;">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
    </nav>
  </aside>

  <!-- Mobile Sidebar Overlay -->
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
  `;

  const container = document.getElementById('sidebarContainer');
  if (container) container.innerHTML = html;
}

function getOrderBadge() {
  const user = Auth.getUser();
  if (!user) return null;
  const orders = FamData.getOrders(user.id, user.role).filter(o => o.status === 'pending' || o.status === 'confirmed');
  return orders.length || null;
}

function getMsgBadge() {
  const user = Auth.getUser();
  if (!user) return null;
  const msgs = FamData.getMessages(user.id).filter(m => !m.read && m.toId === user.id);
  return msgs.length || null;
}

function getNotifBadge() {
  const notifs = FamData.getNotifications().filter(n => !n.read);
  return notifs.length || null;
}

/* ── DASH HEADER ─────────────────────────────── */
function renderDashHeader(title, subtitle) {
  const user = Auth.getUser();
  if (!user) return;

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';
  const now = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const html = `
  <header class="dash-header">
    <div class="dash-header-left">
      <button class="sidebar-toggle" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
      <div>
        <h2>${title || `${greeting}, ${user.firstName} ${user.avatar}`}</h2>
        <p>${subtitle || `${now} · ${user.state || 'India'}`}</p>
      </div>
    </div>
    <div class="dash-header-right">
      <div class="dash-search">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search crops, buyers…" onkeydown="if(event.key==='Enter')window.location.href='marketplace.html?q='+this.value" />
      </div>
      <a href="notifications.html" class="dash-notif" title="Notifications">
        <i class="fas fa-bell"></i>
        ${getNotifBadge() ? `<div class="notif-dot"></div>` : ''}
      </a>
      <a href="messages.html" class="dash-notif" title="Messages" style="margin-left:-6px;">
        <i class="fas fa-comments"></i>
        ${getMsgBadge() ? `<div class="notif-dot"></div>` : ''}
      </a>
      <a href="profile.html" class="dash-user">
        <div class="dash-avatar">${user.avatar || user.firstName[0]}</div>
        <span class="dash-user-name">${user.firstName} ${user.lastName[0]}.</span>
        <i class="fas fa-chevron-down" style="font-size:0.7rem;color:#9ca3af;"></i>
      </a>
    </div>
  </header>`;

  const container = document.getElementById('headerContainer');
  if (container) container.innerHTML = html;
}

/* ── SIDEBAR TOGGLE ─────────────────────────── */
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebarOverlay')?.classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
}

/* ── TOAST NOTIFICATIONS ───────────────────── */
function showToast(message, type = 'success', duration = 3500) {
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  const colors = { success:'#22c55e', error:'#ef4444', info:'#3b82f6', warning:'#f59e0b' };

  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:28px; right:28px; z-index:9999;
    background:#fff; border-left:4px solid ${colors[type]};
    border-radius:12px; padding:16px 20px; max-width:340px;
    box-shadow:0 8px 32px rgba(0,0,0,0.15);
    display:flex; align-items:center; gap:12px;
    animation: toastIn 0.35s cubic-bezier(0.4,0,0.2,1);
    font-family:Inter,sans-serif;
  `;
  toast.innerHTML = `
    <span style="font-size:1.3rem;">${icons[type]}</span>
    <span style="font-size:0.9rem;color:#374151;font-weight:500;">${message}</span>
    <button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1rem;">✕</button>
  `;

  const style = document.createElement('style');
  style.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`;
  document.head.appendChild(style);

  document.body.appendChild(toast);
  setTimeout(() => toast.style.opacity = '0', duration);
  setTimeout(() => toast.remove(), duration + 400);
}

/* ── MODAL ──────────────────────────────────── */
function showModal({ title, body, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, danger = false }) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:8000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);`;

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:36px;max-width:480px;width:100%;box-shadow:0 32px 80px rgba(0,0,0,0.2);animation:toastIn 0.3s ease;font-family:Inter,sans-serif;">
      <h3 style="font-size:1.2rem;font-weight:800;color:#111;margin-bottom:12px;">${title}</h3>
      <div style="color:#6b7280;font-size:0.93rem;line-height:1.7;margin-bottom:28px;">${body}</div>
      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button onclick="this.closest('[style*=\"inset:0\"]').remove()" style="padding:10px 24px;border:1.5px solid #e5e7eb;border-radius:99px;background:#fff;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;">${cancelText}</button>
        <button id="modalConfirm" style="padding:10px 24px;border:none;border-radius:99px;background:${danger?'#ef4444':'#22c55e'};color:#fff;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector('#modalConfirm').onclick = () => { if(onConfirm) onConfirm(); overlay.remove(); };
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
}

/* ── HELPERS ────────────────────────────────── */
function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = Date.now() - d;
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), day = Math.floor(diff/86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${day}d ago`;
}

window.renderSidebar = renderSidebar;
window.renderDashHeader = renderDashHeader;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.showToast = showToast;
window.showModal = showModal;
window.capitalize = capitalize;
window.timeAgo = timeAgo;
