import React from 'react';

export default function Select({
  label,
  name,
  options = [],
  error,
  register,
  className = '',
  required = false,
  disabled = false,
  placeholder,
  ...rest
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        disabled={disabled}
        className={`block w-full rounded-lg border ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
        } sm:text-sm px-3 py-2 bg-white disabled:bg-gray-50 disabled:text-gray-500 transition-colors focus:outline-none focus:ring-1`}
        {...(register ? register(name, { required }) : {})}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled selected hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
