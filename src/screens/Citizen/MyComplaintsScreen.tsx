import React, {useCallback, useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {CitizenStackParamList} from '@appTypes/navigation';
import {Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus} from '@appTypes/api';
import {AppBadge} from '@components/common/AppBadge';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useNotificationStore} from '@store/notificationStore';
import {MOCK_COMPLAINTS} from '@utils/mockData';
import {formatRelativeTime, getCategoryLabel} from '@utils/formatters';
import {AppColors, Navy} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TranslationKey} from '@constants/i18n';

type Nav = NativeStackNavigationProp<CitizenStackParamList>;

const FILTERS: {id: ComplaintStatus | 'all'; label: string}[] = [
  {id: 'all', label: 'All'},
  {id: 'submitted', label: 'Open'},
  {id: 'in_progress', label: 'In Progress'},
  {id: 'resolved', label: 'Resolved'},
];

const CATEGORY_FILTERS: {id: ComplaintCategory | 'all'; labelKey?: TranslationKey; label?: string}[] = [
  {id: 'all', label: 'All'},
  {id: 'road', labelKey: 'road'},
  {id: 'water', labelKey: 'water'},
  {id: 'electricity', labelKey: 'electricity'},
  {id: 'sanitation', labelKey: 'sanitation'},
  {id: 'other', labelKey: 'other'},
];

const PRIORITY_FILTERS: {id: ComplaintPriority | 'all'; labelKey?: TranslationKey; label?: string}[] = [
  {id: 'all', label: 'All'},
  {id: 'low', labelKey: 'low'},
  {id: 'medium', labelKey: 'medium'},
  {id: 'high', labelKey: 'high'},
];

type CategoryConfig = {iconName: string; iconColor: string; iconBg: string};

const CATEGORY_CONFIG: Record<ComplaintCategory, CategoryConfig> = {
  road:        {iconName: 'road-variant',         iconColor: '#F97316', iconBg: '#FFF0E0'},
  water:       {iconName: 'water',                iconColor: '#3B9EFF', iconBg: '#E0F0FF'},
  electricity: {iconName: 'lightning-bolt',       iconColor: '#22C55E', iconBg: '#E0F5E8'},
  sanitation:  {iconName: 'trash-can-outline',    iconColor: '#8B5CF6', iconBg: '#F1ECFE'},
  other:       {iconName: 'file-document-outline',iconColor: '#64748B', iconBg: '#F2F6FC'},
};

const CategoryIcon: React.FC<{category: ComplaintCategory}> = ({category}) => {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
  return (
    <View style={{
      width: 52, height: 52,
      borderRadius: BorderRadius.lg,
      backgroundColor: cfg.iconBg,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <MaterialCommunityIcons name={cfg.iconName as any} size={26} color={cfg.iconColor} />
    </View>
  );
};

export const MyComplaintsScreen: React.FC<{embedded?: boolean}> = ({embedded}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<Nav>();
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const [activeFilter, setActiveFilter] = useState<ComplaintStatus | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<ComplaintCategory | 'all'>('all');
  const [activePriority, setActivePriority] = useState<ComplaintPriority | 'all'>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = MOCK_COMPLAINTS.filter(c => {
    const matchFilter = activeFilter === 'all' || c.status === activeFilter;
    const matchCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchPriority = activePriority === 'all' || c.priority === activePriority;
    const matchSearch =
      search === '' ||
      c.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchCategory && matchPriority && matchSearch;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderItem = useCallback(
    ({item}: {item: Complaint}) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ComplaintTicket', {ticketId: item.ticketId})}
        style={styles.card}>
        {/* Top: icon + meta */}
        <View style={styles.cardTop}>
          <CategoryIcon category={item.category} />
          <View style={styles.cardMeta}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.categoryTextRow}>
                <Text style={styles.categoryLabel}>{getCategoryLabel(item.category)}</Text>
                {item.subCategory
                  ? <Text style={styles.subCategoryLabel}> · {item.subCategory}</Text>
                  : null}
              </View>
              <AppBadge status={item.status} />
            </View>
            <View style={styles.descriptionRow}>
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={Colors.textDisabled}
                style={styles.chevron}
              />
            </View>
          </View>
        </View>
        {/* Divider */}
        <View style={styles.divider} />
        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.ticketId}>{item.ticketId}</Text>
          <Text style={styles.date}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    ),
    [navigation, styles, Colors],
  );

  const Container: React.ComponentType<any> = embedded ? View : SafeAreaView;

  return (
    <Container style={styles.container} edges={['top']}>
      {!embedded && <OfflineBanner />}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{t('myComplaints')}</Text>
          <Text style={styles.headerSubtitle}>Track and manage your complaints</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Notifications')}>
          <MaterialCommunityIcons name="bell-outline" size={22} color="#FFFFFF" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search + filter button */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textDisabled} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ticket ID or description"
            placeholderTextColor={Colors.textDisabled}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterIconBtn, filterOpen && styles.filterIconBtnActive]}
          activeOpacity={0.82}
          onPress={() => setFilterOpen(open => !open)}>
          <MaterialCommunityIcons name="tune-variant" size={20} color="#FFFFFF" />
          {(activeCategory !== 'all' || activePriority !== 'all') && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {filterOpen && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterPanelTitle}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.panelScroll}
            contentContainerStyle={styles.panelRow}>
            {CATEGORY_FILTERS.map(f => {
              const active = activeCategory === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setActiveCategory(f.id)}
                  style={[styles.panelChip, active ? styles.panelChipActive : styles.panelChipInactive]}>
                  <Text style={[styles.panelChipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                    {f.labelKey ? t(f.labelKey) : f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.filterPanelTitle}>Priority</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.panelScroll}
            contentContainerStyle={styles.panelRow}>
            {PRIORITY_FILTERS.map(f => {
              const active = activePriority === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setActivePriority(f.id)}
                  style={[styles.panelChip, active ? styles.panelChipActive : styles.panelChipInactive]}>
                  <Text style={[styles.panelChipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                    {f.labelKey ? t(f.labelKey) : f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setActiveFilter(f.id)}
            style={[
              styles.chip,
              activeFilter === f.id ? styles.chipActive : styles.chipInactive,
            ]}>
            <Text style={[
              styles.chipText,
              activeFilter === f.id ? styles.chipTextActive : styles.chipTextInactive,
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Complaint list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.flatList}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F8DFF" />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppEmptyState
            icon="tray-alert"
            title={t('noComplaintsFound')}
            subtitle={
              activeFilter === 'all'
                ? t('noComplaintsYet')
                : t('noFilteredComplaints', {
                    status: FILTERS.find(f => f.id === activeFilter)?.label ?? '',
                  })
            }
            ctaLabel={t('reportProblem')}
            onCTAPress={() => navigation.navigate('ReportProblem')}
          />
        }
      />
    </Container>
  );
};

const createStyles = (Colors: AppColors) =>
  ({
    container: {flex: 1, backgroundColor: Navy.base},

    // ── Header ──────────────────────────────────────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      paddingTop: Spacing[3],
      paddingBottom: Spacing[5],
    },
    headerText: {flex: 1},
    notificationBtn: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    notificationBadge: {
      position: 'absolute',
      top: -3,
      right: -3,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: Colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 1.5,
      borderColor: Navy.base,
    },
    notificationBadgeText: {
      fontSize: 10,
      fontWeight: FontWeight.bold,
      color: '#FFFFFF',
    },
    headerTitle: {
      fontSize: FontSize['2xl'],
      fontWeight: FontWeight.bold,
      color: '#FFFFFF',
      marginBottom: 2,
    },
    headerSubtitle: {
      fontSize: FontSize.base,
      fontWeight: FontWeight.regular,
      color: 'rgba(255,255,255,0.5)',
    },

    // ── Search ───────────────────────────────────────────
    searchSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      marginBottom: Spacing[4],
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[3],
      borderWidth: 1,
      borderColor: Colors.borderLight,
      marginRight: Spacing[2],
    },
    searchInput: {
      flex: 1,
      marginLeft: Spacing[2],
      fontSize: FontSize.base,
      color: Colors.text,
      padding: 0,
    },
    filterIconBtn: {
      width: 46,
      height: 46,
      borderRadius: BorderRadius.lg,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    filterIconBtnActive: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    filterDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.danger,
      borderWidth: 1,
      borderColor: '#FFFFFF',
    },
    filterPanel: {
      marginHorizontal: Spacing[4],
      marginTop: -Spacing[2],
      marginBottom: Spacing[3],
      padding: Spacing[3],
      borderRadius: BorderRadius.xl,
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
    },
    filterPanelTitle: {
      fontSize: FontSize.xs,
      fontWeight: FontWeight.bold,
      color: 'rgba(255,255,255,0.58)',
      marginBottom: Spacing[2],
    },
    panelScroll: {
      flexGrow: 0,
      flexShrink: 0,
      marginBottom: Spacing[3],
    },
    panelRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    panelChip: {
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[1],
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      marginRight: Spacing[2],
    },
    panelChipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
    panelChipInactive: {backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)'},
    panelChipText: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold},
    // ── Filter chips ────────────────────────────────────
    filterScroll: {
      flexGrow: 0,
      flexShrink: 0,
      height: 46,
      marginBottom: Spacing[2],
    },
    flatList: {flex: 1, backgroundColor: 'transparent'},
    filterRow: {
      paddingHorizontal: Spacing[4],
      flexDirection: 'row',
      alignItems: 'center',
      height: 46,
    },
    chip: {
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[2],
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      marginRight: Spacing[2],
      alignSelf: 'flex-start',
    },
    chipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
    chipInactive: {backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)'},
    chipText: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold},
    chipTextActive: {color: '#FFFFFF'},
    chipTextInactive: {color: 'rgba(255,255,255,0.75)'},

    // ── Card list ────────────────────────────────────────
    list: {
      paddingHorizontal: Spacing[4],
      paddingTop: Spacing[2],
      paddingBottom: Spacing[16],
    },
    emptyContainer: {flex: 1, paddingHorizontal: Spacing[4]},

    card: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius['2xl'],
      padding: Spacing[4],
      marginBottom: Spacing[3],
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    cardTop: {flexDirection: 'row', alignItems: 'flex-start'},
    cardMeta: {flex: 1, marginLeft: Spacing[3]},
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing[2],
    },
    categoryTextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: Spacing[2],
    },
    categoryLabel: {
      fontSize: FontSize.base,
      fontWeight: FontWeight.semiBold,
      color: Colors.text,
    },
    subCategoryLabel: {
      fontSize: FontSize.base,
      color: Colors.textSecondary,
    },
    descriptionRow: {flexDirection: 'row', alignItems: 'flex-start'},
    description: {
      flex: 1,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semiBold,
      color: Colors.text,
      lineHeight: 22,
    },
    chevron: {marginLeft: Spacing[1], marginTop: 1},
    divider: {
      height: 1,
      backgroundColor: Colors.borderLight,
      marginVertical: Spacing[3],
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ticketId: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
      color: Colors.primary,
    },
    date: {
      fontSize: FontSize.sm,
      color: Colors.textDisabled,
    },
  } as const);
