// Step 2: Additional Services
import React from 'react';

function AdditionalServicesForm({ nextStep, prevStep, handleChange, values }) {
  const Continue = e => {
    e.preventDefault();
    // Add any validation if needed for this step
    nextStep();
  }

  const Previous = e => {
    e.preventDefault();
    prevStep();
  }

  return (
    <div>
      <h2>Step 2: Additional Services</h2>

      <label htmlFor="hasSolarPanels">
        <input 
          type="checkbox" 
          id="hasSolarPanels" 
          checked={values.hasSolarPanels} // Assuming you'll add hasSolarPanels to formData
          onChange={handleChange('hasSolarPanels')} 
        />
        Do you want solar panel cleaning?
      </label>
      <br />

      {values.hasSolarPanels && (
        <label htmlFor="solarPanels">Number of Solar Panels:
          <input 
            type="number" 
            id="solarPanels"
            value={values.solarPanels} 
            onChange={handleChange('solarPanels')} 
            min="0"
          />
        </label>
      )}
      <br />

      <label htmlFor="internalGutterCleaning">
        <input 
          type="checkbox" 
          id="internalGutterCleaning" 
          checked={values.internalGutterCleaning} 
          onChange={handleChange('internalGutterCleaning')}
        />
        Internal Gutter Clearing (remove leaves, moss, debris)
      </label>
      <br />

      <label htmlFor="externalGutterCleaning">
        <input 
          type="checkbox" 
          id="externalGutterCleaning" 
          checked={values.externalGutterCleaning} 
          onChange={handleChange('externalGutterCleaning')}
        />
        External Gutter & Fascia Clean (exterior surfaces)
      </label>
      <br />

      {/* Add other fields for gutter cleaning options */}
      <button onClick={Previous}>Back</button>
      <button onClick={Continue}>Next</button>
    </div>
  );
}

export default AdditionalServicesForm;
