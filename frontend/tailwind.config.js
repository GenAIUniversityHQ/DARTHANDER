/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        // DARTHANDER Creative Brief Color Palette
        neon: {
          purple: '#8B5CF6',
          magenta: '#EC4899',
          red: '#EF4444',
          cyan: '#06B6D4',
        },
        crimson: {
          deep: '#DC2626',
        },
        void: {
          black: '#0D0D0D',
          dark: '#050505',
        },
        deep: {
          purple: '#1A0A2E',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
        'cosmic-gradient': 'linear-gradient(180deg, #0D0D0D 0%, #1A0A2E 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-magenta': '0 0 20px rgba(236, 72, 153, 0.3)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
