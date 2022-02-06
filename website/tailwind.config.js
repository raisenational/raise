const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "raise-purple": "#5D215E",
        "raise-purple-light": "#6D376E",
        "raise-purple-dark": "#4A1A4B",

        "raise-red": "#AD2E53",
        "raise-red-light": "#B54264",
        "raise-red-dark": "#8A2442",

        "raise-blue": "#2ECAD6",
        "raise-blue-light": "#42CFDA",
        "raise-blue-dark": "#24A1AB",

        "raise-orange": "#E88452",
        "raise-orange-light": "#EA9063",
        "raise-orange-dark": "#B96941",

        "raise-yellow": "#F2CA1A",
        "raise-yellow-light": "#F3CF30",
        "raise-yellow-dark": "#C1A114",
      },
      fontFamily: {
        "raise-header": ["laca", ...defaultTheme.fontFamily.sans],
        "raise-content": ["mr-eaves-sans", ...defaultTheme.fontFamily.sans],
      },
      skew: {
        15: "15deg",
        "-15": "-15deg",
      },
      boxShadow: {
        raise: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
      },
    },
  },
  plugins: [],
}
