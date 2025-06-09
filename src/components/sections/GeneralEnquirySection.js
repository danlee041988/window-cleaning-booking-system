/**
 * GeneralEnquirySection - General enquiry details section
 * Placeholder component - can be expanded later
 */

import React from 'react';
import PropTypes from 'prop-types';
import TextareaField from '../forms/TextareaField';

const GeneralEnquirySection = ({ values, errors, touched, onFieldChange, onFieldBlur }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">Enquiry Details</h3>
      
      <TextareaField
        label="Tell us about your requirements"
        name="enquiryComments"
        value={values.generalEnquiryDetails?.enquiryComments || ''}
        onChange={(e) => onFieldChange('generalEnquiryDetails', {
          ...values.generalEnquiryDetails,
          enquiryComments: e.target.value
        })}
        onBlur={() => onFieldBlur('enquiryComments')}
        placeholder="Please describe what services you're interested in and any specific requirements..."
        rows={4}
        maxLength={1000}
        showCharCount={true}
      />

      <div className="mt-4 p-4 bg-green-900/30 border border-green-600 rounded-lg">
        <p className="text-green-300 text-sm">
          We'll review your enquiry and get back to you with information about our services and pricing.
        </p>
      </div>
    </div>
  );
};

GeneralEnquirySection.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onFieldBlur: PropTypes.func.isRequired
};

export default GeneralEnquirySection;