/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: colors.zinc,
        'gray-1000': 'rgb(17,17,19)',
        'gray-1100': 'rgb(10,10,11)',
        vercel: {
          pink: '#FF0080',
          blue: '#0070F3',
          cyan: '#50E3C2',
          orange: '#F5A623',
          violet: '#7928CA',
        },
      },
      backgroundImage: {
        'vc-border-gradient': 'radial-gradient(at left top, rgb(107 114 128), 50px, rgb(55 65 81) 50%)',
      },
      keyframes: {
        rerender: {
          '0%': {
            'border-color': '#FF0080',
          },
          '40%': {
            'border-color': '#FF0080',
          },
        },
        highlight: {
          '0%': {
            background: '#FF0080',
            color: '#fff',
          },
          '40%': {
            background: '#FF0080',
            color: '#fff',
          },
        },
      },
      animation: {
        rerender: 'rerender 1s ease-in-out',
        highlight: 'highlight 1s ease-in-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}
