import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useAuthStore} from '@store/authStore';
import {SosEmergencyModal} from '@components/common/SosEmergencyModal';
import {AppColors} from '@constants/colors';
import {FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const SosButton: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [visible, setVisible] = useState(false);

  // Every authenticated user (any role / gender) gets the always-on SOS affordance.
  if (!isAuthenticated) {
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
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0322A',
    shadowColor: '#E0322A',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1, marginTop: 1},
} as const);
