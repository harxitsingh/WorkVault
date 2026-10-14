import React from 'react';
import { LayoutDashboard, Package, Handshake, Wallet, AlertTriangle, Star, Bell, User, Settings } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const freelancerSidebarItems = [
  { label: 'Overview', icon: LayoutDashboard, to: '/freelancer/dashboard' },
  { label: 'My Services', icon: Package, to: '/freelancer/services' },
  { label: 'Deals', icon: Handshake, to: '/freelancer/deals', badge: '1' },
  { label: 'Earnings', icon: Wallet, to: '/freelancer/earnings' },
  { label: 'Disputes', icon: AlertTriangle, to: '/freelancer/disputes' },
  { label: 'Reviews', icon: Star, to: '/freelancer/reviews' },
  { label: 'Notifications', icon: Bell, to: '/freelancer/notifications', badge: '3' },
  { label: 'Profile', icon: User, to: '/freelancer/profile' },
  { label: 'Settings', icon: Settings, to: '/freelancer/settings' },
];

const FreelancerLayout = () => {
  return <DashboardLayout role="freelancer" sidebarItems={freelancerSidebarItems} />;
};

export default FreelancerLayout;
