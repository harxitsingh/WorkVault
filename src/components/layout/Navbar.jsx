import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X, LayoutDashboard, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role || 'client'}/dashboard`;
  };

  const getProfileLink = () => {
    if (!user) return '/login';
    return `/${user.role || 'client'}/profile`;
  };

  const getSettingsLink = () => {
    if (!user) return '/login';
    return `/${user.role || 'client'}/settings`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">WorkVault</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/services" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Browse Services</Link>
            <Link to="/about" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">How It Works</Link>
            <Link to="/about" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">About</Link>
          </nav>

          {/* Right Side (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Log In</Link>
                <Link to="/register">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                >
                  <Avatar src={user.avatar || user.profileImage} name={user.name} size="sm" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                    </div>
                    <Link to={getDashboardLink()} onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                      <LayoutDashboard className="h-4 w-4 mr-3" /> Dashboard
                    </Link>
                    <Link to={getProfileLink()} onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                      <User className="h-4 w-4 mr-3" /> Profile
                    </Link>
                    <Link to={getSettingsLink()} onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                      <Settings className="h-4 w-4 mr-3" /> Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left border-t border-gray-100">
                      <LogOut className="h-4 w-4 mr-3" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl h-full slide-in-from-right">
            <div className="flex items-center justify-between px-4 pt-5 pb-2 border-b border-gray-100">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Briefcase className="h-6 w-6 text-indigo-600" />
                <span className="text-lg font-bold text-gray-900">WorkVault</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 h-0 overflow-y-auto">
              <nav className="px-4 py-6 flex flex-col gap-4">
                <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-gray-900 hover:text-indigo-600">Browse Services</Link>
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-gray-900 hover:text-indigo-600">How It Works</Link>
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-gray-900 hover:text-indigo-600">About</Link>
              </nav>

              <div className="px-4 py-6 border-t border-gray-100 flex flex-col gap-4">
                {!user ? (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Log In</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full">Sign Up</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <Avatar src={user.avatar} alt={user.name} size="sm" />
                      <div className="ml-3">
                        <p className="text-base font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm font-medium text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <Link to={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-base font-medium text-gray-900 hover:text-indigo-600">
                      <LayoutDashboard className="h-5 w-5 mr-3 text-gray-500" /> Dashboard
                    </Link>
                    <Link to={getProfileLink()} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-base font-medium text-gray-900 hover:text-indigo-600">
                      <User className="h-5 w-5 mr-3 text-gray-500" /> Profile
                    </Link>
                    <Link to={getSettingsLink()} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-base font-medium text-gray-900 hover:text-indigo-600">
                      <Settings className="h-5 w-5 mr-3 text-gray-500" /> Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center w-full text-base font-medium text-red-600 hover:text-red-700">
                      <LogOut className="h-5 w-5 mr-3 text-red-500" /> Log Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
