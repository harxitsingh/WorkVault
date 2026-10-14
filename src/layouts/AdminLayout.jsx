import React from 'react';
import { LayoutDashboard, Users, Package, Handshake, CreditCard, AlertTriangle, Star, BarChart3, Settings } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const adminSidebarItems = [
  { label: 'Overview', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Services', icon: Package, to: '/admin/services' },
  { label: 'Deals', icon: Handshake, to: '/admin/deals' },
  { label: 'Payments', icon: CreditCard, to: '/admin/payments' },
  { label: 'Disputes', icon: AlertTriangle, to: '/admin/disputes', badge: '4' },
  { label: 'Reviews', icon: Star, to: '/admin/reviews' },
  { label: 'Reports', icon: BarChart3, to: '/admin/reports' },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

const AdminLayout = () => {
  return <DashboardLayout role="admin" sidebarItems={adminSidebarItems} />;
};

export default AdminLayout;
