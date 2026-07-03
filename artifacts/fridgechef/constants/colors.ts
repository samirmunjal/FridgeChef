/**
 * Semantic design tokens for FridgeChef.
 *
 * Warm, appetizing palette inspired by the approved mockups: cream
 * background, orange primary accent, stone neutrals.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: "#292524",
    tint: "#EA580C",

    // Core surfaces
    background: "#FFFBF5",
    foreground: "#292524",

    // Cards / elevated surfaces
    card: "#FFFFFF",
    cardForeground: "#292524",

    // Primary action color (buttons, links, active states)
    primary: "#EA580C",
    primaryForeground: "#FFFFFF",

    // Secondary / less-emphasis interactive surfaces (dark chip style)
    secondary: "#292524",
    secondaryForeground: "#FFFFFF",

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: "#F5F5F4",
    mutedForeground: "#78716C",

    // Accent highlights (badges, selected items, focus rings)
    accent: "#FFEDD5",
    accentForeground: "#7C2D12",

    // Destructive actions (delete, error states)
    destructive: "#EF4444",
    destructiveForeground: "#FFFFFF",

    // Borders and input outlines
    border: "#E7E5E4",
    input: "#E7E5E4",

    // Status colors
    success: "#22C55E",
    successForeground: "#FFFFFF",
    warning: "#F59E0B",
    warningForeground: "#FFFFFF",
  },

  // Border radius (in px) applied to cards, buttons, inputs, and modals.
  radius: 20,
};

export default colors;
