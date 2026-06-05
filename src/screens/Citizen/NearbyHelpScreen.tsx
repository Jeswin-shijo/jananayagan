import React, {useEffect} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {CitizenStackParamList} from '@appTypes/navigation';
import {AppHeader} from '@components/common/AppHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useCurrentLocation} from '@hooks/useCurrentLocation';
import {useLocationStore} from '@store/locationStore';
import {openNearbySearch} from '@utils/locationShare';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type Props = NativeStackScreenProps<CitizenStackParamList, 'NearbyHelp'>;
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';

const PLACES: {key: string; labelKey: TranslationKey; query: string; icon: IconName; tint: string; bg: string}[] = [
  {key: 'police', labelKey: 'placePolice', query: 'police station', icon: 'police-badge-outline', tint: PURPLE, bg: PURPLE_LIGHT},
  {key: 'hospital', labelKey: 'placeHospital', query: 'hospital', icon: 'hospital-building', tint: PURPLE, bg: PURPLE_LIGHT},
  {key: 'pharmacy', labelKey: 'placePharmacy', query: 'pharmacy', icon: 'medical-bag', tint: PURPLE, bg: PURPLE_LIGHT},
  {key: 'women', labelKey: 'placeWomenCenter', query: 'women help center', icon: 'human-female', tint: PURPLE, bg: PURPLE_LIGHT},
  {key: 'fire', labelKey: 'placeFire', query: 'fire station', icon: 'fire-truck', tint: PURPLE, bg: PURPLE_LIGHT},
];

const HELPLINES: {labelKey: TranslationKey; number: string; icon: IconName}[] = [
  {labelKey: 'callPolice', number: '100', icon: 'police-badge-outline'},
  {labelKey: 'ambulance', number: '108', icon: 'ambulance'},
  {labelKey: 'womenHelpline', number: '1091', icon: 'human-female'},
  {labelKey: 'fireService', number: '101', icon: 'fire'},
  {labelKey: 'callEmergency', number: '112', icon: 'phone-alert-outline'},
];

export const NearbyHelpScreen: React.FC<Props> = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {fetchLocation, isLoading} = useCurrentLocation();
  const {coords, address} = useLocationStore();

  useEffect(() => {
    if (!coords) {
      fetchLocation().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const call = (num: string) => Linking.openURL(`tel:${num}`).catch(() => {});

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title={t('nearbyHelp')} showBack />
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.locBox}>
          <MaterialCommunityIcons name="map-marker-radius-outline" size={18} color={PURPLE} />
          <Text style={styles.locText} numberOfLines={1}>
            {address ? address : isLoading ? t('locating') : t('nearbyHelpIntro')}
          </Text>
        </View>

        {/* Place categories */}
        <View style={styles.grid}>
          {PLACES.map(p => (
            <TouchableOpacity
              key={p.key}
              style={styles.placeCard}
              activeOpacity={0.85}
              onPress={() => openNearbySearch(p.query, coords)}>
              <View style={[styles.placeIcon, {backgroundColor: p.bg}]}>
                <MaterialCommunityIcons name={p.icon} size={24} color={p.tint} />
              </View>
              <Text style={styles.placeTitle}>{t(p.labelKey)}</Text>
              <View style={styles.placeAction}>
                <Text style={[styles.placeActionText, {color: p.tint}]}>{t('findNearby')}</Text>
                <MaterialCommunityIcons name="arrow-top-right" size={14} color={p.tint} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Helplines */}
        <Text style={styles.sectionTitle}>{t('helplineNumbers')}</Text>
        <View style={styles.helplineList}>
          {HELPLINES.map(h => (
            <TouchableOpacity key={h.number} style={styles.helplineRow} onPress={() => call(h.number)}>
              <View style={styles.helplineIcon}>
                <MaterialCommunityIcons name={h.icon} size={20} color={PURPLE} />
              </View>
              <Text style={styles.helplineLabel}>{t(h.labelKey)}</Text>
              <Text style={styles.helplineNumber}>{h.number}</Text>
              <MaterialCommunityIcons name="phone" size={20} color={PURPLE} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{height: Spacing[8]}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},
  locBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: PURPLE_LIGHT,
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    marginBottom: Spacing[4],
  },
  locText: {flex: 1, fontSize: FontSize.sm, color: Colors.text},
  grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  placeCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  placeIcon: {width: 48, height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[3]},
  placeTitle: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text},
  placeAction: {flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: Spacing[2]},
  placeActionText: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold},
  sectionTitle: {fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing[2], marginBottom: Spacing[3]},
  helplineList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  helplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  helplineIcon: {width: 38, height: 38, borderRadius: BorderRadius.full, backgroundColor: PURPLE_LIGHT, alignItems: 'center', justifyContent: 'center'},
  helplineLabel: {flex: 1, fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.medium},
  helplineNumber: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textSecondary},
} as const);
