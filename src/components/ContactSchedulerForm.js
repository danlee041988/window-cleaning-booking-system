// Step 3: Contact & Scheduling
import React from 'react';

function ContactSchedulerForm({ nextStep, prevStep, handleChange, values }) {
  const Continue = e => {
    e.preventDefault();
    // Basic validation example (can be expanded)
    if (!values.name || !values.address || !values.postcode || !values.mobile) {
      alert("Please fill in all required contact details.");
      return;
    }
    if (values.preferredContact === 'email' && !values.email) {
      alert("Please provide an email address for email contact.");
      return;
    }
    nextStep();
  }

  const Previous = e => {
    e.preventDefault();
    prevStep();
  }
  return (
    <div>
      <h2>Step 3: Contact & Scheduling</h2>
      <label htmlFor="name">Full Name:
        <input type="text" id="name" value={values.name} onChange={handleChange('name')} required />
      </label>
      <br />

      <label htmlFor="address">Full Address:
        <textarea id="address" value={values.address} onChange={handleChange('address')} required />
      </label>
      <br />

      <label htmlFor="postcode">Postcode:
        <input type="text" id="postcode" value={values.postcode} onChange={handleChange('postcode')} required />
      </label>
      <br />

      <label htmlFor="mobile">Mobile Number:
        <input type="tel" id="mobile" value={values.mobile} onChange={handleChange('mobile')} required />
      </label>
      <br />

      <label htmlFor="email">Email Address:
        <input type="email" id="email" value={values.email} onChange={handleChange('email')} />
      </label>
      <br />

      <fieldset>
        <legend>Preferred Contact Method:</legend>
        <label htmlFor="contactEmail">
          <input 
            type="radio" 
            id="contactEmail" 
            name="preferredContact" 
            value="email" 
            checked={values.preferredContact === 'email'} 
            onChange={handleChange('preferredContact')} 
          /> Email
        </label>
        <label htmlFor="contactMobile">
          <input 
            type="radio" 
            id="contactMobile" 
            name="preferredContact" 
            value="mobile" 
            checked={values.preferredContact === 'mobile'} 
            onChange={handleChange('preferredContact')} 
          /> Mobile
        </label>
      </fieldset>
      <br />

      <button onClick={Previous}>Back</button>
      <button onClick={Continue}>Next</button>
    </div>
  );
}

export default ContactSchedulerForm;
