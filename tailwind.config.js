// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        shake: 'shake 0.3s ease',
        flash: 'flash 0.3s ease'
      },
      keyframes: {
        shake: {
          '0%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-5px)' },
          '40%': { transform: 'translateX(5px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
          '100%': { transform: 'translateX(0)' },
        },
        flash: {
          '0%, 100%': { filter: 'none' },
          '50%': { filter: 'brightness(0.5) saturate(2) hue-rotate(-30deg)' }
        }
      }
    }
  },
  plugins: [],
}