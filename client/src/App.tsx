import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { connectSocket, disconnectSocket } from '@/lib/socket';

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Pages
import LoginPage      from '@/pages/auth/LoginPage';
import RegisterPage   from '@/pages/auth/RegisterPage';
import DashboardPage  from '@/pages/dashboard/DashboardPage';
import MarketplacePage from '@/pages/marketplace/MarketplacePage';
import MyListingsPage from '@/pages/listings/MyListingsPage';
import OrdersPage     from '@/pages/orders/OrdersPage';
import OffersPage     from '@/pages/offers/OffersPage';
import MessagesPage   from '@/pages/messages/MessagesPage';
import TransportPage  from '@/pages/transport/TransportPage';
import MarketPricesPage from '@/pages/market-prices/MarketPricesPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import ProfilePage    from '@/pages/profile/ProfilePage';

// Guards
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket(user.id);
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user]);

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
      </Route>

      {/* Protected dashboard routes */}
      <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/marketplace"   element={<MarketplacePage />} />
        <Route path="/my-listings"   element={<MyListingsPage />} />
        <Route path="/orders"        element={<OrdersPage />} />
        <Route path="/offers"        element={<OffersPage />} />
        <Route path="/messages"      element={<MessagesPage />} />
        <Route path="/messages/:id"  element={<MessagesPage />} />
        <Route path="/transport"     element={<TransportPage />} />
        <Route path="/market-prices" element={<MarketPricesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile"       element={<ProfilePage />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
