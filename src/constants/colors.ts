export const LightColors = {
  primary: '#1A56DB',
  primaryLight: '#E1EFFE',
  primaryDark: '#1337A4',

  secondary: '#0E9F6E',
  secondaryLight: '#D5F5E3',
  secondaryDark: '#057A55',

  danger: '#E02424',
  dangerLight: '#FDE8E8',

  warning: '#C27803',
  warningLight: '#FDF6B2',

  success: '#057A55',
  successLight: '#D5F5E3',

  info: '#1C64F2',
  infoLight: '#E1EFFE',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  text: '#111827',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  // Status
  statusSubmitted: '#1A56DB',
  statusUnderReview: '#C27803',
  statusInProgress: '#7E3AF2',
  statusResolved: '#057A55',
  statusRejected: '#E02424',

  // Sentiment
  sentimentPositive: '#057A55',
  sentimentNeutral: '#C27803',
  sentimentNegative: '#E02424',

  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',

  // Priority
  priorityLow: '#057A55',
  priorityMedium: '#C27803',
  priorityHigh: '#E02424',
};

export const DarkColors: typeof LightColors = {
  primary: '#60A5FA',
  primaryLight: '#1E3A8A',
  primaryDark: '#93C5FD',

  secondary: '#34D399',
  secondaryLight: '#064E3B',
  secondaryDark: '#A7F3D0',

  danger: '#F87171',
  dangerLight: '#7F1D1D',

  warning: '#FBBF24',
  warningLight: '#78350F',

  success: '#34D399',
  successLight: '#064E3B',

  info: '#60A5FA',
  infoLight: '#1E3A8A',

  // Neutrals
  white: '#111827',
  black: '#F9FAFB',
  background: '#0B1120',
  surface: '#111827',
  border: '#374151',
  borderLight: '#1F2937',

  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textDisabled: '#9CA3AF',
  textOnPrimary: '#0B1120',

  // Status
  statusSubmitted: '#60A5FA',
  statusUnderReview: '#FBBF24',
  statusInProgress: '#C084FC',
  statusResolved: '#34D399',
  statusRejected: '#F87171',

  // Sentiment
  sentimentPositive: '#34D399',
  sentimentNeutral: '#FBBF24',
  sentimentNegative: '#F87171',

  // Overlay
  overlay: 'rgba(0,0,0,0.65)',
  overlayLight: 'rgba(255,255,255,0.14)',

  // Priority
  priorityLow: '#34D399',
  priorityMedium: '#FBBF24',
  priorityHigh: '#F87171',
};

export type AppColors = typeof LightColors;
export type ThemeMode = 'light' | 'dark';

export const Colors = LightColors;
