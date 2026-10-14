import React, { useState } from 'react';
import { getImageUrl } from '../../utils/imageHelper';

export default function Avatar({
  name = 'User',
  src,
  size = 'md',
  className = ''
}) {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-24 w-24 text-2xl font-bold'
  };

  const colors = [
    'bg-blue-100 text-[#2F5BEA]',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-violet-100 text-violet-700',
    'bg-cyan-100 text-cyan-700'
  ];

  // Hash name to get consistent color
  const safeName = name || 'User';
  const hash = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = colors[hash % colors.length];

  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const resolvedSrc = src ? getImageUrl(src, 'avatar') : null;

  if (resolvedSrc && !hasError) {
    return (
      <img
        src={resolvedSrc}
        alt={safeName}
        onError={() => setHasError(true)}
        className={`inline-block rounded-full object-cover shrink-0 ring-1 ring-slate-200/60 shadow-xs ${sizes[size] || sizes.md} ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={safeName}
      className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 ring-1 ring-slate-200/60 shadow-xs select-none ${colorClass} ${sizes[size] || sizes.md} ${className}`}
    >
      {initials}
    </div>
  );
}
