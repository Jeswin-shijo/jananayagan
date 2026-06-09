import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAuthStore} from '@store/authStore';
import {MOCK_COMPLAINTS} from '@utils/mockData';
import {MOCK_DASHBOARD_STATS, MOCK_DASHBOARD_CATEGORIES, DashboardStat} from '@utils/politicianData';
import {formatRelativeTime} from '@utils/formatters';
import {ComplaintStatus} from '@appTypes/api';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TranslationKey} from '@constants/i18n';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const STAT_BG: Record<DashboardStat['tone'], string> = {
  primary: '#EFF6FF',
  success: '#F0FDF4',
  warning: '#FFFBEB',
  danger: '#FFF1F2',
};

const STAT_COLOR: Record<DashboardStat['tone'], string> = {
  primary: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};

const STAT_WATERMARK: Record<string, MaterialCommunityIconName> = {
  totalComplaints: 'file-document-outline',
  resolved: 'shield-check-outline',
  inProgress: 'cog-outline',
  pending: 'timer-sand',
};

const CATEGORY_META: Record<string, {icon: MaterialCommunityIconName; color: string; bg: string}> = {
  road: {icon: 'road-variant', color: '#F59E0B', bg: '#FEF3C7'},
  water: {icon: 'water', color: '#3B82F6', bg: '#DBEAFE'},
  electricity: {icon: 'lightning-bolt', color: '#EAB308', bg: '#FEF9C3'},
  sanitation: {icon: 'trash-can-outline', color: '#22C55E', bg: '#DCFCE7'},
};

const COMPLAINT_CATEGORY = (desc: string): {icon: MaterialCommunityIconName; color: string; bg: string} => {
  const d = desc.toLowerCase();
  if (d.includes('road') || d.includes('pothole') || d.includes('street')) return CATEGORY_META.road;
  if (d.includes('water') || d.includes('pipe') || d.includes('leak')) return CATEGORY_META.water;
  if (d.includes('light') || d.includes('electric')) return CATEGORY_META.electricity;
  if (d.includes('sanit') || d.includes('drain') || d.includes('garbage')) return CATEGORY_META.sanitation;
  return {icon: 'alert-circle-outline', color: '#6B7280', bg: '#F3F4F6'};
};

const BADGE_CONFIG: Record<ComplaintStatus, {labelKey: TranslationKey; color: string; dot: string}> = {
  submitted: {labelKey: 'submitted', color: '#2563EB', dot: '#3B82F6'},
  under_review: {labelKey: 'underReview', color: '#7C3AED', dot: '#8B5CF6'},
  in_progress: {labelKey: 'inProgress', color: '#7C3AED', dot: '#8B5CF6'},
  resolved: {labelKey: 'resolved', color: '#16A34A', dot: '#22C55E'},
  rejected: {labelKey: 'pdashRejected', color: '#6B7280', dot: '#9CA3AF'},
};

const NAV_ACTIONS: {icon: MaterialCommunityIconName; labelKey: TranslationKey; screen: string; iconColor: string; iconBg: string; stack?: boolean}[] = [
  {icon: 'account-group-outline', labelKey: 'volunteers', screen: 'VolunteerManagement', iconColor: '#3B82F6', iconBg: '#EFF6FF'},
  {icon: 'brain', labelKey: 'aiSentiment', screen: 'AISentimentDashboard', iconColor: '#8B5CF6', iconBg: '#F5F3FF'},
  {icon: 'file-document-edit-outline', labelKey: 'petition', screen: 'PetitionManagement', iconColor: '#3B82F6', iconBg: '#EFF6FF'},
  {icon: 'vote-outline', labelKey: 'electionMode', screen: 'ElectionMode', iconColor: '#F59E0B', iconBg: '#FFFBEB'},
];

const StatusBadge: React.FC<{status: ComplaintStatus}> = ({status}) => {
  const {t} = useTranslation();
  const cfg = BADGE_CONFIG[status] ?? BADGE_CONFIG.submitted;
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: cfg.color + '14', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: cfg.color + '30'}}>
      <View style={{width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.dot}} />
      <Text style={{color: cfg.color, fontSize: 10, fontWeight: '600'}}>{t(cfg.labelKey)}</Text>
    </View>
  );
};

export const PoliticianDashboardScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);
  const {width} = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const statCardWidth = (width - Spacing[4] * 2 - Spacing[3]) / 2;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const goDrawer = (screen: string) => navigation.navigate(screen as never);
  const goStack = (screen: string) => {
    const parent = navigation.getParent?.() as any;
    parent ? parent.navigate(screen) : navigation.navigate(screen as never);
  };

  const recentComplaints = MOCK_COMPLAINTS.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('dashboard')} subtitle={user?.constituency ?? t('constituencyDashboard')} />
      <OfflineBanner />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#F0F7FF', '#EBF5FF', '#F8FBFF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroLeft}>
            <Text style={styles.heroSub}>{t('constituencyDashboard')}</Text>
            <Text style={styles.heroName}>{user?.name ?? t('politician')}</Text>
            {user?.constituency && (
              <View style={styles.heroLoc}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#2563EB" />
                <Text style={styles.heroLocText}>{user.constituency}</Text>
              </View>
            )}
          </View>
          <View style={styles.heroDecor}>
            <MaterialCommunityIcons name="domain" size={90} color="#93C5FD" style={{opacity: 0.35}} />
            <MaterialCommunityIcons name="office-building-outline" size={60} color="#BFDBFE" style={{opacity: 0.5, position: 'absolute', right: 24, bottom: 8}} />
          </View>
        </View>

        {/* Stats 2×2 grid */}
        <View style={styles.statsGrid}>
          {MOCK_DASHBOARD_STATS.map(stat => {
            const bg = STAT_BG[stat.tone];
            const color = STAT_COLOR[stat.tone];
            const watermark = STAT_WATERMARK[stat.labelKey] ?? 'circle-outline';
            return (
              <View key={stat.labelKey} style={[styles.statCard, {backgroundColor: bg, width: statCardWidth}]}>
                <View style={[styles.statIconBubble, {backgroundColor: '#FFFFFF'}]}>
                  <MaterialCommunityIcons name={stat.icon as MaterialCommunityIconName} size={20} color={color} />
                </View>
                <View style={styles.statBody}>
                  <Text style={[styles.statValue, {color: '#1E293B'}]}>{stat.value}</Text>
                  {stat.sub && <Text style={[styles.statSub, {color}]}>{stat.sub}</Text>}
                  <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
                </View>
                <MaterialCommunityIcons
                  name={watermark}
                  size={72}
                  color={color}
                  style={styles.statWatermark}
                />
              </View>
            );
          })}
        </View>

        {/* Quick nav — 4 items */}
        <View style={styles.navRow}>
          {NAV_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.screen + action.labelKey}
              onPress={() => action.stack ? goStack(action.screen) : goDrawer(action.screen)}
              style={styles.navCard}
              activeOpacity={0.75}>
              <View style={[styles.navIconBubble, {backgroundColor: action.iconBg}]}>
                <MaterialCommunityIcons name={action.icon} size={22} color={action.iconColor} />
              </View>
              <Text style={styles.navLabel}>{t(action.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Complaints by category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('complaintsByCategory')}</Text>
          <TouchableOpacity onPress={() => goDrawer('Complaints')} style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            <MaterialCommunityIcons name="arrow-right" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.categoryCard}>
          {MOCK_DASHBOARD_CATEGORIES.map((row, i) => {
            const meta = CATEGORY_META[row.categoryKey] ?? {icon: 'circle-outline', color: '#6B7280', bg: '#F3F4F6'};
            return (
              <View key={row.categoryKey} style={[styles.catRow, i < MOCK_DASHBOARD_CATEGORIES.length - 1 && styles.catDivider]}>
                <View style={[styles.catIconTile, {backgroundColor: meta.bg}]}>
                  <MaterialCommunityIcons name={meta.icon} size={16} color={meta.color} />
                </View>
                <Text style={styles.catLabel}>{t(row.categoryKey)}</Text>
                <View style={styles.catBarWrapper}>
                  <View style={[styles.catBar, {width: `${row.pct}%`, backgroundColor: Colors.primary}]} />
                </View>
                <Text style={styles.catCount}>{row.count}</Text>
              </View>
            );
          })}
        </View>

        {/* Recent complaints */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('recentComplaints')}</Text>
          <TouchableOpacity onPress={() => goDrawer('Complaints')} style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>{t('seeAll')}</Text>
            <MaterialCommunityIcons name="arrow-right" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.complaintsCard}>
          {recentComplaints.map((c, i) => {
            const cat = COMPLAINT_CATEGORY(c.description);
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.7}
                onPress={() => goDrawer('Complaints')}
                style={[styles.complaintRow, i < recentComplaints.length - 1 && styles.complaintDivider]}>
                <View style={[styles.complaintIcon, {backgroundColor: cat.bg}]}>
                  <MaterialCommunityIcons name={cat.icon} size={20} color={cat.color} />
                </View>
                <View style={styles.complaintInfo}>
                  <Text style={styles.complaintDesc} numberOfLines={1}>{c.description}</Text>
                  <Text style={styles.complaintMeta}>{c.location.address} · {formatRelativeTime(c.createdAt)}</Text>
                </View>
                <View style={styles.complaintRight}>
                  <StatusBadge status={c.status} />
                  <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textDisabled} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{height: Spacing[10]}} />
      </ScrollView>

    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {paddingBottom: Spacing[4]},

  // Hero
  heroCard: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[4],
    marginBottom: Spacing[3],
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[5],
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  heroLeft: {flex: 1},
  heroSub: {fontSize: FontSize.xs, color: '#94A3B8', marginBottom: 4},
  heroName: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: '#1E293B'},
  heroLoc: {flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4},
  heroLocText: {fontSize: FontSize.sm, color: '#2563EB', fontWeight: FontWeight.semiBold},
  heroDecor: {position: 'absolute' as const, right: -8, bottom: -16},

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  statCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBubble: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statBody: {gap: 1},
  statValue: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold},
  statSub: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold},
  statLabel: {fontSize: FontSize.xs, color: '#64748B', marginTop: 2},
  statWatermark: {
    position: 'absolute' as const,
    right: -8,
    bottom: -8,
    opacity: 0.12,
  },

  // Quick nav
  navRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  navCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[2],
    alignItems: 'center',
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  navIconBubble: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {fontSize: 10, fontWeight: FontWeight.semiBold, color: Colors.text, textAlign: 'center'},

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[3],
  },
  sectionTitle: {fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text},
  viewAllBtn: {flexDirection: 'row', alignItems: 'center', gap: 2},
  viewAllText: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold},

  // Category
  categoryCard: {
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[5],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  catRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing[4], gap: Spacing[3]},
  catDivider: {borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
  catIconTile: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {width: 80, fontSize: FontSize.sm, color: Colors.text, fontWeight: '500'},
  catBarWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  catBar: {height: '100%', borderRadius: BorderRadius.full},
  catCount: {width: 28, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text, textAlign: 'right'},

  // Complaints
  complaintsCard: {
    marginHorizontal: Spacing[4],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  complaintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },
  complaintDivider: {borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
  complaintIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  complaintInfo: {flex: 1},
  complaintDesc: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  complaintMeta: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  complaintRight: {flexDirection: 'row', alignItems: 'center', gap: 4},

} as const);
