import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) {
  const isBusy = loading || isLoading;
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-transparent',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700 border border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isBusy}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isBusy && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
