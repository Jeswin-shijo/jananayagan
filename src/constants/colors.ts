export const LightColors = {
  primary: '#5586B5',
  primaryLight: '#EAF2FA',
  primaryDark: '#2F5C86',
  primarySoft: '#D6E6F4',

  secondary: '#6FC298',
  secondaryLight: '#E6F6EE',
  secondaryDark: '#48A075',
  secondarySoft: '#D5EFDF',

  danger: '#D9695E',
  dangerLight: '#FBEAE8',

  warning: '#D6A24E',
  warningLight: '#FBF1DC',

  success: '#5BB587',
  successLight: '#E2F4EA',

  info: '#5586B5',
  infoLight: '#EAF2FA',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#EEF3F9',
  surface: '#FFFFFF',
  surfaceSoft: '#F6F9FC',
  border: '#E2E9F1',
  borderLight: '#EFF3F8',

  text: '#1E3A5F',
  textSecondary: '#5E7088',
  textDisabled: '#9AA8B8',
  textOnPrimary: '#FFFFFF',

  // Pastel tiles (quick actions / category accents)
  tileBlue: '#E8F0FA',
  tileGreen: '#E3F6EC',
  tilePurple: '#EEEAFB',
  tileAmber: '#FBF1DC',
  tilePink: '#FBE7EF',
  tileTeal: '#E2F4F4',

  // Status
  statusSubmitted: '#5586B5',
  statusUnderReview: '#D6A24E',
  statusInProgress: '#7C77C9',
  statusResolved: '#5BB587',
  statusRejected: '#D9695E',

  // Sentiment
  sentimentPositive: '#5BB587',
  sentimentNeutral: '#D6A24E',
  sentimentNegative: '#D9695E',

  // Overlay
  overlay: 'rgba(30,58,95,0.45)',
  overlayLight: 'rgba(255,255,255,0.34)',

  // Priority
  priorityLow: '#5BB587',
  priorityMedium: '#D6A24E',
  priorityHigh: '#D9695E',
};

export const DarkColors: typeof LightColors = {
  primary: '#8FBBDD',
  primaryLight: '#173249',
  primaryDark: '#BBDDF1',
  primarySoft: '#1E4058',

  secondary: '#7FD3AC',
  secondaryLight: '#123D2F',
  secondaryDark: '#BCF1D6',
  secondarySoft: '#164A38',

  danger: '#EE8A80',
  dangerLight: '#4E211E',

  warning: '#EBC06A',
  warningLight: '#4A3718',

  success: '#7FD3AC',
  successLight: '#123D2F',

  info: '#8FBBDD',
  infoLight: '#173249',

  // Neutrals
  white: '#101B29',
  black: '#EEF3F9',
  background: '#0A121C',
  surface: '#101B29',
  surfaceSoft: '#15212F',
  border: '#243443',
  borderLight: '#1A2737',

  text: '#EEF3F9',
  textSecondary: '#AEBDCB',
  textDisabled: '#788A9C',
  textOnPrimary: '#0A121C',

  // Pastel tiles (quick actions / category accents)
  tileBlue: '#173249',
  tileGreen: '#123D2F',
  tilePurple: '#221F3D',
  tileAmber: '#3A2D14',
  tilePink: '#3D1E2A',
  tileTeal: '#0F3535',

  // Status
  statusSubmitted: '#8FBBDD',
  statusUnderReview: '#EBC06A',
  statusInProgress: '#AAA4EE',
  statusResolved: '#7FD3AC',
  statusRejected: '#EE8A80',

  // Sentiment
  sentimentPositive: '#7FD3AC',
  sentimentNeutral: '#EBC06A',
  sentimentNegative: '#EE8A80',

  // Overlay
  overlay: 'rgba(0,0,0,0.65)',
  overlayLight: 'rgba(255,255,255,0.16)',

  // Priority
  priorityLow: '#7FD3AC',
  priorityMedium: '#EBC06A',
  priorityHigh: '#EE8A80',
};

export type AppColors = typeof LightColors;
export type ThemeMode = 'light' | 'dark';

export const Colors = LightColors;
