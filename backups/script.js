// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translate(-5px, 6px)' : '';
    spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translate(-5px, -6px)' : '';
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Here you would normally send the data to a server
    // For now, we'll just show an alert
    alert(`Thank you for your enquiry, ${data.name}! We'll get back to you soon.`);
    
    // Reset form
    contactForm.reset();
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .service-card, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add active state to navigation based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink?.classList.add('active');
        } else {
            navLink?.classList.remove('active');
        }
    });
});

// Add dynamic year to footer
const currentYear = new Date().getFullYear();
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    footerYear.innerHTML = footerYear.innerHTML.replace('2024', currentYear);
}

// =====================================================
// Booking Form Implementation (Adapted from React code)
// =====================================================

// Form state
const formState = {
    propertyType: '',
    frequency: '4weekly',
    additionalServices: [],
    fullName: '',
    email: '',
    address: '',
    city: '',
    postcode: '',
    phone: '',
    contactMethod: 'email',
    preferredDate: '',
    notes: '',
    termsAgreed: false
};

let currentStep = 1;
const totalSteps = 4;

// Pricing data
const propertyPrices = {
    'semi-2': 20,
    'semi-3': 25,
    'semi-4': 28,
    'semi-5': 32,
    'detached-2': 25,
    'detached-3': 30,
    'detached-4': 35,
    'detached-5': 40,
    'custom': 0, // Quote required
    'commercial': 0, // Quote required
    'general': 0 // General enquiry
};

const frequencyAdjustments = {
    '4weekly': 0,
    '8weekly': 3,
    '12weekly': 5,
    'onetime': 20
};

// Postcode schedule groups
const postcodeSchedules = {
    'TA1': { day: 'Monday', week: 1 },
    'TA2': { day: 'Monday', week: 2 },
    'TA3': { day: 'Tuesday', week: 1 },
    'TA4': { day: 'Tuesday', week: 2 },
    'TA5': { day: 'Wednesday', week: 1 },
    'TA6': { day: 'Wednesday', week: 2 },
    'TA7': { day: 'Thursday', week: 1 },
    'TA8': { day: 'Thursday', week: 2 },
    'TA9': { day: 'Friday', week: 1 },
    'TA10': { day: 'Friday', week: 2 },
    'BA1': { day: 'Monday', week: 3 },
    'BA2': { day: 'Tuesday', week: 3 },
    'BA3': { day: 'Wednesday', week: 3 },
    'BA4': { day: 'Thursday', week: 3 },
    'BA5': { day: 'Friday', week: 3 },
    'BA6': { day: 'Monday', week: 4 },
    'BA7': { day: 'Tuesday', week: 4 },
    'BA8': { day: 'Wednesday', week: 4 },
    'BA9': { day: 'Thursday', week: 4 },
    'BA10': { day: 'Friday', week: 4 }
};

// Initialize booking form
function initializeBookingForm() {
    // Property type change handler
    const propertyTypeSelect = document.getElementById('propertyType');
    propertyTypeSelect?.addEventListener('change', (e) => {
        formState.propertyType = e.target.value;
        updateStep1Display();
    });

    // Frequency change handler
    document.querySelectorAll('input[name="frequency"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            formState.frequency = e.target.value;
            updatePriceDisplay();
        });
    });

    // Additional services handler
    document.querySelectorAll('input[name="additionalServices"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                formState.additionalServices.push(e.target.value);
            } else {
                formState.additionalServices = formState.additionalServices.filter(
                    service => service !== e.target.value
                );
            }
            updateGutterOffer();
        });
    });

    // Postcode change handler
    const postcodeInput = document.querySelector('input[name="postcode"]');
    postcodeInput?.addEventListener('blur', updateAvailableDates);

    // Form inputs handler with real-time validation
    document.querySelectorAll('#bookingForm input, #bookingForm select, #bookingForm textarea').forEach(input => {
        input.addEventListener('change', (e) => {
            const name = e.target.name;
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            if (name && name !== 'additionalServices') {
                formState[name] = value;
            }
            
            // Real-time validation for mobile number
            if (name === 'phone') {
                validateMobileNumber(e.target);
            }
            
            // Real-time validation for postcode
            if (name === 'postcode') {
                validatePostcode(e.target);
            }
            
            // Real-time validation for email
            if (name === 'email') {
                validateEmail(e.target);
            }
        });
        
        // Also validate on blur for better UX
        if (input.name === 'phone' || input.name === 'postcode' || input.name === 'email') {
            input.addEventListener('blur', (e) => {
                if (e.target.name === 'phone') {
                    validateMobileNumber(e.target);
                } else if (e.target.name === 'postcode') {
                    validatePostcode(e.target);
                } else if (e.target.name === 'email') {
                    validateEmail(e.target);
                }
            });
        }
    });

    // Initialize reCAPTCHA
    loadRecaptcha();
}

function updateStep1Display() {
    const frequencySection = document.querySelector('.frequency-section');
    const priceDisplay = document.querySelector('.price-display');
    
    if (formState.propertyType && 
        formState.propertyType !== 'custom' && 
        formState.propertyType !== 'commercial' && 
        formState.propertyType !== 'general') {
        frequencySection.style.display = 'block';
        priceDisplay.style.display = 'block';
        updatePriceDisplay();
    } else {
        frequencySection.style.display = 'none';
        priceDisplay.style.display = 'none';
    }
}

function updatePriceDisplay() {
    const basePrice = propertyPrices[formState.propertyType] || 0;
    const adjustment = frequencyAdjustments[formState.frequency] || 0;
    const totalPrice = basePrice + adjustment;
    
    const priceElement = document.getElementById('step1Price');
    if (priceElement) {
        priceElement.textContent = basePrice > 0 ? `£${totalPrice}` : 'Quote Required';
    }
}

function updateGutterOffer() {
    const hasInternal = formState.additionalServices.includes('gutterInternal');
    const hasExternal = formState.additionalServices.includes('gutterExternal');
    const offerDiv = document.getElementById('gutterOffer');
    
    if (offerDiv) {
        offerDiv.style.display = hasInternal && hasExternal ? 'flex' : 'none';
    }
}

function updateAvailableDates() {
    const postcode = formState.postcode.toUpperCase();
    const dateSelect = document.getElementById('preferredDate');
    const dateGroup = document.getElementById('preferredDateGroup');
    
    if (!dateSelect || !dateGroup) return;
    
    // Only show for standard bookings
    if (formState.propertyType === 'custom' || 
        formState.propertyType === 'commercial' || 
        formState.propertyType === 'general') {
        dateGroup.style.display = 'none';
        return;
    }
    
    // Find matching schedule
    let schedule = null;
    for (const [prefix, data] of Object.entries(postcodeSchedules)) {
        if (postcode.startsWith(prefix)) {
            schedule = data;
            break;
        }
    }
    
    if (!schedule) {
        dateGroup.style.display = 'none';
        return;
    }
    
    dateGroup.style.display = 'block';
    dateSelect.innerHTML = '<option value="">Select available date</option>';
    
    // Generate next 8 available dates
    const dates = getNextAvailableDates(schedule.day, schedule.week, 8);
    dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date.toISOString().split('T')[0];
        option.textContent = date.toLocaleDateString('en-GB', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        dateSelect.appendChild(option);
    });
}

function getNextAvailableDates(dayName, weekNumber, count) {
    const dates = [];
    const dayMap = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5
    };
    const targetDay = dayMap[dayName];
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Skip to next occurrence of target day
    while (currentDate.getDay() !== targetDay) {
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Find dates that match the week pattern
    while (dates.length < count) {
        const weekOfMonth = Math.ceil(currentDate.getDate() / 7);
        if (weekOfMonth === weekNumber || (weekNumber === 4 && weekOfMonth >= 4)) {
            dates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 28); // Jump 4 weeks
    }
    
    return dates;
}

function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function showStep(step) {
    // Clear any field validation errors when moving between steps
    clearAllFieldErrors();
    
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    updateProgressBar();
    
    if (step === 4) {
        updateReviewSummary();
    }
}

function clearAllFieldErrors() {
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.invalid-input, .valid-input').forEach(input => {
        input.classList.remove('invalid-input', 'valid-input');
    });
}

function nextStep() {
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            window.scrollTo({ top: document.getElementById('booking').offsetTop - 100, behavior: 'smooth' });
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function validateStep(step) {
    if (step === 1) {
        if (!formState.propertyType) {
            showErrorMessage('Please select a property type');
            return false;
        }
        return true;
    }
    
    if (step === 2) {
        // Additional services are optional
        return true;
    }
    
    if (step === 3) {
        const requiredFields = ['fullName', 'email', 'address', 'city', 'postcode', 'phone'];
        const missingFields = requiredFields.filter(field => !formState[field]);
        
        if (missingFields.length > 0) {
            showErrorMessage('Please fill in all required fields');
            return false;
        }
        
        // Validate all fields using real-time validation functions
        const emailInput = document.querySelector('input[name="email"]');
        const phoneInput = document.querySelector('input[name="phone"]');
        const postcodeInput = document.querySelector('input[name="postcode"]');
        
        let isValid = true;
        
        if (!validateEmail(emailInput)) {
            isValid = false;
        }
        
        if (!validateMobileNumber(phoneInput)) {
            isValid = false;
        }
        
        if (!validatePostcode(postcodeInput)) {
            isValid = false;
        }
        
        if (!isValid) {
            return false;
        }
        
        return true;
    }
    
    if (step === 4) {
        if (!formState.termsAgreed) {
            showErrorMessage('Please agree to the terms and conditions');
            return false;
        }
        
        // Check reCAPTCHA if available
        const recaptchaResponse = getRecaptchaResponse();
        if (window.grecaptcha && recaptchaWidgetId !== null && !recaptchaResponse) {
            showErrorMessage('Please complete the reCAPTCHA verification');
            return false;
        }
        
        return true;
    }
    
    return true;
}

function updateReviewSummary() {
    // Service summary
    const serviceSummary = document.getElementById('serviceSummary');
    if (serviceSummary) {
        const propertyTypeText = document.querySelector(`#propertyType option[value="${formState.propertyType}"]`)?.textContent || '';
        const basePrice = propertyPrices[formState.propertyType] || 0;
        const adjustment = frequencyAdjustments[formState.frequency] || 0;
        const totalPrice = basePrice + adjustment;
        
        let serviceHTML = `<p><strong>Property:</strong> ${propertyTypeText}</p>`;
        if (basePrice > 0) {
            serviceHTML += `<p><strong>Frequency:</strong> ${getFrequencyText(formState.frequency)}</p>`;
            serviceHTML += `<p><strong>Window Cleaning Price:</strong> £${totalPrice} per clean</p>`;
        }
        
        if (formState.additionalServices.length > 0) {
            serviceHTML += '<p><strong>Additional Services:</strong></p><ul>';
            formState.additionalServices.forEach(service => {
                serviceHTML += `<li>${getServiceText(service)}</li>`;
            });
            serviceHTML += '</ul>';
        }
        
        if (formState.preferredDate) {
            const date = new Date(formState.preferredDate);
            serviceHTML += `<p><strong>Preferred Start Date:</strong> ${date.toLocaleDateString('en-GB')}</p>`;
        }
        
        serviceSummary.innerHTML = serviceHTML;
    }
    
    // Contact summary
    const contactSummary = document.getElementById('contactSummary');
    if (contactSummary) {
        contactSummary.innerHTML = `
            <p><strong>Name:</strong> ${formState.fullName}</p>
            <p><strong>Email:</strong> ${formState.email}</p>
            <p><strong>Phone:</strong> ${formState.phone}</p>
            <p><strong>Address:</strong> ${formState.address}, ${formState.city}, ${formState.postcode}</p>
            <p><strong>Contact Method:</strong> ${formState.contactMethod}</p>
        `;
    }
    
    // Price summary
    const priceSummary = document.getElementById('priceSummary');
    if (priceSummary) {
        const basePrice = propertyPrices[formState.propertyType] || 0;
        if (basePrice > 0) {
            const adjustment = frequencyAdjustments[formState.frequency] || 0;
            const totalPrice = basePrice + adjustment;
            
            let priceHTML = `<p><strong>Window Cleaning:</strong> £${totalPrice} per clean</p>`;
            
            if (formState.additionalServices.includes('gutterInternal') && 
                formState.additionalServices.includes('gutterExternal')) {
                priceHTML += '<p class="special-offer">✨ Special offer: Windows cleaned FREE with both gutter services!</p>';
            }
            
            priceSummary.innerHTML = priceHTML;
        } else {
            priceSummary.innerHTML = '<p>We will provide a custom quote for your requirements.</p>';
        }
    }
}

function getFrequencyText(frequency) {
    const frequencyMap = {
        '4weekly': 'Every 4 Weeks',
        '8weekly': 'Every 8 Weeks',
        '12weekly': 'Every 12 Weeks',
        'onetime': 'One-time Clean'
    };
    return frequencyMap[frequency] || frequency;
}

function getServiceText(service) {
    const serviceMap = {
        'gutterInternal': 'Gutter Clearing (Internal)',
        'gutterExternal': 'Gutter, Fascia & Soffit Cleaning',
        'solar': 'Solar Panel Cleaning',
        'conservatory': 'Conservatory Roof Cleaning'
    };
    return serviceMap[service] || service;
}

// Booking form submission
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateStep(4)) {
            return;
        }
        
        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Prepare data for API
        const bookingData = {
            customerName: formState.fullName,
            email: formState.email,
            mobile: formState.phone,
            addressLine1: formState.address,
            addressLine2: '',
            townCity: formState.city,
            postcode: formState.postcode,
            propertyType: formState.propertyType,
            frequency: formState.frequency,
            preferredDate: formState.preferredDate,
            servicesRequested: {
                windowCleaning: true,
                ...formState.additionalServices.reduce((acc, service) => {
                    acc[service] = true;
                    return acc;
                }, {})
            },
            estimatedPrice: propertyPrices[formState.propertyType] ? 
                propertyPrices[formState.propertyType] + (frequencyAdjustments[formState.frequency] || 0) : null,
            preferredContactMethod: formState.contactMethod,
            specialRequirements: formState.notes,
            marketingConsent: formState.termsAgreed
        };
        
        console.log('Submitting booking data:', bookingData);
        
        try {
            const response = await fetch('https://window-cleaning-booking-system-6k15.vercel.app/api/submit-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });
            
            const result = await response.json();
            console.log('API Response:', result);
            
            if (result.success) {
                // Show success message
                showSuccessMessage(`Thank you for your booking, ${formState.fullName}! Your booking reference is: ${result.bookingReference}. We'll contact you within 24 hours.`);
                
                // Send confirmation email via EmailJS (async, don't block the success flow)
                sendConfirmationEmail(bookingData, result.bookingReference).then(emailSent => {
                    if (emailSent) {
                        console.log('Confirmation email sent successfully');
                    } else {
                        console.log('Confirmation email failed, but booking was successful');
                    }
                });
                
                // Reset form
                bookingForm.reset();
                Object.keys(formState).forEach(key => {
                    if (key === 'additionalServices') {
                        formState[key] = [];
                    } else if (key === 'frequency') {
                        formState[key] = '4weekly';
                    } else if (key === 'contactMethod') {
                        formState[key] = 'email';
                    } else if (key === 'termsAgreed') {
                        formState[key] = false;
                    } else {
                        formState[key] = '';
                    }
                });
                currentStep = 1;
                showStep(1);
                
                // Reset reCAPTCHA after successful submission
                resetRecaptcha();
            } else {
                // Handle API validation errors with specific messages
                if (result.errors && Array.isArray(result.errors)) {
                    throw new Error(result.errors.join('. '));
                } else {
                    throw new Error(result.error || 'Submission failed');
                }
            }
        } catch (error) {
            console.error('Booking submission error:', error);
            
            let errorMessage = '';
            
            // Handle specific API validation errors
            if (error.message && error.message.includes('Valid UK mobile number required')) {
                errorMessage = 'Please check your phone number format. We accept UK mobile and landline numbers';
            } else if (error.message && error.message.includes('Valid UK postcode required')) {
                errorMessage = 'Please check your postcode format. UK postcodes should be in the format like BS1 4DJ or M1 1AA';
            } else if (error.message && error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to our servers. Please check your internet connection and try again.';
            } else if (error.response?.status === 422 || error.message.includes('422')) {
                errorMessage = 'Please check your information and try again.';
            } else if (error.response?.status >= 500 || error.message.includes('500')) {
                errorMessage = 'Server error occurred. Please try again in a few moments.';
            } else if (error.message && error.message !== 'Submission failed') {
                errorMessage = error.message;
            } else {
                errorMessage = 'There was an error submitting your booking. Please try again or contact us directly at 01458 860339.';
            }
            
            showErrorMessage(errorMessage);
            
            // Reset reCAPTCHA after failed submission
            resetRecaptcha();
        } finally {
            // Restore button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Error and success message functions
function showErrorMessage(message) {
    // Remove any existing messages
    removeExistingMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'booking-message error-message';
    messageDiv.innerHTML = `
        <div style="background: #fee; border: 1px solid #f88; color: #c33; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 16px;">
            <strong>❌ Error:</strong> ${message}
        </div>
    `;
    
    const form = document.getElementById('bookingForm');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 10000);
}

function showSuccessMessage(message) {
    // Remove any existing messages
    removeExistingMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'booking-message success-message';
    messageDiv.innerHTML = `
        <div style="background: #efe; border: 1px solid #8f8; color: #393; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 16px;">
            <strong>✅ Success:</strong> ${message}
        </div>
    `;
    
    const form = document.getElementById('bookingForm');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function removeExistingMessages() {
    const existingMessages = document.querySelectorAll('.booking-message');
    existingMessages.forEach(msg => msg.remove());
}

// Configuration
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_your_id', // Replace with your actual EmailJS service ID
    TEMPLATE_ID: 'template_your_id', // Replace with your actual EmailJS template ID
    PUBLIC_KEY: 'your_public_key' // Replace with your actual EmailJS public key
};

const RECAPTCHA_CONFIG = {
    SITE_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Test key - replace with your actual reCAPTCHA site key
};

let recaptchaLoaded = false;
let recaptchaWidgetId = null;

// Load EmailJS script dynamically
function loadEmailJS() {
    return new Promise((resolve, reject) => {
        if (window.emailjs) {
            resolve(window.emailjs);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.onload = () => {
            window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            resolve(window.emailjs);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Send confirmation email via EmailJS
async function sendConfirmationEmail(bookingData, bookingReference) {
    try {
        await loadEmailJS();
        
        const templateParams = {
            customer_name: bookingData.customerName,
            customer_email: bookingData.email,
            customer_phone: bookingData.mobile,
            booking_reference: bookingReference,
            property_address: `${bookingData.addressLine1}, ${bookingData.townCity}, ${bookingData.postcode}`,
            property_type: bookingData.propertyType,
            frequency: bookingData.frequency,
            estimated_price: bookingData.estimatedPrice ? `£${bookingData.estimatedPrice}` : 'Quote required',
            services_requested: Object.keys(bookingData.servicesRequested)
                .filter(key => bookingData.servicesRequested[key])
                .join(', '),
            special_requirements: bookingData.specialRequirements || 'None',
            preferred_contact: bookingData.preferredContactMethod,
            submission_date: new Date().toLocaleDateString('en-GB'),
            to_email: 'info@somersetwindowcleaning.co.uk' // Your business email
        };
        
        console.log('Sending confirmation email via EmailJS...');
        
        await window.emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams
        );
        
        console.log('Confirmation email sent successfully');
        return true;
    } catch (error) {
        console.error('EmailJS error:', error);
        return false;
    }
}

// reCAPTCHA Functions
function loadRecaptcha() {
    if (recaptchaLoaded) return;
    
    // Create reCAPTCHA script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    // Make callback available globally
    window.onRecaptchaLoad = function() {
        recaptchaLoaded = true;
        initRecaptchaWidget();
    };
}

function initRecaptchaWidget() {
    const recaptchaContainer = document.getElementById('recaptcha');
    if (recaptchaContainer && window.grecaptcha) {
        try {
            recaptchaWidgetId = window.grecaptcha.render(recaptchaContainer, {
                'sitekey': RECAPTCHA_CONFIG.SITE_KEY,
                'theme': 'light',
                'size': 'normal'
            });
        } catch (error) {
            console.error('reCAPTCHA render error:', error);
            // Fallback to basic message
            recaptchaContainer.innerHTML = '<p style="padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; color: #666;">reCAPTCHA verification required for form submission</p>';
        }
    }
}

function getRecaptchaResponse() {
    if (window.grecaptcha && recaptchaWidgetId !== null) {
        return window.grecaptcha.getResponse(recaptchaWidgetId);
    }
    return null;
}

function resetRecaptcha() {
    if (window.grecaptcha && recaptchaWidgetId !== null) {
        window.grecaptcha.reset(recaptchaWidgetId);
    }
}

// Real-time validation functions
function validateMobileNumber(input) {
    // UK phone regex - accepts mobile (07) and landline (01/02/03) numbers
    // Allows spaces and dashes for user convenience
    const ukPhoneRegex = /^(?:(?:\+44\s?|0)(?:1\d{8,9}|2\d{9}|3\d{9}|7\d{9}|8\d{9}))$/;
    // Clean the value by removing spaces, dashes, and parentheses for validation
    const value = input.value.trim().replace(/[\s\-\(\)]/g, '');
    
    // Remove any existing validation styling
    input.classList.remove('invalid-input', 'valid-input');
    removeFieldError(input);
    
    if (value && !ukPhoneRegex.test(value)) {
        input.classList.add('invalid-input');
        showFieldError(input, 'Please enter a valid UK phone number');
        return false;
    } else if (value) {
        input.classList.add('valid-input');
        return true;
    }
    return true;
}

function validatePostcode(input) {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    const value = input.value.trim();
    
    // Remove any existing validation styling
    input.classList.remove('invalid-input', 'valid-input');
    removeFieldError(input);
    
    if (value && !postcodeRegex.test(value)) {
        input.classList.add('invalid-input');
        showFieldError(input, 'Please enter a valid UK postcode (e.g., BS1 4DJ)');
        return false;
    } else if (value) {
        input.classList.add('valid-input');
        return true;
    }
    return true;
}

function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const value = input.value.trim();
    
    // Remove any existing validation styling
    input.classList.remove('invalid-input', 'valid-input');
    removeFieldError(input);
    
    if (value && !emailRegex.test(value)) {
        input.classList.add('invalid-input');
        showFieldError(input, 'Please enter a valid email address');
        return false;
    } else if (value) {
        input.classList.add('valid-input');
        return true;
    }
    return true;
}

function showFieldError(input, message) {
    // Remove any existing error for this field
    removeFieldError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `
        color: #dc2626;
        font-size: 14px;
        margin-top: 4px;
        padding: 4px 8px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 4px;
    `;
    errorDiv.textContent = message;
    
    // Insert after the input
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

function removeFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Initialize booking form when DOM is ready
document.addEventListener('DOMContentLoaded', initializeBookingForm);