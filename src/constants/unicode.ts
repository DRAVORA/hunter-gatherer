// ============================================================================
// UNICODE CONSTANTS
// ============================================================================
// All special characters as unicode escape sequences for cross-platform stability
// Never use literal unicode characters in source files - they can break during
// file transfers, git operations, and across different text encodings

export const UNICODE = {
  // Checkmarks and symbols
  CHECKMARK: "\u2713",
  HEAVY_CHECKMARK: "\u2714",
  CROSS: "\u2717",
  
  // Bullets and separators
  BULLET: "\u2022",
  CIRCLE_BULLET: "\u25E6",
  DASH: "\u2013", // en dash
  EM_DASH: "\u2014",
  
  // Fractions
  QUARTER: "\u00BC",      // ¼
  HALF: "\u00BD",         // ½
  THREE_QUARTERS: "\u00BE", // ¾
  
  // Math symbols
  MULTIPLY: "\u00D7",     // ×
  DIVIDE: "\u00F7",       // ÷
  PLUS_MINUS: "\u00B1",   // ±
  
  // Arrows
  ARROW_UP: "\u2191",
  ARROW_DOWN: "\u2193",
  ARROW_LEFT: "\u2190",
  ARROW_RIGHT: "\u2192",
  
  // Common symbols
  DEGREE: "\u00B0",       // °
  MICRO: "\u00B5",        // µ
  SECTION: "\u00A7",      // §
  
} as const;

// Type for autocomplete
export type UnicodeKey = keyof typeof UNICODE;
