import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import MobileSidebar from "../components/layout/MobileSidebar";
import DashboardHeader from "../components/layout/DashboardHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";

const getPageTitle = (pathname, role) => {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  const titleMap = {
    dashboard: 'Dashboard Overview',
    deals: 'Manage Deals & Escrow',
    services: 'Services & Marketplace',
    new: 'Create New Service',
    edit: 'Edit Service',
    earnings: 'Earnings & Balances',
    disputes: 'Dispute Resolution Center',
    payments: 'Payment History & Escrow',
    notifications: 'Notifications & Alerts',
    profile: 'Profile & Identity',
    settings: 'Account Settings',
    users: 'User Management',
    reports: 'Financial Reports & Analytics',
    reviews: 'Reviews & Reputation'
  };

  if (lastSegment && titleMap[lastSegment]) {
    return titleMap[lastSegment];
  }

  if (segments.includes('disputes') && segments.length > 2) {
    return 'Dispute Details';
  }
  if (segments.includes('deals') && segments.length > 2) {
    return 'Deal Details';
  }
  if (segments.includes('users') && segments.length > 2) {
    return 'User Profile & Activity';
  }

  return `${role ? role.charAt(0).toUpperCase() + role.slice(1) : ''} Workspace`;
};

const DashboardLayout = ({ role, sidebarItems }) => {
  const { sidebarOpen, closeSidebar } = useUI();
  const { user, loading, activeRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && activeRole !== role) {
    return <Navigate to={`/${activeRole}/dashboard`} replace />;
  }

  const pageTitle = getPageTitle(location.pathname, role);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar items={sidebarItems} role={role} />

      {/* Mobile Drawer */}
      <MobileSidebar
        items={sidebarItems}
        role={role}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        <DashboardHeader
          title={pageTitle}
          subtitle={`Logged in as ${user?.name || 'User'} (${user?.role || role})`}
        />

        <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
