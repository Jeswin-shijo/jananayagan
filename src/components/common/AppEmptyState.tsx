import React from 'react';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {BorderRadius, Spacing} from '@constants/spacing';
import {AppButton} from './AppButton';

interface AppEmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCTAPress?: () => void;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  icon = '📭',
  title,
  subtitle,
  ctaLabel,
  onCTAPress,
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.container}>
      <View style={styles.iconBubble}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {ctaLabel && onCTAPress && (
        <AppButton
          title={ctaLabel}
          onPress={onCTAPress}
          style={styles.cta}
          fullWidth={false}
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
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  icon: {fontSize: 44},
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing[6],
  },
  cta: {paddingHorizontal: Spacing[6]},
});
