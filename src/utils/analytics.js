// Form Analytics Utility for tracking user behavior and conversion rates

class FormAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.stepTimes = {};
        this.fieldInteractions = {};
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Track when user starts the form
    trackFormStart(formType = 'booking') {
        const event = {
            type: 'form_start',
            formType,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            referrer: document.referrer
        };
        
        this.events.push(event);
        this.stepTimes[`form_start`] = Date.now();
        this.logEvent(event);
    }

    // Track step navigation
    trackStepStart(stepNumber, stepName) {
        const event = {
            type: 'step_start',
            stepNumber,
            stepName,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            timeFromStart: Date.now() - this.startTime
        };
        
        this.events.push(event);
        this.stepTimes[`step_${stepNumber}_start`] = Date.now();
        this.logEvent(event);
    }

    trackStepComplete(stepNumber, stepName, formData = {}) {
        const startTime = this.stepTimes[`step_${stepNumber}_start`];
        const timeOnStep = startTime ? Date.now() - startTime : 0;
        
        const event = {
            type: 'step_complete',
            stepNumber,
            stepName,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            timeOnStep,
            totalFieldsCompleted: this.countCompletedFields(formData),
            dataQuality: this.assessDataQuality(formData)
        };
        
        this.events.push(event);
        this.logEvent(event);
    }

    // Track field interactions
    trackFieldFocus(fieldName, stepNumber) {
        if (!this.fieldInteractions[fieldName]) {
            this.fieldInteractions[fieldName] = {
                firstFocus: Date.now(),
                focusCount: 0,
                completionAttempts: 0
            };
        }
        
        this.fieldInteractions[fieldName].focusCount++;
        
        const event = {
            type: 'field_focus',
            fieldName,
            stepNumber,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            focusCount: this.fieldInteractions[fieldName].focusCount
        };
        
        this.events.push(event);
        this.logEvent(event);
    }

    trackFieldCompletion(fieldName, stepNumber, value, isValid = true) {
        if (this.fieldInteractions[fieldName]) {
            this.fieldInteractions[fieldName].completionAttempts++;
        }
        
        const event = {
            type: 'field_completion',
            fieldName,
            stepNumber,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            hasValue: !!value,
            valueLength: value ? value.toString().length : 0,
            isValid,
            attempts: this.fieldInteractions[fieldName]?.completionAttempts || 1
        };
        
        this.events.push(event);
        this.logEvent(event);
    }

    // Track validation errors
    trackValidationError(fieldName, stepNumber, errorType, errorMessage) {
        const event = {
            type: 'validation_error',
            fieldName,
            stepNumber,
            errorType,
            errorMessage,
            timestamp: Date.now(),
            sessionId: this.sessionId
        };
        
        this.events.push(event);
        this.logEvent(event);
    }

    // Track form abandonment
    trackFormAbandonment(stepNumber, stepName, reason = 'unknown') {
        const event = {
            type: 'form_abandonment',
            stepNumber,
            stepName,
            reason,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            timeOnForm: Date.now() - this.startTime,
            completedSteps: this.getCompletedSteps(),
            totalInteractions: this.events.length
        };
        
        this.events.push(event);
        this.logEvent(event);
        this.sendAnalytics(); // Send data immediately on abandonment
    }

    // Track successful form submission
    trackFormSubmission(formType, submissionData) {
        const event = {
            type: 'form_submission',
            formType,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            totalTime: Date.now() - this.startTime,
            completedSteps: this.getCompletedSteps(),
            totalFieldInteractions: Object.keys(this.fieldInteractions).length,
            submissionAttempts: this.events.filter(e => e.type === 'form_submission_attempt').length + 1,
            dataCompleteness: this.calculateCompleteness(submissionData)
        };
        
        this.events.push(event);
        this.logEvent(event);
        this.sendAnalytics(); // Send all analytics data
    }

    // Track failed submission attempts
    trackSubmissionError(errorType, errorMessage, stepNumber) {
        const event = {
            type: 'submission_error',
            errorType,
            errorMessage,
            stepNumber,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            attemptNumber: this.events.filter(e => e.type.includes('submission')).length + 1
        };
        
        this.events.push(event);
        this.logEvent(event);
    }

    // Track service selections for business intelligence
    trackServiceSelection(serviceType, serviceDetails) {
        const event = {
            type: 'service_selection',
            serviceType,
            serviceDetails,
            timestamp: Date.now(),
            sessionId: this.sessionId
        };
        
        this.events.push(event);
        this.logEvent(event);
    }

    // Helper methods
    countCompletedFields(formData) {
        if (!formData || typeof formData !== 'object') return 0;
        
        let count = 0;
        for (const [key, value] of Object.entries(formData)) {
            if (value && value !== '' && value !== null && value !== undefined) {
                count++;
            }
        }
        return count;
    }

    assessDataQuality(formData) {
        const quality = {
            hasRequiredFields: false,
            hasValidEmail: false,
            hasValidPhone: false,
            completenessScore: 0
        };
        
        if (formData.customerName && formData.customerName.length >= 2) {
            quality.hasRequiredFields = true;
        }
        
        if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            quality.hasValidEmail = true;
        }
        
        if (formData.mobile && formData.mobile.length >= 10) {
            quality.hasValidPhone = true;
        }
        
        const totalFields = Object.keys(formData).length;
        const completedFields = this.countCompletedFields(formData);
        quality.completenessScore = totalFields > 0 ? (completedFields / totalFields) : 0;
        
        return quality;
    }

    getCompletedSteps() {
        return this.events
            .filter(e => e.type === 'step_complete')
            .map(e => e.stepNumber);
    }

    calculateCompleteness(data) {
        const requiredFields = ['customerName', 'email', 'mobile', 'addressLine1', 'townCity', 'postcode'];
        const completedRequired = requiredFields.filter(field => data[field] && data[field].toString().trim() !== '').length;
        return (completedRequired / requiredFields.length) * 100;
    }

    // Analytics data sending (placeholder - replace with your analytics service)
    sendAnalytics() {
        const analyticsData = {
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime: Date.now(),
            totalEvents: this.events.length,
            events: this.events,
            fieldInteractions: this.fieldInteractions,
            summary: this.generateSummary()
        };

        // For now, store in localStorage for debugging
        // Replace this with actual analytics service calls
        try {
            localStorage.setItem(`form_analytics_${this.sessionId}`, JSON.stringify(analyticsData));
            
            // Example: Send to analytics service
            // fetch('/api/analytics', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(analyticsData)
            // });
            
        } catch (error) {
            console.warn('Failed to store analytics data:', error);
        }
    }

    generateSummary() {
        const stepCompletions = this.events.filter(e => e.type === 'step_complete');
        const fieldErrors = this.events.filter(e => e.type === 'validation_error');
        const submissionAttempts = this.events.filter(e => e.type.includes('submission'));
        
        return {
            totalStepsCompleted: stepCompletions.length,
            totalValidationErrors: fieldErrors.length,
            totalSubmissionAttempts: submissionAttempts.length,
            averageTimePerStep: this.calculateAverageStepTime(),
            mostProblematicFields: this.findProblematicFields(),
            conversionFunnelData: this.generateFunnelData()
        };
    }

    calculateAverageStepTime() {
        const stepTimes = [];
        for (let i = 1; i <= 3; i++) {
            const start = this.stepTimes[`step_${i}_start`];
            const complete = this.events.find(e => e.type === 'step_complete' && e.stepNumber === i);
            if (start && complete) {
                stepTimes.push(complete.timestamp - start);
            }
        }
        return stepTimes.length > 0 ? stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length : 0;
    }

    findProblematicFields() {
        const fieldErrors = {};
        this.events
            .filter(e => e.type === 'validation_error')
            .forEach(e => {
                fieldErrors[e.fieldName] = (fieldErrors[e.fieldName] || 0) + 1;
            });
        
        return Object.entries(fieldErrors)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([field, errors]) => ({ field, errors }));
    }

    generateFunnelData() {
        const funnel = {
            step1_start: this.events.filter(e => e.type === 'step_start' && e.stepNumber === 1).length,
            step1_complete: this.events.filter(e => e.type === 'step_complete' && e.stepNumber === 1).length,
            step2_start: this.events.filter(e => e.type === 'step_start' && e.stepNumber === 2).length,
            step2_complete: this.events.filter(e => e.type === 'step_complete' && e.stepNumber === 2).length,
            step3_start: this.events.filter(e => e.type === 'step_start' && e.stepNumber === 3).length,
            step3_complete: this.events.filter(e => e.type === 'step_complete' && e.stepNumber === 3).length,
            form_submitted: this.events.filter(e => e.type === 'form_submission').length
        };
        
        return funnel;
    }

    logEvent(event) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Form Analytics:', event);
        }
    }

    // Track page visibility for abandonment detection
    setupPageVisibilityTracking() {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User switched away - potential abandonment
                const lastEvent = this.events[this.events.length - 1];
                if (lastEvent && lastEvent.type !== 'form_submission' && lastEvent.type !== 'form_abandonment') {
                    this.trackFormAbandonment(
                        lastEvent.stepNumber || 0, 
                        lastEvent.stepName || 'unknown', 
                        'page_hidden'
                    );
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Also track beforeunload
        window.addEventListener('beforeunload', () => {
            const lastEvent = this.events[this.events.length - 1];
            if (lastEvent && lastEvent.type !== 'form_submission') {
                this.trackFormAbandonment(
                    lastEvent.stepNumber || 0, 
                    lastEvent.stepName || 'unknown', 
                    'page_unload'
                );
            }
        });
    }
}

// Create and export analytics instance
const formAnalytics = new FormAnalytics();
export default formAnalytics;