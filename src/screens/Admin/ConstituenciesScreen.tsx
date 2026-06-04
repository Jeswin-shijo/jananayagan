import React, {useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {AppButton} from '@components/common/AppButton';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {FormModal} from '@components/common/FormModal';
import {MOCK_CONSTITUENCIES, ConstituencyItem} from '@utils/adminData';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const ConstituenciesScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [items, setItems] = useState<ConstituencyItem[]>(MOCK_CONSTITUENCIES);
  const [formVisible, setFormVisible] = useState(false);

  const handleAdd = (values: Record<string, string>) => {
    const newItem: ConstituencyItem = {
      id: `c-${items.length + 1}`,
      name: values.name?.trim() || t('constituencies'),
      mla: values.mla?.trim() || t('vacant'),
      wards: parseInt(values.wards ?? '', 10) || 0,
      complaints: 0,
      resolvedPct: 0,
    };
    setItems(prev => [...prev, newItem]);
    toastSuccess(t('constituencyAdded'), newItem.name);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('constituencies')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppButton title={t('addConstituency')} onPress={() => setFormVisible(true)} />
        <View style={{height: Spacing[4]}} />
        {items.map(c => (
          <AppCard key={c.id}>
            <View style={styles.row}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.meta}>{t('mla')}: {c.mla} · {c.wards} {t('wards')}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.complaints}>{c.complaints.toLocaleString()} {t('complaints')}</Text>
              <Text style={styles.resolved}>{c.resolvedPct}% {t('resolved')}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, {width: `${c.resolvedPct}%`}]} />
            </View>
          </AppCard>
        ))}
        <View style={{height: Spacing[8]}} />
      </ScrollView>

      <FormModal
        visible={formVisible}
        title={t('addConstituency')}
        submitLabel={t('create')}
        onClose={() => setFormVisible(false)}
        onSubmit={handleAdd}
        fields={[
          {key: 'name', label: t('name'), placeholder: t('name'), required: true},
          {key: 'mla', label: t('mla'), placeholder: t('mla')},
          {key: 'wards', label: t('wards'), placeholder: '14', keyboardType: 'number-pad'},
        ]}
      />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  row: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[3]},
  iconBubble: {width: 42, height: 42, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center'},
  info: {flex: 1},
  name: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  meta: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  statsRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[2]},
  complaints: {fontSize: FontSize.sm, color: Colors.textSecondary},
  resolved: {fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.semiBold},
  track: {height: 6, backgroundColor: Colors.borderLight, borderRadius: BorderRadius.full, overflow: 'hidden'},
  fill: {height: '100%', backgroundColor: Colors.success, borderRadius: BorderRadius.full},
} as const);
