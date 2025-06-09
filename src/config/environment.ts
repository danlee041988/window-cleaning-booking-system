// Environment configuration with validation for Vite
// This provides a secure way to handle environment variables

interface EmailJSConfig {
  serviceId: string | undefined;
  templateId: string | undefined;
  publicKey: string | undefined;
}

interface RecaptchaConfig {
  siteKey: string | undefined;
}

interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}

class EnvironmentConfig {
  constructor() {
    this.validateEnvironment();
  }

  private validateEnvironment(): void {
    const requiredVars = [
      'VITE_EMAILJS_SERVICE_ID',
      'VITE_EMAILJS_TEMPLATE_ID', 
      'VITE_EMAILJS_PUBLIC_KEY',
      'VITE_RECAPTCHA_SITE_KEY'
    ];

    const missing = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missing.length > 0) {
      console.warn('Missing environment variables:', missing);
      console.warn('Using placeholder values for development. Set proper values for production.');
    }
  }

  get emailjs(): EmailJSConfig {
    return {
      serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
      templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    };
  }

  get recaptcha(): RecaptchaConfig {
    return {
      siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY
    };
  }

  get firebase(): FirebaseConfig {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
  }

  get isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  get isProduction(): boolean {
    return import.meta.env.PROD;
  }
}

// Create singleton instance
const environmentConfig = new EnvironmentConfig();

export default environmentConfig;