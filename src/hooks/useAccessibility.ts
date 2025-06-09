/**
 * useAccessibility - Enhanced accessibility hook
 * Provides keyboard navigation, screen reader support, and ARIA enhancements
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAccessibilityOptions {
  announceChanges?: boolean;
  focusManagement?: boolean;
  keyboardNavigation?: boolean;
  reducedMotion?: boolean;
}

export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const {
    announceChanges = true,
    focusManagement = true,
    keyboardNavigation = true,
    reducedMotion = true
  } = options;

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const announcementRef = useRef<HTMLDivElement | null>(null);

  // Detect user preferences
  useEffect(() => {
    if (reducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [reducedMotion]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Create live region for announcements
  useEffect(() => {
    if (!announceChanges) return;

    let liveRegion = document.getElementById('accessibility-live-region') as HTMLDivElement;
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    
    announcementRef.current = liveRegion;

    return () => {
      if (liveRegion && liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    };
  }, [announceChanges]);

  // Announce message to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges || !announcementRef.current) return;

    announcementRef.current.setAttribute('aria-live', priority);
    announcementRef.current.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = '';
      }
    }, 1000);
  }, [announceChanges]);

  // Focus management
  const focusElement = useCallback((elementOrSelector: HTMLElement | string) => {
    if (!focusManagement) return;

    const element = typeof elementOrSelector === 'string' 
      ? document.querySelector(elementOrSelector) as HTMLElement
      : elementOrSelector;

    if (element) {
      // Small delay to ensure element is ready
      requestAnimationFrame(() => {
        element.focus();
        
        // Scroll into view if needed
        element.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'center'
        });
      });
    }
  }, [focusManagement, prefersReducedMotion]);

  // Skip to main content
  const skipToMain = useCallback(() => {
    const mainContent = document.getElementById('main-content') || 
                       document.querySelector('main') ||
                       document.querySelector('[role="main"]') as HTMLElement;
    
    if (mainContent) {
      focusElement(mainContent);
      announce('Skipped to main content');
    }
  }, [focusElement, announce]);

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((
    event: KeyboardEvent,
    options: {
      onEscape?: () => void;
      onEnter?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onTab?: () => void;
    } = {}
  ) => {
    if (!keyboardNavigation) return;

    const { onEscape, onEnter, onArrowUp, onArrowDown, onTab } = options;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'Enter':
        if (event.target instanceof HTMLButtonElement || 
            (event.target as HTMLElement).getAttribute('role') === 'button') {
          event.preventDefault();
          onEnter?.();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'Tab':
        onTab?.();
        break;
    }
  }, [keyboardNavigation]);

  // Generate accessible IDs
  const generateId = useCallback((prefix: string = 'accessibility') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // ARIA helpers
  const getAriaProps = useCallback((
    options: {
      label?: string;
      describedBy?: string;
      expanded?: boolean;
      selected?: boolean;
      required?: boolean;
      invalid?: boolean;
      live?: 'polite' | 'assertive' | 'off';
    } = {}
  ) => {
    const props: Record<string, any> = {};

    if (options.label) props['aria-label'] = options.label;
    if (options.describedBy) props['aria-describedby'] = options.describedBy;
    if (options.expanded !== undefined) props['aria-expanded'] = options.expanded;
    if (options.selected !== undefined) props['aria-selected'] = options.selected;
    if (options.required) props['aria-required'] = true;
    if (options.invalid) props['aria-invalid'] = true;
    if (options.live) props['aria-live'] = options.live;

    return props;
  }, []);

  return {
    // State
    prefersReducedMotion,
    highContrast,
    
    // Functions
    announce,
    focusElement,
    skipToMain,
    handleKeyboardNavigation,
    generateId,
    getAriaProps,
    
    // Utilities
    motionClass: prefersReducedMotion ? 'motion-reduce' : '',
    contrastClass: highContrast ? 'high-contrast' : ''
  };
};

// Hook for form accessibility
export const useFormAccessibility = () => {
  const accessibility = useAccessibility();
  
  const announceFieldError = useCallback((fieldName: string, error: string) => {
    accessibility.announce(`Error in ${fieldName}: ${error}`, 'assertive');
  }, [accessibility]);

  const announceFieldSuccess = useCallback((fieldName: string) => {
    accessibility.announce(`${fieldName} is valid`);
  }, [accessibility]);

  const announceStepChange = useCallback((step: number, total: number, stepName?: string) => {
    const message = stepName 
      ? `Moved to step ${step} of ${total}: ${stepName}`
      : `Moved to step ${step} of ${total}`;
    accessibility.announce(message);
  }, [accessibility]);

  return {
    ...accessibility,
    announceFieldError,
    announceFieldSuccess,
    announceStepChange
  };
};