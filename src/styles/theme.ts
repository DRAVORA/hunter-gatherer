// ============================================================================
// THEME SYSTEM
// ============================================================================
// Centralized design tokens for the Hunter-Gatherer app
// Dark cherry-black aesthetic with burgundy, bronze, and antique gold accents

import { colors } from "./colors";

// ============================================================================
// SPACING SCALE
// ============================================================================
// Base unit: 4px
// Scale follows 4px increments with half-step at 0.5 (2px)

const spacing = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96,
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

const typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 1.5,
  },
} as const;

// ============================================================================
// BORDER RADII
// ============================================================================

const borderRadius = {
  none: 0,
  sm: 4,
  base: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ============================================================================
// BORDER WIDTHS
// ============================================================================

const borderWidth = {
  hairline: 1,
  thin: 2,
  thick: 3,
} as const;

// ============================================================================
// SHADOWS (for future use)
// ============================================================================

const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// ============================================================================
// COMBINED THEME EXPORT
// ============================================================================

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  borderWidth,
  shadows,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Theme = typeof theme;
export type ThemeColors = typeof colors;
export type ThemeSpacing = typeof spacing;
export type ThemeTypography = typeof typography;
