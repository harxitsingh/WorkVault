import React from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import MobileSidebar from "../components/layout/MobileSidebar";
import DashboardHeader from "../components/layout/DashboardHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = ({ role, sidebarItems }) => {
  const { sidebarOpen, closeSidebar } = useUI();
  const { user, loading, activeRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Use activeRole for demo role switching — allows viewing other dashboards.
  // Backend authorization remains based on user.role from JWT.
  if (role && activeRole !== role) {
    return <Navigate to={`/${activeRole}/dashboard`} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar items={sidebarItems} role={role} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        items={sidebarItems}
        role={role}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          title="Dashboard"
          subtitle={`Welcome back, let's get to work.`}
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
