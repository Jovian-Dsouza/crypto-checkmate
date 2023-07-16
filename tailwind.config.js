/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1020px',
        xl: '1440px',
        tall: { raw: '(min-height: 800px)' },
      },
      colors: {
        'orange-custom': '#fca311',
        lightgreen: '#7ad05b',
        violet: 'rgba(240, 135, 255, 0.3)',
        gray: {
          100: '#161618',
          200: '#011226',
          300: '#060125',
          400: 'rgba(255, 255, 255, 0.15)',
          500: 'rgba(255, 255, 255, 0.4)',
          600: 'rgba(255, 255, 255, 0.05)',
          700: 'rgba(255, 255, 255, 0)',
        },
        whitesmoke: '#ededef',
        ghostwhite: 'rgba(247, 245, 255, 0.62)',
        lavender: {
          100: 'rgba(235, 235, 254, 0.06)',
          200: 'rgba(229, 229, 254, 0.09)',
          300: 'rgba(215, 215, 250, 0.03)',
        },
        lightsteelblue: '#a9a7d9',
        seagreen: '#02733f',
        darkslategray: '#3b3b3b',
        yellowGreen: '#ABD93A',
      },
      fontFamily: {
        manrope: ['var(--font-manrope)'],
        poppins: ['var(--font-poppins)'],
        'space-grotesk': ['var(--font-space-grotesk)'],
      },
      fontWeight: {
        400: '400',
        500: '500',
        600: '600',
        700: '700',
      },
      backgroundImage: {
        bg_image: "url('/imgs/background.jpeg')",
        'chessboard-bg': "url('/imgs/chessboardBackground.jpg')",
      },
      backgroundPosition: {
        'center-8': 'center -8rem',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
