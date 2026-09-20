/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      colors: {
        // Brand
        bluePrimary: "#2563EB",   // primary brand accent (buttons, links, active)
        blueHover: "#1D4ED8",     // darker brand for hover states
        lightBlue: "#DEE6FF",     // light brand tint (pills, badges, subtle bg)
        // Accents
        greenAccent: "#17BF88",
        redAccent: "#EF4444",
        amberAccent: "#F59E0B",
        // Text
        textHeading: "#1F2937",   // headings / strongest text
        textDark: "#414A5A",      // strong body text
        textMuted: "#606060",     // muted body text
        grayLight: "#9DA6B2",     // faint text / disabled
        grayDark: "#858994",
        // Surfaces & lines
        background: "#F9FAFB",     // page background
        darkBg: "#111827",        // dark surfaces (admin sidebar/header)
        darkBgHover: "#1F2937",
        border: "#B1B4BC",        // default border
        borderLight: "#E5E7EB",   // subtle border (inputs, dividers)
      },
      fontSize: {
        xl: "30px",
        lg: "20px",
        md: "18px",
        sm: "14px",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        // Make Inter the default font everywhere for a cohesive, modern look.
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontWeight: {
        regular: "400",
        semi: "600",
        bold: "700",
      },
    },
  },
  plugins: [],
};


// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }