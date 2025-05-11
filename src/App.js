import React from 'react';
import './App.css';
import WindowCleaningForm from './components/WindowCleaningForm.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <main className="flex justify-center items-center min-h-[80vh] py-8 w-full">
        <WindowCleaningForm />
      </main>
    </div>
  );
}

export default App;
