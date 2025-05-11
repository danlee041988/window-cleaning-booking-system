// Step 4: Review & Submit
import React from 'react';
// import { db } from '../firebaseConfig'; // We'll use this later to submit data
// import { collection, addDoc } from "firebase/firestore"; 

function ReviewSubmitForm({ prevStep, values }) {
  const Previous = e => {
    e.preventDefault();
    prevStep();
  }

  const Submit = async (e) => {
    e.preventDefault();
    // Placeholder for submission logic
    console.log("Form data to submit:", values);
    alert("Booking request submitted (placeholder)!\nCheck console for data.");
    // try {
    //   const docRef = await addDoc(collection(db, "bookingRequests"), {
    //     ...values,
    //     estimatedPrice: calculatePrice(values).totalPrice, // Store calculated price
    //     priceBreakdown: calculatePrice(values).breakdown, // Store breakdown
    //     submittedAt: new Date()
    //   });
    //   console.log("Document written with ID: ", docRef.id);
    //   alert("Booking request submitted successfully!");
    //   // Optionally reset form or redirect user
    // } catch (e) {
    //   console.error("Error adding document: ", e);
    //   alert("Error submitting booking. Please try again.");
    // }
  }

  const calculatePrice = (currentValues) => {
    let baseWindowPrice = 0;
    let breakdown = [];

    if (currentValues.propertyChoice && currentValues.propertyChoice.price > 0) {
      baseWindowPrice = currentValues.propertyChoice.price;
      breakdown.push({ service: `Window Cleaning (${currentValues.propertyChoice.description})`, price: baseWindowPrice });
    } else if (currentValues.propertyChoice) {
      // This handles the '6+ Beds / Bespoke' case where price is 0 initially
      breakdown.push({ service: `Window Cleaning (${currentValues.propertyChoice.description})`, price: 0 });
    }

    let totalPrice = baseWindowPrice;

    // Frequency adjustments
    if (currentValues.frequency === '12-weekly' && baseWindowPrice > 0) { // Only add surcharge if there's a base price
      totalPrice += 5;
      breakdown.push({ service: '12-Weekly Surcharge', price: 5 });
    } else if (currentValues.frequency === 'one-off') {
      if (baseWindowPrice > 0) {
        const oneOffBase = baseWindowPrice * 2;
        totalPrice = oneOffBase; // Reset total price to double the base, add-ons will be added later
        // Adjust breakdown for one-off
        breakdown = breakdown.map(item => item.service.startsWith('Window Cleaning') ? { ...item, price: oneOffBase } : item);
      } else if (currentValues.propertyChoice) {
        // If baseWindowPrice is 0 (e.g. bespoke) but it's a one-off, use a minimum estimate for the one-off itself.
        totalPrice = 50; // Min one-off estimate if no base is set
        breakdown.push({ service: 'One-off Service (Bespoke Minimum Estimate)', price: 50 });
      }
    }

    // Add-ons (ensure they add to the potentially doubled one-off price)
    if (currentValues.hasExtension) {
      totalPrice += 5;
      breakdown.push({ service: 'Extension Cleaning', price: 5 });
    }
    if (currentValues.hasConservatory) {
      totalPrice += 5;
      breakdown.push({ service: 'Conservatory Windows', price: 5 });
    }
    if (currentValues.hasSolarPanels && currentValues.solarPanels > 0) {
      const solarPanelPrice = currentValues.solarPanels * 10;
      totalPrice += solarPanelPrice;
      breakdown.push({ service: `Solar Panel Cleaning (${currentValues.solarPanels} panels)`, price: solarPanelPrice });
    }

    // Gutter Cleaning
    let internalGutterPrice = 0;
    let externalGutterPrice = 0;

    if (currentValues.internalGutterCleaning) {
      internalGutterPrice = 80; // Standard price
      totalPrice += internalGutterPrice;
      breakdown.push({ service: 'Internal Gutter Clearing', price: internalGutterPrice });
    }
    if (currentValues.externalGutterCleaning) {
      externalGutterPrice = 80; // Assuming same as internal for now, needs clarification
      totalPrice += externalGutterPrice;
      breakdown.push({ service: 'External Gutter & Fascia Clean', price: externalGutterPrice });
    }

    // Special offer: Free window clean if both gutter services selected
    let freeWindowCleanApplied = false;
    if (currentValues.internalGutterCleaning && currentValues.externalGutterCleaning && baseWindowPrice > 0) {
      totalPrice -= (currentValues.frequency === 'one-off' ? baseWindowPrice * 2 : baseWindowPrice); // Subtract the original window cleaning cost (doubled if one-off)
      // Update breakdown to show window cleaning as free
      breakdown = breakdown.map(item => 
        item.service.startsWith('Window Cleaning') ? { ...item, price: 0, service: item.service + ' (Free with Gutter Bundle)' } : item
      );
      freeWindowCleanApplied = true;
    }

    // Custom quote flag
    let needsCustomQuote = false;
    if (currentValues.propertyChoice && currentValues.propertyChoice.propertyType === 'bespoke') {
      needsCustomQuote = true;
    }

    return { totalPrice, breakdown, needsCustomQuote, freeWindowCleanApplied };
  }

  const { totalPrice, breakdown, needsCustomQuote, freeWindowCleanApplied } = calculatePrice(values);

  return (
    <div>
      <h2>Step 4: Review Your Booking & Submit</h2>
      <h3>Booking Details:</h3>
      <p><strong>Property Selection:</strong> {values.propertyChoice ? values.propertyChoice.description : 'N/A'}</p>
      <p><strong>Cleaning Frequency:</strong> {values.frequency || 'N/A'}</p>
      <p><strong>Extension:</strong> {values.hasExtension ? 'Yes' : 'No'}</p>
      <p><strong>Conservatory:</strong> {values.hasConservatory ? 'Yes' : 'No'}</p>
      
      <h4>Additional Services:</h4>
      <p><strong>Solar Panel Cleaning:</strong> {values.hasSolarPanels ? `Yes, ${values.solarPanels} panels` : 'No'}</p>
      <p><strong>Internal Gutter Clearing:</strong> {values.internalGutterCleaning ? 'Yes' : 'No'}</p>
      <p><strong>External Gutter & Fascia Clean:</strong> {values.externalGutterCleaning ? 'Yes' : 'No'}</p>

      <h4>Contact Information:</h4>
      <p><strong>Name:</strong> {values.name || 'N/A'}</p>
      <p><strong>Address:</strong> {values.address || 'N/A'}</p>
      <p><strong>Postcode:</strong> {values.postcode || 'N/A'}</p>
      <p><strong>Mobile:</strong> {values.mobile || 'N/A'}</p>
      <p><strong>Email:</strong> {values.email || 'N/A'}</p>
      <p><strong>Preferred Contact:</strong> {values.preferredContact || 'N/A'}</p>
      
      <hr />
      <h3>Estimated Price Breakdown:</h3>
      {breakdown.map((item, index) => (
        <p key={index}>{item.service}: £{item.price}</p>
      ))}
      {freeWindowCleanApplied && <p><strong>Special Offer: Window Cleaning is FREE with combined gutter services!</strong></p>}
      <hr />
      <p><strong>Total Estimated Price: £{totalPrice}</strong></p>

      {needsCustomQuote && 
        <p><strong>NOTE: Your selection (e.g., 6+ bedrooms or 'Other' property type) requires a custom quotation. This price is a preliminary estimate. We will contact you.</strong></p>
      }

      <p><i>Prices are estimates based on standard property sizes and are subject to change for heavy soiling or larger properties. We will notify you of any changes before starting work.</i></p>
      
      <button onClick={Previous}>Back</button>
      <button onClick={Submit}>{needsCustomQuote ? 'Submit for Custom Quote' : 'Submit Request'}</button>
    </div>
  );
}

export default ReviewSubmitForm;
