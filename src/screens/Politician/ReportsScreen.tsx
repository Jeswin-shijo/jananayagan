import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_REPORTS} from '@utils/politicianData';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const ReportsScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('reports')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {MOCK_REPORTS.map(r => (
          <AppCard key={r.id}>
            <View style={styles.row}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name={r.icon as MaterialCommunityIconName} size={20} color={Colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.title}>{r.title}</Text>
                <Text style={styles.period}>{t(r.periodKey as TranslationKey)}</Text>
              </View>
              <TouchableOpacity style={styles.exportBtn} onPress={() => toastSuccess(t('reportExported'), r.title)}>
                <MaterialCommunityIcons name="download-outline" size={16} color={Colors.primary} />
                <Text style={styles.exportText}>{t('exportReport')}</Text>
              </TouchableOpacity>
            </View>
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
  row: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3]},
  iconBubble: {width: 42, height: 42, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center'},
  info: {flex: 1},
  title: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  period: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  exportBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing[3], paddingVertical: Spacing[2], borderRadius: BorderRadius.md},
  exportText: {fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semiBold},
} as const);
