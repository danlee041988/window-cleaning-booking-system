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

    // Form inputs handler
    document.querySelectorAll('#bookingForm input, #bookingForm select, #bookingForm textarea').forEach(input => {
        input.addEventListener('change', (e) => {
            const name = e.target.name;
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            if (name && name !== 'additionalServices') {
                formState[name] = value;
            }
        });
    });

    // Initialize reCAPTCHA placeholder
    const recaptchaDiv = document.getElementById('recaptcha');
    if (recaptchaDiv) {
        recaptchaDiv.innerHTML = '<p style="padding: 20px; background: #f0f0f0; border-radius: 4px;">reCAPTCHA verification will appear here</p>';
    }
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
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    updateProgressBar();
    
    if (step === 4) {
        updateReviewSummary();
    }
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
            alert('Please select a property type');
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
            alert('Please fill in all required fields');
            return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formState.email)) {
            alert('Please enter a valid email address');
            return false;
        }
        
        return true;
    }
    
    if (step === 4) {
        if (!formState.termsAgreed) {
            alert('Please agree to the terms and conditions');
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
        
        // In production, you would:
        // 1. Verify reCAPTCHA
        // 2. Send data via EmailJS
        // 3. Show success/error message
        
        alert(`Thank you for your booking, ${formState.fullName}! We'll contact you soon to confirm your service.`);
        
        // Reset form
        bookingForm.reset();
        formState.additionalServices = [];
        formState.termsAgreed = false;
        currentStep = 1;
        showStep(1);
    });
}

// Initialize booking form when DOM is ready
document.addEventListener('DOMContentLoaded', initializeBookingForm);