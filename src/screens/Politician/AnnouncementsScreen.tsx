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
import {MOCK_ANNOUNCEMENTS, AnnouncementItem} from '@utils/politicianData';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const AnnouncementsScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [items, setItems] = useState<AnnouncementItem[]>(MOCK_ANNOUNCEMENTS);
  const [formVisible, setFormVisible] = useState(false);

  const handleCreate = (values: Record<string, string>) => {
    const newItem: AnnouncementItem = {
      id: `a-${items.length + 1}-${values.title?.slice(0, 4) ?? 'new'}`,
      title: values.title?.trim() || t('createAnnouncement'),
      body: values.body?.trim() || '',
      ago: t('justNow'),
      audienceKey: 'allWards',
      pinned: false,
    };
    setItems(prev => [newItem, ...prev]);
    toastSuccess(t('announcementPublished'));
  };

  const togglePin = (id: string) => {
    setItems(prev => prev.map(a => (a.id === id ? {...a, pinned: !a.pinned} : a)));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('announcements')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppButton title={t('createAnnouncement')} onPress={() => setFormVisible(true)} />
        <View style={{height: Spacing[4]}} />
        {items.map(a => (
          <AppCard key={a.id} onPress={() => togglePin(a.id)}>
            <View style={styles.row}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="bullhorn-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.title} numberOfLines={1}>{a.title}</Text>
              {a.pinned && (
                <View style={styles.pin}>
                  <MaterialCommunityIcons name="pin" size={12} color={Colors.warning} />
                  <Text style={styles.pinText}>{t('pinned')}</Text>
                </View>
              )}
            </View>
            {!!a.body && <Text style={styles.body}>{a.body}</Text>}
            <View style={styles.footer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{t(a.audienceKey)}</Text>
              </View>
              <Text style={styles.ago}>{t('agoShort', {time: a.ago})}</Text>
            </View>
          </AppCard>
        ))}
        <View style={{height: Spacing[8]}} />
      </ScrollView>

      <FormModal
        visible={formVisible}
        title={t('createAnnouncement')}
        submitLabel={t('publish')}
        onClose={() => setFormVisible(false)}
        onSubmit={handleCreate}
        fields={[
          {key: 'title', label: t('title'), placeholder: t('title'), required: true},
          {key: 'body', label: t('message'), placeholder: t('message'), multiline: true, required: true},
        ]}
      />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[2], gap: Spacing[2]},
  iconBubble: {width: 34, height: 34, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center'},
  title: {flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  pin: {flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.warningLight, paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full},
  pinText: {fontSize: 10, color: Colors.warning, fontWeight: FontWeight.semiBold},
  body: {fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing[3]},
  footer: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  tag: {backgroundColor: Colors.surfaceSoft, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full},
  tagText: {fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium},
  ago: {fontSize: FontSize.xs, color: Colors.textDisabled},
} as const);
