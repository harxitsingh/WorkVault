import React, { useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

const MobileSidebar = ({ items = [], role, isOpen, onClose }) => {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleRoleSwitch = async (newRole) => {
    if (newRole === 'admin' && user?.role !== 'admin') {
      toast.error('Admin dashboard requires an administrator account');
      return;
    }
    try {
      await switchRole(newRole);
      onClose();
      navigate(`/${newRole}/dashboard`);
    } catch {
      // Handled in switchRole
    }
  };

  const currentRole = user?.role || role || 'client';

  return (
    <div 
      className="md:hidden fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity duration-200" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Off-canvas Panel */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0E1525] border-r border-[#1E293B] h-full shadow-2xl z-10">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1E293B] bg-[#0E1525]">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="h-9 w-9 rounded-xl bg-[#2F5BEA] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">WorkVault</span>
          </Link>
          <button 
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Bar */}
        <div className="px-4 py-3 border-b border-[#1E293B] bg-[#162036]/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-300 capitalize">{currentRole} View</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleRoleSwitch('client')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${currentRole === 'client' ? 'bg-[#2F5BEA] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Client
            </button>
            <button
              onClick={() => handleRoleSwitch('freelancer')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${currentRole === 'freelancer' ? 'bg-[#2F5BEA] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Freelancer
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${currentRole === 'admin' ? 'bg-[#2F5BEA] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Admin
              </button>
            )}
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.to}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#2F5BEA] text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#162036]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 mr-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 ml-2 text-xs font-bold rounded-full bg-[#1E293B] text-slate-200">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Mobile Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0E1525]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#162036]/60 border border-[#1E293B] mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar src={user?.avatar || user?.profileImage} name={user?.name || 'User'} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize">{currentRole}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-3 py-2.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
