import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    default: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    primary: 'bg-indigo-500',
    default: 'bg-gray-500'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm'
  };

  return (
    <span className={`inline-flex items-center font-medium border rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && (
        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
