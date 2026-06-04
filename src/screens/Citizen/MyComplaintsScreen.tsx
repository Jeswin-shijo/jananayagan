import React, {useCallback, useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {CitizenStackParamList} from '@appTypes/navigation';
import {Complaint, ComplaintStatus} from '@appTypes/api';
import {AppCard} from '@components/common/AppCard';
import {AppBadge} from '@components/common/AppBadge';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {AppChip} from '@components/common/AppChip';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_COMPLAINTS} from '@utils/mockData';
import {formatRelativeTime, getCategoryIcon, getCategoryLabel} from '@utils/formatters';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TranslationKey} from '@constants/i18n';

type Nav = NativeStackNavigationProp<CitizenStackParamList>;

const FILTERS: {id: ComplaintStatus | 'all'; labelKey: TranslationKey}[] = [
  {id: 'all', labelKey: 'all'},
  {id: 'submitted', labelKey: 'open'},
  {id: 'in_progress', labelKey: 'inProgress'},
  {id: 'resolved', labelKey: 'resolved'},
];

export const MyComplaintsScreen: React.FC<{embedded?: boolean}> = ({embedded}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<Nav>();
  const [activeFilter, setActiveFilter] = useState<ComplaintStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = MOCK_COMPLAINTS.filter(c => {
    const matchFilter = activeFilter === 'all' || c.status === activeFilter;
    const matchSearch = search === '' ||
      c.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: refetch complaints
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderItem = useCallback(({item}: {item: Complaint}) => (
    <AppCard
      onPress={() => navigation.navigate('ComplaintTicket', {ticketId: item.ticketId})}
      style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
          <Text style={styles.categoryLabel}>{getCategoryLabel(item.category)}</Text>
          {item.subCategory ? <Text style={styles.subCategory}> · {item.subCategory}</Text> : null}
        </View>
        <AppBadge status={item.status} />
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.ticketId}>{item.ticketId}</Text>
        <Text style={styles.date}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
    </AppCard>
  ), [navigation, styles]);

  const Container: React.ComponentType<any> = embedded ? View : SafeAreaView;

  return (
    <Container style={styles.container}>
      {!embedded && <OfflineBanner />}
      {!embedded && (
        <View style={styles.header}>
          <Text style={styles.title}>{t('myComplaints')}</Text>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.textDisabled} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchComplaints')}
          placeholderTextColor={Colors.textDisabled}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <AppChip
            key={f.id}
            label={t(f.labelKey)}
            isActive={activeFilter === f.id}
            onPress={() => setActiveFilter(f.id)}
          />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppEmptyState
            icon="tray-alert"
            title={t('noComplaintsFound')}
            subtitle={activeFilter === 'all' ? t('noComplaintsYet') : t('noFilteredComplaints', {status: t(FILTERS.find(f => f.id === activeFilter)?.labelKey ?? 'all')})}
            ctaLabel={t('reportProblem')}
            onCTAPress={() => navigation.navigate('ReportProblem')}
          />
        }
      />
      {!embedded && <CitizenCreateFab />}
    </Container>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {padding: Spacing[4], paddingBottom: Spacing[2]},
  title: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing[4],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing[3],
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing[3],
    paddingLeft: Spacing[2],
    fontSize: FontSize.base,
    color: Colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[2],
  },
  list: {padding: Spacing[4], paddingTop: Spacing[2]},
  emptyContainer: {flex: 1},
  card: {marginHorizontal: 0},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
  },
  categoryRow: {flexDirection: 'row', alignItems: 'center'},
  categoryIcon: {fontSize: 16, marginRight: Spacing[1]},
  categoryLabel: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  subCategory: {fontSize: FontSize.sm, color: Colors.textSecondary},
  description: {
    fontSize: FontSize.base,
    color: Colors.text,
    marginBottom: Spacing[3],
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing[2],
  },
  ticketId: {fontSize: FontSize.xs, color: Colors.textSecondary},
  date: {fontSize: FontSize.xs, color: Colors.textDisabled},
} as const);
