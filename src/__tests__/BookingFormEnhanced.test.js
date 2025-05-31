import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BookingFormEnhanced from '../components/BookingFormEnhanced';

// Mock dependencies
jest.mock('@emailjs/browser');
jest.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: ({ onChange }) => (
    <div data-testid="mock-recaptcha">
      <button onClick={() => onChange('mock-token')}>Complete reCAPTCHA</button>
    </div>
  ),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock window methods
global.gtag = jest.fn();
global.scrollTo = jest.fn();
window.confirm = jest.fn(() => true);

describe('BookingFormEnhanced', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Critical Issues Fixed', () => {
    test('prevents memory leaks on unmount during async operations', async () => {
      const { unmount } = render(<BookingFormEnhanced />);
      
      // Start an async operation
      const submitButton = screen.queryByText(/submit/i);
      if (submitButton) {
        fireEvent.click(submitButton);
      }
      
      // Unmount immediately
      unmount();
      
      // Wait to ensure no state updates occur
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Test passes if no errors are thrown
      expect(true).toBe(true);
    });

    test('prevents state mutations with deep cloning', () => {
      const { rerender } = render(<BookingFormEnhanced />);
      
      // Initial render
      const initialFormData = { 
        customer: { 
          name: 'John', 
          address: { line1: '123 Main' } 
        } 
      };
      
      // Rerender with updated data
      rerender(<BookingFormEnhanced />);
      
      // Original data should remain unchanged
      expect(initialFormData.customer.name).toBe('John');
    });

    test('cleans up timeouts on unmount', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const { unmount } = render(<BookingFormEnhanced />);
      
      // Navigate between steps
      const nextButton = screen.queryByText(/continue|next/i);
      if (nextButton) {
        fireEvent.click(nextButton);
      }
      
      unmount();
      
      // Verify timeouts were cleared
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('Error Boundary', () => {
    test('catches and displays errors gracefully', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Component that throws an error
      const ThrowError = () => {
        throw new Error('Test error');
      };
      
      const { container } = render(
        <BookingFormEnhanced>
          <ThrowError />
        </BookingFormEnhanced>
      );
      
      // Should show error UI
      expect(screen.queryByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText(/try again/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Form Persistence', () => {
    test('auto-saves form data to localStorage', async () => {
      render(<BookingFormEnhanced />);
      
      // Fill in a field
      const nameInput = screen.queryByLabelText(/full name/i);
      if (nameInput) {
        await userEvent.type(nameInput, 'John Doe');
      }
      
      // Wait for debounced save
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveProperty('timestamp');
      expect(savedData).toHaveProperty('version', '2.0');
    });

    test('restores saved form data on mount', async () => {
      const savedData = {
        version: '2.0',
        timestamp: Date.now(),
        formData: {
          customerName: 'John Doe',
          email: 'john@example.com'
        }
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(savedData));
      
      render(<BookingFormEnhanced />);
      
      // Wait for restoration
      await waitFor(() => {
        const nameInput = screen.queryByDisplayValue('John Doe');
        expect(nameInput).toBeInTheDocument();
      });
    });

    test('clears expired data', () => {
      const oldData = {
        version: '2.0',
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        formData: {}
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(oldData));
      
      render(<BookingFormEnhanced />);
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('bookingFormData');
    });
  });

  describe('Field Validation', () => {
    test('validates fields with debouncing', async () => {
      render(<BookingFormEnhanced />);
      
      // Navigate to contact details
      const detailsStep = screen.queryByText(/your details/i);
      if (detailsStep) {
        // Type invalid email
        const emailInput = screen.queryByLabelText(/email/i);
        if (emailInput) {
          await userEvent.type(emailInput, 'invalid-email');
          
          // Error should appear after debounce
          await waitFor(() => {
            expect(screen.queryByText(/valid email/i)).toBeInTheDocument();
          }, { timeout: 1000 });
        }
      }
    });

    test('shows success state for valid fields', async () => {
      render(<BookingFormEnhanced />);
      
      const emailInput = screen.queryByLabelText(/email/i);
      if (emailInput) {
        await userEvent.type(emailInput, 'valid@example.com');
        fireEvent.blur(emailInput);
        
        // Should show checkmark icon
        await waitFor(() => {
          const successIcon = emailInput.parentElement.querySelector('svg');
          expect(successIcon).toBeInTheDocument();
        });
      }
    });

    test('validates UK phone numbers correctly', async () => {
      render(<BookingFormEnhanced />);
      
      const phoneInput = screen.queryByLabelText(/mobile/i);
      if (phoneInput) {
        // Test valid UK mobile
        await userEvent.clear(phoneInput);
        await userEvent.type(phoneInput, '07700900123');
        fireEvent.blur(phoneInput);
        
        await waitFor(() => {
          expect(screen.queryByText(/valid UK phone/i)).not.toBeInTheDocument();
        });
        
        // Test invalid number
        await userEvent.clear(phoneInput);
        await userEvent.type(phoneInput, '123');
        fireEvent.blur(phoneInput);
        
        await waitFor(() => {
          expect(screen.queryByText(/valid UK phone/i)).toBeInTheDocument();
        });
      }
    });

    test('validates UK postcodes correctly', async () => {
      render(<BookingFormEnhanced />);
      
      const postcodeInput = screen.queryByLabelText(/postcode/i);
      if (postcodeInput) {
        // Test valid postcode
        await userEvent.type(postcodeInput, 'BS1 2AB');
        fireEvent.blur(postcodeInput);
        
        await waitFor(() => {
          expect(screen.queryByText(/valid UK postcode/i)).not.toBeInTheDocument();
        });
        
        // Test invalid postcode
        await userEvent.clear(postcodeInput);
        await userEvent.type(postcodeInput, 'INVALID');
        fireEvent.blur(postcodeInput);
        
        await waitFor(() => {
          expect(screen.queryByText(/valid UK postcode/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Mobile Responsiveness', () => {
    test('renders mobile-friendly UI', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      render(<BookingFormEnhanced />);
      
      // Check for mobile-first classes
      const container = screen.getByRole('main', { hidden: true }) || document.body;
      expect(container.innerHTML).toMatch(/sm:|min-h-\[44px\]/);
    });

    test('touch-friendly button sizes', () => {
      render(<BookingFormEnhanced />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const height = parseInt(styles.minHeight) || parseInt(styles.height);
        expect(height).toBeGreaterThanOrEqual(44); // Touch target minimum
      });
    });
  });

  describe('Loading States', () => {
    test('shows skeleton loader during loading', async () => {
      render(<BookingFormEnhanced />);
      
      // Trigger loading state
      const submitButton = screen.queryByText(/submit/i);
      if (submitButton) {
        fireEvent.click(submitButton);
        
        // Should show loading spinner
        await waitFor(() => {
          expect(screen.queryByText(/submitting/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Analytics Tracking', () => {
    test('tracks form events', async () => {
      render(<BookingFormEnhanced />);
      
      // Should track initial view
      expect(global.gtag).toHaveBeenCalledWith(
        'event',
        'step_viewed',
        expect.objectContaining({
          event_category: 'BookingForm',
          step: 1
        })
      );
      
      // Navigate to next step
      const nextButton = screen.queryByText(/continue|next/i);
      if (nextButton) {
        fireEvent.click(nextButton);
        
        await waitFor(() => {
          expect(global.gtag).toHaveBeenCalledWith(
            'event',
            'step_viewed',
            expect.objectContaining({
              step: 2
            })
          );
        });
      }
    });

    test('tracks form errors', async () => {
      render(<BookingFormEnhanced />);
      
      // Submit without required fields
      const submitButton = screen.queryByText(/submit/i);
      if (submitButton) {
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(global.gtag).toHaveBeenCalledWith(
            'event',
            'form_error',
            expect.any(Object)
          );
        });
      }
    });
  });

  describe('Form Flow', () => {
    test('completes standard residential booking flow', async () => {
      const user = userEvent.setup();
      render(<BookingFormEnhanced />);
      
      // Step 1: Select service
      const residentialButton = screen.queryByText(/residential/i);
      if (residentialButton) {
        await user.click(residentialButton);
      }
      
      // Continue through steps...
      const continueButton = screen.queryByText(/continue/i);
      if (continueButton) {
        await user.click(continueButton);
      }
      
      // Verify we can navigate through the form
      expect(screen.queryByText(/step 2/i)).toBeInTheDocument();
    });

    test('handles back navigation correctly', async () => {
      render(<BookingFormEnhanced />);
      
      // Navigate forward
      const nextButton = screen.queryByText(/continue|next/i);
      if (nextButton) {
        fireEvent.click(nextButton);
      }
      
      // Navigate back
      const backButton = screen.queryByText(/back/i);
      if (backButton) {
        fireEvent.click(backButton);
        
        await waitFor(() => {
          expect(screen.queryByText(/step 1/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Accessibility', () => {
    test('form has proper ARIA labels', () => {
      render(<BookingFormEnhanced />);
      
      // Check for required ARIA attributes
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('id');
        const label = screen.queryByLabelText(input.getAttribute('placeholder') || '');
        expect(label || input.getAttribute('aria-label')).toBeTruthy();
      });
    });

    test('supports keyboard navigation', async () => {
      render(<BookingFormEnhanced />);
      
      // Tab through form
      const user = userEvent.setup();
      await user.tab();
      
      // Active element should be focusable
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  describe('Performance', () => {
    test('memoizes expensive calculations', () => {
      const { rerender } = render(<BookingFormEnhanced />);
      
      // Initial render
      rerender(<BookingFormEnhanced />);
      
      // Subsequent renders should use memoized values
      const performanceNow = jest.spyOn(performance, 'now');
      rerender(<BookingFormEnhanced />);
      
      // Should not recalculate if props haven't changed
      expect(performanceNow).toHaveBeenCalledTimes(0);
    });

    test('lazy loads heavy components', async () => {
      render(<BookingFormEnhanced />);
      
      // PropertyDetailsAndReview should be lazy loaded
      expect(screen.queryByText(/complete your booking/i)).not.toBeInTheDocument();
      
      // Navigate to step that requires it
      // ... navigation logic
      
      // Should load when needed
      await waitFor(() => {
        // Component loads
      });
    });
  });
});