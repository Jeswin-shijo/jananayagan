import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import {RootNavigator} from './src/navigation/RootNavigator';
import {SosButton} from './src/components/common/SosButton';
import {AppAlertProvider} from './src/components/common/AppAlert';
import {useThemeStore} from './src/store/themeStore';
import {useLanguageStore} from './src/store/languageStore';
import {useEmergencyContactsStore} from './src/store/emergencyContactsStore';
import {useStartupPermissions} from './src/hooks/useStartupPermissions';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App(): React.JSX.Element {
  const {colors, isDark, restoreTheme} = useThemeStore();
  const restoreLanguage = useLanguageStore(state => state.restoreLanguage);
  const restoreEmergencyContacts = useEmergencyContactsStore(state => state.restore);

  useStartupPermissions();

  useEffect(() => {
    restoreTheme();
    restoreLanguage();
    restoreEmergencyContacts();
  }, [restoreTheme, restoreLanguage, restoreEmergencyContacts]);

  const navigationTheme = {
    ...(isDark ? NavigationDarkTheme : NavigationLightTheme),
    colors: {
      ...(isDark ? NavigationDarkTheme.colors : NavigationLightTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={colors.surface}
            translucent={false}
          />
          <BottomSheetModalProvider>
            <AppAlertProvider>
              <NavigationContainer theme={navigationTheme}>
                <RootNavigator />
              </NavigationContainer>
              <SosButton />
            </AppAlertProvider>
          </BottomSheetModalProvider>
          <Toast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
