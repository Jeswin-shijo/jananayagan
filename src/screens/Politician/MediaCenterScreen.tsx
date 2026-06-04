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
import {MOCK_MEDIA, MediaItem} from '@utils/politicianData';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const MediaCenterScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [items, setItems] = useState<MediaItem[]>(MOCK_MEDIA);
  const [formVisible, setFormVisible] = useState(false);

  const handleUpload = (values: Record<string, string>) => {
    const newItem: MediaItem = {
      id: `m-${items.length + 1}`,
      title: values.title?.trim() || t('uploadMedia'),
      typeKey: 'photo',
      ago: t('justNow'),
      views: 0,
      icon: 'image-outline',
    };
    setItems(prev => [newItem, ...prev]);
    toastSuccess(t('mediaUploaded'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('mediaCenter')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppButton title={t('uploadMedia')} onPress={() => setFormVisible(true)} />
        <View style={{height: Spacing[4]}} />
        {items.map(m => (
          <AppCard key={m.id}>
            <View style={styles.row}>
              <View style={styles.thumb}>
                <MaterialCommunityIcons name={m.icon as MaterialCommunityIconName} size={24} color={Colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{m.title}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeText}>{t(m.typeKey as TranslationKey)}</Text>
                  </View>
                  <Text style={styles.meta}>{m.views.toLocaleString()} {t('views')} · {t('agoShort', {time: m.ago})}</Text>
                </View>
              </View>
            </View>
          </AppCard>
        ))}
        <View style={{height: Spacing[8]}} />
      </ScrollView>

      <FormModal
        visible={formVisible}
        title={t('uploadMedia')}
        submitLabel={t('uploadMedia')}
        onClose={() => setFormVisible(false)}
        onSubmit={handleUpload}
        fields={[{key: 'title', label: t('title'), placeholder: t('title'), required: true}]}
      />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  row: {flexDirection: 'row', gap: Spacing[3], alignItems: 'center'},
  thumb: {width: 56, height: 56, borderRadius: BorderRadius.lg, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center'},
  info: {flex: 1},
  title: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text, marginBottom: Spacing[2]},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2]},
  typeTag: {backgroundColor: Colors.secondaryLight, paddingHorizontal: Spacing[2], paddingVertical: 1, borderRadius: BorderRadius.full},
  typeText: {fontSize: 10, color: Colors.secondaryDark, fontWeight: FontWeight.semiBold},
  meta: {fontSize: FontSize.xs, color: Colors.textSecondary},
} as const);
