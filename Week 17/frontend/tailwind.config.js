/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui'],
        display: ['Sora', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        glow: '0 18px 45px -18px rgba(8, 145, 178, 0.5)'
      }
    }
  },
  plugins: []
};

