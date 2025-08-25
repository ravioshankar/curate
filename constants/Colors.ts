/**
 * Ruby Red Theme - Sophisticated and elegant color palette
 * Inspired by precious ruby gemstones with warm undertones
 */

// Primary Ruby Red Palette
const rubyPrimary = '#B91C1C';      // Deep Ruby Red
const rubyLight = '#DC2626';        // Bright Ruby
const rubyDark = '#991B1B';         // Dark Ruby
const rubyAccent = '#F87171';       // Light Ruby Accent

// Supporting Colors
const warmGray = '#78716C';         // Warm gray for text
const lightWarm = '#FEF7F0';        // Warm cream background
const darkWarm = '#1C1917';         // Dark warm background
const goldAccent = '#D97706';       // Gold accent for highlights

export const Colors = {
  light: {
    text: '#1C1917',              // Dark warm brown
    background: lightWarm,         // Warm cream
    tint: rubyPrimary,            // Deep Ruby Red
    icon: warmGray,               // Warm gray
    tabIconDefault: warmGray,     // Warm gray
    tabIconSelected: rubyPrimary, // Deep Ruby Red
    accent: goldAccent,           // Gold accent
    surface: '#FFFFFF',           // Pure white for cards
    border: '#E7E5E4',           // Light warm border
    success: '#059669',           // Emerald green
    warning: goldAccent,          // Gold warning
    error: rubyLight,             // Bright ruby for errors
  },
  dark: {
    text: '#F5F5F4',              // Warm white
    background: darkWarm,          // Dark warm background
    tint: rubyAccent,             // Light Ruby Accent
    icon: '#A8A29E',             // Light warm gray
    tabIconDefault: '#A8A29E',   // Light warm gray
    tabIconSelected: rubyAccent,  // Light Ruby Accent
    accent: goldAccent,           // Gold accent
    surface: '#292524',           // Dark warm surface
    border: '#44403C',           // Dark warm border
    success: '#10B981',           // Bright emerald
    warning: '#F59E0B',          // Bright amber
    error: rubyAccent,            // Light ruby for errors
  },
};
