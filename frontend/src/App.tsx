import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/store/authStore';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import WorkerDashboard from '@/pages/worker/WorkerDashboard';
import CustomerDashboard from '@/pages/customer/CustomerDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import JobsPage from '@/pages/jobs/JobsPage';
import JobDetailPage from '@/pages/jobs/JobDetailPage';
import PostJobPage from '@/pages/jobs/PostJobPage';
import WalletPage from '@/pages/wallet/WalletPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import DocumentsPage from '@/pages/documents/DocumentsPage';
import SchemesPage from '@/pages/schemes/SchemesPage';
import LoanPage from '@/pages/loan/LoanPage';
import EarningsPage from '@/pages/earnings/EarningsPage';
import NotFoundPage from '@/pages/NotFoundPage';

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  const { user } = useAuthStore();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'CUSTOMER') return '/customer/dashboard';
    return '/worker/dashboard';
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Navigate to={getDashboardPath()} replace />} />

        {/* Worker Routes */}
        <Route path="/worker/dashboard" element={
          <PrivateRoute roles={['WORKER']}>
            <WorkerDashboard />
          </PrivateRoute>
        } />
        <Route path="/worker/earnings" element={
          <PrivateRoute roles={['WORKER']}>
            <EarningsPage />
          </PrivateRoute>
        } />
        <Route path="/worker/loans" element={
          <PrivateRoute roles={['WORKER']}>
            <LoanPage />
          </PrivateRoute>
        } />

        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={
          <PrivateRoute roles={['CUSTOMER']}>
            <CustomerDashboard />
          </PrivateRoute>
        } />
        <Route path="/customer/post-job" element={
          <PrivateRoute roles={['CUSTOMER']}>
            <PostJobPage />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <PrivateRoute roles={['ADMIN']}>
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* Shared Routes */}
        <Route path="/jobs" element={<PrivateRoute><JobsPage /></PrivateRoute>} />
        <Route path="/jobs/:id" element={<PrivateRoute><JobDetailPage /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><WalletPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
        <Route path="/schemes" element={<PrivateRoute><SchemesPage /></PrivateRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;