import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DarkColors, LightColors, ThemeMode} from '@constants/colors';

const THEME_STORAGE_KEY = 'theme_mode';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof LightColors;
  restoreTheme: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
}

const getColors = (mode: ThemeMode) => (mode === 'dark' ? DarkColors : LightColors);

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  isDark: false,
  colors: LightColors,

  restoreTheme: async () => {
    const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    const mode: ThemeMode = storedMode === 'dark' ? 'dark' : 'light';
    set({mode, isDark: mode === 'dark', colors: getColors(mode)});
  },

  setMode: async mode => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    set({mode, isDark: mode === 'dark', colors: getColors(mode)});
  },

  toggleMode: async () => {
    const nextMode: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
    await get().setMode(nextMode);
  },
}));
