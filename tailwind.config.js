/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Add more if you have src/ or other folders
  ],
  theme: {
    extend: {
      // Your hot pinks here if you want deeper tease
      colors: {
        'hitam-pink': '#ec4899', // pink-500
        'hitam-pink-light': '#f472b6',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // or 'media' for system dark
};
