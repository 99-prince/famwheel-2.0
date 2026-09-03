// ── UTILITY HELPERS ────────────────────────────────────────────────────────

export function formatMoney(n: number): string {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
}

export function roleLabel(role: string): string {
  return capitalize(role);
}

export function roleEmoji(role: string): string {
  const map: Record<string, string> = { FARMER:'👨‍🌾', BUYER:'🛒', TRANSPORT:'🚚', ADMIN:'👨‍💼' };
  return map[role.toUpperCase()] || '👤';
}

export function categoryBg(category: string): string {
  const map: Record<string, string> = {
    GRAIN:'from-yellow-50 to-amber-100', VEGETABLE:'from-green-50 to-emerald-100',
    FRUIT:'from-purple-50 to-violet-100', PULSE:'from-blue-50 to-cyan-100',
    OILSEED:'from-orange-50 to-amber-100', SPICE:'from-red-50 to-rose-100',
    DAIRY:'from-indigo-50 to-blue-100', OTHER:'from-gray-50 to-slate-100'
  };
  return map[category?.toUpperCase()] || 'from-gray-50 to-slate-100';
}

export function orderStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:'badge-yellow', CONFIRMED:'badge-blue', IN_TRANSIT:'badge-purple',
    DELIVERED:'badge-green', CANCELLED:'badge-red'
  };
  return map[status] || 'badge-yellow';
}

export function offerStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:'badge-yellow', ACCEPTED:'badge-green', REJECTED:'badge-red',
    COUNTERED:'badge-blue', EXPIRED:'badge-red'
  };
  return map[status] || 'badge-yellow';
}

export function clsx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
