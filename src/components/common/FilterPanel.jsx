import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import Button from './Button';
import Select from './Select';

export default function FilterPanel({ filters = [], values = {}, onChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:hidden">
        <Button 
          variant="ghost" 
          icon={<Filter className="h-4 w-4" />} 
          onClick={() => setIsOpen(!isOpen)}
        >
          Filters
        </Button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} sm:block p-4 sm:p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filters.map((filter) => {
              if (filter.type === 'select') {
                return (
                  <Select
                    key={filter.key}
                    label={filter.label}
                    name={filter.key}
                    options={filter.options}
                    value={values[filter.key] || ''}
                    onChange={(e) => onChange && onChange({ ...values, [filter.key]: e.target.value })}
                  />
                );
              }
              if (filter.type === 'checkbox') {
                return (
                  <div key={filter.key} className="flex items-center h-full pt-6">
                    <input
                      id={filter.key}
                      type="checkbox"
                      checked={!!values[filter.key]}
                      onChange={(e) => onChange && onChange({ ...values, [filter.key]: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor={filter.key} className="ml-2 block text-sm text-gray-900">
                      {filter.label}
                    </label>
                  </div>
                );
              }
              // Add other types like 'range' if needed
              return null;
            })}
          </div>
          <div className="flex sm:flex-shrink-0 space-x-2 pt-2 sm:pt-0">
            {onReset && (
              <Button variant="outline" onClick={onReset}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
