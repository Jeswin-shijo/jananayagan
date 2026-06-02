import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {PoliticianStackParamList} from '@appTypes/navigation';
import {AppCard} from '@components/common/AppCard';
import {AppBadge} from '@components/common/AppBadge';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAuthStore} from '@store/authStore';
import {MOCK_COMPLAINTS} from '@utils/mockData';
import {formatRelativeTime} from '@utils/formatters';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type Nav = NativeStackNavigationProp<PoliticianStackParamList>;
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const NAV_ACTIONS: {icon: MaterialCommunityIconName; label: string; screen: keyof PoliticianStackParamList}[] = [
  {icon: 'account-group-outline', label: 'Volunteers', screen: 'VolunteerManagement'},
  {icon: 'brain', label: 'AI Sentiment', screen: 'AISentimentDashboard'},
  {icon: 'vote-outline', label: 'Election Mode', screen: 'ElectionMode'},
];

export const PoliticianDashboardScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const statCards = [
    {icon: 'clipboard-text-outline' as MaterialCommunityIconName, label: 'Total Complaints', value: '156', color: Colors.primaryLight},
    {icon: 'check-circle-outline' as MaterialCommunityIconName, label: 'Resolved', value: '98', sub: '63%', color: Colors.successLight},
    {icon: 'progress-wrench' as MaterialCommunityIconName, label: 'In Progress', value: '34', color: Colors.warningLight},
    {icon: 'clock-outline' as MaterialCommunityIconName, label: 'Pending', value: '24', color: Colors.dangerLight},
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Constituency Dashboard</Text>
            <Text style={styles.name}>{user?.name ?? 'Politician'}</Text>
            {user?.constituency && <Text style={styles.constituency}>{user.constituency}</Text>}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map(stat => (
            <View key={stat.label} style={[styles.statCard, {backgroundColor: stat.color}]}>
              <View style={styles.statIconBubble}>
                <MaterialCommunityIcons name={stat.icon} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              {stat.sub && <Text style={styles.statSub}>{stat.sub}</Text>}
              <Text style={styles.statLabel}>{stat.label}</Text>
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
              <Text style={styles.navLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Breakdown */}
        <Text style={styles.sectionTitle}>Complaints by Category</Text>
        <AppCard>
          {[
            {cat: '🛣️ Road', count: 54, pct: 35},
            {cat: '💧 Water', count: 38, pct: 24},
            {cat: '⚡ Electricity', count: 31, pct: 20},
            {cat: '🗑️ Sanitation', count: 33, pct: 21},
          ].map(row => (
            <View key={row.cat} style={styles.catRow}>
              <Text style={styles.catLabel}>{row.cat}</Text>
              <View style={styles.catBarWrapper}>
                <View style={[styles.catBar, {width: `${row.pct}%`}]} />
              </View>
              <Text style={styles.catCount}>{row.count}</Text>
            </View>
          ))}
        </AppCard>

        {/* Recent Complaints */}
        <Text style={styles.sectionTitle}>Recent Complaints</Text>
        {MOCK_COMPLAINTS.map(c => (
          <AppCard key={c.id}>
            <View style={styles.complaintRow}>
              <View style={styles.complaintInfo}>
                <Text style={styles.complaintDesc} numberOfLines={1}>{c.description}</Text>
                <Text style={styles.complaintMeta}>{c.location.address} · {formatRelativeTime(c.createdAt)}</Text>
              </View>
              <AppBadge status={c.status} />
            </View>
            <TouchableOpacity style={styles.assignBtn}>
              <Text style={styles.assignText}>Assign Volunteer →</Text>
            </TouchableOpacity>
          </AppCard>
        ))}

        <View style={{height: Spacing[8]}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {padding: Spacing[4]},
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
    borderColor: Colors.overlayLight,
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
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
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
});
