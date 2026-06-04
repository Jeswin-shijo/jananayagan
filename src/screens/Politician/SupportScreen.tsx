import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const CONTACTS: {icon: MaterialCommunityIconName; labelKey: TranslationKey; value: string; action: string}[] = [
  {icon: 'phone-outline', labelKey: 'contactSupport', value: '1800-123-4567', action: 'tel:18001234567'},
  {icon: 'email-outline', labelKey: 'emailOptional', value: 'help@jananayagan.in', action: 'mailto:help@jananayagan.in'},
];

const FAQS: {qKey: TranslationKey; aKey: TranslationKey}[] = [
  {qKey: 'faqAssignQ', aKey: 'faqAssignA'},
  {qKey: 'faqBroadcastQ', aKey: 'faqBroadcastA'},
  {qKey: 'faqReportQ', aKey: 'faqReportA'},
];

export const SupportScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('supportHelp')} />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>{t('contactSupport')}</Text>
        <AppCard padding={0}>
          {CONTACTS.map((c, i) => (
            <TouchableOpacity key={c.value} onPress={() => Linking.openURL(c.action)} style={[styles.contactRow, i < CONTACTS.length - 1 && styles.divider]}>
              <View style={styles.bubble}>
                <MaterialCommunityIcons name={c.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.contactLabel}>{t(c.labelKey)}</Text>
                <Text style={styles.contactValue}>{c.value}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textDisabled} />
            </TouchableOpacity>
          ))}
        </AppCard>

        <Text style={styles.sectionTitle}>{t('faq')}</Text>
        {FAQS.map(f => (
          <AppCard key={f.qKey}>
            <Text style={styles.q}>{t(f.qKey)}</Text>
            <Text style={styles.a}>{t(f.aKey)}</Text>
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
  sectionTitle: {fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.text, marginBottom: Spacing[3], marginTop: Spacing[2]},
  contactRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[4], paddingVertical: Spacing[3]},
  divider: {borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
  bubble: {width: 38, height: 38, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing[3]},
  info: {flex: 1},
  contactLabel: {fontSize: FontSize.sm, color: Colors.textSecondary},
  contactValue: {fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.semiBold, marginTop: 2},
  q: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text, marginBottom: Spacing[1]},
  a: {fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20},
} as const);
