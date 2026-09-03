import React, { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`flex h-10 w-full rounded-md border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          } bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        {typeof error === 'string' && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
