/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        iot: {
          dark: '#0a0d14',
          card: 'rgba(17, 24, 39, 0.75)',
          border: 'rgba(56, 189, 248, 0.15)',
          cyan: '#06b6d4',
          neon: '#00f2fe',
          emerald: '#10b981',
          amber: '#f59e0b',
          purple: '#8b5cf6',
          esp: '#1e293b'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'flow-dash': 'flowDash 1.2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.9))' },
        },
        flowDash: {
          to: { strokeDashoffset: '-20' }
        }
      }
    },
  },
  plugins: [],
}
