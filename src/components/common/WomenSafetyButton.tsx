import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {useAuthStore} from '@store/authStore';
import {navigate} from '@navigation/navigationRef';
import {AppColors} from '@constants/colors';
import {FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

// Floating entry point to the Women Safety hub. Replaces the old SOS button —
// the hub itself still holds the SOS press-and-hold affordance.
export const WomenSafetyButton: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const role = useAuthStore(s => s.role);

  // Women Safety hub lives in the citizen navigator, so only surface it there.
  if (!isAuthenticated || role !== 'citizen') {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[styles.host, {bottom: insets.bottom + 86}]}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigate('WomenSafety')}
        activeOpacity={0.85}>
        <MaterialCommunityIcons name="shield-account" size={22} color="#FFFFFF" />
        <Text style={styles.fabText}>SAFETY</Text>
      </TouchableOpacity>
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
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: 9, letterSpacing: 0.5, marginTop: 1},
} as const);
