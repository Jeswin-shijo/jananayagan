import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text} from 'react-native';
import {AppColors} from '@constants/colors';
import {FontSize} from '@constants/typography';
import {BorderRadius, Spacing} from '@constants/spacing';

interface AppProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

export const AppProgressBar: React.FC<AppProgressBarProps> = ({current, total, label, showPercentage = true}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Text style={styles.count}>
              {current.toLocaleString()} / {total.toLocaleString()}
            </Text>
          )}
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, {width: `${percentage}%`}]} />
      </View>
    </View>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {marginVertical: Spacing[1]},
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[1],
  },
  label: {fontSize: FontSize.sm, color: Colors.textSecondary},
  count: {fontSize: FontSize.sm, color: Colors.text, fontWeight: '600'},
  track: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
} as const);
