/**
 * SelectField - Reusable form select component
 * Extracted for better reusability and consistency
 */

import React, { memo } from 'react';
import Tooltip from '../common/Tooltip';
import ValidationFeedback from '../common/ValidationFeedback';
import { getFieldHints } from '../../utils/smartDefaults';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  hint?: string;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  [key: string]: any; // For additional props
}

const SelectField: React.FC<SelectFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  placeholder = 'Please select...', 
  required = false, 
  error, 
  touched, 
  hint, 
  onBlur,
  disabled = false,
  className = '',
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
      
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        aria-label={label}
        aria-required={required}
        aria-invalid={error && touched ? 'true' : 'false'}
        aria-describedby={
          error && touched ? `${name}-error` : 
          showHint ? `${name}-hint` : 
          undefined
        }
        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 transition-all duration-200 hover:border-gray-500 ${
          error && touched 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="bg-gray-700 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      
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

export default memo(SelectField);