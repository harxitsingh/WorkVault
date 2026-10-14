import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Badge from '../common/Badge';

const MobileSidebar = ({ items, role, isOpen, onClose }) => {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleRoleSwitch = async (newRole) => {
    try {
      await switchRole(newRole);
      onClose();
      navigate(`/${newRole}/dashboard`);
    } catch {
      // Handled in switchRole
    }
  };

  const currentRole = user?.role || role;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full transform transition-transform duration-300 ease-in-out">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <Briefcase className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">WorkVault</span>
          </Link>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <Badge variant={currentRole === 'admin' ? 'danger' : currentRole === 'client' ? 'primary' : 'success'} className="capitalize font-semibold">
            {currentRole}
          </Badge>
          
          <div className="relative group">
            <div className="flex items-center text-xs font-semibold text-gray-500 cursor-pointer">
              Switch Role <ChevronDown className="h-3 w-3 ml-1" />
            </div>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-10">
              <button 
                onClick={() => handleRoleSwitch('client')} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Client
              </button>
              <button 
                onClick={() => handleRoleSwitch('freelancer')} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Freelancer
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => handleRoleSwitch('admin')} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.to}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${item.isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
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
            className="flex items-center w-full px-3 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
