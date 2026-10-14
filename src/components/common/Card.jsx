import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  padding = 'md', 
  hover = false,
  onClick,
  ...props 
}) {
  const paddings = {
    none: 'p-0',
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-xs transition-all duration-200 ${paddings[padding] || paddings.md} ${
        hover ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
