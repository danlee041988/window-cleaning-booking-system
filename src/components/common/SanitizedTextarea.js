import React from 'react';
import PropTypes from 'prop-types';
import { sanitizeTextInput } from '../../utils/sanitization';
import ValidationFeedback from './ValidationFeedback';
import Tooltip from './Tooltip';

/**
 * Sanitized textarea component that automatically sanitizes user input
 * Prevents XSS attacks while maintaining user experience
 */
const SanitizedTextarea = ({ 
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
  rows = 4,
  maxLength = 500,
  className = '',
  ...otherProps 
}) => {
  const handleChange = (e) => {
    const { value } = e.target;
    const sanitized = sanitizeTextInput(value, { 
      maxLength, 
      allowNewlines: true 
    });
    
    // Create synthetic event with sanitized value
    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: sanitized
      }
    };
    
    onChange(sanitizedEvent);
  };

  const remainingChars = maxLength - (value?.length || 0);
  const showCharCount = remainingChars < 50;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <label htmlFor={name} className="block text-sm font-semibold text-gray-200">
            {label}{required && <span className="text-red-400">*</span>}
          </label>
          {hint && (
            <Tooltip content={hint} position="top">
              <svg className="w-4 h-4 ml-2 text-gray-400 hover:text-gray-300 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </Tooltip>
          )}
        </div>
        {showCharCount && (
          <span className="text-xs text-gray-400">
            {remainingChars} characters remaining
          </span>
        )}
      </div>
      
      <textarea
        name={name}
        id={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        rows={rows}
        maxLength={maxLength}
        aria-describedby={error && touched ? `${name}-error` : undefined}
        aria-invalid={error && touched ? 'true' : 'false'}
        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg shadow-sm text-white placeholder-gray-400 
          focus:outline-none focus:ring-2 transition-all duration-200 hover:border-gray-500 resize-none
          ${error && touched 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : value && touched && !error
            ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
            : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
          } ${className}`}
        {...otherProps}
      />
      
      <ValidationFeedback field={name} value={value} error={error} touched={touched} />
      
      {maxLength && value?.length > maxLength * 0.9 && (
        <p className="mt-1 text-xs text-yellow-400">
          Approaching character limit
        </p>
      )}
    </div>
  );
};

SanitizedTextarea.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  hint: PropTypes.string,
  onBlur: PropTypes.func,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  className: PropTypes.string
};

SanitizedTextarea.defaultProps = {
  value: '',
  placeholder: '',
  required: false,
  error: null,
  touched: false,
  hint: null,
  onBlur: () => {},
  rows: 4,
  maxLength: 500,
  className: ''
};

export default SanitizedTextarea;