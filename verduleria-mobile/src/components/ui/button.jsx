import React from 'react';

export function Button({ children, onClick, disabled, className = '', variant = 'default', ...props }) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-0 outline-none';
  
  const variantStyles = {
    default: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white',
    ghost: 'text-gray-700 hover:bg-gray-100 bg-transparent',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ WebkitAppearance: 'none', appearance: 'none' }}
      {...props}
    >
      {children}
    </button>
  );
}
