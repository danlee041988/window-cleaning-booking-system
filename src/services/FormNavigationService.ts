/**
 * FormNavigationService - Handles form step navigation and state management
 * Extracted from BookingForm.js for better separation of concerns
 */

import type { FormData, ValidationResult } from '../types/booking';

export class FormNavigationService {
  private totalSteps: number;

  constructor() {
    this.totalSteps = 3; // Not counting confirmation page
  }

  /**
   * Determines if a step should be skipped based on form data
   */
  shouldSkipStep(step: number, formData: FormData): boolean {
    switch (step) {
      case 2: // Additional services step
        // Skip if not standard residential booking
        return !this.isStandardResidentialBooking(formData);
      default:
        return false;
    }
  }

  /**
   * Checks if this is a standard residential booking
   */
  isStandardResidentialBooking(formData: FormData): boolean {
    return formData.isResidential && 
           !formData.isCustomQuote && 
           !formData.isCommercial && 
           !formData.isGeneralEnquiry;
  }

  /**
   * Gets the next valid step, skipping any that should be skipped
   */
  getNextStep(currentStep: number, formData: FormData): number {
    let nextStep = currentStep + 1;
    
    // Keep incrementing until we find a valid step or reach the end
    while (nextStep <= this.totalSteps && this.shouldSkipStep(nextStep, formData)) {
      nextStep++;
    }
    
    return nextStep;
  }

  /**
   * Gets the previous valid step, skipping any that should be skipped
   */
  getPreviousStep(currentStep: number, formData: FormData): number {
    let prevStep = currentStep - 1;
    
    // Keep decrementing until we find a valid step or reach the beginning
    while (prevStep >= 1 && this.shouldSkipStep(prevStep, formData)) {
      prevStep--;
    }
    
    return Math.max(1, prevStep);
  }

  /**
   * Validates if a step can be completed with current form data
   */
  canCompleteStep(step: number, formData: FormData): ValidationResult {
    switch (step) {
      case 1: // Service selection
        return this.validateStep1(formData);
      case 2: // Additional services (only for standard residential)
        return { isValid: true, errors: [] }; // Optional step, always valid
      case 3: // Contact details and review
        return this.validateStep3(formData);
      default:
        return { isValid: false, errors: ['Invalid step'] };
    }
  }

  /**
   * Validates step 1 (service selection)
   */
  private validateStep1(formData: FormData): ValidationResult {
    const errors: string[] = [];

    // Must select a booking type
    const hasBookingType = formData.isResidential || 
                          formData.isCommercial || 
                          formData.isGeneralEnquiry;

    if (!hasBookingType) {
      errors.push('Please select a service type');
    }

    // Standard residential must have service and property details
    if (this.isStandardResidentialBooking(formData)) {
      if (!formData.selectedWindowService) {
        errors.push('Please select a window cleaning service');
      }
      if (!formData.propertyType) {
        errors.push('Please select your property type');
      }
      if (!formData.bedrooms) {
        errors.push('Please select number of bedrooms');
      }
      if (!formData.selectedFrequency) {
        errors.push('Please select cleaning frequency');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates step 3 (contact details)
   */
  private validateStep3(formData: FormData): ValidationResult {
    const errors: string[] = [];

    // Required contact fields
    if (!formData.customerName?.trim()) {
      errors.push('Customer name is required');
    }

    if (!formData.email?.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.mobile?.trim()) {
      errors.push('Mobile number is required');
    }

    // Required address fields
    if (!formData.addressLine1?.trim()) {
      errors.push('Address line 1 is required');
    }

    if (!formData.townCity?.trim()) {
      errors.push('Town/City is required');
    }

    if (!formData.postcode?.trim()) {
      errors.push('Postcode is required');
    }

    // Commercial-specific validation
    if (formData.isCommercial) {
      if (!formData.commercialDetails?.companyName?.trim()) {
        errors.push('Company name is required for commercial bookings');
      }
      
      const hasCommercialServices = Object.values(
        formData.commercialDetails?.servicesRequested || {}
      ).some(Boolean);
      
      if (!hasCommercialServices) {
        errors.push('Please select at least one commercial service');
      }
    }

    // General enquiry validation
    if (formData.isGeneralEnquiry) {
      const hasEnquiryServices = Object.values(
        formData.generalEnquiryDetails?.requestedServices || {}
      ).some(Boolean);
      
      if (!hasEnquiryServices) {
        errors.push('Please select at least one service for your enquiry');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Email validation helper
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Gets progress percentage for current step
   */
  getProgressPercentage(currentStep: number): number {
    if (currentStep >= 4) return 100; // Confirmation page
    return Math.round((currentStep / this.totalSteps) * 100);
  }

  /**
   * Gets step title for display
   */
  getStepTitle(step: number): string {
    switch (step) {
      case 1: return 'Service Selection';
      case 2: return 'Additional Services';
      case 3: return 'Contact Details';
      case 4: return 'Confirmation';
      default: return `Step ${step}`;
    }
  }

  /**
   * Gets step description for accessibility
   */
  getStepDescription(step: number): string {
    switch (step) {
      case 1: return 'Choose your cleaning service and property details';
      case 2: return 'Select any additional services you need';
      case 3: return 'Provide your contact information and review your booking';
      case 4: return 'Booking confirmation and next steps';
      default: return '';
    }
  }
}

export default new FormNavigationService();