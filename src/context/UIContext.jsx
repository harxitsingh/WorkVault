import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('workvault_theme') || 'light';
    } catch {
      return 'light';
    }
  });
  const [isMobile, setIsMobile] = useState(false);

  // Synchronize document attributes with current theme
  const applyTheme = useCallback((targetTheme) => {
    const root = document.documentElement;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, []);

  const setTheme = useCallback((newTheme) => {
    const resolvedTheme = newTheme === 'dark' ? 'dark' : 'light';
    setThemeState(resolvedTheme);
    try {
      localStorage.setItem('workvault_theme', resolvedTheme);
    } catch {}
    applyTheme(resolvedTheme);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar, theme, setTheme, toggleTheme, isMobile }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
