import React, { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Avatar from '../common/Avatar';
import SearchBar from '../common/SearchBar';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';

const DashboardHeader = ({ title, subtitle }) => {
  const { user } = useAuth();
  const { toggleSidebar } = useUI();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationService.getUnreadCount()
        .then(count => setUnreadCount(count))
        .catch(() => {});
    }
  }, [user]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 -ml-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 leading-tight">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block w-64">
            <SearchBar placeholder="Search deals, users..." />
          </div>

          <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
            <Link 
              to={user?.role ? `/${user.role}/notifications` : '/login'}
              className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              {unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
              <Bell className="h-5 w-5" />
            </Link>
            
            <Link to={user?.role ? `/${user.role}/profile` : '/login'} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar src={user?.avatar} alt={user?.name} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 leading-none">{user?.name}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
