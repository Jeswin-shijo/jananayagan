import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {AppChip} from '@components/common/AppChip';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_USERS, ManagedUser, UserStatus} from '@utils/adminData';
import {toastSuccess, toastInfo} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {UserRole} from '@appTypes/navigation';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

const FILTERS: {id: 'all' | UserRole; labelKey: TranslationKey}[] = [
  {id: 'all', labelKey: 'all'},
  {id: 'politician', labelKey: 'politician'},
  {id: 'volunteer', labelKey: 'volunteer'},
  {id: 'citizen', labelKey: 'citizen'},
];

const STATUS_TONE: Record<UserStatus, {bg: keyof AppColors; fg: keyof AppColors; labelKey: TranslationKey}> = {
  active: {bg: 'successLight', fg: 'success', labelKey: 'statusActive'},
  pending: {bg: 'warningLight', fg: 'warning', labelKey: 'pending'},
  suspended: {bg: 'dangerLight', fg: 'danger', labelKey: 'suspended'},
};

export const UserManagementScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [filter, setFilter] = useState<'all' | UserRole>('all');
  const [users, setUsers] = useState<ManagedUser[]>(MOCK_USERS);

  const data = filter === 'all' ? users : users.filter(u => u.role === filter);

  const setStatus = (u: ManagedUser, status: UserStatus, msg: TranslationKey) => {
    setUsers(prev => prev.map(x => (x.id === u.id ? {...x, status} : x)));
    if (status === 'suspended') {
      toastInfo(t(msg), u.name);
    } else {
      toastSuccess(t(msg), u.name);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('userManagement')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {FILTERS.map(f => (
            <AppChip key={f.id} label={t(f.labelKey)} isActive={filter === f.id} onPress={() => setFilter(f.id)} />
          ))}
        </ScrollView>

        {data.map(u => {
          const tone = STATUS_TONE[u.status];
          return (
            <AppCard key={u.id}>
              <View style={styles.row}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{u.name.charAt(0)}</Text></View>
                <View style={styles.info}>
                  <Text style={styles.name}>{u.name}</Text>
                  <Text style={styles.meta}>{t(u.role)} · {u.constituency} · {u.joined}</Text>
                </View>
                <View style={[styles.statusPill, {backgroundColor: Colors[tone.bg]}]}>
                  <Text style={[styles.statusText, {color: Colors[tone.fg]}]}>{t(tone.labelKey)}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                {u.status === 'pending' && (
                  <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => setStatus(u, 'active', 'userApproved')}>
                    <Text style={styles.approveText}>{t('approve')}</Text>
                  </TouchableOpacity>
                )}
                {u.status !== 'suspended' ? (
                  <TouchableOpacity style={[styles.btn, styles.suspend]} onPress={() => setStatus(u, 'suspended', 'userSuspended')}>
                    <Text style={styles.suspendText}>{t('suspend')}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => setStatus(u, 'active', 'userReactivated')}>
                    <Text style={styles.approveText}>{t('reactivate')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </AppCard>
          );
        })}
        <View style={{height: Spacing[8]}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  filters: {marginBottom: Spacing[3]},
  row: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[3]},
  avatar: {width: 42, height: 42, borderRadius: BorderRadius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: Colors.textOnPrimary, fontWeight: FontWeight.bold},
  info: {flex: 1},
  name: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  meta: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  statusPill: {paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full},
  statusText: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold},
  actions: {flexDirection: 'row', gap: Spacing[2]},
  btn: {flex: 1, paddingVertical: Spacing[2], borderRadius: 10, alignItems: 'center'},
  approve: {backgroundColor: Colors.secondaryLight},
  approveText: {color: Colors.secondaryDark, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm},
  suspend: {backgroundColor: Colors.dangerLight},
  suspendText: {color: Colors.danger, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm},
} as const);
