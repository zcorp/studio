/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark cinematic palette inspired by DaVinci Resolve + VS Code
        void: '#0a0a0c',
        surface: '#111114',
        panel: '#18181d',
        elevated: '#1f1f26',
        border: '#2a2a35',
        muted: '#3a3a48',
        dim: '#5a5a72',
        subtle: '#8888a8',
        text: '#c8c8e0',
        bright: '#e8e8f8',
        // Accent: electric amber (like timecode displays)
        accent: '#f0a020',
        'accent-dim': '#b87818',
        'accent-glow': '#f0a02040',
        // Status colors
        validated: '#22c55e',
        rejected: '#ef4444',
        uncertain: '#f59e0b',
        info: '#3b82f6',
      },
      fontFamily: {
        // Mono for timecodes, technical data
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        // Display for headings
        display: ['Syne', 'sans-serif'],
        // Body
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 0 0 1px rgba(42,42,53,0.8)',
        'glow-accent': '0 0 12px rgba(240,160,32,0.3)',
        'glow-validated': '0 0 8px rgba(34,197,94,0.3)',
        'inner-dark': 'inset 0 1px 3px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      }
    }
  },
  plugins: []
}
