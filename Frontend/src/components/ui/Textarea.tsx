import React, { type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-body-text">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`flex min-h-[80px] w-full rounded-md border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-secondary/50 focus:ring-primary'
          } bg-background px-3 py-2 text-sm text-body-text placeholder:text-body-text/50 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        {typeof error === 'string' && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
