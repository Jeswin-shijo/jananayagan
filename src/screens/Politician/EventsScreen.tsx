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
import {MOCK_EVENTS, EventItem} from '@utils/politicianData';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const EventsScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [items, setItems] = useState<EventItem[]>(MOCK_EVENTS);
  const [formVisible, setFormVisible] = useState(false);

  const handleCreate = (values: Record<string, string>) => {
    const newItem: EventItem = {
      id: `e-${items.length + 1}`,
      title: values.title?.trim() || t('createEvent'),
      date: values.date?.trim() || '—',
      time: values.time?.trim() || '—',
      venue: values.venue?.trim() || '—',
      ward: values.ward?.trim() || t('allWards'),
      rsvp: 0,
    };
    setItems(prev => [newItem, ...prev]);
    toastSuccess(t('eventCreated'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('events')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppButton title={t('createEvent')} onPress={() => setFormVisible(true)} />
        <View style={{height: Spacing[4]}} />
        {items.map(e => (
          <AppCard key={e.id}>
            <View style={styles.row}>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>{e.date}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{e.title}</Text>
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="clock-outline" size={13} color={Colors.textSecondary} />
                  <Text style={styles.meta}>{e.time} · {e.venue}</Text>
                </View>
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.textSecondary} />
                  <Text style={styles.meta}>{e.ward}</Text>
                </View>
              </View>
            </View>
            <View style={styles.footer}>
              <MaterialCommunityIcons name="account-check-outline" size={15} color={Colors.primary} />
              <Text style={styles.rsvp}>{e.rsvp} {t('rsvp')}</Text>
            </View>
          </AppCard>
        ))}
        <View style={{height: Spacing[8]}} />
      </ScrollView>

      <FormModal
        visible={formVisible}
        title={t('createEvent')}
        submitLabel={t('create')}
        onClose={() => setFormVisible(false)}
        onSubmit={handleCreate}
        fields={[
          {key: 'title', label: t('title'), placeholder: t('title'), required: true},
          {key: 'date', label: t('date'), placeholder: 'Jun 20'},
          {key: 'time', label: t('time'), placeholder: '10:00 AM'},
          {key: 'venue', label: t('venue'), placeholder: t('venue')},
          {key: 'ward', label: t('ward'), placeholder: 'Ward 5'},
        ]}
      />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  row: {flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[3]},
  dateBox: {width: 56, height: 56, borderRadius: BorderRadius.lg, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center'},
  dateText: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary, textAlign: 'center'},
  info: {flex: 1},
  title: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text, marginBottom: 4},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2},
  meta: {fontSize: FontSize.xs, color: Colors.textSecondary},
  footer: {flexDirection: 'row', alignItems: 'center', gap: 4, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing[2]},
  rsvp: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold},
} as const);
