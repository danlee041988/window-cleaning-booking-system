/**
 * EmailTemplateService - Handles email template mapping and formatting
 * Extracted from BookingForm.js for better separation of concerns
 */

import * as FORM_CONSTANTS from '../constants/formConstants';
import type { FormData, EmailTemplateParams } from '../types/booking';

export class EmailTemplateService {
  /**
   * Formats price for display
   */
  formatPrice(price: number | undefined | null): string {
    return (price !== undefined && price !== null ? price.toFixed(2) : '0.00');
  }

  /**
   * Formats date for display
   */
  formatDate(dateString: string | Date | undefined | null): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        weekday: 'long',
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'N/A';
    }
  }

  /**
   * Maps form data to simple template parameters for email
   */
  mapFormDataToTemplateParamsSimple(formData: FormData): EmailTemplateParams {
    // Determine booking type
    let bookingTypeDisplay = 'Unknown Booking Type';
    const isStandardResidential = (
      formData.isResidential &&
      !formData.isCustomQuote &&
      !formData.isCommercial &&
      !formData.isGeneralEnquiry
    );

    if (isStandardResidential) {
      bookingTypeDisplay = 'Standard Residential Booking';
    } else if (formData.isGeneralEnquiry) {
      bookingTypeDisplay = 'General Enquiry';
    } else if (formData.isCommercial) {
      bookingTypeDisplay = 'Commercial Enquiry';
    } else if (formData.isCustomQuote) {
      bookingTypeDisplay = 'Custom Quote Request';
    }

    // Get selected services for standard residential
    const selectedAddons = this.getSelectedAddons(formData);
    const commercialServices = this.getSelectedCommercialServices(formData);
    const generalEnquiryServices = this.getSelectedGeneralEnquiryServices(formData);

    return {
      // Booking information
      booking_type: bookingTypeDisplay,
      booking_reference: formData.bookingReference || 'Not generated',
      submitted_date: this.formatDate(formData.submittedAt || new Date()),

      // Customer information
      customer_name: formData.customerName || 'N/A',
      email: formData.email || 'N/A',
      mobile: formData.mobile || 'N/A',
      landline: formData.landline || 'N/A',
      preferred_contact_method: formData.preferredContactMethod || 'N/A',
      preferred_contact_time: formData.preferredContactTime || 'N/A',
      best_time_to_call: formData.bestTimeToCall || 'N/A',

      // Address information
      address_line1: formData.addressLine1 || 'N/A',
      address_line2: formData.addressLine2 || '',
      town_city: formData.townCity || 'N/A',
      county: formData.county || 'N/A',
      postcode: formData.postcode || 'N/A',

      // Standard residential service details
      property_type: formData.propertyType || 'N/A',
      bedrooms: formData.bedrooms || 'N/A',
      selected_frequency: formData.selectedFrequency || 'N/A',
      selected_window_service: formData.selectedWindowService?.name || 'N/A',

      // Property features
      has_conservatory: formData.hasConservatory ? 'Yes' : 'No',
      has_extension: formData.hasExtension ? 'Yes' : 'No',

      // Pricing
      initial_window_price: this.formatPrice(formData.initialWindowPrice),
      gutter_clearing_price: this.formatPrice(formData.gutterClearingServicePrice),
      fascia_soffit_price: this.formatPrice(formData.fasciaSoffitGutterServicePrice),
      conservatory_surcharge: this.formatPrice(formData.conservatorySurcharge),
      extension_surcharge: this.formatPrice(formData.extensionSurcharge),
      window_cleaning_discount: this.formatPrice(formData.windowCleaningDiscount),
      sub_total: this.formatPrice(formData.subTotalBeforeDiscount),
      grand_total: this.formatPrice(formData.grandTotal),

      // Selected services
      selected_addons: selectedAddons,
      commercial_services: commercialServices,
      general_enquiry_services: generalEnquiryServices,

      // Commercial details
      company_name: formData.commercialDetails?.companyName || 'N/A',
      business_type: formData.commercialDetails?.businessType || 'N/A',
      vat_number: formData.commercialDetails?.vatNumber || 'N/A',
      contact_person: formData.commercialDetails?.contactPerson || 'N/A',
      contact_role: formData.commercialDetails?.contactRole || 'N/A',
      number_of_floors: formData.commercialDetails?.numberOfFloors || 'N/A',
      preferred_cleaning_times: formData.commercialDetails?.preferredCleaningTimes || 'N/A',
      access_requirements: formData.commercialDetails?.accessRequirements || 'N/A',
      health_safety_requirements: formData.commercialDetails?.healthSafetyRequirements || 'N/A',
      parking_available: formData.commercialDetails?.parkingAvailable || 'N/A',

      // General enquiry details
      customer_status: formData.generalEnquiryDetails?.customerStatus || 'N/A',
      requested_frequency: formData.generalEnquiryDetails?.requestedFrequency || 'N/A',
      enquiry_comments: formData.generalEnquiryDetails?.enquiryComments || 'N/A',

      // Notes and additional information
      access_notes: formData.accessNotes || 'N/A',
      booking_notes: formData.bookingNotes || 'N/A',
      other_service_details: formData.commercialDetails?.otherServiceDetails || 'N/A',
      other_service_text: formData.commercialDetails?.otherServiceText || 'N/A',
      other_notes: formData.commercialDetails?.otherNotes || 'N/A',

      // Quote requests
      quote_requests: this.getQuoteRequests(formData)
    };
  }

  /**
   * Gets selected additional services for standard residential bookings
   */
  getSelectedAddons(formData: FormData): string {
    const addons: string[] = [];

    if (formData.additionalServices?.[FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF]) {
      addons.push('Conservatory Roof Cleaning');
    }

    if (formData.additionalServices?.[FORM_CONSTANTS.ADDON_GUTTER_CLEARING]) {
      addons.push(`Gutter Clearing (£${this.formatPrice(formData.gutterClearingServicePrice)})`);
    }

    if (formData.additionalServices?.[FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]) {
      addons.push(`Fascia, Soffit & Gutter Cleaning (£${this.formatPrice(formData.fasciaSoffitGutterServicePrice)})`);
    }

    return addons.length > 0 ? addons.join(', ') : 'None selected';
  }

  /**
   * Gets selected commercial services
   */
  getSelectedCommercialServices(formData: FormData): string {
    const services: string[] = [];

    if (!formData.commercialDetails?.servicesRequested) {
      return 'None selected';
    }

    const serviceMap: Record<string, string> = {
      [FORM_CONSTANTS.COMM_SERVICE_WINDOW_CLEANING]: 'Window Cleaning',
      [FORM_CONSTANTS.COMM_SERVICE_GUTTER_CLEANING]: 'Gutter Cleaning',
      [FORM_CONSTANTS.COMM_SERVICE_FASCIA_SOFFIT_CLEANING]: 'Fascia & Soffit Cleaning',
      // Note: Solar panel and pressure washing services not defined in form constants
      // [FORM_CONSTANTS.COMM_SERVICE_SOLAR_PANEL_CLEANING]: 'Solar Panel Cleaning',
      // [FORM_CONSTANTS.COMM_SERVICE_PRESSURE_WASHING]: 'Pressure Washing',
      [FORM_CONSTANTS.COMM_SERVICE_CLADDING_CLEANING]: 'Cladding Cleaning',
      [FORM_CONSTANTS.COMM_SERVICE_SIGNAGE_CLEANING]: 'Signage Cleaning'
    };

    Object.entries(formData.commercialDetails.servicesRequested).forEach(([key, selected]) => {
      if (selected && serviceMap[key]) {
        services.push(serviceMap[key]);
      }
    });

    if (formData.commercialDetails.servicesRequested[FORM_CONSTANTS.COMM_SERVICE_OTHER] && 
        formData.commercialDetails.otherServiceText) {
      services.push(`Other: ${formData.commercialDetails.otherServiceText}`);
    }

    return services.length > 0 ? services.join(', ') : 'None selected';
  }

  /**
   * Gets selected general enquiry services
   */
  getSelectedGeneralEnquiryServices(formData: FormData): string {
    const services: string[] = [];

    if (!formData.generalEnquiryDetails?.requestedServices) {
      return 'None selected';
    }

    const serviceMap: Record<string, string> = {
      [FORM_CONSTANTS.GEN_ENQ_SERVICE_WINDOW_CLEANING]: 'Window Cleaning',
      [FORM_CONSTANTS.GEN_ENQ_SERVICE_CONSERVATORY_WINDOWS]: 'Conservatory Window Cleaning',
      [FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF]: 'Conservatory Roof Cleaning',
      [FORM_CONSTANTS.ADDON_GUTTER_CLEARING]: 'Gutter Clearing',
      [FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]: 'Fascia, Soffit & Gutter Cleaning',
      [FORM_CONSTANTS.GEN_ENQ_SERVICE_SOLAR_PANELS]: 'Solar Panel Cleaning'
    };

    Object.entries(formData.generalEnquiryDetails.requestedServices).forEach(([key, selected]) => {
      if (selected && serviceMap[key]) {
        services.push(serviceMap[key]);
      }
    });

    if (formData.generalEnquiryDetails.requestedServices[FORM_CONSTANTS.GEN_ENQ_SERVICE_OTHER] && 
        formData.generalEnquiryDetails.otherServiceText) {
      services.push(`Other: ${formData.generalEnquiryDetails.otherServiceText}`);
    }

    return services.length > 0 ? services.join(', ') : 'None selected';
  }

  /**
   * Gets quote requests
   */
  getQuoteRequests(formData: FormData): string {
    const quotes: string[] = [];

    if (formData.quoteRequests?.[FORM_CONSTANTS.QUOTE_REQUEST_SOLAR_PANEL_CLEANING]) {
      quotes.push('Solar Panel Cleaning Quote');
    }

    if (formData.quoteRequests?.[FORM_CONSTANTS.QUOTE_REQUEST_CONSERVATORY_ROOF_CLEANING]) {
      quotes.push('Conservatory Roof Cleaning Quote');
    }

    return quotes.length > 0 ? quotes.join(', ') : 'None requested';
  }

  /**
   * Determines if this is a quote/enquiry vs booking
   */
  getBookingOrEnquiryText(formData: FormData): string {
    const isQuoteOrEnquiry = formData.isCustomQuote || 
                           formData.isCommercial || 
                           formData.isGeneralEnquiry;
    return isQuoteOrEnquiry ? "enquiry" : "booking";
  }
}

export default new EmailTemplateService();