import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {AppBadge} from '@components/common/AppBadge';
import {AppChip} from '@components/common/AppChip';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_COMPLAINTS} from '@utils/mockData';
import {formatRelativeTime} from '@utils/formatters';
import {toastSuccess, toastInfo} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {Complaint, ComplaintStatus} from '@appTypes/api';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing} from '@constants/spacing';

const FILTERS: {id: 'all' | ComplaintStatus; labelKey: TranslationKey}[] = [
  {id: 'all', labelKey: 'all'},
  {id: 'submitted', labelKey: 'submitted'},
  {id: 'in_progress', labelKey: 'inProgress'},
  {id: 'resolved', labelKey: 'resolved'},
];

export const PoliticianComplaintsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [filter, setFilter] = useState<'all' | ComplaintStatus>('all');
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);

  const data = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const handleAssign = (c: Complaint) => {
    setComplaints(prev => prev.map(x => (x.id === c.id ? {...x, status: 'in_progress'} : x)));
    toastInfo(t('volunteerAssigned'), c.ticketId);
  };

  const handleResolve = (c: Complaint) => {
    setComplaints(prev => prev.map(x => (x.id === c.id ? {...x, status: 'resolved'} : x)));
    toastSuccess(t('complaintResolved'), c.ticketId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('complaints')} subtitle={t('manageComplaints')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {FILTERS.map(f => (
            <AppChip key={f.id} label={t(f.labelKey)} isActive={filter === f.id} onPress={() => setFilter(f.id)} />
          ))}
        </ScrollView>

        {data.map(c => (
          <AppCard key={c.id}>
            <View style={styles.row}>
              <Text style={styles.ticket}>{c.ticketId}</Text>
              <AppBadge status={c.status} />
            </View>
            <Text style={styles.desc} numberOfLines={2}>{c.description}</Text>
            <Text style={styles.meta}>{c.location.address} · {formatRelativeTime(c.createdAt)}</Text>
            {c.status !== 'resolved' && (
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, styles.assign]} onPress={() => handleAssign(c)}>
                  <Text style={styles.assignText}>{t('assignVolunteer')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.resolve]} onPress={() => handleResolve(c)}>
                  <Text style={styles.resolveText}>{t('markResolved')}</Text>
                </TouchableOpacity>
              </View>
            )}
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
  filters: {marginBottom: Spacing[3]},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2]},
  ticket: {fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semiBold},
  desc: {fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.medium, marginBottom: 4},
  meta: {fontSize: FontSize.xs, color: Colors.textDisabled, marginBottom: Spacing[3]},
  actions: {flexDirection: 'row', gap: Spacing[2]},
  actionBtn: {flex: 1, paddingVertical: Spacing[2], borderRadius: 10, alignItems: 'center'},
  assign: {backgroundColor: Colors.primaryLight},
  assignText: {color: Colors.primary, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm},
  resolve: {backgroundColor: Colors.secondaryLight},
  resolveText: {color: Colors.secondaryDark, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm},
} as const);
