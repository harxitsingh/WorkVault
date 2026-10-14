import React from 'react';

export default function Textarea({
  label,
  name,
  placeholder,
  error,
  register,
  className = '',
  required = false,
  disabled = false,
  rows = 4,
  ...rest
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={`block w-full rounded-lg border ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
        } sm:text-sm px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500 transition-colors focus:outline-none focus:ring-1 resize-y`}
        {...(register ? register(name, { required }) : {})}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
