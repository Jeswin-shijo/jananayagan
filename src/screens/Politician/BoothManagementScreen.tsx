import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_BOOTHS} from '@utils/politicianData';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export const BoothManagementScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();

  const totalVoters = MOCK_BOOTHS.reduce((s, b) => s + b.voters, 0);
  const avgCoverage = Math.round(MOCK_BOOTHS.reduce((s, b) => s + b.coveragePct, 0) / MOCK_BOOTHS.length);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('boothManagement')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{MOCK_BOOTHS.length}</Text>
            <Text style={styles.summaryLabel}>{t('boothManagement')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalVoters.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>{t('voters')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{avgCoverage}%</Text>
            <Text style={styles.summaryLabel}>{t('coverage')}</Text>
          </View>
        </View>

        {MOCK_BOOTHS.map(b => (
          <AppCard key={b.id}>
            <View style={styles.row}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="office-building-marker-outline" size={18} color={Colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{b.name}</Text>
                <Text style={styles.meta}>{b.ward} · {b.agent}</Text>
              </View>
              <Text style={styles.voters}>{b.voters.toLocaleString()}</Text>
            </View>
            <View style={styles.coverageRow}>
              <View style={styles.track}>
                <View style={[styles.fill, {width: `${b.coveragePct}%`, backgroundColor: b.coveragePct >= 75 ? Colors.success : b.coveragePct >= 60 ? Colors.warning : Colors.danger}]} />
              </View>
              <Text style={styles.coveragePct}>{b.coveragePct}%</Text>
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
  summaryRow: {flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[4]},
  summaryCard: {flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing[3], alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight},
  summaryValue: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  summaryLabel: {fontSize: 10, color: Colors.textSecondary, marginTop: 2, textAlign: 'center'},
  row: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[3]},
  iconBubble: {width: 38, height: 38, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center'},
  info: {flex: 1},
  name: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  meta: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  voters: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text},
  coverageRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2]},
  track: {flex: 1, height: 6, backgroundColor: Colors.borderLight, borderRadius: BorderRadius.full, overflow: 'hidden'},
  fill: {height: '100%', borderRadius: BorderRadius.full},
  coveragePct: {width: 38, fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: Colors.text, textAlign: 'right'},
} as const);
