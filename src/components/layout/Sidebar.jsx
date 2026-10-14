import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

const Sidebar = ({ items = [], role }) => {
  const { user, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowRoleMenu(false);
    };
    if (showRoleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showRoleMenu]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRoleSwitch = async (newRole) => {
    setShowRoleMenu(false);
    if (newRole === 'admin' && user?.role !== 'admin') {
      toast.error('Admin dashboard requires an administrator account');
      return;
    }
    try {
      await switchRole(newRole);
      navigate(`/${newRole}/dashboard`);
    } catch {
      // Handled in AuthContext
    }
  };

  const currentRole = user?.role || role || 'client';

  return (
    <aside 
      className="hidden md:flex flex-col w-64 bg-[#0E1525] border-r border-[#1E293B] h-screen sticky top-0 shrink-0 z-20 select-none"
      aria-label="Sidebar Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#1E293B]/80 bg-[#0E1525]">
        <Link 
          to="/" 
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA] rounded-lg p-1"
        >
          <div className="h-9 w-9 rounded-xl bg-[#2F5BEA] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight">WorkVault</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Escrow Market</span>
          </div>
        </Link>
      </div>

      {/* Role Switcher & Context Bar */}
      <div className="px-4 py-3 border-b border-[#1E293B]/60 bg-[#162036]/50">
        <div className="flex items-center justify-between relative" ref={roleMenuRef}>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-300 capitalize tracking-wide">
              {currentRole} Mode
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowRoleMenu(prev => !prev)}
            aria-expanded={showRoleMenu}
            aria-haspopup="true"
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-[#1E293B] hover:bg-[#25334D] px-2.5 py-1 rounded-md border border-[#2E3D5B] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2F5BEA]"
          >
            <span>Switch</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div 
              role="menu"
              className="absolute right-0 top-full mt-2 w-48 bg-[#162036] rounded-xl shadow-2xl py-1.5 border border-[#2E3D5B] z-50 text-slate-200"
            >
              <div className="px-3 py-1.5 border-b border-[#1E293B] text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Switch Active View
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => handleRoleSwitch('client')}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#1E293B] transition-colors ${currentRole === 'client' ? 'text-[#3B7BF6] font-semibold bg-[#1E293B]/60' : 'text-slate-300'}`}
              >
                <span>Client View</span>
                {currentRole === 'client' && <span className="h-1.5 w-1.5 rounded-full bg-[#3B7BF6]" />}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => handleRoleSwitch('freelancer')}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#1E293B] transition-colors ${currentRole === 'freelancer' ? 'text-[#3B7BF6] font-semibold bg-[#1E293B]/60' : 'text-slate-300'}`}
              >
                <span>Freelancer View</span>
                {currentRole === 'freelancer' && <span className="h-1.5 w-1.5 rounded-full bg-[#3B7BF6]" />}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => handleRoleSwitch('admin')}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${user?.role === 'admin' ? (currentRole === 'admin' ? 'text-[#3B7BF6] font-semibold bg-[#1E293B]/60' : 'text-slate-300 hover:bg-[#1E293B]') : 'text-slate-500 cursor-not-allowed hover:bg-transparent opacity-60'}`}
              >
                <span>Admin View</span>
                {user?.role !== 'admin' ? (
                  <span className="text-[10px] text-slate-500">Locked</span>
                ) : (
                  currentRole === 'admin' && <span className="h-1.5 w-1.5 rounded-full bg-[#3B7BF6]" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA] ${
                  isActive
                    ? 'bg-[#2F5BEA] text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#162036]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-4.5 w-4.5 mr-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 ml-2 text-[11px] font-bold rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#1E293B] text-slate-300 border border-[#2E3D5B]'}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0E1525]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#162036]/60 border border-[#1E293B]">
          <Link 
            to={user?.role ? `/${user.role}/profile` : '/login'}
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2F5BEA] rounded-lg"
          >
            <Avatar 
              src={user?.avatar || user?.profileImage} 
              name={user?.name || 'User'} 
              size="sm" 
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{currentRole}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Log Out"
            aria-label="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
