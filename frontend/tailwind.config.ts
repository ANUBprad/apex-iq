import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ===== TYPOGRAPHY =====
      fontFamily: {
        orbitron: ['Orbitron', 'ui-monospace', 'monospace'],
        rajdhani: ['Rajdhani', 'ui-monospace', 'monospace'],
        grotesk: ['Space Grotesk', 'ui-sans-serif', 'sans-serif'],
        inter: ['Google Sans', 'Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        // Orbitron sizes (metrics)
        'metric-xs': ['11px', { lineHeight: '0.9', letterSpacing: '0.02em' }],
        'metric-sm': ['13px', { lineHeight: '0.95', letterSpacing: '0.02em' }],
        'metric-md': ['16px', { lineHeight: '1', letterSpacing: '0.01em' }],
        'metric-lg': ['20px', { lineHeight: '1', letterSpacing: '0.01em' }],
        'metric-xl': ['24px', { lineHeight: '1', letterSpacing: '0em' }],
        'metric-2xl': ['32px', { lineHeight: '1', letterSpacing: '-0.01em' }],
        'metric-3xl': ['48px', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'metric-4xl': ['64px', { lineHeight: '1', letterSpacing: '-0.02em' }],

        // Rajdhani sizes (labels)
        'label-xs': ['11px', { lineHeight: '1', letterSpacing: '0.03em' }],
        'label-sm': ['12px', { lineHeight: '1.1', letterSpacing: '0.02em' }],
        'label-md': ['14px', { lineHeight: '1.2', letterSpacing: '0.02em' }],
        'label-lg': ['16px', { lineHeight: '1.3', letterSpacing: '0.01em' }],
        'label-xl': ['18px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'label-2xl': ['24px', { lineHeight: '1.4', letterSpacing: '0em' }],
        'label-3xl': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],

        // Inter sizes (body)
        'body-xs': ['12px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'body-sm': ['13px', { lineHeight: '1.5', letterSpacing: '-0.005em' }],
        'body-md': ['14px', { lineHeight: '1.6', letterSpacing: '0em' }],
        'body-lg': ['16px', { lineHeight: '1.6', letterSpacing: '0em' }],
      },

      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },

      // ===== COLORS =====
      colors: {
        // Background layers (3-tier depth)
        'bg-base': '#0F0F0F',
        'bg-elevated': '#1A1A1A',
        'bg-interactive': '#242424',

        // Accent colors (strict usage)
        'red-ferrari': '#DC143C',
        'red-ferrari-dim': '#8B0B2A',
        'cyan-electric': '#00D9FF',
        'cyan-electric-dim': '#0099BB',
        'green-telemetry': '#39FF14',
        'green-telemetry-dim': '#228800',

        // Text colors
        'text-primary': '#F5F5F5',
        'text-secondary': '#B0B0B0',
        'text-tertiary': '#696969',

        // Border colors
        'border-subtle': '#333333',
        'border-visible': '#444444',
        'border-grid': '#111111',

        // Semantic colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'alert': '#DC143C',
        'info': '#06B6D4',

        // Temperature indicators
        'temp-cold': '#06B6D4',
        'temp-optimal': '#10B981',
        'temp-warm': '#F59E0B',
        'temp-hot': '#DC143C',

        // Compound colors (tyres)
        'compound-soft': '#DC143C',
        'compound-medium': '#F59E0B',
        'compound-hard': '#F5F5F5',
      },

      backgroundColor: {
        'apex-base': '#0F0F0F',
        'apex-elevated': '#1A1A1A',
        'apex-interactive': '#242424',
      },

      borderColor: {
        'apex-subtle': '#333333',
        'apex-visible': '#444444',
      },

      // ===== SPACING =====
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },

      gap: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },

      padding: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },

      // ===== SHADOWS & GLOWS =====
      boxShadow: {
        // Shadows (without color)
        'subtle': '0 2px 4px rgba(0, 0, 0, 0.2)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.4)',

        // Red glows (alerts, CTAs)
        'glow-red-sm': '0 0 12px rgba(220, 20, 60, 0.3)',
        'glow-red': '0 0 20px rgba(220, 20, 60, 0.4)',
        'glow-red-lg': '0 0 32px rgba(220, 20, 60, 0.5)',

        // Cyan glows (focus, active)
        'glow-cyan-sm': '0 0 12px rgba(0, 217, 255, 0.25)',
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.4)',
        'glow-cyan-lg': '0 0 32px rgba(0, 217, 255, 0.5)',

        // Green glows (telemetry)
        'glow-green-sm': '0 0 12px rgba(57, 255, 20, 0.3)',
        'glow-green': '0 0 20px rgba(57, 255, 20, 0.4)',
        'glow-green-lg': '0 0 32px rgba(57, 255, 20, 0.5)',

        // Combined (shadow + glow)
        'card-red': '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 16px rgba(220, 20, 60, 0.3)',
        'card-cyan': '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 16px rgba(0, 217, 255, 0.3)',
        'card-green': '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 16px rgba(57, 255, 20, 0.3)',
      },

      textShadow: {
        'glow-red': '0 0 8px rgba(220, 20, 60, 0.3)',
        'glow-cyan': '0 0 8px rgba(0, 217, 255, 0.3)',
        'glow-green': '0 0 8px rgba(57, 255, 20, 0.3)',
      },

      // ===== BORDERS & RADIUS =====
      borderRadius: {
        'none': '0px',
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
      },

      borderWidth: {
        'thin': '1px',
        'bold': '2px',
        'thick': '3px',
      },

      // ===== TRANSITIONS & ANIMATIONS =====
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '600ms',
      },

      transitionTimingFunction: {
        'fast': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'normal': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'mechanical': 'linear',
      },

      animation: {
        // Entrance
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',

        // Interaction
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'hover-lift': 'hoverLift 0.15s ease-out',

        // Data
        'count-up': 'countUp 0.4s ease-out',
        'color-flash': 'colorFlash 0.3s ease-out',

        // Metrics
        'metric-update': 'metricUpdate 0.3s ease-out',

        // UI feedback
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'scan-line': 'scanLine 4s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'float-y': 'floatY 4s ease-in-out infinite',
        'ambient-blob': 'ambientBlob 14s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2.4s ease-in-out infinite',
        'scroll-down': 'scrollDown 2s ease-in-out infinite',
        'typing-dot': 'typingDot 1s ease-in-out infinite',
      },

      keyframes: {
        // Entrance
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },

        // Interaction
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 16px rgba(220, 20, 60, 0.28), 0 0 48px rgba(220, 20, 60, 0.12)',
          },
          '50%': {
            boxShadow: '0 0 28px rgba(220, 20, 60, 0.45), 0 0 80px rgba(220, 20, 60, 0.22)',
          },
        },
        hoverLift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-2px)' },
        },

        // Data
        colorFlash: {
          '0%': { color: '#DC143C' },
          '50%': { color: '#F5F5F5' },
          '100%': { color: '#F5F5F5' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        metricUpdate: {
          '0%': { color: '#00D9FF', transform: 'scale(1.1)' },
          '100%': { color: '#F5F5F5', transform: 'scale(1)' },
        },

        // UI feedback (already in styles.css, including for reference)
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(255,30,30,0.28), 0 0 48px rgba(255,30,30,0.12)' },
          '50%': { boxShadow: '0 0 28px rgba(255,30,30,0.45), 0 0 80px rgba(255,30,30,0.22)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '20%': { opacity: '1' },
          '100%': { transform: 'translateY(1000%)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        ambientBlob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)', opacity: '0.45' },
          '50%': { transform: 'translate(20px,-10px) scale(1.06)', opacity: '0.6' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(255,30,30,0.45)' },
          '50%': { opacity: '0.55', boxShadow: '0 0 0 6px rgba(255,30,30,0)' },
        },
        scrollDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        typingDot: {
          '0%, 60%, 100%': { opacity: '0.25', transform: 'translateY(0)' },
          '30%': { opacity: '1', transform: 'translateY(-3px)' },
        },
      },

      // ===== SCREENS =====
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
};

export default config;
