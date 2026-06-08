import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {FormModal} from '@components/common/FormModal';
import {MOCK_SURVEYS, SurveyItem} from '@utils/politicianData';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const SurveysScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [items, setItems] = useState<SurveyItem[]>(MOCK_SURVEYS);
  const [formVisible, setFormVisible] = useState(false);

  const handleCreate = (values: Record<string, string>) => {
    const target = parseInt(values.target ?? '', 10) || 500;
    const newItem: SurveyItem = {
      id: `s-${items.length + 1}`,
      title: values.title?.trim() || t('createSurvey'),
      responses: 0,
      target,
      status: 'active',
      ago: t('justNow'),
    };
    setItems(prev => [newItem, ...prev]);
    toastSuccess(t('surveyCreated'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('surveys')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setFormVisible(true)} activeOpacity={0.85} style={styles.createBtn}>
          <LinearGradient colors={['#2563EB', '#06B6D4']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.createBtnGradient}>
            <Text style={styles.createBtnText}>{t('createSurvey')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        {items.map(s => {
          const pct = Math.min(Math.round((s.responses / s.target) * 100), 100);
          return (
            <AppCard key={s.id}>
              <View style={styles.head}>
                <Text style={styles.title} numberOfLines={1}>{s.title}</Text>
                <View style={[styles.pill, s.status === 'active' ? styles.activePill : styles.closedPill]}>
                  <Text style={[styles.pillText, {color: s.status === 'active' ? Colors.success : Colors.textSecondary}]}>
                    {s.status === 'active' ? t('active') : t('closed')}
                  </Text>
                </View>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, {width: `${pct}%`}]} />
              </View>
              <Text style={styles.meta}>{s.responses.toLocaleString()} / {s.target.toLocaleString()} {t('responses')} · {t('agoShort', {time: s.ago})}</Text>
            </AppCard>
          );
        })}
        <View style={{height: Spacing[8]}} />
      </ScrollView>

      <FormModal
        visible={formVisible}
        title={t('createSurvey')}
        submitLabel={t('create')}
        onClose={() => setFormVisible(false)}
        onSubmit={handleCreate}
        fields={[
          {key: 'title', label: t('title'), placeholder: t('title'), required: true},
          {key: 'target', label: t('target'), placeholder: '500', keyboardType: 'number-pad'},
        ]}
      />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  head: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[3]},
  title: {flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  pill: {paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full},
  activePill: {backgroundColor: Colors.successLight},
  closedPill: {backgroundColor: Colors.borderLight},
  pillText: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold},
  track: {height: 6, backgroundColor: Colors.borderLight, borderRadius: BorderRadius.full, overflow: 'hidden', marginBottom: Spacing[2]},
  fill: {height: '100%', backgroundColor: Colors.primary, borderRadius: BorderRadius.full},
  meta: {fontSize: FontSize.xs, color: Colors.textSecondary},
  createBtn: {marginBottom: Spacing[5]},
  createBtnGradient: {borderRadius: BorderRadius['2xl'], overflow: 'hidden', paddingVertical: Spacing[4], alignItems: 'center' as const},
  createBtnText: {color: '#FFFFFF', fontSize: FontSize.base, fontWeight: FontWeight.bold, letterSpacing: 0.3},
} as const);
