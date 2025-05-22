import React from 'react';
import './App.css';
// import WindowCleaningForm from './components/WindowCleaningForm.jsx'; // Old form
import BookingForm from './components/BookingForm.js'; // New form we are working on

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <main className="w-full">
        <BookingForm />
      </main>
    </div>
  );
}

export default App;
