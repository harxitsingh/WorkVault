import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry,
  className = '' 
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-rose-50/50 border border-rose-200/80 shadow-2xs ${className}`} role="alert">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-2xs">
        <AlertCircle className="h-7 w-7 text-rose-600" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-rose-950 tracking-tight">{title}</h3>
      {message && (
        <p className="mt-1.5 text-sm text-rose-700 max-w-sm leading-relaxed">
          {message}
        </p>
      )}
      {onRetry && (
        <div className="mt-6 flex items-center justify-center">
          <Button 
            variant="danger" 
            onClick={onRetry} 
            icon={<RotateCcw className="h-4 w-4" />}
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
