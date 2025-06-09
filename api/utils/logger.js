/**
 * Production-safe logging utility
 * Handles different log levels and environment-based output
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const getCurrentLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL || (env === 'production' ? 'WARN' : 'DEBUG');
  return LOG_LEVELS[logLevel.toUpperCase()] ?? LOG_LEVELS.INFO;
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const baseLog = {
    timestamp,
    level,
    message,
    environment: process.env.NODE_ENV || 'development'
  };
  
  if (Object.keys(meta).length > 0) {
    baseLog.meta = meta;
  }
  
  return JSON.stringify(baseLog);
};

const shouldLog = (level) => {
  return LOG_LEVELS[level] <= getCurrentLevel();
};

const logger = {
  error: (message, meta = {}) => {
    if (shouldLog('ERROR')) {
      console.error(formatMessage('ERROR', message, meta));
    }
  },
  
  warn: (message, meta = {}) => {
    if (shouldLog('WARN')) {
      console.warn(formatMessage('WARN', message, meta));
    }
  },
  
  info: (message, meta = {}) => {
    if (shouldLog('INFO')) {
      console.log(formatMessage('INFO', message, meta));
    }
  },
  
  debug: (message, meta = {}) => {
    if (shouldLog('DEBUG')) {
      console.log(formatMessage('DEBUG', message, meta));
    }
  },
  
  // Special method for startup messages
  startup: (message, meta = {}) => {
    console.log(formatMessage('INFO', message, meta));
  }
};

module.exports = logger;