/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0B0C10',
        'bg-panel': '#1F2833',
        'gold': '#FFD700',
        'cyan': '#45A29E',
        'neon-blue': '#66FCF1',
        'electric-purple': '#8A2BE2',
        'crimson': '#DC143C',
      },
      animation: {
        'spin': 'spin-vertical 0.8s linear infinite',
        'spin-loop': 'spin-loop 0.6s linear infinite',
        'stop': 'stop-impact 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'win': 'win-pulse 1.2s ease-in-out infinite',
        'win-flash': 'win-flash 0.15s ease-in-out 6',
        'multiplier-pop': 'multiplier-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'scatter-glow': 'scatter-glow 1.5s ease-in-out infinite',
      },
      keyframes: {
        'spin-vertical': {
          '0%': { transform: 'translateY(-100%) scaleY(1.2)', filter: 'blur(8px)', opacity: '0.7' },
          '50%': { filter: 'blur(12px)', opacity: '0.5' },
          '100%': { transform: 'translateY(100%) scaleY(1.2)', filter: 'blur(8px)', opacity: '0.7' },
        },
        'spin-loop': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        'stop-impact': {
          '0%': { transform: 'translateY(0) scaleY(1)', filter: 'blur(8px)' },
          '30%': { transform: 'translateY(-4px) scaleY(0.85)', filter: 'blur(0)' },
          '60%': { transform: 'translateY(2px) scaleY(1.05)' },
          '100%': { transform: 'translateY(0) scaleY(1)', filter: 'blur(0)' },
        },
        'win-pulse': {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 16px rgba(255, 215, 0, 0.4))' },
          '50%': { transform: 'scale(1.12)', filter: 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 32px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 48px rgba(255, 215, 0, 0.3))' },
        },
        'win-flash': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'multiplier-pop': {
          '0%': { transform: 'scale(0) translateY(0)', opacity: '0' },
          '20%': { transform: 'scale(1.3) translateY(-10px)', opacity: '1' },
          '40%': { transform: 'scale(1) translateY(-20px)' },
          '100%': { transform: 'scale(1) translateY(-40px)', opacity: '0' },
        },
        'scatter-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px rgba(69, 162, 158, 0.6)) drop-shadow(0 0 8px rgba(102, 252, 241, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 12px rgba(69, 162, 158, 1)) drop-shadow(0 0 24px rgba(102, 252, 241, 0.8)) drop-shadow(0 0 36px rgba(138, 43, 226, 0.6))' },
        },
      },
    },
  },
  plugins: [],
}