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
      },
      backgroundImage: {
        "sds-gradient": "linear-gradient(135deg, #C00C00 0%, #0033A0 100%)",
        "sds-gradient-red": "linear-gradient(135deg, #C00C00 0%, #A00A00 100%)",
        "sds-gradient-blue":
          "linear-gradient(135deg, #0033A0 0%, #00287D 100%)",
      },
      boxShadow: {
        sds: "0 4px 6px -1px rgba(192, 12, 0, 0.1), 0 2px 4px -1px rgba(192, 12, 0, 0.06)",
        "sds-lg":
          "0 10px 15px -3px rgba(192, 12, 0, 0.1), 0 4px 6px -2px rgba(192, 12, 0, 0.05)",
        "sds-xl":
          "0 20px 25px -5px rgba(192, 12, 0, 0.1), 0 10px 10px -5px rgba(192, 12, 0, 0.04)",
      },
      borderRadius: {
        sds: "0.75rem",
        "sds-lg": "1rem",
      },
    },
  },
  plugins: [],
};
