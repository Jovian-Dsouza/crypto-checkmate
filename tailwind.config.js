/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#000",
        orange: "#fca311",
        white: "#fff",
        lightgreen: "#7ad05b",
        violet: "rgba(240, 135, 255, 0.3)",
      },
      fontFamily: {
        manrope: "Manrope",
        "space-grotesk": "'Space Grotesk'",
      },
      borderRadius: {
        xl: "20px",
        "981xl": "1000px",
      },
    },
    // fontSize: {
    //   "17xl": "36px",
    //   "45xl": "64px",
    //   "21xl": "40px",
    // },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
