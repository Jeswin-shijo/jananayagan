import React, {useState, useMemo} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {MOCK_PETITIONS} from '@utils/mockData';
import {formatRelativeTime} from '@utils/formatters';
import {Petition} from '@appTypes/api';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type Filter = 'all' | Petition['status'];

const FILTERS: {key: Filter; label: string}[] = [
  {key: 'all', label: 'All'},
  {key: 'active', label: 'Active'},
  {key: 'approved', label: 'Approved'},
  {key: 'closed', label: 'Closed'},
];

const STATUS_CONFIG: Record<Petition['status'], {label: string; color: string; bg: string; icon: string}> = {
  active: {label: 'Active', color: '#16A34A', bg: '#F0FDF4', icon: 'circle-slice-8'},
  approved: {label: 'Approved', color: '#2563EB', bg: '#EFF6FF', icon: 'check-circle-outline'},
  closed: {label: 'Closed', color: '#6B7280', bg: '#F3F4F6', icon: 'close-circle-outline'},
};

const CATEGORY_COLOR: Record<string, string> = {
  'Road Safety': '#F59E0B',
  'Water': '#3B82F6',
  'Electricity': '#EAB308',
  'Environment': '#22C55E',
  'Traffic': '#EF4444',
  'Public Spaces': '#8B5CF6',
  'Sanitation': '#10B981',
};

const PetitionCard: React.FC<{petition: Petition; Colors: AppColors; styles: ReturnType<typeof createStyles>}> = ({petition, Colors, styles}) => {
  const pct = Math.min(Math.round((petition.currentSignatures / petition.targetSignatures) * 100), 100);
  const status = STATUS_CONFIG[petition.status];
  const catColor = CATEGORY_COLOR[petition.category] ?? Colors.primary;

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, {backgroundColor: catColor + '18', borderColor: catColor + '40'}]}>
          <Text style={[styles.categoryText, {color: catColor}]}>{petition.category}</Text>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: status.bg}]}>
          <MaterialCommunityIcons name={status.icon as any} size={12} color={status.color} />
          <Text style={[styles.statusText, {color: status.color}]}>{status.label}</Text>
        </View>
      </View>

      {/* Title & description */}
      <Text style={styles.cardTitle} numberOfLines={2}>{petition.title}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>{petition.description}</Text>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.signaturesText}>
            <Text style={styles.signaturesCount}>{petition.currentSignatures.toLocaleString()}</Text>
            {' / '}{petition.targetSignatures.toLocaleString()} signatures
          </Text>
          <Text style={[styles.pctText, {color: pct >= 100 ? '#16A34A' : pct >= 70 ? '#F59E0B' : Colors.primary}]}>
            {pct}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${pct}%`,
                backgroundColor: pct >= 100 ? '#16A34A' : pct >= 70 ? '#F59E0B' : Colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.textDisabled} />
        <Text style={styles.footerText}>{petition.constituency}</Text>
        <Text style={styles.footerDot}>·</Text>
        <MaterialCommunityIcons name="account-outline" size={13} color={Colors.textDisabled} />
        <Text style={styles.footerText}>{petition.createdBy}</Text>
        <Text style={styles.footerDot}>·</Text>
        <Text style={styles.footerText}>{formatRelativeTime(petition.createdAt)}</Text>
      </View>
    </View>
  );
};

export const PoliticianPetitionsScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const filtered = useMemo(() =>
    activeFilter === 'all'
      ? MOCK_PETITIONS
      : MOCK_PETITIONS.filter(p => p.status === activeFilter),
    [activeFilter],
  );

  const counts = useMemo(() => ({
    all: MOCK_PETITIONS.length,
    active: MOCK_PETITIONS.filter(p => p.status === 'active').length,
    approved: MOCK_PETITIONS.filter(p => p.status === 'approved').length,
    closed: MOCK_PETITIONS.filter(p => p.status === 'closed').length,
  }), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('petition')} subtitle={`${MOCK_PETITIONS.length} total`} />
      <OfflineBanner />

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map(f => {
            const isActive = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.75}>
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {f.label}
                </Text>
                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                    {counts[f.key]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <AppEmptyState icon="file-sign" title="No petitions" subtitle="No petitions found for this filter" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}>
          {filtered.map(petition => (
            <PetitionCard key={petition.id} petition={petition} Colors={Colors} styles={styles} />
          ))}
          <View style={{height: Spacing[6]}} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},

  // Filters
  filterRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  filterScroll: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  filterLabel: {fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium},
  filterLabelActive: {color: Colors.primary, fontWeight: FontWeight.semiBold},
  filterCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterCountActive: {backgroundColor: Colors.primary},
  filterCountText: {fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textSecondary},
  filterCountTextActive: {color: '#FFFFFF'},

  // List
  list: {padding: Spacing[4], gap: Spacing[3]},

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  categoryBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryText: {fontSize: 11, fontWeight: FontWeight.semiBold},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {fontSize: 11, fontWeight: FontWeight.semiBold},
  cardTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing[1],
    lineHeight: 22,
  },
  cardDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing[4],
  },

  // Progress
  progressSection: {marginBottom: Spacing[3]},
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing[2],
  },
  signaturesText: {fontSize: FontSize.sm, color: Colors.textSecondary},
  signaturesCount: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text},
  pctText: {fontSize: FontSize.sm, fontWeight: FontWeight.bold},
  progressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  footerText: {fontSize: FontSize.xs, color: Colors.textDisabled},
  footerDot: {fontSize: FontSize.xs, color: Colors.textDisabled},
} as const);
