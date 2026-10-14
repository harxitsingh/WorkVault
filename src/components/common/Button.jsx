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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variants = {
    primary: 'bg-[#2F5BEA] hover:bg-[#2446BD] active:bg-[#1E3794] text-white shadow-xs focus-visible:ring-[#2F5BEA]',
    secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200/80 focus-visible:ring-slate-400',
    outline: 'border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 shadow-xs focus-visible:ring-[#2F5BEA]',
    ghost: 'hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-transparent focus-visible:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus-visible:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus-visible:ring-emerald-500'
  };
  
  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1.5',
    sm: 'px-3 py-1.5 text-xs sm:text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isBusy}
      aria-busy={isBusy}
      aria-disabled={disabled || isBusy}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {isBusy && <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
      {!isBusy && icon && <span className="shrink-0 flex items-center" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
