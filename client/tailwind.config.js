const colors = require("tailwindcss/colors");

module.exports = {
  // mode: "jit",
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        warmGray: colors.warmGray,
        blueGray: colors.blueGray,
        cyan: colors.cyan,
        lightBlue: colors.lightBlue,
        coolGray: colors.coolGray,
        gray: colors.gray,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
