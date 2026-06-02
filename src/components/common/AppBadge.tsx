import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {AppColors} from '@constants/colors';
import {View, Text, StyleSheet} from 'react-native';
import {ComplaintStatus} from '@appTypes/api';
import {getStatusColor, getStatusLabel} from '@utils/formatters';
import {FontSize} from '@constants/typography';
import {BorderRadius, Spacing} from '@constants/spacing';

interface AppBadgeProps {
  status: ComplaintStatus;
}

export const AppBadge: React.FC<AppBadgeProps> = ({status}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const color = getStatusColor(status);
  return (
    <View style={[styles.badge, {backgroundColor: color + '20', borderColor: color}]}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <Text style={[styles.text, {color}]}>{getStatusLabel(status)}</Text>
    </View>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {width: 6, height: 6, borderRadius: 3, marginRight: Spacing[1]},
  text: {fontSize: FontSize.xs, fontWeight: '600'},
});
