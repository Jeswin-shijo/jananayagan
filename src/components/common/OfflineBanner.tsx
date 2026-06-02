import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text, StyleSheet} from 'react-native';
import {AppColors} from '@constants/colors';
import {FontSize} from '@constants/typography';
import {Spacing} from '@constants/spacing';
import {useNetworkStatus} from '@hooks/useNetworkStatus';

export const OfflineBanner: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {isConnected} = useNetworkStatus();

  if (isConnected !== false) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>📵 You're offline. Some features may not work.</Text>
    </View>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  banner: {
    backgroundColor: Colors.warning,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    alignItems: 'center',
  },
  text: {color: Colors.white, fontSize: FontSize.sm, fontWeight: '600'},
});
