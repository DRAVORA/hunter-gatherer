// ============================================================================
// HUNTER-GATHERER THEME SYSTEM
// ============================================================================
// Complete design system for dark, disciplined fitness aesthetic
// Built for React Native StyleSheet compatibility
// ============================================================================

import { colors } from './colors';

export const theme = {
  colors,

  // ==========================================================================
  // TYPOGRAPHY
  // ==========================================================================
  
  typography: {
    // Font families
    fontFamily: {
      primary: 'System',      // System default
      mono: 'Courier',        // Monospace for numbers/data
    },

    // Font sizes
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

    // Font weights
    fontWeight: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '800' as const,
    },

    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },

    // Letter spacing
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
      widest: 2,
    },
  },

  // ==========================================================================
  // SPACING SYSTEM
  // ==========================================================================
  
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },

  // ==========================================================================
  // BORDER RADIUS
  // ==========================================================================
  
  borderRadius: {
    none: 0,
    sm: 4,
    base: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // ==========================================================================
  // BORDER WIDTHS
  // ==========================================================================
  
  borderWidth: {
    none: 0,
    hairline: 1,
    thin: 2,
    base: 3,
    thick: 4,
  },

  // ==========================================================================
  // SHADOWS (React Native compatible)
  // ==========================================================================
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: colors.shadow.medium,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    base: {
      shadowColor: colors.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    md: {
      shadowColor: colors.shadow.heavy,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 6,
    },
    lg: {
      shadowColor: colors.shadow.heavy,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  // ==========================================================================
  // COMPONENT TOKENS
  // ==========================================================================
  
  components: {
    // Screen containers
    screen: {
      background: colors.background.primary,
      padding: 16,
    },

    // Cards
    card: {
      background: colors.surface.base,
      borderColor: colors.border.subtle,
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
    },

    // Buttons
    button: {
      primary: {
        background: colors.accent.primary,
        backgroundPressed: colors.accent.primaryDark,
        text: colors.text.primary,
        borderRadius: 6,
        paddingVertical: 14,
        paddingHorizontal: 20,
      },
      secondary: {
        background: colors.surface.elevated,
        backgroundPressed: colors.surface.interactive,
        text: colors.text.primary,
        borderColor: colors.border.default,
        borderWidth: 2,
        borderRadius: 6,
        paddingVertical: 14,
        paddingHorizontal: 20,
      },
      success: {
        background: colors.state.success,
        backgroundPressed: colors.state.successDark,
        text: colors.text.primary,
        borderRadius: 6,
        paddingVertical: 14,
        paddingHorizontal: 20,
      },
      warning: {
        background: colors.state.warning,
        backgroundPressed: colors.state.warningDark,
        text: colors.text.primary,
        borderRadius: 6,
        paddingVertical: 14,
        paddingHorizontal: 20,
      },
      disabled: {
        background: colors.surface.base,
        text: colors.text.disabled,
        borderRadius: 6,
        paddingVertical: 14,
        paddingHorizontal: 20,
      },
    },

    // Input fields
    input: {
      background: colors.surface.base,
      backgroundFocused: colors.surface.elevated,
      text: colors.text.primary,
      placeholder: colors.text.tertiary,
      borderColor: colors.border.subtle,
      borderColorFocused: colors.accent.secondary,
      borderWidth: 2,
      borderRadius: 6,
      padding: 12,
    },

    // Headers
    header: {
      background: colors.background.secondary,
      text: colors.text.primary,
      borderColor: colors.border.subtle,
      height: 56,
    },

    // Badges
    badge: {
      clean: {
        background: colors.state.success,
        text: colors.text.primary,
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
      },
      dirty: {
        background: colors.execution.dirtyRep,
        text: colors.text.primary,
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
      },
      info: {
        background: colors.state.info,
        text: colors.text.primary,
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
      },
    },

    // Progress indicators
    progress: {
      background: colors.surface.base,
      fill: colors.accent.secondary,
      height: 8,
      borderRadius: 4,
    },

    // Dividers
    divider: {
      color: colors.border.subtle,
      thickness: 1,
      marginVertical: 16,
    },

    // Modal overlays
    modal: {
      overlay: colors.overlay.heavy,
      background: colors.surface.elevated,
      borderRadius: 12,
      padding: 24,
    },

    // Stop rules box
    stopRules: {
      background: colors.stopRules.background,
      borderColor: colors.stopRules.border,
      borderWidth: 2,
      borderRadius: 8,
      padding: 16,
    },

    // Readiness indicators
    readiness: {
      ready: {
        background: colors.readiness.ready,
        text: colors.text.primary,
      },
      volumeReduced: {
        background: colors.readiness.volumeReduced,
        text: colors.text.primary,
      },
      noProgression: {
        background: colors.readiness.noProgression,
        text: colors.text.primary,
      },
      restDay: {
        background: colors.readiness.restDay,
        text: colors.text.primary,
      },
    },

    // Exercise execution states
    execution: {
      setup: {
        background: colors.execution.setup,
        borderColor: colors.accent.tertiary,
        borderWidth: 2,
      },
      focus: {
        background: colors.execution.focus,
        borderColor: colors.border.default,
        borderWidth: 1,
      },
      breathing: {
        background: colors.execution.breathing,
        borderColor: colors.border.subtle,
        borderWidth: 1,
      },
    },

    // Timers
    timer: {
      rest: {
        background: colors.surface.elevated,
        text: colors.timer.rest,
        borderColor: colors.timer.rest,
      },
      active: {
        background: colors.surface.elevated,
        text: colors.timer.active,
        borderColor: colors.timer.active,
      },
      complete: {
        background: colors.surface.elevated,
        text: colors.timer.complete,
        borderColor: colors.timer.complete,
      },
    },

    // Session history
    history: {
      sectionHeader: {
        background: colors.background.secondary,
        text: colors.text.secondary,
        borderColor: colors.border.subtle,
      },
      sessionCard: {
        background: colors.surface.base,
        backgroundExpanded: colors.surface.elevated,
        borderColor: colors.border.subtle,
      },
    },
  },

  // ==========================================================================
  // LAYOUT CONSTANTS
  // ==========================================================================
  
  layout: {
    containerMaxWidth: 640,
    screenPadding: 16,
    sectionSpacing: 24,
    componentSpacing: 16,
  },

  // ==========================================================================
  // ANIMATION DURATIONS (milliseconds)
  // ==========================================================================
  
  animation: {
    fast: 150,
    base: 250,
    slow: 400,
  },

  // ==========================================================================
  // Z-INDEX LAYERS
  // ==========================================================================
  
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    toast: 500,
  },

} as const;

// ============================================================================
// THEME UTILITY TYPES
// ============================================================================

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeTypography = typeof theme.typography;
export type ThemeComponents = typeof theme.components;

// ============================================================================
// COMMON STYLE PRESETS
// ============================================================================

export const commonStyles = {
  // Flex layouts
  flex: {
    row: {
      flexDirection: 'row' as const,
    },
    column: {
      flexDirection: 'column' as const,
    },
    center: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    spaceBetween: {
      justifyContent: 'space-between' as const,
    },
    alignCenter: {
      alignItems: 'center' as const,
    },
  },

  // Text styles
  text: {
    h1: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight,
    },
    h2: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.fontSize['3xl'] * theme.typography.lineHeight.tight,
    },
    h3: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight,
    },
    h4: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.normal,
    },
    body: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.normal,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
    },
    bodySecondary: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.normal,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
    },
    caption: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.normal,
      color: theme.colors.text.tertiary,
      lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
    },
    emphasis: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.emphasis,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
    },
  },

  // Container styles
  container: {
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollContent: {
      padding: theme.spacing[4],
    },
    centered: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.colors.background.primary,
    },
  },
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default theme;
