import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {StyleSheet} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAuthStore} from '@store/authStore';
import {MOCK_VOLUNTEER_STATS, MOCK_BROADCASTS} from '@utils/volunteerData';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const TONES: Record<string, {bg: keyof AppColors; fg: keyof AppColors}> = {
  info: {bg: 'tileBlue', fg: 'info'},
  warning: {bg: 'tileAmber', fg: 'warning'},
  success: {bg: 'tileGreen', fg: 'success'},
};

export const VolunteerHomeScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('volunteer')}</Text>
            <Text style={styles.name}>{user?.name ?? t('volunteer')}</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'V'}</Text></View>
        </View>

        <View style={styles.statsRow}>
          {MOCK_VOLUNTEER_STATS.map(s => {
            const tone = TONES[s.tone];
            return (
              <View key={s.key} style={styles.statCard}>
                <View style={[styles.statIcon, {backgroundColor: Colors[tone.bg]}]}>
                  <MaterialCommunityIcons name={s.icon as MaterialCommunityIconName} size={18} color={Colors[tone.fg]} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{t(s.labelKey)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('VolunteerTasks')}>
            <LinearGradient colors={[Colors.primaryDark, Colors.primary]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={StyleSheet.absoluteFill} />
            <MaterialCommunityIcons name="clipboard-check-outline" size={26} color={Colors.white} />
            <Text style={styles.quickLabel}>{t('myTasks')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('FieldWork')}>
            <LinearGradient colors={[Colors.secondaryDark, Colors.secondary]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={StyleSheet.absoluteFill} />
            <MaterialCommunityIcons name="map-marker-radius-outline" size={26} color={Colors.white} />
            <Text style={styles.quickLabel}>{t('fieldWork')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('broadcasts')}</Text>
        {MOCK_BROADCASTS.map(b => (
          <AppCard key={b.id}>
            <View style={styles.bRow}>
              <View style={styles.bIcon}>
                <MaterialCommunityIcons name="bullhorn-outline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.bFrom}>{b.from}</Text>
              <Text style={styles.bAgo}>{t('agoShort', {time: b.ago})}</Text>
            </View>
            <Text style={styles.bMsg}>{b.message}</Text>
          </AppCard>
        ))}
        <View style={{height: Spacing[8]}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[4]},
  greeting: {fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium},
  name: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text},
  avatar: {width: 46, height: 46, borderRadius: BorderRadius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: Colors.textOnPrimary, fontWeight: FontWeight.bold, fontSize: FontSize.md},
  statsRow: {flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[4]},
  statCard: {flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing[3], alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight},
  statIcon: {width: 34, height: 34, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[1]},
  statValue: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  statLabel: {fontSize: 10, color: Colors.textSecondary, textAlign: 'center', marginTop: 2},
  quickRow: {flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[4]},
  quickCard: {flex: 1, height: 96, borderRadius: BorderRadius.xl, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', gap: Spacing[2]},
  quickLabel: {color: Colors.white, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm},
  sectionTitle: {fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.text, marginBottom: Spacing[3]},
  bRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2]},
  bIcon: {width: 30, height: 30, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center'},
  bFrom: {flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  bAgo: {fontSize: FontSize.xs, color: Colors.textDisabled},
  bMsg: {fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20},
} as const);
