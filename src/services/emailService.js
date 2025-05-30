// Enhanced Email service with security best practices and fallback to EmailJS
import emailjs from '@emailjs/browser';
import environmentConfig from '../config/environment';

class EmailService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '/api';
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    this.useEmailJSFallback = true; // Enable direct EmailJS for now
  }

  /**
   * Send booking form data - tries backend first, falls back to EmailJS
   */
  async sendBooking(formData, templateParams) {
    // Validate required data
    this.validateEmailData(formData);

    // Try backend API first (if available)
    if (!this.useEmailJSFallback) {
      try {
        return await this.sendViaBackend(formData);
      } catch (error) {
        console.warn('Backend submission failed, falling back to EmailJS:', error);
      }
    }

    // Fallback to direct EmailJS submission
    return await this.sendViaEmailJS(templateParams);
  }

  /**
   * Send via backend API (preferred method)
   */
  async sendViaBackend(formData) {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/submit-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        message: data.message || 'Booking submitted successfully'
      };
    } catch (error) {
      console.error('Backend email service error:', error);
      throw error;
    }
  }

  /**
   * Send via EmailJS (fallback method)
   */
  async sendViaEmailJS(templateParams) {
    try {
      const config = environmentConfig.emailjs;
      
      await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams,
        config.publicKey
      );

      return {
        success: true,
        message: 'Booking submitted successfully via EmailJS'
      };
    } catch (error) {
      console.error('EmailJS submission failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
        details: error
      };
    }
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error) {
    if (error.status === 422) {
      return 'Please check your information and try again.';
    } else if (error.status >= 500) {
      return 'Server error occurred. Please try again in a few moments.';
    } else if (error.text?.includes('reCAPTCHA')) {
      return 'reCAPTCHA verification failed. Please try again.';
    } else {
      return 'An error occurred while submitting your request. Please try again or contact us directly.';
    }
  }

  /**
   * Fetch with retry logic
   */
  async fetchWithRetry(url, options, attempt = 1) {
    try {
      const response = await fetch(url, options);
      
      // Retry on 5xx errors
      if (response.status >= 500 && attempt < this.retryAttempts) {
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      
      return response;
    } catch (error) {
      // Retry on network errors
      if (attempt < this.retryAttempts) {
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate email data before sending
   */
  validateEmailData(formData) {
    const required = ['customerName', 'email', 'phone', 'addressLine1', 'postcode'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    // Additional validation can be added here
    return true;
  }

  /**
   * Format form data for email template
   * This can still be used client-side for preview purposes
   */
  formatEmailData(formData) {
    const formatPrice = (price) => {
      if (typeof price !== 'number') return '0.00';
      return price.toFixed(2);
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Not selected';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      } catch (e) {
        return 'Invalid date';
      }
    };
    
    return {
      // Customer Details
      customerName: formData.customerName || '',
      email: formData.email || '',
      phone: formData.phone || '',
      address: [
        formData.addressLine1,
        formData.addressLine2,
        formData.townCity,
        formData.postcode
      ].filter(Boolean).join(', '),
      
      // Service Details
      serviceType: this.getServiceTypeDisplay(formData),
      propertyDetails: this.getPropertyDetails(formData),
      frequency: formData.selectedFrequency || 'Not specified',
      startDate: formatDate(formData.selectedDate),
      
      // Pricing
      windowCleaningPrice: formatPrice(formData.initialWindowPrice),
      additionalServices: this.getAdditionalServicesDisplay(formData),
      discounts: formatPrice(formData.windowCleaningDiscount),
      totalPrice: formatPrice(formData.grandTotal),
      
      // Additional Info
      notes: formData.bookingNotes || 'None',
      bookingType: this.getBookingType(formData),
      timestamp: new Date().toISOString()
    };
  }

  getServiceTypeDisplay(formData) {
    if (formData.isCommercial) return 'Commercial Enquiry';
    if (formData.isCustomQuote) return 'Custom Residential Quote';
    if (formData.isGeneralEnquiry) return 'General Enquiry';
    return 'Standard Residential Booking';
  }

  getPropertyDetails(formData) {
    if (formData.isCommercial) {
      return formData.commercialDetails?.businessName || 'Commercial Property';
    }
    return `${formData.propertyType || 'Unknown'} - ${formData.bedrooms || 'Unknown'}`;
  }

  getAdditionalServicesDisplay(formData) {
    const services = [];
    
    if (formData.hasConservatory) {
      services.push(`Conservatory surcharge: £${formData.conservatorySurcharge?.toFixed(2) || '0.00'}`);
    }
    
    if (formData.hasExtension) {
      services.push(`Extension surcharge: £${formData.extensionSurcharge?.toFixed(2) || '0.00'}`);
    }
    
    Object.entries(formData.additionalServices || {}).forEach(([service, selected]) => {
      if (selected) {
        services.push(service.replace(/([A-Z])/g, ' $1').trim());
      }
    });
    
    return services.length > 0 ? services.join(', ') : 'None';
  }

  getBookingType(formData) {
    if (formData.grandTotal > 0) return 'Confirmed Booking';
    return 'Quote Request';
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;

// Export for testing
export { EmailService };