import React from 'react';
import { LayoutDashboard, Search, Handshake, AlertTriangle, CreditCard, Bell, User, Settings } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const clientSidebarItems = [
  { label: 'Overview', icon: LayoutDashboard, to: '/client/dashboard' },
  { label: 'Browse Services', icon: Search, to: '/services' },
  { label: 'My Deals', icon: Handshake, to: '/client/deals' },
  { label: 'Disputes', icon: AlertTriangle, to: '/client/disputes' },
  { label: 'Payments', icon: CreditCard, to: '/client/payments' },
  { label: 'Notifications', icon: Bell, to: '/client/notifications' },
  { label: 'Profile', icon: User, to: '/client/profile' },
  { label: 'Settings', icon: Settings, to: '/client/settings' },
];

const ClientLayout = () => {
  return <DashboardLayout role="client" sidebarItems={clientSidebarItems} />;
};

export default ClientLayout;
