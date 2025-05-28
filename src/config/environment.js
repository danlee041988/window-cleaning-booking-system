// Environment configuration with validation
// This provides a secure way to handle environment variables

class EnvironmentConfig {
  constructor() {
    this.validateEnvironment();
  }

  validateEnvironment() {
    const requiredVars = [
      'REACT_APP_EMAILJS_SERVICE_ID',
      'REACT_APP_EMAILJS_TEMPLATE_ID', 
      'REACT_APP_EMAILJS_PUBLIC_KEY',
      'REACT_APP_RECAPTCHA_SITE_KEY'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.warn('Missing environment variables:', missing);
      console.warn('Using placeholder values for development. Set proper values for production.');
    }
  }

  get emailjs() {
    return {
      serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
      templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    };
  }

  get recaptcha() {
    return {
      siteKey: process.env.REACT_APP_RECAPTCHA_SITE_KEY
    };
  }

  get firebase() {
    return {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
    };
  }

  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  get isProduction() {
    return process.env.NODE_ENV === 'production';
  }
}

// Create singleton instance
const environmentConfig = new EnvironmentConfig();

export default environmentConfig;