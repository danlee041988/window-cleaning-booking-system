import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AdditionalServicesForm from '../components/AdditionalServicesForm';

describe('AdditionalServicesForm Component', () => {
  const mockNextStep = jest.fn();
  const mockPrevStep = jest.fn();
  const mockSetFormData = jest.fn();

  const defaultValues = {
    isResidential: true,
    isCommercial: false,
    selectedFrequency: '8-weekly',
    propertyType: '3 Bed Semi-Detached',
    initialWindowPrice: 25,
    additionalServices: {},
    hasConservatory: false,
    hasExtension: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Conservatory Selection', () => {
    it('should render conservatory question for residential bookings', () => {
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      expect(screen.getByText(/Conservatory\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Yes/)).toBeInTheDocument();
      expect(screen.getByText(/No/)).toBeInTheDocument();
    });

    it('should show conservatory surcharge when yes is selected', async () => {
      const user = userEvent.setup();
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      const yesButton = screen.getAllByText(/Yes/)[0]; // First Yes button (conservatory)
      await user.click(yesButton);

      expect(screen.getByText(/£10.*surcharge/i)).toBeInTheDocument();
    });
  });

  describe('Extension Selection', () => {
    it('should render extension question', () => {
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      expect(screen.getByText(/Property Extension\?/i)).toBeInTheDocument();
    });

    it('should show extension surcharge when selected', async () => {
      const user = userEvent.setup();
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      const yesButtons = screen.getAllByText(/Yes/);
      const extensionYes = yesButtons[1]; // Second Yes button (extension)
      await user.click(extensionYes);

      expect(screen.getByText(/£5.*surcharge/i)).toBeInTheDocument();
    });
  });

  describe('Gutter Offer Logic', () => {
    it('should show gutter offer for regular frequency customers', () => {
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      expect(screen.getByText(/FREE WINDOW CLEAN OFFER/i)).toBeInTheDocument();
    });

    it('should hide gutter offer for ad-hoc customers', () => {
      const adhocValues = { ...defaultValues, selectedFrequency: 'adhoc' };
      
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={adhocValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      expect(screen.queryByText(/FREE WINDOW CLEAN OFFER/i)).not.toBeInTheDocument();
      expect(screen.getByText(/One-off Service Selected/i)).toBeInTheDocument();
      expect(screen.getByText(/Bundle discounts are available only for regular cleaning customers/i)).toBeInTheDocument();
    });

    it('should apply free window clean when both gutter services selected', async () => {
      const user = userEvent.setup();
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      // Select both gutter services
      await user.click(screen.getByLabelText(/internal gutter clearing/i));
      await user.click(screen.getByLabelText(/fascia.*soffit.*cleaning/i));

      await waitFor(() => {
        expect(screen.getByText(/FREE WINDOW CLEAN APPLIED/i)).toBeInTheDocument();
      });
    });

    it('should not apply offer if only one gutter service selected', async () => {
      const user = userEvent.setup();
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      // Select only one gutter service
      await user.click(screen.getByLabelText(/internal gutter clearing/i));

      expect(screen.queryByText(/FREE WINDOW CLEAN APPLIED/i)).not.toBeInTheDocument();
      expect(screen.getByText(/FREE WINDOW CLEAN OFFER/i)).toBeInTheDocument();
    });
  });

  describe('Additional Services Selection', () => {
    it('should allow selection of gutter clearing service', async () => {
      const user = userEvent.setup();
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      const gutterCheckbox = screen.getByLabelText(/internal gutter clearing/i);
      await user.click(gutterCheckbox);

      expect(gutterCheckbox).toBeChecked();
    });

    it('should allow selection of fascia and soffit service', async () => {
      const user = userEvent.setup();
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      const fasciaSoffitCheckbox = screen.getByLabelText(/fascia.*soffit.*cleaning/i);
      await user.click(fasciaSoffitCheckbox);

      expect(fasciaSoffitCheckbox).toBeChecked();
    });

    it('should disable services when not available', () => {
      const valuesWithoutWindow = { ...defaultValues, selectedFrequency: '' };
      
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={valuesWithoutWindow}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      const gutterCheckbox = screen.getByLabelText(/internal gutter clearing/i);
      expect(gutterCheckbox).toBeDisabled();
    });
  });

  describe('General Enquiry Mode', () => {
    it('should show general enquiry form when isGeneralEnquiry is true', () => {
      const generalEnquiryValues = { 
        ...defaultValues, 
        isGeneralEnquiry: true,
        isResidential: false 
      };
      
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={generalEnquiryValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      expect(screen.getByText(/Which services interest you\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Window Cleaning/i)).toBeInTheDocument();
    });

    it('should allow service selection in general enquiry mode', async () => {
      const user = userEvent.setup();
      const generalEnquiryValues = { 
        ...defaultValues, 
        isGeneralEnquiry: true,
        isResidential: false 
      };
      
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={generalEnquiryValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      const windowCleaningCheckbox = screen.getByLabelText(/window cleaning/i);
      await user.click(windowCleaningCheckbox);

      expect(windowCleaningCheckbox).toBeChecked();
    });
  });

  describe('Navigation', () => {
    it('should call prevStep when back button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      await user.click(screen.getByText(/Back/i));
      expect(mockPrevStep).toHaveBeenCalled();
    });

    it('should call nextStep when continue button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      await user.click(screen.getByText(/Continue/i));
      expect(mockNextStep).toHaveBeenCalled();
    });
  });

  describe('Pricing Display', () => {
    it('should show correct pricing for selected services', async () => {
      const user = userEvent.setup();
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      // Select gutter clearing
      await user.click(screen.getByLabelText(/internal gutter clearing/i));

      // Should show gutter clearing price
      expect(screen.getByText(/£60/)).toBeInTheDocument(); // Price for 3-bed semi
    });

    it('should update total when services are selected', async () => {
      const user = userEvent.setup();
      render(
        <AdditionalServicesForm 
          nextStep={mockNextStep}
          prevStep={mockPrevStep}
          values={defaultValues}
          setFormData={mockSetFormData}
          conservatorySurchargeAmount={10}
          extensionSurchargeAmount={5}
        />
      );

      // Check initial total
      expect(screen.getByText(/£25/)).toBeInTheDocument(); // Base window price

      // Select conservatory
      const yesButton = screen.getAllByText(/Yes/)[0];
      await user.click(yesButton);

      // Total should update
      await waitFor(() => {
        expect(screen.getByText(/£35/)).toBeInTheDocument(); // 25 + 10 surcharge
      });
    });
  });
});