import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_HOUSES, FieldHouse, HouseLean} from '@utils/volunteerData';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

const LEANS: {id: Exclude<HouseLean, null>; labelKey: TranslationKey; color: keyof AppColors}[] = [
  {id: 'supporter', labelKey: 'supporter', color: 'success'},
  {id: 'neutral', labelKey: 'neutral', color: 'warning'},
  {id: 'opposition', labelKey: 'opposition', color: 'danger'},
];

export const FieldWorkScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [houses, setHouses] = useState<FieldHouse[]>(MOCK_HOUSES);

  const visited = houses.filter(h => h.visited).length;

  const setLean = (house: FieldHouse, lean: Exclude<HouseLean, null>) => {
    setHouses(prev => prev.map(h => (h.id === house.id ? {...h, visited: true, lean} : h)));
    toastSuccess(t('houseUpdated'), `${house.doorNo}, ${house.street}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />
      <View style={styles.titleBar}>
        <Text style={styles.screenTitle}>{t('fieldWork')}</Text>
        <Text style={styles.progress}>{visited}/{houses.length} {t('visited')}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {houses.map(h => (
          <AppCard key={h.id}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.door}>{h.doorNo}, {h.street}</Text>
                <Text style={styles.voters}>{h.voters} {t('voters')}{h.visited ? ` · ${t('visited')}` : ''}</Text>
              </View>
              {h.lean && (
                <View style={[styles.leanPill, {backgroundColor: Colors[LEANS.find(l => l.id === h.lean)!.color] + '22'}]}>
                  <Text style={[styles.leanPillText, {color: Colors[LEANS.find(l => l.id === h.lean)!.color]}]}>
                    {t(LEANS.find(l => l.id === h.lean)!.labelKey)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.leanRow}>
              {LEANS.map(l => {
                const active = h.lean === l.id;
                return (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.leanBtn, active && {backgroundColor: Colors[l.color], borderColor: Colors[l.color]}]}
                    onPress={() => setLean(h, l.id)}>
                    <Text style={[styles.leanText, {color: active ? Colors.white : Colors[l.color]}]}>{t(l.labelKey)}</Text>
                  </TouchableOpacity>
                );
              })}
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
  titleBar: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing[4], paddingVertical: Spacing[3]},
  screenTitle: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  progress: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold},
  scroll: {paddingHorizontal: Spacing[4]},
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[3]},
  info: {flex: 1},
  door: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  voters: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  leanPill: {paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full},
  leanPillText: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold},
  leanRow: {flexDirection: 'row', gap: Spacing[2]},
  leanBtn: {flex: 1, paddingVertical: Spacing[2], borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border},
  leanText: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold},
} as const);
