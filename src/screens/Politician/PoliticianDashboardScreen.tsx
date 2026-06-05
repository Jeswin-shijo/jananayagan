import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {PoliticianDrawerParamList} from '@appTypes/navigation';
import {AppCard} from '@components/common/AppCard';
import {AppBadge} from '@components/common/AppBadge';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAuthStore} from '@store/authStore';
import {MOCK_COMPLAINTS} from '@utils/mockData';
import {MOCK_DASHBOARD_STATS, MOCK_DASHBOARD_CATEGORIES, DashboardStat} from '@utils/politicianData';
import {formatRelativeTime} from '@utils/formatters';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TranslationKey} from '@constants/i18n';

type Nav = NativeStackNavigationProp<PoliticianDrawerParamList>;
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const NAV_ACTIONS: {icon: MaterialCommunityIconName; labelKey: TranslationKey; screen: keyof PoliticianDrawerParamList}[] = [
  {icon: 'account-group-outline', labelKey: 'volunteers', screen: 'VolunteerManagement'},
  {icon: 'brain', labelKey: 'aiSentiment', screen: 'AISentimentDashboard'},
  {icon: 'vote-outline', labelKey: 'electionMode', screen: 'ElectionMode'},
];

export const PoliticianDashboardScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const statTone: Record<DashboardStat['tone'], string> = {
    primary: Colors.primaryLight,
    success: Colors.successLight,
    warning: Colors.warningLight,
    danger: Colors.dangerLight,
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('dashboard')} subtitle={user?.constituency ?? t('constituencyDashboard')} />
      <OfflineBanner />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[Colors.primaryLight, Colors.surface, Colors.secondaryLight]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <View>
            <Text style={styles.greeting}>{t('constituencyDashboard')}</Text>
            <Text style={styles.name}>{user?.name ?? t('politician')}</Text>
            {user?.constituency && <Text style={styles.constituency}>{user.constituency}</Text>}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {MOCK_DASHBOARD_STATS.map(stat => (
            <View key={stat.labelKey} style={[styles.statCard, {backgroundColor: statTone[stat.tone]}]}>
              <View style={styles.statIconBubble}>
                <MaterialCommunityIcons name={stat.icon as MaterialCommunityIconName} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              {stat.sub && <Text style={styles.statSub}>{stat.sub}</Text>}
              <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
            </View>
          ))}
        </View>

        {/* Quick Nav */}
        <View style={styles.navRow}>
          {NAV_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.screen}
              onPress={() => navigation.navigate(action.screen as any)}
              style={styles.navCard}>
              <View style={styles.navIconBubble}>
                <MaterialCommunityIcons name={action.icon} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.navLabel}>{t(action.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Breakdown */}
        <Text style={styles.sectionTitle}>{t('complaintsByCategory')}</Text>
        <AppCard>
          {MOCK_DASHBOARD_CATEGORIES.map(row => (
            <View key={row.categoryKey} style={styles.catRow}>
              <Text style={styles.catLabel}>{t(row.categoryKey)}</Text>
              <View style={styles.catBarWrapper}>
                <View style={[styles.catBar, {width: `${row.pct}%`}]} />
              </View>
              <Text style={styles.catCount}>{row.count}</Text>
            </View>
          ))}
        </AppCard>

        {/* Recent Complaints */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('recentComplaints')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Complaints')}>
            <Text style={styles.seeAll}>{t('seeAll')}</Text>
          </TouchableOpacity>
        </View>
        {MOCK_COMPLAINTS.map(c => (
          <AppCard key={c.id} onPress={() => navigation.navigate('Complaints')}>
            <View style={styles.complaintRow}>
              <View style={styles.complaintInfo}>
                <Text style={styles.complaintDesc} numberOfLines={1}>{c.description}</Text>
                <Text style={styles.complaintMeta}>{c.location.address} · {formatRelativeTime(c.createdAt)}</Text>
              </View>
              <AppBadge status={c.status} />
            </View>
            <TouchableOpacity style={styles.assignBtn} onPress={() => navigation.navigate('Complaints')}>
              <Text style={styles.assignText}>{t('assignVolunteer')}</Text>
            </TouchableOpacity>
          </AppCard>
        ))}

        <View style={{height: Spacing[8]}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {
    padding: Spacing[5],
    margin: Spacing[4],
    marginBottom: Spacing[3],
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  greeting: {fontSize: FontSize.sm, color: Colors.textSecondary},
  name: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  constituency: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500'},
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[4],
  },
  statCard: {
    width: '48%',
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  statIconBubble: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginBottom: Spacing[2],
  },
  statValue: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text},
  statSub: {fontSize: FontSize.sm, color: Colors.success, fontWeight: '600'},
  statLabel: {fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 2},
  navRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  navCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navIconBubble: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing[2],
  },
  navLabel: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: Colors.text},
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: Spacing[4],
  },
  seeAll: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold},
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  catLabel: {width: 110, fontSize: FontSize.sm, color: Colors.text},
  catBarWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginHorizontal: Spacing[2],
  },
  catBar: {height: '100%', backgroundColor: Colors.primary, borderRadius: BorderRadius.full},
  catCount: {width: 30, fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right'},
  complaintRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  complaintInfo: {flex: 1, marginRight: Spacing[2]},
  complaintDesc: {fontSize: FontSize.base, color: Colors.text, fontWeight: '500'},
  complaintMeta: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  assignBtn: {marginTop: Spacing[2]},
  assignText: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500'},
} as const);
