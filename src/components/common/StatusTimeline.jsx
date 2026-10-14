import React from 'react';
import { Check } from 'lucide-react';

export default function StatusTimeline({ steps = [] }) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => (
          <li key={step.label || stepIdx}>
            <div className="relative pb-8">
              {stepIdx !== steps.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                    ${step.completed ? 'bg-emerald-500' : step.active ? 'bg-indigo-600 animate-pulse ring-indigo-50' : 'bg-gray-200'}
                  `}>
                    {step.completed ? (
                      <Check className="h-5 w-5 text-white" aria-hidden="true" />
                    ) : step.active ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    ) : null}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className={`text-sm font-medium ${step.completed || step.active ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                    )}
                  </div>
                  {step.date && (
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {step.date}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
