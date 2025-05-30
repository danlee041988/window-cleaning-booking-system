# Window Cleaning Booking System

A professional, multi-step booking and enquiry system for window cleaning services. Built with React, featuring a modern dark theme UI and integrated email submission capabilities.

## Features

- **Multi-step Form Flow**: Guided booking process with validation
- **Responsive Design**: Professional dark theme optimized for all devices
- **Service Options**: 
  - Standard residential window cleaning bookings
  - Custom quotes for 6+ bedroom properties
  - Commercial property enquiries
  - General service enquiries
- **EmailJS Integration**: Direct email delivery of bookings and enquiries
- **Google reCAPTCHA**: Spam protection
- **Dynamic Pricing**: Property-type based pricing with additional services
- **Date Scheduling**: Available date selection based on postcode areas

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd window-cleaning-booking-system
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# EmailJS Configuration (Required)
# Get these values from your EmailJS dashboard at https://www.emailjs.com/
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key

# Google reCAPTCHA Configuration (Required)
# Get your site key from https://www.google.com/recaptcha/admin
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### 3. EmailJS Setup

1. Visit [EmailJS](https://www.emailjs.com/) and create an account
2. Create a new service (Gmail, Outlook, etc.)
3. Create an email template with the following template variables:
   - `{{customerName}}`, `{{email}}`, `{{mobile}}`
   - `{{addressLine1}}`, `{{townCity}}`, `{{postcode}}`
   - `{{bookingTypeDisplay}}`
   - `{{grandTotaltoFixed2}}` (for pricing)
   - Plus many others as defined in the form mapping
4. Copy your Service ID, Template ID, and Public Key to the `.env` file

### 4. Google reCAPTCHA Setup

1. Visit [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Register a new site with reCAPTCHA v2 "I'm not a robot" Checkbox
3. Add your domain(s) (localhost for development)
4. Copy the Site Key to your `.env` file

### 5. Run the Application

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000).

## Form Flow

1. **Service Selection**: Choose property type and frequency or enquiry type
2. **Additional Services**: Select extra services (conservatory, gutters, etc.)
3. **Contact Details**: Enter customer information and preferences
4. **Review & Submit**: Final review with reCAPTCHA verification

## Project Structure

```
src/
├── components/
│   ├── BookingForm.js          # Main form controller
│   ├── WindowCleaningPricing.js # Step 1: Service selection
│   ├── AdditionalServicesForm.js # Step 2: Extra services
│   ├── PropertyDetailsForm.js   # Step 3: Contact details
│   └── ReviewSubmitForm.js      # Step 4: Review & submit
├── utils/
│   └── scheduleUtils.js         # Date scheduling utilities
└── config/
    └── firebaseConfig.js        # Firebase configuration (if used)
```

## Customization

### Pricing Configuration
- Edit pricing in `WindowCleaningPricing.js` (`windowCleaningOptions` array)
- Modify surcharges in `BookingForm.js` (conservatory/extension amounts)

### Styling
- Uses Tailwind CSS with a custom dark theme
- Consistent gradient backgrounds and professional styling throughout
- Modify classes in component files to adjust appearance

### Email Template
- The form data mapping is handled in `BookingForm.js` (`mapFormDataToTemplateParams` function)
- Customize the email template variables as needed

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Deployment

1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Update reCAPTCHA settings to include your production domain
4. Ensure environment variables are properly configured for production

## Technologies Used

- **React 18** - UI framework
- **Tailwind CSS** - Styling and responsive design
- **EmailJS** - Email delivery service
- **Google reCAPTCHA** - Spam protection
- **React Google reCAPTCHA** - reCAPTCHA React component

## Support

For issues or customization requests, please check the component documentation and EmailJS setup guides.
