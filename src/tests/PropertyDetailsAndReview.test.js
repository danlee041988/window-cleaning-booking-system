import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PropertyDetailsAndReview from '../components/PropertyDetailsAndReview';

// Mock reCAPTCHA
jest.mock('react-google-recaptcha', () => {
  return React.forwardRef((props, ref) => (
    <div 
      data-testid="recaptcha"
      onClick={() => props.onChange && props.onChange('test-token')}
    >
      Mock reCAPTCHA
    </div>
  ));
});

// Mock ScheduleSelection component
jest.mock('../components/steps/ScheduleSelection', () => {
  return function MockScheduleSelection({ onDateSelect }) {
    return (
      <div data-testid="schedule-selection">
        <button onClick={() => onDateSelect('2024-01-15')}>
          Select Date
        </button>
      </div>
    );
  };
});

describe('PropertyDetailsAndReview Component', () => {
  const mockPrevStep = jest.fn();
  const mockHandleChange = jest.fn((field) => (event) => {});
  const mockSetFormData = jest.fn();
  const mockHandleSubmit = jest.fn();

  const defaultValues = {
    isResidential: true,
    isCommercial: false,
    isCustomQuote: false,
    isGeneralEnquiry: false,
    customerName: '',
    email: '',
    mobile: '',
    addressLine1: '',
    townCity: '',
    postcode: '',
    initialWindowPrice: 25,
    bookingNotes: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Contact Form Rendering', () => {
    it('should render contact details form', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={defaultValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.getByText(/Complete Your Booking/i)).toBeInTheDocument();
      expect(screen.getByText(/Your Details/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
    });

    it('should render address fields', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={defaultValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.getByLabelText(/Address Line 1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Address Line 2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Town\/City/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Postcode/i)).toBeInTheDocument();
    });

    it('should render reCAPTCHA', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={defaultValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={defaultValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      // Complete reCAPTCHA
      await user.click(screen.getByTestId('recaptcha'));

      // Try to submit without filling required fields
      await user.click(screen.getByText(/Submit Booking/i));

      await waitFor(() => {
        expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/Please enter a valid UK phone number/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={defaultValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      const emailInput = screen.getByLabelText(/Email Address/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      const user = userEvent.setup();
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={defaultValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      const mobileInput = screen.getByLabelText(/Mobile Number/i);
      await user.type(mobileInput, '123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid UK phone number/i)).toBeInTheDocument();
      });
    });

    it('should validate postcode format', async () => {
      const user = userEvent.setup();
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={defaultValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      const postcodeInput = screen.getByLabelText(/Postcode/i);
      await user.type(postcodeInput, 'INVALID');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid UK postcode/i)).toBeInTheDocument();
      });
    });
  });

  describe('Commercial Form', () => {
    const commercialValues = {
      ...defaultValues,
      isCommercial: true,
      isResidential: false,
      commercialDetails: {
        businessName: '',
        propertyType: '',
        services: {},
        frequencies: {}
      }
    };

    it('should render commercial form when isCommercial is true', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={commercialValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.getByText(/Commercial Services Details/i)).toBeInTheDocument();
      expect(screen.getByText(/Business Information/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Business Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Type of Business/i)).toBeInTheDocument();
    });

    it('should render all commercial service options', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={commercialValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.getByLabelText(/External Window Cleaning/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Internal Window Cleaning/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Gutter Clearing/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Fascia & Soffit Cleaning/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Solar Panel Cleaning/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Pressure Washing/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Cladding & Panel Cleaning/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Signage & Shop Front Cleaning/i)).toBeInTheDocument();
    });

    it('should show frequency dropdown when service is selected', async () => {
      const user = userEvent.setup();
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={commercialValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      await user.click(screen.getByLabelText(/External Window Cleaning/i));

      expect(screen.getByText(/Preferred Frequency:/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Select frequency')).toBeInTheDocument();
    });

    it('should render site access and operational details', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={commercialValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.getByText(/Site Access & Operational Details/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Preferred Cleaning Times/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Parking Available\?/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Access Requirements/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Health & Safety Requirements/i)).toBeInTheDocument();
    });

    it('should use single column layout for commercial forms', () => {
      const { container } = render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={commercialValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      // Check that the main grid uses single column for commercial
      const mainGrid = container.querySelector('.grid.gap-8');
      expect(mainGrid).toHaveClass('grid-cols-1');
      expect(mainGrid).not.toHaveClass('lg:grid-cols-2');
    });
  });

  describe('Schedule Selection', () => {
    const residentialValues = {
      ...defaultValues,
      isResidential: true,
      postcode: 'BS1 2AB'
    };

    it('should show schedule selection for standard residential bookings', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={residentialValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.getByText(/Preferred Start Date/i)).toBeInTheDocument();
      expect(screen.getByTestId('schedule-selection')).toBeInTheDocument();
    });

    it('should not show schedule selection for non-standard bookings', () => {
      const customQuoteValues = {
        ...defaultValues,
        isCustomQuote: true,
        isResidential: false
      };

      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={customQuoteValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.queryByText(/Preferred Start Date/i)).not.toBeInTheDocument();
    });
  });

  describe('Booking Summary', () => {
    const summaryValues = {
      ...defaultValues,
      propertyType: '3 Bed Semi-Detached',
      bedrooms: '3',
      selectedFrequency: '8-weekly',
      hasConservatory: true,
      initialWindowPrice: 25,
      conservatorySurcharge: 10
    };

    it('should display booking summary for residential bookings', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={summaryValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.getByText(/Booking Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Property Details/i)).toBeInTheDocument();
      expect(screen.getByText(/Services & Pricing/i)).toBeInTheDocument();
    });

    it('should display correct pricing in summary', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={summaryValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.getByText(/£25.00/)).toBeInTheDocument(); // Window cleaning
      expect(screen.getByText(/£35.00/)).toBeInTheDocument(); // Total
    });
  });

  describe('Form Submission', () => {
    const validValues = {
      ...defaultValues,
      customerName: 'John Smith',
      email: 'john@example.com',
      mobile: '07700900000',
      addressLine1: '123 Test Street',
      townCity: 'Bristol',
      postcode: 'BS1 2AB'
    };

    it('should require reCAPTCHA before submission', async () => {
      const user = userEvent.setup();
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={validValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      // Try to submit without reCAPTCHA
      await user.click(screen.getByText(/Submit Booking/i));

      // Should see alert about reCAPTCHA
      await waitFor(() => {
        expect(mockHandleSubmit).not.toHaveBeenCalled();
      });
    });

    it('should call handleSubmit when form is valid and reCAPTCHA completed', async () => {
      const user = userEvent.setup();
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={validValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      // Complete reCAPTCHA
      await user.click(screen.getByTestId('recaptcha'));

      // Submit form
      await user.click(screen.getByText(/Submit Booking/i));

      await waitFor(() => {
        expect(mockHandleSubmit).toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={validValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={true}
          submissionError={null}
        />
      );

      expect(screen.getByText(/Submitting.../i)).toBeInTheDocument();
      expect(screen.getByText(/Submit/i).closest('button')).toBeDisabled();
    });

    it('should display submission errors', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={validValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError="Network error occurred"
        />
      );

      expect(screen.getByText(/Network error occurred/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call prevStep when back button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={defaultValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      await user.click(screen.getByText(/Back/i));
      expect(mockPrevStep).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      render(
        <PropertyDetailsAndReview 
          prevStep={mockPrevStep}
          handleChange={mockHandleChange}
          values={defaultValues}
          setFormData={mockSetFormData}
          handleSubmit={mockHandleSubmit}
          isLoading={false}
          submissionError={null}
        />
      );

      expect(screen.getByLabelText(/Full Name/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/Email Address/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/Mobile Number/i)).toHaveAttribute('aria-required', 'true');
    });
  });
});