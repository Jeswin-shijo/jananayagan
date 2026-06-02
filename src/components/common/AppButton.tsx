import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {BorderRadius, Spacing} from '@constants/spacing';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, {damping: 16, stiffness: 260});
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {damping: 14, stiffness: 220});
      }}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant === 'primary' && styles.primaryShadow,
        style,
        animatedStyle,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
  },
  fullWidth: {width: '100%'},
  disabled: {opacity: 0.5},

  primary: {backgroundColor: Colors.primary},
  secondary: {backgroundColor: Colors.secondary},
  outline: {backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary},
  danger: {backgroundColor: Colors.danger},
  ghost: {backgroundColor: 'transparent'},
  primaryShadow: {
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },

  size_sm: {paddingVertical: Spacing[2], paddingHorizontal: Spacing[4], minHeight: 38},
  size_md: {paddingVertical: Spacing[3], paddingHorizontal: Spacing[6], minHeight: 48},
  size_lg: {paddingVertical: Spacing[4], paddingHorizontal: Spacing[8], minHeight: 56},

  text: {fontWeight: FontWeight.semiBold, letterSpacing: 0},
  text_primary: {color: Colors.white},
  text_secondary: {color: Colors.white},
  text_outline: {color: Colors.primary},
  text_danger: {color: Colors.white},
  text_ghost: {color: Colors.primary},

  textSize_sm: {fontSize: FontSize.sm},
  textSize_md: {fontSize: FontSize.base},
  textSize_lg: {fontSize: FontSize.md},
});
