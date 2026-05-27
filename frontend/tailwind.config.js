/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          DEFAULT: '#336699',  // PANTONE 653 C
          light: '#5588BB',
          dark: '#264D73',
        },
        'blue': {
          DEFAULT: '#3399CC',  // PANTONE 7688 C
          light: '#66B2D9',
          dark: '#267399',
        },
        'gray': {
          DEFAULT: '#919191',  // PANTONE 415 C
          light: '#B0B0B0',
          dark: '#6E6E6E',
        },
      },
      fontFamily: {
        sans: ['Kanit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}