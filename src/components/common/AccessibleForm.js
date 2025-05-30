import React from 'react';

/**
 * Accessible form wrapper with ARIA attributes
 */
export const AccessibleForm = ({ 
  children, 
  onSubmit, 
  ariaLabel,
  className = '' 
}) => {
  return (
    <form
      onSubmit={onSubmit}
      aria-label={ariaLabel}
      className={className}
      noValidate
    >
      {children}
    </form>
  );
};

/**
 * Accessible form section with proper labeling
 */
export const FormSection = ({ 
  title, 
  description, 
  children,
  className = '' 
}) => {
  const sectionId = title.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <section 
      aria-labelledby={`${sectionId}-heading`}
      className={className}
    >
      {title && (
        <h2 
          id={`${sectionId}-heading`}
          className="text-2xl font-semibold text-white mb-2"
        >
          {title}
        </h2>
      )}
      {description && (
        <p className="text-gray-300 mb-6">
          {description}
        </p>
      )}
      {children}
    </section>
  );
};

/**
 * Accessible radio button group
 */
export const RadioGroup = ({ 
  legend, 
  name, 
  options, 
  value, 
  onChange,
  required = false,
  error,
  className = '' 
}) => {
  return (
    <fieldset className={className}>
      <legend className="text-lg font-medium text-white mb-4">
        {legend}
        {required && <span className="text-red-400 ml-1">*</span>}
      </legend>
      <div className="space-y-3" role="radiogroup" aria-required={required}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              aria-describedby={option.description ? `${name}-${option.value}-desc` : undefined}
            />
            <div className="ml-3">
              <span className="text-white font-medium">{option.label}</span>
              {option.description && (
                <p 
                  id={`${name}-${option.value}-desc`}
                  className="text-sm text-gray-400 mt-1"
                >
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-400 mt-2" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
};

/**
 * Accessible checkbox group
 */
export const CheckboxGroup = ({ 
  legend, 
  options, 
  values, 
  onChange,
  error,
  className = '' 
}) => {
  return (
    <fieldset className={className}>
      <legend className="text-lg font-medium text-white mb-4">
        {legend}
      </legend>
      <div className="space-y-3" role="group">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-start p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
          >
            <input
              type="checkbox"
              value={option.value}
              checked={values[option.value] || false}
              onChange={(e) => onChange(option.value, e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
              aria-describedby={option.description ? `${option.value}-desc` : undefined}
            />
            <div className="ml-3">
              <span className="text-white font-medium">{option.label}</span>
              {option.description && (
                <p 
                  id={`${option.value}-desc`}
                  className="text-sm text-gray-400 mt-1"
                >
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-400 mt-2" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
};

/**
 * Skip to main content link
 */
export const SkipToContent = ({ targetId = 'main-content' }) => {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none 
                 focus:ring-2 focus:ring-blue-500"
    >
      Skip to main content
    </a>
  );
};

/**
 * Screen reader only text
 */
export const ScreenReaderText = ({ children }) => {
  return <span className="sr-only">{children}</span>;
};