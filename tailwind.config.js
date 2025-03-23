/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          DEFAULT: '#9b59b6',
          50: '#f5eef8',
          100: '#e6d2ee',
          200: '#d7b6e4',
          300: '#c79ad9',
          400: '#b87ecf',
          500: '#9b59b6',
          600: '#7e4893',
          700: '#613771',
          800: '#43264e',
          900: '#26152d',
        },
        accent: {
          DEFAULT: '#2ecc71',
          50: '#eafaf1',
          100: '#c6f1d6',
          200: '#a1e8bc',
          300: '#7dde9f',
          400: '#58d485',
          500: '#2ecc71',
          600: '#25a75c',
          700: '#1c8047',
          800: '#135932',
          900: '#0a321c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
} 