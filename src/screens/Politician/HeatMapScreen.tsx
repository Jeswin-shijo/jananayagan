import React, {useState} from 'react';
import {View, Text, ScrollView, RefreshControl, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {toastInfo} from '@utils/toast';
import {AppCard} from '@components/common/AppCard';
import {AppBadge} from '@components/common/AppBadge';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {ConstituencyHeatMap, HEAT_COLORS} from '@components/common/ConstituencyHeatMap';
import {
  MOCK_WARDS,
  MOCK_CONSTITUENCY_STATS,
  MOCK_TOP_ISSUES,
  MOCK_PRIORITY_ISSUES,
} from '@utils/politicianData';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const STAT_TONES: Record<string, {bg: keyof AppColors; fg: keyof AppColors}> = {
  danger: {bg: 'dangerLight', fg: 'danger'},
  warning: {bg: 'warningLight', fg: 'warning'},
  success: {bg: 'successLight', fg: 'success'},
  info: {bg: 'infoLight', fg: 'info'},
};

const ISSUE_TONES: Record<string, {bg: keyof AppColors; fg: keyof AppColors}> = {
  info: {bg: 'tileBlue', fg: 'info'},
  warning: {bg: 'tileAmber', fg: 'warning'},
  purple: {bg: 'tilePurple', fg: 'statusInProgress'},
  success: {bg: 'tileGreen', fg: 'success'},
  neutral: {bg: 'borderLight', fg: 'textSecondary'},
};

export const HeatMapScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const goToComplaints = () => navigation.navigate('Complaints');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('constituencyHeatMap')} subtitle={t('heatMapSubtitle')} />
      <OfflineBanner />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterChip} onPress={() => toastInfo(t('allWards'))}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.filterText}>{t('allWards')}</Text>
            <MaterialCommunityIcons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip} onPress={() => toastInfo(t('thisMonth'))}>
            <MaterialCommunityIcons name="calendar-range" size={16} color={Colors.textSecondary} />
            <Text style={styles.filterText}>{t('thisMonth')}</Text>
            <MaterialCommunityIcons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stat cards */}
        <View style={styles.statsGrid}>
          {MOCK_CONSTITUENCY_STATS.map(stat => {
            const tone = STAT_TONES[stat.tone];
            return (
              <View key={stat.key} style={styles.statCard}>
                <View style={styles.statTop}>
                  <Text style={styles.statLabel}>{t(stat.labelKey).toUpperCase()}</Text>
                  <View style={[styles.statIcon, {backgroundColor: Colors[tone.bg]}]}>
                    <MaterialCommunityIcons name={stat.icon as MaterialCommunityIconName} size={18} color={Colors[tone.fg]} />
                  </View>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <View style={styles.statDeltaRow}>
                  <MaterialCommunityIcons
                    name={stat.trendUp ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={stat.trendUp ? Colors.success : Colors.danger}
                  />
                  <Text style={[styles.statDelta, {color: stat.trendUp ? Colors.success : Colors.danger}]}>
                    {stat.delta}
                  </Text>
                  <Text style={styles.statDeltaSub}>{t('fromLastMonth')}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Heat map */}
        <ConstituencyHeatMap wards={MOCK_WARDS} />

        {/* Top issues */}
        <AppCard style={styles.block}>
          <Text style={styles.sectionTitle}>{t('topIssues')}</Text>
          {MOCK_TOP_ISSUES.map(issue => {
            const tone = ISSUE_TONES[issue.tone];
            return (
              <View key={issue.id} style={styles.issueRow}>
                <View style={[styles.issueIcon, {backgroundColor: Colors[tone.bg]}]}>
                  <MaterialCommunityIcons name={issue.icon as MaterialCommunityIconName} size={18} color={Colors[tone.fg]} />
                </View>
                <Text style={styles.issueLabel}>{t(issue.labelKey)}</Text>
                <View style={styles.issueBarWrap}>
                  <View style={[styles.issueBar, {width: `${issue.percentage}%`, backgroundColor: Colors[tone.fg]}]} />
                </View>
                <Text style={styles.issuePct}>{issue.percentage}%</Text>
              </View>
            );
          })}
          <TouchableOpacity style={styles.viewAll} onPress={goToComplaints}>
            <Text style={styles.viewAllText}>{t('viewAllIssues')}</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </AppCard>

        {/* Ward wise summary */}
        <AppCard style={styles.block}>
          <Text style={styles.sectionTitle}>{t('wardWiseSummary')}</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colWard]}>{t('ward')}</Text>
            <Text style={[styles.th, styles.colNum]}>{t('total')}</Text>
            <Text style={[styles.th, styles.colNum]}>{t('pending')}</Text>
            <Text style={[styles.th, styles.colNum]}>{t('resolved')}</Text>
          </View>
          {MOCK_WARDS.slice(0, 6).map(w => (
            <View key={w.id} style={styles.tableRow}>
              <View style={[styles.colWard, styles.wardCell]}>
                <View style={[styles.wardDot, {backgroundColor: HEAT_COLORS[w.intensity]}]} />
                <Text style={styles.wardName}>{w.name}</Text>
              </View>
              <Text style={[styles.td, styles.colNum]}>{w.total.toLocaleString()}</Text>
              <Text style={[styles.td, styles.colNum]}>{w.pending}</Text>
              <Text style={[styles.td, styles.colNum]}>{w.resolved}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.viewAll} onPress={goToComplaints}>
            <Text style={styles.viewAllText}>{t('viewAllWards')}</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </AppCard>

        {/* Recent high priority issues */}
        <AppCard style={styles.block}>
          <Text style={styles.sectionTitle}>{t('recentHighPriority')}</Text>
          {MOCK_PRIORITY_ISSUES.map(issue => (
            <View key={issue.id} style={styles.priorityRow}>
              <View style={styles.priorityThumb}>
                <MaterialCommunityIcons name="image-outline" size={20} color={Colors.textDisabled} />
              </View>
              <View style={styles.priorityInfo}>
                <View style={styles.priorityTitleRow}>
                  <View style={styles.priorityDot} />
                  <Text style={styles.priorityTitle} numberOfLines={1}>{issue.title}</Text>
                </View>
                <Text style={styles.priorityMeta} numberOfLines={1}>
                  {issue.ward}, {issue.area} · {t('agoShort', {time: issue.ago})}
                </Text>
              </View>
              <AppBadge status={issue.status} />
            </View>
          ))}
          <TouchableOpacity style={styles.viewAll} onPress={goToComplaints}>
            <Text style={styles.viewAllText}>{t('viewAllIssues')}</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </AppCard>

        <View style={{height: Spacing[8]}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  filterRow: {flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[4]},
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterText: {fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium},
  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: Spacing[4]},
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  statTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2]},
  statLabel: {fontSize: 9, fontWeight: FontWeight.bold, color: Colors.textSecondary, letterSpacing: 0.5, flex: 1},
  statIcon: {width: 32, height: 32, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center'},
  statValue: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text},
  statDeltaRow: {flexDirection: 'row', alignItems: 'center', marginTop: Spacing[1]},
  statDelta: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, marginLeft: 2},
  statDeltaSub: {fontSize: 10, color: Colors.textDisabled, marginLeft: 4},
  block: {marginTop: Spacing[4], marginBottom: 0},
  sectionTitle: {fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing[3]},
  issueRow: {flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[3]},
  issueIcon: {width: 32, height: 32, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing[2]},
  issueLabel: {width: 92, fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium},
  issueBarWrap: {flex: 1, height: 6, backgroundColor: Colors.borderLight, borderRadius: BorderRadius.full, overflow: 'hidden', marginHorizontal: Spacing[2]},
  issueBar: {height: '100%', borderRadius: BorderRadius.full},
  issuePct: {width: 36, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text, textAlign: 'right'},
  viewAll: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[1], marginTop: Spacing[2], paddingTop: Spacing[2]},
  viewAllText: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold},
  tableHead: {flexDirection: 'row', paddingBottom: Spacing[2], borderBottomWidth: 1, borderBottomColor: Colors.borderLight, marginBottom: Spacing[2]},
  th: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: Colors.textSecondary},
  td: {fontSize: FontSize.sm, color: Colors.text},
  colWard: {flex: 1.4},
  colNum: {flex: 1, textAlign: 'right'},
  tableRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing[2]},
  wardCell: {flexDirection: 'row', alignItems: 'center'},
  wardDot: {width: 8, height: 8, borderRadius: 4, marginRight: Spacing[2]},
  wardName: {fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium},
  priorityRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing[2], gap: Spacing[2]},
  priorityThumb: {width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center'},
  priorityInfo: {flex: 1},
  priorityTitleRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[1]},
  priorityDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger},
  priorityTitle: {flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  priorityMeta: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
} as const);
