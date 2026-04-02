/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        glass: "0 10px 35px rgba(11, 20, 38, 0.18)",
      },
      borderRadius: {
        "2xl": "1.2rem",
      },
      colors: {
        status: {
          good: "#16a34a",
          warning: "#eab308",
          critical: "#ef4444",
          neutral: "#0ea5e9",
        },
      },
    },
  },
  plugins: [],
};
