import React from 'react';

export default function Card({ children, className = '', padding = 'md', hover = false }) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${paddings[padding]} ${
        hover ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
