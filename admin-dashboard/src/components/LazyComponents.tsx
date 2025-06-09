import { lazy } from 'react';

// Lazy load heavy components to reduce initial bundle size
export const LazyLeadKanban = lazy(() => import('./leads/LeadKanban'));
export const LazyCreateLeadModal = lazy(() => import('./leads/CreateLeadModal'));
export const LazyConversionChart = lazy(() => import('./dashboard/ConversionChart'));
export const LazyQuoteManagement = lazy(() => import('./quotes/QuoteManagement'));
export const LazyTransferHistory = lazy(() => import('./squeegee/TransferHistory'));

// Lazy load chart components
export const LazyConversionFunnel = lazy(() => import('./analytics/ConversionFunnel'));
export const LazyLeadSourceChart = lazy(() => import('./analytics/LeadSourceChart'));
export const LazyPerformanceMetrics = lazy(() => import('./analytics/PerformanceMetrics'));