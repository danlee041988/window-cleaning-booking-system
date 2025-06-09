/**
 * ContactDetailsSection - Contact form section component
 * Extracted from PropertyDetailsAndReview for better modularity
 */

import React from 'react';
import PropTypes from 'prop-types';
import InputField from '../forms/InputField';
import SelectField from '../forms/SelectField';
import { CONTACT_METHODS, TIME_PREFERENCES } from '../../shared/constants';

const ContactDetailsSection = ({ values, errors, touched, onFieldChange, onFieldBlur }) => {
  const contactMethodOptions = Object.values(CONTACT_METHODS).map(method => ({
    value: method.value,
    label: `${method.icon} ${method.label}`
  }));

  const timePreferenceOptions = TIME_PREFERENCES.map(time => ({
    value: time.value,
    label: time.label
  }));

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Full Name"
          name="customerName"
          value={values.customerName || ''}
          onChange={(e) => onFieldChange('customerName', e.target.value)}
          onBlur={() => onFieldBlur('customerName')}
          placeholder="Your full name"
          required={true}
          error={errors.customerName}
          touched={touched.customerName}
          autoComplete="name"
        />

        <InputField
          label="Email Address"
          name="email"
          type="email"
          value={values.email || ''}
          onChange={(e) => onFieldChange('email', e.target.value)}
          onBlur={() => onFieldBlur('email')}
          placeholder="your.email@example.com"
          required={true}
          error={errors.email}
          touched={touched.email}
          autoComplete="email"
        />

        <InputField
          label="Mobile Number"
          name="mobile"
          type="tel"
          value={values.mobile || ''}
          onChange={(e) => onFieldChange('mobile', e.target.value)}
          onBlur={() => onFieldBlur('mobile')}
          placeholder="07xxx xxxxxx"
          required={true}
          error={errors.mobile}
          touched={touched.mobile}
          autoComplete="tel"
        />

        <InputField
          label="Landline (Optional)"
          name="landline"
          type="tel"
          value={values.landline || ''}
          onChange={(e) => onFieldChange('landline', e.target.value)}
          onBlur={() => onFieldBlur('landline')}
          placeholder="01xxx xxxxxx"
          error={errors.landline}
          touched={touched.landline}
          autoComplete="tel"
        />
      </div>

      <div className="mt-6 space-y-4">
        <h4 className="text-lg font-medium text-white">Address Details</h4>
        
        <InputField
          label="Address Line 1"
          name="addressLine1"
          value={values.addressLine1 || ''}
          onChange={(e) => onFieldChange('addressLine1', e.target.value)}
          onBlur={() => onFieldBlur('addressLine1')}
          placeholder="House number and street name"
          required={true}
          error={errors.addressLine1}
          touched={touched.addressLine1}
          autoComplete="address-line1"
        />

        <InputField
          label="Address Line 2 (Optional)"
          name="addressLine2"
          value={values.addressLine2 || ''}
          onChange={(e) => onFieldChange('addressLine2', e.target.value)}
          onBlur={() => onFieldBlur('addressLine2')}
          placeholder="Apartment, suite, etc."
          autoComplete="address-line2"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Town/City"
            name="townCity"
            value={values.townCity || ''}
            onChange={(e) => onFieldChange('townCity', e.target.value)}
            onBlur={() => onFieldBlur('townCity')}
            placeholder="Town or city"
            required={true}
            error={errors.townCity}
            touched={touched.townCity}
            autoComplete="address-level2"
          />

          <InputField
            label="County (Optional)"
            name="county"
            value={values.county || ''}
            onChange={(e) => onFieldChange('county', e.target.value)}
            onBlur={() => onFieldBlur('county')}
            placeholder="County"
            autoComplete="address-level1"
          />

          <InputField
            label="Postcode"
            name="postcode"
            value={values.postcode || ''}
            onChange={(e) => onFieldChange('postcode', e.target.value.toUpperCase())}
            onBlur={() => onFieldBlur('postcode')}
            placeholder="SW1A 1AA"
            required={true}
            error={errors.postcode}
            touched={touched.postcode}
            autoComplete="postal-code"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField
          label="Preferred Contact Method"
          name="preferredContactMethod"
          value={values.preferredContactMethod || 'phone'}
          onChange={(e) => onFieldChange('preferredContactMethod', e.target.value)}
          onBlur={() => onFieldBlur('preferredContactMethod')}
          options={contactMethodOptions}
          required={true}
          error={errors.preferredContactMethod}
          touched={touched.preferredContactMethod}
        />

        <SelectField
          label="Best Time to Contact"
          name="preferredContactTime"
          value={values.preferredContactTime || ''}
          onChange={(e) => onFieldChange('preferredContactTime', e.target.value)}
          onBlur={() => onFieldBlur('preferredContactTime')}
          options={timePreferenceOptions}
          placeholder="Select preferred time"
        />
      </div>
    </div>
  );
};

ContactDetailsSection.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onFieldBlur: PropTypes.func.isRequired
};

export default ContactDetailsSection;