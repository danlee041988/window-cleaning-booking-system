/**
 * CommercialDetailsSection - Commercial booking details section
 * Placeholder component - can be expanded later
 */

import React from 'react';
import PropTypes from 'prop-types';
import InputField from '../forms/InputField';

const CommercialDetailsSection = ({ values, errors, touched, onFieldChange, onFieldBlur }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">Commercial Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Company Name"
          name="companyName"
          value={values.commercialDetails?.companyName || ''}
          onChange={(e) => onFieldChange('commercialDetails', {
            ...values.commercialDetails,
            companyName: e.target.value
          })}
          onBlur={() => onFieldBlur('companyName')}
          placeholder="Your company name"
          required={true}
          error={errors.companyName}
          touched={touched.companyName}
        />

        <InputField
          label="Business Type"
          name="businessType"
          value={values.commercialDetails?.businessType || ''}
          onChange={(e) => onFieldChange('commercialDetails', {
            ...values.commercialDetails,
            businessType: e.target.value
          })}
          onBlur={() => onFieldBlur('businessType')}
          placeholder="e.g., Office, Retail, Restaurant"
        />
      </div>

      <div className="mt-4 p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
        <p className="text-blue-300 text-sm">
          Commercial bookings require a site visit for accurate pricing. We'll contact you to arrange a convenient time.
        </p>
      </div>
    </div>
  );
};

CommercialDetailsSection.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onFieldBlur: PropTypes.func.isRequired
};

export default CommercialDetailsSection;