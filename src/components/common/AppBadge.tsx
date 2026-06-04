import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {AppColors} from '@constants/colors';
import {View, Text} from 'react-native';
import {ComplaintStatus} from '@appTypes/api';
import {getStatusLabel} from '@utils/formatters';
import {FontSize} from '@constants/typography';
import {BorderRadius, Spacing} from '@constants/spacing';

interface AppBadgeProps {
  status: ComplaintStatus;
}

const statusColorKey: Record<ComplaintStatus, keyof AppColors> = {
  submitted: 'statusSubmitted',
  under_review: 'statusUnderReview',
  in_progress: 'statusInProgress',
  resolved: 'statusResolved',
  rejected: 'statusRejected',
};

export const AppBadge: React.FC<AppBadgeProps> = ({status}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const color = Colors[statusColorKey[status]] ?? Colors.statusSubmitted;
  return (
    <View style={[styles.badge, {backgroundColor: color + '20', borderColor: color}]}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <Text style={[styles.text, {color}]}>{getStatusLabel(status)}</Text>
    </View>
  );
};

const createStyles = (_Colors: AppColors) => ({
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
} as const);
