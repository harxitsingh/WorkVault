import React from 'react';

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  icon,
  register,
  className = '',
  required = false,
  disabled = false,
  ...rest
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full rounded-lg border ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } sm:text-sm px-3 py-2 ${
            icon ? 'pl-10' : ''
          } disabled:bg-gray-50 disabled:text-gray-500 transition-colors focus:outline-none focus:ring-1`}
          {...(register ? register(name, { required }) : {})}
          {...rest}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
