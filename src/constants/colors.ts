export const LightColors = {
  primary: '#3F86A8',
  primaryLight: '#E7F5F7',
  primaryDark: '#235B78',
  primarySoft: '#D7EDF5',

  secondary: '#58BF93',
  secondaryLight: '#E3F8EE',
  secondaryDark: '#2B8E69',
  secondarySoft: '#D7F4E6',

  danger: '#B9504E',
  dangerLight: '#FCECEC',

  warning: '#B98A38',
  warningLight: '#FFF4D7',

  success: '#42A978',
  successLight: '#DFF6E9',

  info: '#4C91BF',
  infoLight: '#E6F2FA',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F4F9FB',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FCFB',
  border: '#DCE8EC',
  borderLight: '#EEF5F6',

  text: '#14233A',
  textSecondary: '#617182',
  textDisabled: '#99A7B5',
  textOnPrimary: '#FFFFFF',

  // Status
  statusSubmitted: '#3F86A8',
  statusUnderReview: '#B98A38',
  statusInProgress: '#7E78C8',
  statusResolved: '#42A978',
  statusRejected: '#B9504E',

  // Sentiment
  sentimentPositive: '#42A978',
  sentimentNeutral: '#B98A38',
  sentimentNegative: '#B9504E',

  // Overlay
  overlay: 'rgba(20,35,58,0.48)',
  overlayLight: 'rgba(255,255,255,0.34)',

  // Priority
  priorityLow: '#42A978',
  priorityMedium: '#B98A38',
  priorityHigh: '#B9504E',
};

export const DarkColors: typeof LightColors = {
  primary: '#7FC4E1',
  primaryLight: '#17354A',
  primaryDark: '#B7E3F3',
  primarySoft: '#1E4256',

  secondary: '#79D7AC',
  secondaryLight: '#123D30',
  secondaryDark: '#B9F2D4',
  secondarySoft: '#164B39',

  danger: '#F08D8A',
  dangerLight: '#522021',

  warning: '#F1C86B',
  warningLight: '#4D3718',

  success: '#79D7AC',
  successLight: '#123D30',

  info: '#7FC4E1',
  infoLight: '#17354A',

  // Neutrals
  white: '#101C2D',
  black: '#F4F9FB',
  background: '#08131F',
  surface: '#101C2D',
  surfaceSoft: '#142437',
  border: '#26384A',
  borderLight: '#1B2A3D',

  text: '#F4F9FB',
  textSecondary: '#B7C5D0',
  textDisabled: '#7F93A6',
  textOnPrimary: '#08131F',

  // Status
  statusSubmitted: '#7FC4E1',
  statusUnderReview: '#F1C86B',
  statusInProgress: '#AFA8F0',
  statusResolved: '#79D7AC',
  statusRejected: '#F08D8A',

  // Sentiment
  sentimentPositive: '#79D7AC',
  sentimentNeutral: '#F1C86B',
  sentimentNegative: '#F08D8A',

  // Overlay
  overlay: 'rgba(0,0,0,0.65)',
  overlayLight: 'rgba(255,255,255,0.16)',

  // Priority
  priorityLow: '#79D7AC',
  priorityMedium: '#F1C86B',
  priorityHigh: '#F08D8A',
};

export type AppColors = typeof LightColors;
export type ThemeMode = 'light' | 'dark';

export const Colors = LightColors;
