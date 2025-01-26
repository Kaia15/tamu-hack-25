/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2F76AE',
        secondary: '#BF3532',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  important: true,
  corePlugins: {
    preflight: false,
  },
 }
 