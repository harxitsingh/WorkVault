import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-red-50 border border-red-100">
      <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-800">{title}</h3>
      {message && (
        <p className="mt-2 text-sm text-red-600 max-w-sm">
          {message}
        </p>
      )}
      {onRetry && (
        <div className="mt-6">
          <Button variant="danger" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
