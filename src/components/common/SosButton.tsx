import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useAuthStore} from '@store/authStore';
import {SosEmergencyModal} from '@components/common/SosEmergencyModal';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const SosButton: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const {isAuthenticated, user} = useAuthStore();
  const [visible, setVisible] = useState(false);

  // Only authenticated female users get the always-on floating SOS affordance.
  if (!isAuthenticated || user?.gender !== 'female') {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[styles.host, {bottom: insets.bottom + 86}]}>
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)} activeOpacity={0.85}>
        <MaterialCommunityIcons name="shield-alert" size={20} color={Colors.white} />
        <Text style={styles.fabText}>SOS</Text>
      </TouchableOpacity>
      <SosEmergencyModal visible={visible} onClose={() => setVisible(false)} />
    </View>
  );
};

const createStyles = (_Colors: AppColors) => ({
  host: {position: 'absolute', left: Spacing[4], zIndex: 60},
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[3],
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: '#E0322A',
    shadowColor: '#E0322A',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.sm, letterSpacing: 1},
} as const);
