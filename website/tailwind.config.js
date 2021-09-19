const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        'raise-purple': '#5D215E',
        'raise-red': '#AD2E53',
        'raise-blue': '#2ECAD6',
        'raise-orange': '#E88452',
        'raise-yellow': '#F2CA1A',
      },
      fontFamily: {
        'raise-header': ['laca', ...defaultTheme.fontFamily.sans],
        'raise-content': ['mr-eaves-sans', ...defaultTheme.fontFamily.sans],
      },
      skew: {
        '15': '15deg',
        '-15': '-15deg',
      },
      boxShadow: {
        'raise': '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      }
    },
  },
  variants: {
    extend: {
      translate: ['group-hover']
    },
  },
  plugins: [],
}
