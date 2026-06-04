import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppColors} from '@constants/colors';
import {FontSize} from '@constants/typography';
import {Spacing} from '@constants/spacing';
import {useNetworkStatus} from '@hooks/useNetworkStatus';
import {useTranslation} from '@hooks/useTranslation';

export const OfflineBanner: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {isConnected} = useNetworkStatus();

  if (isConnected !== false) return null;

  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="wifi-off" size={16} color={Colors.white} />
      <Text style={styles.text}>{t('offlineMessage')}</Text>
    </View>
  );
};

const createStyles = (Colors: AppColors) => ({
  banner: {
    backgroundColor: Colors.warning,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  text: {color: Colors.white, fontSize: FontSize.sm, fontWeight: '600'},
} as const);
