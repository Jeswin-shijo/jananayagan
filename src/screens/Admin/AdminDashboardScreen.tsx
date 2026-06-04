import React, {useState} from 'react';
import {View, Text, ScrollView, RefreshControl, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_ADMIN_STATS, MOCK_USERS} from '@utils/adminData';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const TONES: Record<string, {bg: keyof AppColors; fg: keyof AppColors}> = {
  info: {bg: 'tileBlue', fg: 'info'},
  success: {bg: 'tileGreen', fg: 'success'},
  warning: {bg: 'tileAmber', fg: 'warning'},
  purple: {bg: 'tilePurple', fg: 'statusInProgress'},
};

const NAV: {icon: MaterialCommunityIconName; labelKey: TranslationKey; route: string}[] = [
  {icon: 'account-multiple-outline', labelKey: 'userManagement', route: 'UserManagement'},
  {icon: 'map-outline', labelKey: 'constituencies', route: 'Constituencies'},
  {icon: 'shield-alert-outline', labelKey: 'moderation', route: 'Moderation'},
];

export const AdminDashboardScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const pending = MOCK_USERS.filter(u => u.status === 'pending');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('adminDashboard')} subtitle={t('platformOverview')} />
      <OfflineBanner />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        <View style={styles.grid}>
          {MOCK_ADMIN_STATS.map(s => {
            const tone = TONES[s.tone];
            return (
              <View key={s.key} style={styles.statCard}>
                <View style={[styles.statIcon, {backgroundColor: Colors[tone.bg]}]}>
                  <MaterialCommunityIcons name={s.icon as MaterialCommunityIconName} size={20} color={Colors[tone.fg]} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{t(s.labelKey)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.navRow}>
          {NAV.map(n => (
            <TouchableOpacity key={n.route} style={styles.navCard} onPress={() => navigation.navigate(n.route)}>
              <View style={styles.navIcon}>
                <MaterialCommunityIcons name={n.icon} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.navLabel}>{t(n.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('pendingApprovals')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('UserManagement')}>
            <Text style={styles.seeAll}>{t('seeAll')}</Text>
          </TouchableOpacity>
        </View>
        {pending.map(u => (
          <AppCard key={u.id} onPress={() => navigation.navigate('UserManagement')}>
            <View style={styles.userRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{u.name.charAt(0)}</Text></View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userMeta}>{t(u.role)} · {u.constituency}</Text>
              </View>
              <View style={styles.pendingPill}>
                <Text style={styles.pendingText}>{t('pending')}</Text>
              </View>
            </View>
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
  grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  statCard: {width: '48%', backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing[4], marginBottom: Spacing[3], borderWidth: 1, borderColor: Colors.borderLight},
  statIcon: {width: 38, height: 38, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[2]},
  statValue: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text},
  statLabel: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  navRow: {flexDirection: 'row', gap: Spacing[2], marginVertical: Spacing[2]},
  navCard: {flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing[3], alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight},
  navIcon: {width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[1]},
  navLabel: {fontSize: 10, color: Colors.text, fontWeight: FontWeight.medium, textAlign: 'center'},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing[4], marginBottom: Spacing[3]},
  sectionTitle: {fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.text},
  seeAll: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold},
  userRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3]},
  avatar: {width: 42, height: 42, borderRadius: BorderRadius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: Colors.textOnPrimary, fontWeight: FontWeight.bold},
  userInfo: {flex: 1},
  userName: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  userMeta: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  pendingPill: {backgroundColor: Colors.warningLight, paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full},
  pendingText: {fontSize: FontSize.xs, color: Colors.warning, fontWeight: FontWeight.semiBold},
} as const);
