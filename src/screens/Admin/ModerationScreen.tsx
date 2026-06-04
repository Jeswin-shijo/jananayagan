import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_MODERATION, ModerationItem, ModerationType} from '@utils/adminData';
import {toastSuccess, toastInfo} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

const TYPE_ICON: Record<ModerationType, {icon: string; labelKey: TranslationKey}> = {
  post: {icon: 'newspaper-variant-outline', labelKey: 'post'},
  petition: {icon: 'file-sign', labelKey: 'petition'},
  comment: {icon: 'comment-outline', labelKey: 'comment'},
};

export const ModerationScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [items, setItems] = useState<ModerationItem[]>(MOCK_MODERATION);

  const resolve = (item: ModerationItem, remove: boolean) => {
    setItems(prev => prev.filter(x => x.id !== item.id));
    if (remove) {
      toastInfo(t('contentRemoved'));
    } else {
      toastSuccess(t('contentApproved'));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('moderation')} subtitle={t('moderationSubtitle')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {items.length === 0 ? (
          <AppEmptyState icon="shield-check-outline" title={t('allClear')} subtitle={t('noFlaggedContent')} />
        ) : (
          items.map(item => {
            const meta = TYPE_ICON[item.type];
            return (
              <AppCard key={item.id}>
                <View style={styles.row}>
                  <View style={styles.iconBubble}>
                    <MaterialCommunityIcons name={meta.icon as any} size={18} color={Colors.danger} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.type}>{t(meta.labelKey)} · {item.author}</Text>
                    <Text style={styles.reports}>{item.reports} {t('reportsCount')} · {t('agoShort', {time: item.ago})}</Text>
                  </View>
                </View>
                <Text style={styles.snippet}>{item.snippet}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.btn, styles.keep]} onPress={() => resolve(item, false)}>
                    <Text style={styles.keepText}>{t('keep')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.remove]} onPress={() => resolve(item, true)}>
                    <Text style={styles.removeText}>{t('remove')}</Text>
                  </TouchableOpacity>
                </View>
              </AppCard>
            );
          })
        )}
        <View style={{height: Spacing[8]}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4], flexGrow: 1},
  row: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[2]},
  iconBubble: {width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center'},
  info: {flex: 1},
  type: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  reports: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  snippet: {fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing[3]},
  actions: {flexDirection: 'row', gap: Spacing[2]},
  btn: {flex: 1, paddingVertical: Spacing[2], borderRadius: 10, alignItems: 'center'},
  keep: {backgroundColor: Colors.secondaryLight},
  keepText: {color: Colors.secondaryDark, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm},
  remove: {backgroundColor: Colors.dangerLight},
  removeText: {color: Colors.danger, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm},
} as const);
