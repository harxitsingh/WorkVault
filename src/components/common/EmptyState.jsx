import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Inbox, 
  title = 'No items found', 
  description, 
  action,
  className = '' 
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-dashed border-slate-200/90 shadow-2xs ${className}`}>
      {Icon && (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mb-4 shadow-2xs">
          <Icon className="h-7 w-7 text-slate-400" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6 flex items-center justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
