/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d',
        },
        dark: { 900: '#0a0f0d', 800: '#111614', 700: '#1a2318' }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-green': 'pulseGreen 2s ease infinite',
        'slide-in': 'slideIn 0.3s ease',
        'fade-in': 'fadeIn 0.4s ease',
      },
      keyframes: {
        float: { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
        pulseGreen: { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'0.5' } },
        slideIn: { from:{ opacity:'0', transform:'translateY(16px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        fadeIn: { from:{ opacity:'0' }, to:{ opacity:'1' } },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(34,197,94,0.25)',
        'glow-lg': '0 0 40px rgba(34,197,94,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.06)',
        'card-lg': '0 12px 48px rgba(0,0,0,0.1)',
      },
      borderRadius: { xl: '16px', '2xl': '20px', '3xl': '24px' },
    },
  },
  plugins: [],
}
