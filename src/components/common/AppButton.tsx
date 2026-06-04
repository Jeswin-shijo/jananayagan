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
import {LinearGradient} from 'react-native-linear-gradient';
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
  const isGradient = variant === 'primary' || variant === 'secondary';
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
        isGradient && styles.gradientBase,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        isGradient && styles.primaryShadow,
        style,
        animatedStyle,
      ]}>
      {isGradient && (
        <LinearGradient
          colors={variant === 'primary'
            ? [Colors.primaryDark, Colors.primary, Colors.secondary]
            : [Colors.secondaryDark, Colors.secondary, Colors.primary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFill}
        />
      )}
      {loading
        ? (
          <ActivityIndicator
            color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textOnPrimary}
            size="small"
          />
        )
        : (
          <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
            {title}
          </Text>
        )}
    </AnimatedPressable>
  );
};

const createStyles = (Colors: AppColors) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  fullWidth: {width: '100%'},
  disabled: {opacity: 0.5},
  gradientBase: {backgroundColor: Colors.primary},

  primary: {backgroundColor: Colors.primary},
  secondary: {backgroundColor: Colors.secondary},
  outline: {backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border},
  danger: {backgroundColor: Colors.danger},
  ghost: {backgroundColor: Colors.primaryLight},
  primaryShadow: {
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 5,
  },

  size_sm: {paddingVertical: Spacing[2], paddingHorizontal: Spacing[4], minHeight: 38},
  size_md: {paddingVertical: Spacing[3], paddingHorizontal: Spacing[6], minHeight: 48},
  size_lg: {paddingVertical: Spacing[4], paddingHorizontal: Spacing[8], minHeight: 56},

  text: {fontWeight: FontWeight.semiBold, letterSpacing: 0},
  text_primary: {color: Colors.textOnPrimary},
  text_secondary: {color: Colors.textOnPrimary},
  text_outline: {color: Colors.primary},
  text_danger: {color: Colors.white},
  text_ghost: {color: Colors.primary},

  textSize_sm: {fontSize: FontSize.sm},
  textSize_md: {fontSize: FontSize.base},
  textSize_lg: {fontSize: FontSize.md},
} as const);
