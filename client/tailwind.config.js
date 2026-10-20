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

        // ---- Direction A v2 — Cobalt ----
        cream: "#FFFFFF",          // page canvas
        paper: "#F5F7FC",          // raised card surface (light cobalt tint)
        creamAlt: "#EEF1F7",       // hatch / subtle band
        hatch: "#E6EAF2",          // hatch stripe 2
        ink: "#0E1A3A",            // near-black navy — primary text & buttons
        inkSoft: "#26315A",        // softer navy for long-form body / dark rules
        bodytext: "#36405E",       // standard body copy
        muted2: "#4C5675",         // muted labels / meta
        faint: "#6F7794",          // faint placeholders / captions
        line: "#E3E6EE",           // soft divider
        terracotta: "#2344D0",     // accent (cobalt)
        terracottaLight: "#F5D76E",// gold accent (on dark / pops)
        gold: "#F5D76E",           // marquee band, price pills
        successGreen: "#1F7A4C",
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
        // Cobalt type system — Bricolage Grotesque display + Instrument Sans body.
        display: ["'Bricolage Grotesque'", "ui-sans-serif", "system-ui", "sans-serif"],
        // 'mono' kept as a token name (used for eyebrows/labels) but is now Instrument Sans.
        mono: ["'Instrument Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["'Instrument Sans'", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
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