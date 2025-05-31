/**
 * Utilities for immutable state updates
 */

/**
 * Deep clones an object to prevent mutations
 * @param {Object} obj - Object to clone
 * @returns {Object} - Deep cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Safely updates nested state without mutations
 * @param {Object} state - Current state
 * @param {string} path - Dot-separated path (e.g., 'user.address.city')
 * @param {*} value - New value to set
 * @returns {Object} - New state object
 */
export const updateNestedState = (state, path, value) => {
  const newState = deepClone(state);
  const keys = path.split('.');
  
  let current = newState;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return newState;
};

/**
 * Merges state updates immutably
 * @param {Object} currentState - Current state
 * @param {Object} updates - Updates to apply
 * @returns {Object} - New state object
 */
export const mergeState = (currentState, updates) => {
  return deepClone({ ...currentState, ...updates });
};

/**
 * Updates an item in an array immutably
 * @param {Array} array - Current array
 * @param {number} index - Index to update
 * @param {*} newValue - New value
 * @returns {Array} - New array
 */
export const updateArrayItem = (array, index, newValue) => {
  const newArray = [...array];
  newArray[index] = newValue;
  return newArray;
};

/**
 * Removes an item from an array immutably
 * @param {Array} array - Current array
 * @param {number} index - Index to remove
 * @returns {Array} - New array
 */
export const removeArrayItem = (array, index) => {
  return array.filter((_, i) => i !== index);
};

/**
 * Validates that an object has all required fields
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredFields - Required field names
 * @returns {boolean} - Whether object is valid
 */
export const hasRequiredFields = (obj, requiredFields) => {
  return requiredFields.every(field => {
    const value = obj[field];
    return value !== undefined && value !== null && value !== '';
  });
};

/**
 * Creates a debounced version of a function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
  
  debounced.cancel = () => clearTimeout(timeoutId);
  
  return debounced;
};

/**
 * Creates a throttled version of a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  let lastResult;
  
  return (...args) => {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  };
};