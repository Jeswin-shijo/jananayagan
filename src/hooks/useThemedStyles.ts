import {useMemo} from 'react';
import {AppColors} from '@constants/colors';
import {useThemeStore} from '@store/themeStore';

export const useAppColors = () => useThemeStore(state => state.colors);

export const useThemedStyles = <T>(createStyles: (colors: AppColors) => T): T => {
  const colors = useAppColors();
  return useMemo(() => createStyles(colors), [colors, createStyles]);
};
