import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {View, ActivityIndicator, Text} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {AppColors} from '@constants/colors';
import {FontSize} from '@constants/typography';

interface AppLoaderProps {
  fullScreen?: boolean;
  message?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({fullScreen = false, message}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  if (fullScreen) {
    return (
      <Animated.View entering={FadeIn.duration(350)} style={styles.fullScreen}>
        <View style={styles.loaderBubble}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
        {message && <Text style={styles.message}>{message}</Text>}
      </Animated.View>
    );
  }
  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={Colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const createStyles = (Colors: AppColors) => ({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  inline: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  message: {
    marginTop: 12,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
} as const);
