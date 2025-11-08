/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: {
          50: '#e6f6ff',
          100: '#cceaff',
          200: '#99d5ff',
          300: '#66c1ff',
          400: '#33acff',
          500: '#0097ff',
          600: '#0079cc',
          700: '#005b99',
          800: '#003c66',
          900: '#001e33',
        },
        slateglass: {
          950: '#050815',
        },
      },
      boxShadow: {
        'glow-xl':
          '0 50px 100px -20px rgba(59, 130, 246, 0.35), 0 30px 60px -30px rgba(14, 116, 144, 0.45)',
      },
      backgroundImage: {
        'noise-soft':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.08'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}

