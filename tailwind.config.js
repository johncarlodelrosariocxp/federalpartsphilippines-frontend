/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // SDS Federal Color Scheme
        "sds-red": {
          DEFAULT: "#C00C00",
          dark: "#A00A00",
          light: "#FF4D4D",
        },
        "sds-blue": {
          DEFAULT: "#0033A0",
          dark: "#00287D",
          light: "#3366CC",
        },
        "sds-black": "#000000",
        "sds-white": "#FFFFFF",
        "sds-gray": {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },

        // Primary and accent colors from SDS
        primary: "#C00C00", // SDS Red
        accent: "#0033A0", // SDS Blue

        // Optional: You can also keep your original names
        "brand-red": "#C00C00",
        "brand-blue": "#0033A0",
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "sds-pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "sds-bounce": "bounce 1s infinite",
        "sds-spin": "spin 1.5s linear infinite",
        // Custom animations for scroll effects
        'shimmer': 'shimmer 2s infinite',
        'width-expand': 'width-expand 0.8s ease-out forwards',
        'bounce': 'bounce 1s infinite',
        'ping': 'ping 1.5s infinite',
        'pulse': 'pulse 2s infinite',
        'spin': 'spin 1s linear infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'zoom-in': 'zoomIn 0.4s ease-out forwards',
        'slide-down': 'slideDown 0.6s ease-out forwards',
        'flip-left': 'flipLeft 0.4s ease-out forwards',
        'flip-right': 'flipRight 0.4s ease-out forwards',
        'flip-up': 'flipUp 0.4s ease-out forwards',
        'slide-right': 'slideRight 0.5s ease-out forwards',
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-gradient': 'border-gradient 3s ease infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'width-expand': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideInRight: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        slideInLeft: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        zoomIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        slideDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideRight: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        flipLeft: {
          '0%': { 
            opacity: '0',
            transform: 'rotateY(90deg)'
          },
          '100%': { 
            opacity: '1',
            transform: 'rotateY(0)'
          },
        },
        flipRight: {
          '0%': { 
            opacity: '0',
            transform: 'rotateY(-90deg)'
          },
          '100%': { 
            opacity: '1',
            transform: 'rotateY(0)'
          },
        },
        flipUp: {
          '0%': { 
            opacity: '0',
            transform: 'rotateX(90deg)'
          },
          '100%': { 
            opacity: '1',
            transform: 'rotateX(0)'
          },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'border-gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundImage: {
        "sds-gradient": "linear-gradient(135deg, #C00C00 0%, #0033A0 100%)",
        "sds-gradient-red": "linear-gradient(135deg, #C00C00 0%, #A00A00 100%)",
        "sds-gradient-blue": "linear-gradient(135deg, #0033A0 0%, #00287D 100%)",
        // Additional gradients for animations
        'gradient-shine': 'linear-gradient(90deg, transparent, rgba(192, 12, 0, 0.1), transparent)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
      boxShadow: {
        sds: "0 4px 6px -1px rgba(192, 12, 0, 0.1), 0 2px 4px -1px rgba(192, 12, 0, 0.06)",
        "sds-lg": "0 10px 15px -3px rgba(192, 12, 0, 0.1), 0 4px 6px -2px rgba(192, 12, 0, 0.05)",
        "sds-xl": "0 20px 25px -5px rgba(192, 12, 0, 0.1), 0 10px 10px -5px rgba(192, 12, 0, 0.04)",
        // Additional shadows for animations
        'glow-red': '0 0 20px rgba(192, 12, 0, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 51, 160, 0.3)',
        'glow-red-lg': '0 0 30px rgba(192, 12, 0, 0.5)',
        'glow-blue-lg': '0 0 30px rgba(0, 51, 160, 0.5)',
      },
      borderRadius: {
        sds: "0.75rem",
        "sds-lg": "1rem",
      },
      // Additional transition properties
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'transform': 'transform',
        'all': 'all',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
        '2000': '2000ms',
      },
      transitionTimingFunction: {
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
        'in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      // Backdrop blur for glass effect
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      // Custom spacing for animations
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      // Custom opacity for overlays
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },
      // Custom max-width
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      // Custom min-height
      minHeight: {
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
      },
      // Custom z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Custom scale
      scale: {
        '102': '1.02',
        '105': '1.05',
        '110': '1.10',
        '115': '1.15',
      },
      // Custom rotate
      rotate: {
        '135': '135deg',
        '225': '225deg',
        '315': '315deg',
      },
      // Custom skew
      skew: {
        '15': '15deg',
        '-15': '-15deg',
      },
      // Custom border width
      borderWidth: {
        '3': '3px',
        '5': '5px',
        '6': '6px',
        '10': '10px',
      },
      // Custom background size
      backgroundSize: {
        '200%': '200%',
        '300%': '300%',
      },
    },
  },
  plugins: [],
};