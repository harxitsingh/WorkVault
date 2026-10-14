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
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  };

  const colors = [
    'bg-indigo-100 text-indigo-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
    'bg-violet-100 text-violet-600',
    'bg-cyan-100 text-cyan-600'
  ];

  // Hash name to get consistent color
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = colors[hash % colors.length];

  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const resolvedSrc = src ? getImageUrl(src, 'avatar') : null;

  if (resolvedSrc && !hasError) {
    return (
      <img
        src={resolvedSrc}
        alt={name}
        onError={() => setHasError(true)}
        className={`inline-block rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-medium ${colorClass} ${sizes[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
