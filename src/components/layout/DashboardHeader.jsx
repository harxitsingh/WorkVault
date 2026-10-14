import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Search, User, Settings, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Avatar from '../common/Avatar';
import { Link, useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';

const DashboardHeader = ({ title = 'Dashboard', subtitle }) => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    if (user) {
      notificationService.getUnreadCount()
        .then(count => {
          if (isMounted) setUnreadCount(count || 0);
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowUserMenu(false);
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  const role = user?.role || 'client';

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shrink-0 select-none">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center min-w-0">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA]"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Right: Quick actions, notifications, and profile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Notifications */}
          <Link 
            to={user?.role ? `/${user.role}/notifications` : '/login'}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA]"
          >
            {unreadCount > 0 ? (
              <span className="absolute 1.5 -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
            <Bell className="h-5 w-5" />
          </Link>

          {/* User Account Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(prev => !prev)}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              aria-label="User account menu"
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA]"
            >
              <Avatar src={user?.avatar || user?.profileImage} name={user?.name || 'User'} size="sm" />
              <div className="hidden sm:block text-left max-w-[120px]">
                <p className="text-xs font-semibold text-slate-800 leading-none truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 capitalize mt-0.5 truncate">{role}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div 
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-1.5 border border-slate-200/80 z-50 text-slate-700 animate-in fade-in duration-150"
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link 
                    to={`/${role}/dashboard`} 
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                    className="flex items-center px-4 py-2 text-xs font-medium hover:bg-slate-50 hover:text-[#2F5BEA] transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2.5 text-slate-400" /> Dashboard
                  </Link>
                  <Link 
                    to={`/${role}/profile`} 
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                    className="flex items-center px-4 py-2 text-xs font-medium hover:bg-slate-50 hover:text-[#2F5BEA] transition-colors"
                  >
                    <User className="h-4 w-4 mr-2.5 text-slate-400" /> Profile & Photo
                  </Link>
                  <Link 
                    to={`/${role}/settings`} 
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                    className="flex items-center px-4 py-2 text-xs font-medium hover:bg-slate-50 hover:text-[#2F5BEA] transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-2.5 text-slate-400" /> Account Settings
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button 
                    onClick={handleLogout} 
                    role="menuitem"
                    className="flex items-center w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2.5 text-rose-500" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
