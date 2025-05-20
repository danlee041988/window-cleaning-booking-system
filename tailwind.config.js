/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'natural-primary': { DEFAULT: '#4A908A', hover: '#3B736D' }, // Muted Teal
        'natural-secondary': { DEFAULT: '#EAE0D5', light: '#F5F0EB' }, // Warm Beige/Light Tan
        'natural-accent': { DEFAULT: '#E2725B', hover: '#C76450' },    // Soft Terracotta
        'natural-text': { DEFAULT: '#374151', light: '#6B7280' },   // Dark Gray (gray-700), Lighter Gray (gray-500)
        'natural-bg': { DEFAULT: '#FCFBF8', light: '#FFFFFF' },         // Off-white, White
        'natural-success': { DEFAULT: '#10B981', dark: '#059669' }, // Green (green-500, green-600)
        'natural-error': { DEFAULT: '#EF4444', dark: '#DC2626' },   // Red (red-500, red-600)
      }
    },
  },
  plugins: [],
} 