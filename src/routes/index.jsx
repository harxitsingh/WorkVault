import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import ClientLayout from '../layouts/ClientLayout';
import FreelancerLayout from '../layouts/FreelancerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));

// Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));

// Marketplace Pages
const MarketplacePage = lazy(() => import('../pages/marketplace/MarketplacePage'));
const ServiceDetailsPage = lazy(() => import('../pages/marketplace/ServiceDetailsPage'));
const FreelancerProfilePage = lazy(() => import('../pages/marketplace/FreelancerProfilePage'));

// Client Pages
const ClientDashboard = lazy(() => import('../pages/client/ClientDashboard'));
const ClientDeals = lazy(() => import('../pages/client/ClientDeals'));
const ClientDealDetails = lazy(() => import('../pages/client/ClientDealDetails'));
const ClientDisputes = lazy(() => import('../pages/client/ClientDisputes'));
const ClientDisputeDetails = lazy(() => import('../pages/client/ClientDisputeDetails'));
const ClientPayments = lazy(() => import('../pages/client/ClientPayments'));
const ClientNotifications = lazy(() => import('../pages/client/ClientNotifications'));
const ClientProfile = lazy(() => import('../pages/client/ClientProfile'));
const ClientSettings = lazy(() => import('../pages/client/ClientSettings'));

// Freelancer Pages
const FreelancerDashboard = lazy(() => import('../pages/freelancer/FreelancerDashboard'));
const FreelancerServices = lazy(() => import('../pages/freelancer/FreelancerServices'));
const CreateService = lazy(() => import('../pages/freelancer/CreateService'));
const EditService = lazy(() => import('../pages/freelancer/EditService'));
const FreelancerDeals = lazy(() => import('../pages/freelancer/FreelancerDeals'));
const FreelancerDealDetails = lazy(() => import('../pages/freelancer/FreelancerDealDetails'));
const SubmitDelivery = lazy(() => import('../pages/freelancer/SubmitDelivery'));
const FreelancerEarnings = lazy(() => import('../pages/freelancer/FreelancerEarnings'));
const FreelancerDisputes = lazy(() => import('../pages/freelancer/FreelancerDisputes'));
const FreelancerDisputeDetails = lazy(() => import('../pages/freelancer/FreelancerDisputeDetails'));
const FreelancerReviews = lazy(() => import('../pages/freelancer/FreelancerReviews'));
const FreelancerNotifications = lazy(() => import('../pages/freelancer/FreelancerNotifications'));
const FreelancerProfile = lazy(() => import('../pages/freelancer/FreelancerProfile'));
const FreelancerSettings = lazy(() => import('../pages/freelancer/FreelancerSettings'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminUserDetails = lazy(() => import('../pages/admin/AdminUserDetails'));
const AdminServices = lazy(() => import('../pages/admin/AdminServices'));
const AdminDeals = lazy(() => import('../pages/admin/AdminDeals'));
const AdminPayments = lazy(() => import('../pages/admin/AdminPayments'));
const AdminDisputes = lazy(() => import('../pages/admin/AdminDisputes'));
const AdminDisputeDetails = lazy(() => import('../pages/admin/AdminDisputeDetails'));
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));

const SuspenseWrapper = ({ children }) => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const ProfileRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'freelancer') {
    return <Navigate to="/freelancer/profile" replace />;
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin/profile" replace />;
  }
  return <Navigate to="/client/profile" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <LandingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'services',
        element: (
          <SuspenseWrapper>
            <MarketplacePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'services/:id',
        element: (
          <SuspenseWrapper>
            <ServiceDetailsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'freelancer/:id',
        element: (
          <SuspenseWrapper>
            <FreelancerProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'about',
        element: (
          <SuspenseWrapper>
            <AboutPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'login',
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'register',
        element: (
          <SuspenseWrapper>
            <RegisterPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <SuspenseWrapper>
            <ForgotPasswordPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: '/client',
    element: <ClientLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/client/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <ClientDashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'deals',
        element: (
          <SuspenseWrapper>
            <ClientDeals />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'deals/:id',
        element: (
          <SuspenseWrapper>
            <ClientDealDetails />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'disputes',
        element: (
          <SuspenseWrapper>
            <ClientDisputes />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'disputes/:id',
        element: (
          <SuspenseWrapper>
            <ClientDisputeDetails />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'payments',
        element: (
          <SuspenseWrapper>
            <ClientPayments />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'notifications',
        element: (
          <SuspenseWrapper>
            <ClientNotifications />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <SuspenseWrapper>
            <ClientProfile />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <ClientSettings />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: '/freelancer',
    element: <FreelancerLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/freelancer/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <FreelancerDashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'services',
        element: (
          <SuspenseWrapper>
            <FreelancerServices />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'services/new',
        element: (
          <SuspenseWrapper>
            <CreateService />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'services/:id/edit',
        element: (
          <SuspenseWrapper>
            <EditService />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'deals',
        element: (
          <SuspenseWrapper>
            <FreelancerDeals />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'deals/:id',
        element: (
          <SuspenseWrapper>
            <FreelancerDealDetails />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'deals/:id/deliver',
        element: (
          <SuspenseWrapper>
            <SubmitDelivery />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'earnings',
        element: (
          <SuspenseWrapper>
            <FreelancerEarnings />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'disputes',
        element: (
          <SuspenseWrapper>
            <FreelancerDisputes />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'disputes/:id',
        element: (
          <SuspenseWrapper>
            <FreelancerDisputeDetails />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'reviews',
        element: (
          <SuspenseWrapper>
            <FreelancerReviews />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'notifications',
        element: (
          <SuspenseWrapper>
            <FreelancerNotifications />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <SuspenseWrapper>
            <FreelancerProfile />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <FreelancerSettings />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <AdminDashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'users',
        element: (
          <SuspenseWrapper>
            <AdminUsers />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'users/:id',
        element: (
          <SuspenseWrapper>
            <AdminUserDetails />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'services',
        element: (
          <SuspenseWrapper>
            <AdminServices />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'deals',
        element: (
          <SuspenseWrapper>
            <AdminDeals />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'payments',
        element: (
          <SuspenseWrapper>
            <AdminPayments />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'disputes',
        element: (
          <SuspenseWrapper>
            <AdminDisputes />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'disputes/:id',
        element: (
          <SuspenseWrapper>
            <AdminDisputeDetails />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'reviews',
        element: (
          <SuspenseWrapper>
            <AdminReviews />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'reports',
        element: (
          <SuspenseWrapper>
            <AdminReports />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <AdminSettings />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <SuspenseWrapper>
            <ClientProfile />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: '/profile',
    element: <ProfileRedirect />,
  },
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);

export default router;
