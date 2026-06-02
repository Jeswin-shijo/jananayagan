import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {Pressable, View, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {AppColors} from '@constants/colors';
import {BorderRadius, Spacing} from '@constants/spacing';

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AppCard: React.FC<AppCardProps> = ({
  children,
  onPress,
  style,
  padding = Spacing[4],
}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.98, {damping: 16, stiffness: 260});
        }}
        onPressOut={() => {
          scale.value = withSpring(1, {damping: 14, stiffness: 220});
        }}
        style={[styles.card, {padding}, style, animatedStyle]}>
        {children}
      </AnimatedPressable>
    );
  }
  return <View style={[styles.card, {padding}, style]}>{children}</View>;
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});
