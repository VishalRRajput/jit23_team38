/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          hover: '#1E293B'
        },
        brand: {
          primary: '#6366F1',   // Indigo accent
          secondary: '#06B6D4', // Cyan accent
          accent: '#10B981',    // Emerald success
          warning: '#F59E0B',   // Amber warning
          danger: '#EF4444'     // Rose danger
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)' },
          '100%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
