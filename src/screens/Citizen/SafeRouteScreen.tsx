import React, {useEffect} from 'react';
import {View, Text, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {CitizenStackParamList} from '@appTypes/navigation';
import {AppHeader} from '@components/common/AppHeader';
import {AppInput} from '@components/common/AppInput';
import {AppButton} from '@components/common/AppButton';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useCurrentLocation} from '@hooks/useCurrentLocation';
import {useLocationStore} from '@store/locationStore';
import {useEmergencyContactsStore} from '@store/emergencyContactsStore';
import {mapsLinkFor, shareViaSms, openDirections} from '@utils/locationShare';
import {toastInfo} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type Props = NativeStackScreenProps<CitizenStackParamList, 'SafeRoute'>;

const PURPLE = '#7C3AED';

const mapHtml = (lat: number, lng: number) => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>html,body,#map{height:100%;margin:0;background:#e9eef5}</style></head>
<body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var m = L.map('map',{zoomControl:false,attributionControl:false}).setView([${lat},${lng}],15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(m);
  L.circleMarker([${lat},${lng}],{radius:9,color:'#fff',weight:3,fillColor:'#7C3AED',fillOpacity:1}).addTo(m);
</script></body></html>`;

export const SafeRouteScreen: React.FC<Props> = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {fetchLocation, isLoading} = useCurrentLocation();
  const {coords} = useLocationStore();
  const contacts = useEmergencyContactsStore(s => s.contacts);

  const [destination, setDestination] = React.useState('');

  useEffect(() => {
    if (!coords) {
      fetchLocation().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simple time-of-day caution (a real build would blend incident density too).
  const isNight = (() => {
    const h = new Date().getHours();
    return h >= 19 || h < 6;
  })();

  const shareRoute = () => {
    const link = mapsLinkFor(coords);
    const dest = destination.trim() ? ` → ${destination.trim()}` : '';
    const body = `${t('shareRoute')}: ${link}${dest}`;
    if (!contacts.length) {
      toastInfo(t('noContactsForRide'));
      return;
    }
    const sep = Platform.OS === 'ios' ? ',' : ';';
    shareViaSms(contacts.map(c => c.phone).join(sep), body);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title={t('safeRoute')} showBack />
      <OfflineBanner />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.intro}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} color={PURPLE} />
            <Text style={styles.introText}>{t('safeRouteIntro')}</Text>
          </View>

          <AppInput
            label={t('destinationToGo')}
            placeholder={t('destinationPlaceholder')}
            value={destination}
            onChangeText={setDestination}
          />

          {/* Map preview */}
          <View style={styles.mapWrap}>
            {coords ? (
              <WebView
                originWhitelist={['*']}
                source={{html: mapHtml(coords.latitude, coords.longitude)}}
                style={styles.map}
                scrollEnabled={false}
                pointerEvents="none"
              />
            ) : (
              <View style={styles.mapPlaceholder}>
                <MaterialCommunityIcons name="map-search-outline" size={28} color={Colors.textSecondary} />
                <Text style={styles.mapPlaceholderText}>
                  {isLoading ? t('locating') : t('enableLocationForRoute')}
                </Text>
              </View>
            )}
          </View>

          {/* Safety tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <MaterialCommunityIcons
                name={isNight ? 'weather-night' : 'white-balance-sunny'}
                size={18}
                color={PURPLE}
              />
              <Text style={styles.tipsTitle}>{t('safetyTips')}</Text>
            </View>
            <Text style={styles.tipsText}>{isNight ? t('nightCaution') : t('dayCaution')}</Text>
          </View>

          <AppButton title={t('openDirections')} accent={PURPLE} onPress={() => openDirections(destination.trim(), coords)} style={styles.btn} />
          <AppButton title={t('shareRoute')} variant="outline" accent={PURPLE} onPress={shareRoute} style={styles.btnOutline} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  scroll: {padding: Spacing[4], paddingBottom: Spacing[10]},
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: '#EDE9FE',
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    marginBottom: Spacing[4],
  },
  introText: {flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 19},
  mapWrap: {
    height: 220,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceSoft,
    marginBottom: Spacing[4],
  },
  map: {flex: 1, backgroundColor: 'transparent'},
  mapPlaceholder: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing[2]},
  mapPlaceholderText: {fontSize: FontSize.sm, color: Colors.textSecondary},
  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing[4],
    marginBottom: Spacing[4],
  },
  tipsHeader: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2]},
  tipsTitle: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text},
  tipsText: {fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20},
  btn: {marginBottom: Spacing[3]},
  btnOutline: {},
} as const);
