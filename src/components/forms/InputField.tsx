/**
 * InputField - Reusable form input component (TypeScript)
 * Type-safe version of the form input component
 */

import React, { memo } from 'react';
import Tooltip from '../common/Tooltip';
import ValidationFeedback from '../common/ValidationFeedback';
import { getFieldHints } from '../../utils/smartDefaults';

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'url';
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  hint?: string;
  onBlur?: () => void;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  'aria-describedby'?: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  required = false, 
  error, 
  touched, 
  hint, 
  onBlur,
  disabled = false,
  autoComplete,
  className = '',
  maxLength,
  minLength,
  pattern,
  ...props 
}) => {
  const fieldHints = getFieldHints();
  const showHint = hint || fieldHints[name];
  
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center mb-2">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-200">
          {label}{required && <span className="text-red-400">*</span>}
        </label>
        {showHint && (
          <Tooltip content={showHint} position="top">
            <svg 
              className="w-4 h-4 ml-2 text-gray-400 hover:text-gray-300 cursor-help" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
                clipRule="evenodd" 
              />
            </svg>
          </Tooltip>
        )}
      </div>
      
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        aria-label={label}
        aria-required={required}
        aria-invalid={error && touched ? 'true' : 'false'}
        aria-describedby={
          error && touched ? `${name}-error` : 
          showHint ? `${name}-hint` : 
          undefined
        }
        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 hover:border-gray-500 ${
          error && touched 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        {...props}
      />
      
      {showHint && (
        <div id={`${name}-hint`} className="mt-1 text-xs text-gray-400">
          {showHint}
        </div>
      )}
      
      <ValidationFeedback 
        error={error} 
        touched={touched} 
        fieldName={name}
        value={value}
      />
    </div>
  );
};

export default memo(InputField);