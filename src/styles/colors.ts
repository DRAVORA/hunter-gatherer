// ============================================================================
// HUNTER-GATHERER COLOR SYSTEM
// ============================================================================
// Dark, disciplined, elite fitness aesthetic
// Foundation: Deep cherry-black with warm undertones
// Philosophy: Controlled, authoritative, intentional
// ============================================================================

export const colors = {
  // ==========================================================================
  // FOUNDATION BACKGROUNDS
  // ==========================================================================
  
  // Primary background - deep cherry-black / merlot-black
  background: {
    primary: '#0F0808',      // Deepest cherry-black
    secondary: '#1A1212',    // Slightly lighter merlot-black
    tertiary: '#231818',     // Warmest background layer
  },

  // ==========================================================================
  // SURFACE COLORS (CARDS, PANELS, ELEVATION)
  // ==========================================================================
  
  surface: {
    base: '#2B2020',         // Dark charcoal with red undertones
    elevated: '#352828',     // Smoked graphite
    interactive: '#3F2F2F',  // Pressable surfaces
    border: '#4A3535',       // Subtle borders
  },

  // ==========================================================================
  // ACCENT HIERARCHY
  // ==========================================================================
  
  accent: {
    // Core accent - deep wine red / burgundy (use sparingly)
    primary: '#8B2635',      // Deep burgundy
    primaryDark: '#6B1D28',  // Darker burgundy for depth
    primaryLight: '#A33345', // Lighter burgundy for emphasis
    
    // Secondary accent - muted bronze/copper/antique gold
    secondary: '#9B7653',    // Muted bronze
    secondaryDark: '#7A5940', // Darker bronze
    secondaryLight: '#B89770', // Lighter bronze/copper
    
    // Tertiary accent - antique gold for instructional emphasis
    tertiary: '#B8945F',     // Antique gold
    tertiaryDark: '#9A7A4F', // Darker gold
    tertiaryLight: '#D4AD76', // Lighter gold
  },

  // ==========================================================================
  // STATE COLORS (SUCCESS, WARNING, ERROR)
  // ==========================================================================
  
  state: {
    // Success/Ready - desaturated calm green
    success: '#4A6B4A',      // Muted forest green
    successDark: '#3A5538',  // Darker green
    successLight: '#5A7B5A', // Lighter green
    
    // Warning - muted amber
    warning: '#9B7B4A',      // Desaturated amber
    warningDark: '#7A6238',  // Darker amber
    warningLight: '#B89560', // Lighter amber
    
    // Error/Stop - deep burgundy (reuses accent.primary)
    error: '#8B2635',        // Deep burgundy
    errorDark: '#6B1D28',    // Darker burgundy
    errorLight: '#A33345',   // Lighter burgundy
    
    // Info - muted steel blue (only for neutral information)
    info: '#5A6A7A',         // Desaturated steel
    infoDark: '#4A5860',     // Darker steel
    infoLight: '#6A7A8A',    // Lighter steel
  },

  // ==========================================================================
  // TEXT COLORS
  // ==========================================================================
  
  text: {
    // Primary text - warm off-white / bone
    primary: '#E8DDD5',      // Warm bone white
    
    // Secondary text - soft stone grey
    secondary: '#B8A898',    // Stone grey
    
    // Tertiary text - muted grey
    tertiary: '#8A7A6A',     // Muted grey
    
    // Disabled text
    disabled: '#5A4A3A',     // Very muted grey-brown
    
    // Instructional emphasis - muted amber/antique gold
    emphasis: '#B8945F',     // Antique gold
    
    // Error text
    error: '#C84A5A',        // Slightly brighter burgundy for readability
    
    // Success text
    success: '#6A8B6A',      // Slightly brighter green for readability
    
    // Warning text
    warning: '#B89560',      // Muted amber
  },

  // ==========================================================================
  // SPECIALIZED COLORS
  // ==========================================================================
  
  // Readiness indicators
  readiness: {
    ready: '#4A6B4A',        // Calm green
    volumeReduced: '#9B7B4A', // Muted amber
    noProgression: '#9B5B4A', // Rust
    restDay: '#8B2635',      // Deep burgundy
  },

  // Stop rules emphasis
  stopRules: {
    background: '#3F2818',   // Warm dark brown
    border: '#9B7B4A',       // Muted amber
    text: '#E8DDD5',         // Bone white
  },

  // Timer colors
  timer: {
    rest: '#5A6A7A',         // Neutral steel
    active: '#9B7653',       // Bronze
    complete: '#4A6B4A',     // Calm green
  },

  // Exercise execution
  execution: {
    setup: '#2B3A4A',        // Dark blue-grey
    focus: '#3F2F2F',        // Dark charcoal
    breathing: '#2B2828',    // Subtle grey
    cleanRep: '#4A6B4A',     // Calm green
    dirtyRep: '#9B5B4A',     // Rust
  },

  // ==========================================================================
  // SHADOWS & OVERLAYS
  // ==========================================================================
  
  shadow: {
    light: 'rgba(0, 0, 0, 0.2)',
    medium: 'rgba(0, 0, 0, 0.4)',
    heavy: 'rgba(0, 0, 0, 0.6)',
  },

  overlay: {
    light: 'rgba(15, 8, 8, 0.6)',   // Cherry-black overlay
    medium: 'rgba(15, 8, 8, 0.8)',
    heavy: 'rgba(15, 8, 8, 0.95)',
  },

  // ==========================================================================
  // BORDERS
  // ==========================================================================
  
  border: {
    subtle: '#4A3535',       // Very subtle
    default: '#5A4545',      // Default borders
    emphasis: '#9B7653',     // Bronze emphasis
    strong: '#8B2635',       // Burgundy strong
  },

} as const;

// ============================================================================
// COLOR UTILITY TYPES
// ============================================================================

export type ColorToken = typeof colors;
export type BackgroundColor = keyof typeof colors.background;
export type SurfaceColor = keyof typeof colors.surface;
export type AccentColor = keyof typeof colors.accent;
export type StateColor = keyof typeof colors.state;
export type TextColor = keyof typeof colors.text;
