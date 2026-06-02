import {Platform} from 'react-native';

export const FontFamily = {
  regular: Platform.select({ios: 'System', android: 'Roboto'}),
  medium: Platform.select({ios: 'System', android: 'Roboto-Medium'}),
  semiBold: Platform.select({ios: 'System', android: 'Roboto-Medium'}),
  bold: Platform.select({ios: 'System', android: 'Roboto-Bold'}),
};

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};
