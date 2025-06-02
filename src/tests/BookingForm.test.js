import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BookingForm from '../components/BookingForm';

// Mock EmailJS
jest.mock('@emailjs/browser', () => ({
  send: jest.fn(() => Promise.resolve({ status: 200 }))
}));

// Mock reCAPTCHA
jest.mock('react-google-recaptcha', () => {
  return function MockReCAPTCHA(props) {
    return (
      <div 
        data-testid="recaptcha"
        onClick={() => props.onChange && props.onChange('test-token')}
      >
        Mock reCAPTCHA
      </div>
    );
  };
});

// Mock environment variables
process.env.REACT_APP_EMAILJS_SERVICE_ID = 'test_service';
process.env.REACT_APP_EMAILJS_TEMPLATE_ID = 'test_template';
process.env.REACT_APP_EMAILJS_PUBLIC_KEY = 'test_key';
process.env.REACT_APP_RECAPTCHA_SITE_KEY = 'test_recaptcha_key';

describe('BookingForm Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Residential Booking Flow', () => {
    it('should complete full residential booking flow', async () => {
      render(<BookingForm />);

      // Step 1: Select residential service
      expect(screen.getByText(/Standard Window Cleaning/i)).toBeInTheDocument();
      
      // Select property type
      const propertySelect = screen.getByLabelText(/property type/i);
      await userEvent.selectOptions(propertySelect, '3 Bed Semi-Detached');
      
      // Select frequency
      const frequencySelect = screen.getByLabelText(/cleaning frequency/i);
      await userEvent.selectOptions(frequencySelect, '8-weekly');
      
      // Proceed to next step
      await userEvent.click(screen.getByText(/continue/i));

      // Step 2: Additional Services
      await waitFor(() => {
        expect(screen.getByText(/Additional Services/i)).toBeInTheDocument();
      });
      
      // Select conservatory
      const conservatoryYes = screen.getByText(/yes/i, { selector: 'button' });
      await user.click(conservatoryYes);
      
      // Proceed to contact details
      await user.click(screen.getByText(/continue/i));

      // Step 3: Contact Details
      await waitFor(() => {
        expect(screen.getByText(/Complete Your Booking/i)).toBeInTheDocument();
      });
      
      // Fill contact form
      await user.type(screen.getByLabelText(/full name/i), 'John Smith');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/mobile/i), '07700900000');
      await user.type(screen.getByLabelText(/address line 1/i), '123 Test Street');
      await user.type(screen.getByLabelText(/town\/city/i), 'Bristol');
      await user.type(screen.getByLabelText(/postcode/i), 'BS1 2AB');
      
      // Complete reCAPTCHA
      await user.click(screen.getByTestId('recaptcha'));
      
      // Submit booking
      await user.click(screen.getByText(/submit booking/i));
      
      // Check success page
      await waitFor(() => {
        expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument();
      });
    });

    it('should show ad-hoc notice and hide gutter offer for one-off bookings', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      // Select ad-hoc frequency
      const frequencySelect = screen.getByLabelText(/cleaning frequency/i);
      await user.selectOptions(frequencySelect, 'adhoc');
      
      await user.click(screen.getByText(/continue/i));

      await waitFor(() => {
        expect(screen.getByText(/One-off Service Selected/i)).toBeInTheDocument();
        expect(screen.queryByText(/FREE WINDOW CLEAN OFFER/i)).not.toBeInTheDocument();
      });
    });

    it('should show and apply gutter offer for regular customers', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      // Select regular frequency
      const frequencySelect = screen.getByLabelText(/cleaning frequency/i);
      await user.selectOptions(frequencySelect, '8-weekly');
      
      await user.click(screen.getByText(/continue/i));

      await waitFor(() => {
        expect(screen.getByText(/FREE WINDOW CLEAN OFFER/i)).toBeInTheDocument();
      });

      // Select both gutter services
      await user.click(screen.getByLabelText(/internal gutter clearing/i));
      await user.click(screen.getByLabelText(/fascia.*soffit.*cleaning/i));

      // Check if offer is applied
      await waitFor(() => {
        expect(screen.getByText(/FREE WINDOW CLEAN APPLIED/i)).toBeInTheDocument();
      });
    });
  });

  describe('Commercial Booking Flow', () => {
    it('should complete commercial enquiry flow', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      // Select commercial
      await user.click(screen.getByText(/commercial enquiry/i));
      await user.click(screen.getByText(/continue/i));

      // Skip additional services for commercial
      await user.click(screen.getByText(/continue/i));

      // Step 3: Commercial Form
      await waitFor(() => {
        expect(screen.getByText(/Commercial Services Details/i)).toBeInTheDocument();
      });

      // Fill business information
      await user.type(screen.getByLabelText(/business name/i), 'ACME Corp Ltd');
      
      const businessTypeSelect = screen.getByLabelText(/type of business/i);
      await user.selectOptions(businessTypeSelect, 'office');
      
      // Fill contact details
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
      await user.type(screen.getByLabelText(/email/i), 'jane@acme.com');
      await user.type(screen.getByLabelText(/mobile/i), '07700900001');
      await user.type(screen.getByLabelText(/address line 1/i), '456 Business Park');
      await user.type(screen.getByLabelText(/town\/city/i), 'Bristol');
      await user.type(screen.getByLabelText(/postcode/i), 'BS2 3CD');

      // Select commercial services
      await user.click(screen.getByLabelText(/external window cleaning/i));
      await user.click(screen.getByLabelText(/pressure washing/i));

      // Complete reCAPTCHA and submit
      await user.click(screen.getByTestId('recaptcha'));
      await user.click(screen.getByText(/submit enquiry/i));

      await waitFor(() => {
        expect(screen.getByText(/enquiry submitted/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      // Navigate to contact details
      await user.click(screen.getByText(/continue/i));
      await user.click(screen.getByText(/continue/i));

      // Try to submit without filling required fields
      await user.click(screen.getByTestId('recaptcha'));
      await user.click(screen.getByText(/submit/i));

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/please enter a valid uk phone number/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      // Navigate to contact details
      await user.click(screen.getByText(/continue/i));
      await user.click(screen.getByText(/continue/i));

      // Enter invalid email
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate UK postcode format', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      // Navigate to contact details
      await user.click(screen.getByText(/continue/i));
      await user.click(screen.getByText(/continue/i));

      // Enter invalid postcode
      const postcodeInput = screen.getByLabelText(/postcode/i);
      await user.type(postcodeInput, 'INVALID');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid uk postcode/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle email service errors gracefully', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockRejectedValueOnce(new Error('Service unavailable'));

      const user = userEvent.setup();
      render(<BookingForm />);

      // Complete form quickly
      await user.click(screen.getByText(/continue/i));
      await user.click(screen.getByText(/continue/i));

      // Fill minimum required fields
      await user.type(screen.getByLabelText(/full name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/mobile/i), '07700900000');
      await user.type(screen.getByLabelText(/address line 1/i), '123 Test St');
      await user.type(screen.getByLabelText(/town\/city/i), 'Bristol');
      await user.type(screen.getByLabelText(/postcode/i), 'BS1 2AB');
      
      await user.click(screen.getByTestId('recaptcha'));
      await user.click(screen.getByText(/submit/i));

      await waitFor(() => {
        expect(screen.getByText(/an error occurred while submitting/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step Navigation', () => {
    it('should allow navigation between steps', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      // Go to step 2
      await user.click(screen.getByText(/continue/i));
      expect(screen.getByText(/Additional Services/i)).toBeInTheDocument();

      // Go to step 3
      await user.click(screen.getByText(/continue/i));
      expect(screen.getByText(/Complete Your Booking/i)).toBeInTheDocument();

      // Go back to step 2
      await user.click(screen.getByText(/back/i));
      expect(screen.getByText(/Additional Services/i)).toBeInTheDocument();

      // Go back to step 1
      await user.click(screen.getByText(/back/i));
      expect(screen.getByText(/Standard Window Cleaning/i)).toBeInTheDocument();
    });
  });
});