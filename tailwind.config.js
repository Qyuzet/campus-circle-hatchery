/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        "dark-blue": "#1E4D91",
        "campus-green": "#2BA56A",
        "light-blue": "#3498DB",

        // Secondary / Accent Colors
        "dark-gray": "#333333",
        "medium-gray": "#666666",
        "light-gray": "#E5E5E5",

        // Highlight Colors
        "soft-blue": "#4A90E2",
        "green-status": "#27AE60",

        // Logo gradient colors
        "campus-blue-light": "#2C6FB0",
        "campus-blue-dark": "#1F4F87",
        "circle-teal-light": "#4DB9A6",
        "circle-teal-dark": "#2C8C77",

        // Extended palette for better integration
        primary: {
          50: "#f0f4fd",
          100: "#e1e9fb",
          200: "#c3d3f7",
          300: "#9bb5f1",
          400: "#6b8ee8",
          500: "#4A90E2", // soft-blue
          600: "#3498DB", // light-blue
          700: "#1E4D91", // dark-blue
          800: "#1a4080",
          900: "#163366",
        },
        secondary: {
          50: "#f9f9f9",
          100: "#f5f5f5",
          200: "#E5E5E5", // light-gray
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#666666", // medium-gray
          600: "#525252",
          700: "#404040",
          800: "#333333", // dark-gray
          900: "#262626",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#27AE60", // green-status
          600: "#2BA56A", // campus-green
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
    },
  },
  plugins: [],
};
