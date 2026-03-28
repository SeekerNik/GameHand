// GameHand Design System — Dark Gaming Theme

export const Colors = {
  // Base
  background: '#0A0E1A',
  backgroundSecondary: '#111827',
  backgroundTertiary: '#1A2035',
  surface: '#1E2640',
  surfaceHover: '#253050',

  // Accent — Neon Cyan
  primary: '#00F0FF',
  primaryDim: 'rgba(0,240,255,0.15)',
  primaryGlow: 'rgba(0,240,255,0.35)',

  // Secondary — Electric Purple
  secondary: '#A855F7',
  secondaryDim: 'rgba(168,85,247,0.15)',
  secondaryGlow: 'rgba(168,85,247,0.35)',

  // Tertiary — Hot Pink
  accent: '#FF3B82',
  accentDim: 'rgba(255,59,130,0.15)',

  // Success / Warning / Error
  success: '#22C55E',
  successDim: 'rgba(34,197,94,0.15)',
  warning: '#F59E0B',
  warningDim: 'rgba(245,158,11,0.15)',
  error: '#EF4444',
  errorDim: 'rgba(239,68,68,0.15)',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0A0E1A',

  // Borders
  border: 'rgba(148,163,184,0.12)',
  borderLight: 'rgba(148,163,184,0.06)',

  // Gradients
  gradientPrimary: ['#00F0FF', '#A855F7'] as const,
  gradientHot: ['#FF3B82', '#F59E0B'] as const,
  gradientDark: ['#0A0E1A', '#1A2035'] as const,
  gradientCard: ['rgba(30,38,64,0.8)', 'rgba(26,32,53,0.6)'] as const,

  // Tab Bar
  tabActive: '#00F0FF',
  tabInactive: '#475569',

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
};

export const Fonts = {
  // Sizes
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  display: 48,
  hero: 64,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  }),
};
