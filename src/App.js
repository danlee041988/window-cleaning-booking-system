import React from 'react';
import './App.css';
// Use the enhanced booking form with all improvements
import BookingFormEnhanced from './components/BookingFormEnhanced';
// Enhanced error boundary is already included in BookingFormEnhanced

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <main className="w-full">
        <BookingFormEnhanced />
      </main>
    </div>
  );
}

export default App;
