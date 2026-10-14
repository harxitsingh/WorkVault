import React, { createContext, useState, useEffect, useContext } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setThemeState] = useState('light');
  const [isMobile, setIsMobile] = useState(false);

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
  const setTheme = (newTheme) => setThemeState(newTheme);

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar, theme, setTheme, isMobile }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
