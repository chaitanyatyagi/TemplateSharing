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

        // ---- Editorial direction (user-facing) ----
        cream: "#F5F1EA",          // page canvas
        paper: "#FBF8F3",          // raised card surface
        creamAlt: "#EDE7DD",       // hatch / subtle band
        hatch: "#E7E0D4",          // hatch stripe 2
        ink: "#1C1A17",            // near-black — primary text & buttons
        inkSoft: "#3A352E",        // softer ink for long-form body
        bodytext: "#4A443C",       // standard body copy
        muted2: "#6B645A",         // muted labels / meta
        faint: "#8A8276",          // faint placeholders / captions
        line: "#D9D1C4",           // soft divider on cream
        terracotta: "#B4532A",     // accent
        terracottaLight: "#E08A63",// accent on dark
        successGreen: "#2F7D4F",
        likeRed: "#B3261E",
      },
      fontSize: {
        xl: "30px",
        lg: "20px",
        md: "18px",
        sm: "14px",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        // Editorial type system
        display: ["'Instrument Serif'", "ui-serif", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        // Hanken Grotesk is the default UI/body font site-wide.
        sans: ["'Hanken Grotesk'", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
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