import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Menu, X, LayoutDashboard, User, Settings, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const role = user?.role || 'client';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA] rounded-lg p-1">
              <div className="h-9 w-9 rounded-xl bg-[#2F5BEA] flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">WorkVault</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">Escrow Market</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-7">
            <Link to="/services" className="text-sm font-medium text-slate-600 hover:text-[#2F5BEA] transition-colors">
              Explore Services
            </Link>
            <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-[#2F5BEA] transition-colors">
              How Escrow Works
            </Link>
            <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-[#2F5BEA] transition-colors">
              About WorkVault
            </Link>
          </nav>

          {/* Right Side (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA]"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400 hover:text-amber-300" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 hover:text-slate-900" aria-hidden="true" />
              )}
            </button>

            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User navigation menu"
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA]"
                >
                  <Avatar src={user.avatar || user.profileImage} name={user.name} size="sm" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize mt-0.5">{role}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {isDropdownOpen && (
                  <div 
                    role="menu"
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl py-1.5 border border-slate-200/80 z-50 text-slate-700 animate-in fade-in duration-150"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link 
                        to={`/${role}/dashboard`} 
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                        className="flex items-center px-4 py-2 text-xs font-medium hover:bg-slate-50 hover:text-[#2F5BEA] transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2.5 text-slate-400" /> Dashboard
                      </Link>
                      <Link 
                        to={`/${role}/profile`} 
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                        className="flex items-center px-4 py-2 text-xs font-medium hover:bg-slate-50 hover:text-[#2F5BEA] transition-colors"
                      >
                        <User className="h-4 w-4 mr-2.5 text-slate-400" /> My Profile
                      </Link>
                      <Link 
                        to={`/${role}/settings`} 
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                        className="flex items-center px-4 py-2 text-xs font-medium hover:bg-slate-50 hover:text-[#2F5BEA] transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-2.5 text-slate-400" /> Account Settings
                      </Link>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        role="menuitem"
                        className="flex items-center justify-between w-full px-4 py-2 text-xs font-medium hover:bg-slate-50 hover:text-[#2F5BEA] transition-colors text-left"
                      >
                        <span className="flex items-center">
                          {theme === 'dark' ? (
                            <Sun className="h-4 w-4 mr-2.5 text-amber-400" />
                          ) : (
                            <Moon className="h-4 w-4 mr-2.5 text-slate-400" />
                          )}
                          <span>Theme</span>
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {theme === 'dark' ? 'Dark' : 'Light'}
                        </span>
                      </button>
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
            )}
          </div>

          {/* Mobile menu and theme buttons */}
          <div className="md:hidden flex items-center space-x-1">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA]"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile menu"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA]"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl h-full ml-auto z-10">
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="h-8 w-8 rounded-lg bg-[#2F5BEA] flex items-center justify-center text-white">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <span className="text-base font-bold text-slate-900">WorkVault</span>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                aria-label="Close menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              <nav className="flex flex-col space-y-3">
                <Link 
                  to="/services" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-sm font-semibold text-slate-800 hover:text-[#2F5BEA] transition-colors py-1"
                >
                  Explore Services
                </Link>
                <Link 
                  to="/about" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-sm font-semibold text-slate-800 hover:text-[#2F5BEA] transition-colors py-1"
                >
                  How Escrow Works
                </Link>
                <Link 
                  to="/about" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-sm font-semibold text-slate-800 hover:text-[#2F5BEA] transition-colors py-1"
                >
                  About WorkVault
                </Link>
              </nav>

              <div className="border-t border-slate-100 pt-6">
                {!user ? (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Log In</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full">Get Started</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <Avatar src={user.avatar || user.profileImage} name={user.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{role}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <Link 
                        to={`/${role}/dashboard`} 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center text-xs font-semibold text-slate-700 hover:text-[#2F5BEA] py-1.5"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2.5 text-slate-400" /> Dashboard
                      </Link>
                      <Link 
                        to={`/${role}/profile`} 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center text-xs font-semibold text-slate-700 hover:text-[#2F5BEA] py-1.5"
                      >
                        <User className="h-4 w-4 mr-2.5 text-slate-400" /> Profile
                      </Link>
                      <Link 
                        to={`/${role}/settings`} 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="flex items-center text-xs font-semibold text-slate-700 hover:text-[#2F5BEA] py-1.5"
                      >
                        <Settings className="h-4 w-4 mr-2.5 text-slate-400" /> Settings
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 py-1.5 text-left"
                      >
                        <LogOut className="h-4 w-4 mr-2.5 text-rose-500" /> Sign Out
                      </button>
                    </div>
                  </div>
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
