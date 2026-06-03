import React from 'react';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {Pressable, Text, StyleSheet, ViewStyle} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {AppColors} from '@constants/colors';
import {FontSize} from '@constants/typography';
import {BorderRadius, Spacing} from '@constants/spacing';

interface AppChipProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AppChip: React.FC<AppChipProps> = ({
  label,
  isActive = false,
  onPress,
  style,
}) => {
  const styles = useThemedStyles(createStyles);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, {damping: 16, stiffness: 260});
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {damping: 14, stiffness: 220});
      }}
      style={[styles.chip, isActive ? styles.active : styles.inactive, style, animatedStyle]}>
      <Text style={[styles.text, isActive ? styles.activeText : styles.inactiveText]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing[2],
  },
  active: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  inactive: {backgroundColor: Colors.surface, borderColor: Colors.border},
  text: {fontSize: FontSize.sm, fontWeight: '600'},
  activeText: {color: Colors.textOnPrimary},
  inactiveText: {color: Colors.textSecondary},
});
