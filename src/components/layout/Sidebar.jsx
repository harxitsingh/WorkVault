import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';
import toast from 'react-hot-toast';

const Sidebar = ({ items, role }) => {
  const { user, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRoleSwitch = async (newRole) => {
    setShowRoleMenu(false);
    if (newRole === 'admin' && user?.role !== 'admin') {
      toast.error('Admin dashboard requires an admin account');
      return;
    }
    try {
      await switchRole(newRole);
      navigate(`/${newRole}/dashboard`);
    } catch {
      // Handled in switchRole
    }
  };

  const currentRole = user?.role || role;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">WorkVault</span>
        </Link>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between relative">
        <Badge variant={currentRole === 'admin' ? 'danger' : currentRole === 'client' ? 'primary' : 'success'} className="capitalize font-semibold">
          {currentRole}
        </Badge>
        
        {/* Role Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(prev => !prev)}
            className="flex items-center text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-md border border-gray-200"
          >
            Switch Role <ChevronDown className="h-3 w-3 ml-1" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl py-1 border border-gray-200 z-50 animate-in fade-in slide-in-from-top-1">
              <button
                type="button"
                onClick={() => handleRoleSwitch('client')}
                className={`block w-full text-left px-4 py-2 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 ${currentRole === 'client' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-gray-700'}`}
              >
                Client Role
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('freelancer')}
                className={`block w-full text-left px-4 py-2 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 ${currentRole === 'freelancer' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-gray-700'}`}
              >
                Freelancer Role
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className={`block w-full text-left px-4 py-2 text-xs font-medium ${user?.role === 'admin' ? (currentRole === 'admin' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-gray-700 hover:bg-indigo-50') : 'text-gray-400 opacity-60 cursor-not-allowed hover:bg-transparent'}`}
              >
                Admin Role {user?.role !== 'admin' && '🔒'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 pl-2'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent pl-2'
                }`
              }
            >
              <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 ml-auto text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors group"
        >
          <LogOut className="h-5 w-5 mr-3 text-gray-400 group-hover:text-red-500" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
