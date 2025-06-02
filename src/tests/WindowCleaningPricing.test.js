import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import WindowCleaningPricing from '../components/WindowCleaningPricing';

describe('WindowCleaningPricing Component', () => {
  const mockGoToStep = jest.fn();
  const mockOnFormChange = jest.fn();
  const defaultValues = {
    isResidential: false,
    isCommercial: false,
    isCustomQuote: false,
    isGeneralEnquiry: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Type Selection', () => {
    it('should render all service type options', () => {
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      expect(screen.getByText(/Standard Window Cleaning/i)).toBeInTheDocument();
      expect(screen.getByText(/Custom Residential Quote/i)).toBeInTheDocument();
      expect(screen.getByText(/Commercial Enquiry/i)).toBeInTheDocument();
      expect(screen.getByText(/General Enquiry/i)).toBeInTheDocument();
    });

    it('should select residential service and show property options', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      await user.click(screen.getByText(/Standard Window Cleaning/i));

      expect(screen.getByText(/Property Type/i)).toBeInTheDocument();
      expect(screen.getByText(/Cleaning Frequency/i)).toBeInTheDocument();
    });

    it('should select commercial service and show continue button', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      await user.click(screen.getByText(/Commercial Enquiry/i));

      expect(screen.getByText(/Continue to Details/i)).toBeInTheDocument();
    });
  });

  describe('Residential Property Configuration', () => {
    it('should show all property type options', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      await user.click(screen.getByText(/Standard Window Cleaning/i));

      const propertySelect = screen.getByLabelText(/property type/i);
      expect(propertySelect).toBeInTheDocument();
      
      // Check options are available
      expect(screen.getByText(/1-2 Bedroom/i)).toBeInTheDocument();
      expect(screen.getByText(/3 Bed Semi-Detached/i)).toBeInTheDocument();
      expect(screen.getByText(/3 Bed Detached/i)).toBeInTheDocument();
    });

    it('should show frequency options', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      await user.click(screen.getByText(/Standard Window Cleaning/i));

      const frequencySelect = screen.getByLabelText(/cleaning frequency/i);
      expect(frequencySelect).toBeInTheDocument();
    });

    it('should calculate and display pricing', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      await user.click(screen.getByText(/Standard Window Cleaning/i));

      // Select property type
      const propertySelect = screen.getByLabelText(/property type/i);
      await user.selectOptions(propertySelect, '3 Bed Semi-Detached');

      // Select frequency
      const frequencySelect = screen.getByLabelText(/cleaning frequency/i);
      await user.selectOptions(frequencySelect, '8-weekly');

      // Should show pricing
      await waitFor(() => {
        expect(screen.getByText(/£28/)).toBeInTheDocument(); // 25 + 3 for 8-weekly
      });
    });

    it('should handle ad-hoc pricing correctly', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      await user.click(screen.getByText(/Standard Window Cleaning/i));

      // Select property type
      const propertySelect = screen.getByLabelText(/property type/i);
      await user.selectOptions(propertySelect, '1-2 Bedroom');

      // Select ad-hoc frequency
      const frequencySelect = screen.getByLabelText(/cleaning frequency/i);
      await user.selectOptions(frequencySelect, 'adhoc');

      // Should show ad-hoc pricing (base + 20)
      await waitFor(() => {
        expect(screen.getByText(/£40/)).toBeInTheDocument(); // 20 + 20 for ad-hoc
      });
    });
  });

  describe('Navigation and Form Submission', () => {
    it('should enable continue button when residential form is complete', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      await user.click(screen.getByText(/Standard Window Cleaning/i));

      // Select required fields
      await user.selectOptions(screen.getByLabelText(/property type/i), '3 Bed Semi-Detached');
      await user.selectOptions(screen.getByLabelText(/cleaning frequency/i), '8-weekly');

      // Continue button should be enabled
      const continueButton = screen.getByText(/Continue to Additional Services/i);
      expect(continueButton).not.toBeDisabled();

      await user.click(continueButton);
      expect(mockGoToStep).toHaveBeenCalledWith(2);
    });

    it('should handle custom quote selection', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      await user.click(screen.getByText(/Custom Residential Quote/i));

      const continueButton = screen.getByText(/Continue to Details/i);
      expect(continueButton).toBeInTheDocument();

      await user.click(continueButton);
      expect(mockGoToStep).toHaveBeenCalledWith(3);
    });

    it('should call onFormChange when selections are made', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      await user.click(screen.getByText(/Standard Window Cleaning/i));

      expect(mockOnFormChange).toHaveBeenCalledWith(expect.objectContaining({
        isResidential: true,
        isCommercial: false,
        isCustomQuote: false,
        isGeneralEnquiry: false
      }));
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      // Check for accessibility features
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText(/Somerset Window Cleaning/i)).toBeInTheDocument();
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      // Tab through service options
      await user.tab();
      expect(document.activeElement).toHaveAttribute('type', 'radio');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing values gracefully', () => {
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={{}}
        />
      );

      expect(screen.getByText(/Standard Window Cleaning/i)).toBeInTheDocument();
    });

    it('should prevent form submission with incomplete data', async () => {
      const user = userEvent.setup();
      render(
        <WindowCleaningPricing 
          goToStep={mockGoToStep} 
          onFormChange={mockOnFormChange} 
          values={defaultValues}
        />
      );

      await user.click(screen.getByText(/Standard Window Cleaning/i));

      // Try to continue without selections
      const continueButton = screen.getByText(/Continue to Additional Services/i);
      expect(continueButton).toBeDisabled();
    });
  });
});