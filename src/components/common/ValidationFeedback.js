// Real-time validation feedback component
import React from 'react';
import PropTypes from 'prop-types';

const ValidationFeedback = ({ field, value, error, touched }) => {
  // Only show validation after user has interacted with the field
  if (!touched) return null;

  const getValidationStatus = () => {
    if (error) return 'error';
    if (value && !error) return 'success';
    return 'neutral';
  };

  const status = getValidationStatus();

  if (status === 'neutral') return null;

  return (
    <div 
      id={`${field}-error`}
      role={status === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      aria-atomic="true"
      className={`mt-1 text-sm flex items-center ${
        status === 'error' ? 'text-red-400' : 'text-green-400'
      }`}
    >
      {status === 'error' ? (
        <>
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Looks good!</span>
        </>
      )}
    </div>
  );
};

ValidationFeedback.propTypes = {
  field: PropTypes.string.isRequired,
  value: PropTypes.any,
  error: PropTypes.string,
  touched: PropTypes.bool
};

ValidationFeedback.defaultProps = {
  value: '',
  error: null,
  touched: false
};

export default ValidationFeedback;