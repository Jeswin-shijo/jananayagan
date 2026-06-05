export const LightColors = {
  primary: '#2563EB',
  primaryLight: '#E8F0FF',
  primaryDark: '#1746C4',
  primarySoft: '#CFE0FF',

  secondary: '#06B6D4',
  secondaryLight: '#E2F7FB',
  secondaryDark: '#0E8FA8',
  secondarySoft: '#C2ECF4',

  danger: '#EF4444',
  dangerLight: '#FDECEC',

  warning: '#F59E0B',
  warningLight: '#FEF3D9',

  success: '#16A34A',
  successLight: '#E3F6EA',

  info: '#2563EB',
  infoLight: '#E8F0FF',

  // Accent (report / alert)
  accentOrange: '#F97316',
  accentOrangeSoft: '#FFF1E8',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F2F6FC',
  surface: '#FFFFFF',
  surfaceSoft: '#F4F8FD',
  border: '#E1E8F2',
  borderLight: '#EEF3F9',

  text: '#0F2547',
  textSecondary: '#5A6B85',
  textDisabled: '#97A6BA',
  textOnPrimary: '#FFFFFF',

  // Pastel tiles (quick actions / category accents)
  tileBlue: '#E8F0FF',
  tileGreen: '#E3F6EC',
  tilePurple: '#F1ECFE',
  tileAmber: '#FEF3D9',
  tilePink: '#FCE8F0',
  tileTeal: '#E0F7FB',

  // Status
  statusSubmitted: '#2563EB',
  statusUnderReview: '#F59E0B',
  statusInProgress: '#7C3AED',
  statusResolved: '#16A34A',
  statusRejected: '#EF4444',

  // Sentiment
  sentimentPositive: '#16A34A',
  sentimentNeutral: '#F59E0B',
  sentimentNegative: '#EF4444',

  // Overlay
  overlay: 'rgba(10,20,40,0.5)',
  overlayLight: 'rgba(255,255,255,0.34)',

  // Priority
  priorityLow: '#16A34A',
  priorityMedium: '#F59E0B',
  priorityHigh: '#EF4444',
};

export const DarkColors: typeof LightColors = {
  primary: '#4F8DFF',
  primaryLight: '#16233F',
  primaryDark: '#1E50C8',
  primarySoft: '#1B2C4E',

  secondary: '#22D3EE',
  secondaryLight: '#0C3038',
  secondaryDark: '#15A8C2',
  secondarySoft: '#103642',

  danger: '#F87171',
  dangerLight: '#3A1B1B',

  warning: '#FBBF24',
  warningLight: '#3A2E12',

  success: '#34D399',
  successLight: '#0E2E22',

  info: '#4F8DFF',
  infoLight: '#16233F',

  // Accent (report / alert)
  accentOrange: '#FB923C',
  accentOrangeSoft: '#3A2614',

  // Neutrals
  white: '#0B0F1A',
  black: '#EAF1FB',
  background: '#080C18',
  surface: '#111A2C',
  surfaceSoft: '#0E1626',
  border: '#23314C',
  borderLight: '#1A2740',

  text: '#EAF1FB',
  textSecondary: '#9FB2CC',
  textDisabled: '#6B7E99',
  textOnPrimary: '#FFFFFF',

  // Pastel tiles (quick actions / category accents)
  tileBlue: '#16233F',
  tileGreen: '#0E2E22',
  tilePurple: '#221A3D',
  tileAmber: '#3A2E12',
  tilePink: '#3A1B28',
  tileTeal: '#0C3038',

  // Status
  statusSubmitted: '#4F8DFF',
  statusUnderReview: '#FBBF24',
  statusInProgress: '#A78BFA',
  statusResolved: '#34D399',
  statusRejected: '#F87171',

  // Sentiment
  sentimentPositive: '#34D399',
  sentimentNeutral: '#FBBF24',
  sentimentNegative: '#F87171',

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(255,255,255,0.14)',

  // Priority
  priorityLow: '#34D399',
  priorityMedium: '#FBBF24',
  priorityHigh: '#F87171',
};

export type AppColors = typeof LightColors;
export type ThemeMode = 'light' | 'dark';

export const Colors = LightColors;

// Brand navy — the single source of truth for every dark surface across the app.
// Theme-independent (navy is always navy). Change `base` here to retint the whole app.
export const Navy = {
  base: '#0A1B38', // primary dark background
  deep: '#06122A', // deeper shade (gradient bottoms)
  surface: '#0F2247', // elevated surface on navy (tab bar, header sheen, cards)
  border: 'rgba(95,178,255,0.16)',
};
