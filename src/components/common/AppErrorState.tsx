import React from 'react';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {BorderRadius, Spacing} from '@constants/spacing';
import {AppButton} from './AppButton';
import {AppStrings} from '@constants/strings';

interface AppErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const AppErrorState: React.FC<AppErrorStateProps> = ({
  message = AppStrings.errorGeneric,
  onRetry,
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.container}>
      <View style={styles.iconBubble}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <AppButton
          title={AppStrings.retry}
          onPress={onRetry}
          variant="outline"
          fullWidth={false}
          style={styles.btn}
        />
      )}
    </Animated.View>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[8],
  },
  iconBubble: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  icon: {fontSize: 38},
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[2],
  },
  message: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  btn: {paddingHorizontal: Spacing[8]},
});
