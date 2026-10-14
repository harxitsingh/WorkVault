import React from 'react';

export default function Skeleton({ variant = 'text', width, height, className = '', count = 1 }) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const renderSkeleton = () => {
    switch (variant) {
      case 'circular':
        return <div className={`${baseClasses} rounded-full ${className}`} style={{ width, height }} />;
      case 'rectangular':
        return <div className={`${baseClasses} ${className}`} style={{ width, height }} />;
      case 'card':
        return (
          <div className={`${baseClasses} p-4 w-full h-48 ${className}`}>
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        );
      case 'text':
      default:
        return (
          <div className="space-y-2 w-full">
            {Array.from({ length: count }).map((_, i) => (
              <div 
                key={i} 
                className={`${baseClasses} h-4 ${i === count - 1 && count > 1 ? 'w-2/3' : 'w-full'} ${className}`} 
                style={{ width, height: height || '1rem' }} 
              />
            ))}
          </div>
        );
    }
  };

  return renderSkeleton();
}
