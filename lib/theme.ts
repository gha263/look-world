// ─────────────────────────────────────────────────────────────────────────────
// lib/theme.ts
// Single source of truth for the Look 47 Studio dark palette and design tokens.
// Resolves prior drift: lift3 standardized to #424242; amber included for all tabs.
// ─────────────────────────────────────────────────────────────────────────────

export const C = {
  bg: "#212121",      // page background
  lift1: "#2f2f2f",   // first elevation — cards, surfaces
  lift2: "#3a3a3a",   // second elevation — buttons, chips
  lift3: "#424242",   // third elevation — inputs, hover
  text: "#ececec",    // primary text
  muted: "#8e8ea0",   // secondary text, labels
  dim: "#555",        // tertiary text, placeholders
  white: "#fff",
  green: "#4caf6e",   // published, success, snapshot-ready
  red: "#e05a4e",     // destructive, errors, empty
  amber: "#f0a500",   // draft, primary-color star, warnings
} as const;

// Design tokens — radii, spacing, typography. Use these instead of inline values
// so controls stay consistent across tabs.
export const T = {
  font: "Inter, sans-serif",
  radius: {
    pill: 20,   // toolbar controls, buttons, chips
    input: 12,  // form inputs, dropdowns
    card: 16,   // cards, panels
    sm: 10,     // small inputs, thumbnails
  },
  // Standard input border used in form contexts (Intake-style)
  inputBorder: "1px solid #505050",
  // Standard control border used in toolbar contexts (Tag Studio-style)
  controlBorder: "1px solid #606060",
} as const;

// Google Fonts import used at the top of each page's <style> block.
export const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');";
