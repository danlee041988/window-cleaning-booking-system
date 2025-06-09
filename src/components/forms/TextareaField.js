/**
 * TextareaField - Reusable form textarea component
 * Extracted for better reusability and consistency
 */

import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '../common/Tooltip';
import ValidationFeedback from '../common/ValidationFeedback';
import { getFieldHints } from '../../utils/smartDefaults';

const TextareaField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error, 
  touched, 
  hint, 
  onBlur,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
  showCharCount = false,
  ...props 
}) => {
  const fieldHints = getFieldHints();
  const showHint = hint || fieldHints[name];
  const charCount = value ? value.length : 0;
  
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
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
        
        {(showCharCount && maxLength) && (
          <span className={`text-xs ${
            charCount > maxLength * 0.9 
              ? 'text-orange-400' 
              : charCount > maxLength * 0.8 
                ? 'text-yellow-400' 
                : 'text-gray-400'
          }`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      
      <textarea
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-label={label}
        aria-required={required}
        aria-invalid={error && touched ? 'true' : 'false'}
        aria-describedby={
          error && touched ? `${name}-error` : 
          showHint ? `${name}-hint` : 
          undefined
        }
        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 hover:border-gray-500 resize-vertical ${
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
      />
    </div>
  );
};

TextareaField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  hint: PropTypes.string,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  className: PropTypes.string,
  showCharCount: PropTypes.bool
};

export default TextareaField;