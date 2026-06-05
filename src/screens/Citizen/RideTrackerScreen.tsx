import React, {useEffect, useRef, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Switch, KeyboardAvoidingView, Platform} from 'react-native';
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
import {SosEmergencyModal} from '@components/common/SosEmergencyModal';
import {useCurrentLocation} from '@hooks/useCurrentLocation';
import {useLocationStore} from '@store/locationStore';
import {useEmergencyContactsStore} from '@store/emergencyContactsStore';
import {mapsLinkFor, shareViaSms} from '@utils/locationShare';
import {toastSuccess, toastInfo} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type Props = NativeStackScreenProps<CitizenStackParamList, 'RideTracker'>;

const PURPLE = '#7C3AED';
const LOCATION_REFRESH_MS = 30000;

interface Trip {
  startedAt: number;
  etaMs: number;
  vehicle: string;
  destination: string;
}

const two = (n: number) => (n < 10 ? `0${n}` : `${n}`);

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

export const RideTrackerScreen: React.FC<Props> = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {fetchLocation} = useCurrentLocation();
  const {coords} = useLocationStore();
  const contacts = useEmergencyContactsStore(s => s.contacts);

  const [vehicle, setVehicle] = useState('');
  const [destination, setDestination] = useState('');
  const [eta, setEta] = useState('');
  const [etaError, setEtaError] = useState('');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [now, setNow] = useState(Date.now());
  const [sosVisible, setSosVisible] = useState(false);
  const [shareLocation, setShareLocation] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const locTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown ticker + periodic location refresh while a trip is active.
  useEffect(() => {
    if (!trip) {
      return;
    }
    setNow(Date.now());
    tick.current = setInterval(() => setNow(Date.now()), 1000);
    locTimer.current = setInterval(() => fetchLocation().catch(() => {}), LOCATION_REFRESH_MS);
    return () => {
      if (tick.current) clearInterval(tick.current);
      if (locTimer.current) clearInterval(locTimer.current);
    };
  }, [trip, fetchLocation]);

  const startTrip = () => {
    const minutes = parseInt(eta, 10);
    if (!minutes || minutes <= 0) {
      setEtaError(t('invalidEta'));
      return;
    }
    setEtaError('');
    fetchLocation().catch(() => {});
    setTrip({startedAt: Date.now(), etaMs: minutes * 60000, vehicle: vehicle.trim(), destination: destination.trim()});
    toastSuccess(t('tripStarted'));
  };

  const endTrip = (reached: boolean) => {
    setTrip(null);
    setShareLocation(false);
    if (reached) {
      toastSuccess(t('reachedSafelyToast'));
    }
  };

  // Push the current live-location link to ALL saved family contacts at once.
  const shareToContacts = () => {
    fetchLocation().catch(() => {});
    const link = mapsLinkFor(coords);
    const dest = trip?.destination ? ` → ${trip.destination}` : '';
    const sep = Platform.OS === 'ios' ? ',' : ';';
    shareViaSms(contacts.map(c => c.phone).join(sep), `${t('shareLiveLocation')}: ${link}${dest}`);
  };

  const onToggleShare = (next: boolean) => {
    if (next && !contacts.length) {
      toastInfo(t('noContactsForRide'));
      return;
    }
    setShareLocation(next);
    if (next) {
      shareToContacts();
    }
  };

  const remainingMs = trip ? trip.startedAt + trip.etaMs - now : 0;
  const overdue = trip ? remainingMs <= 0 : false;
  const absSec = Math.floor(Math.abs(remainingMs) / 1000);
  const clock = `${two(Math.floor(absSec / 60))}:${two(absSec % 60)}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title={t('rideTracker')} showBack />
      <OfflineBanner />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!trip ? (
            <>
              <View style={styles.intro}>
                <MaterialCommunityIcons name="map-marker-path" size={22} color={PURPLE} />
                <Text style={styles.introText}>{t('rideTrackerIntro')}</Text>
              </View>

              <AppInput
                label={t('vehicleNumber')}
                placeholder={t('vehicleNumberPlaceholder')}
                autoCapitalize="characters"
                value={vehicle}
                onChangeText={setVehicle}
              />
              <AppInput
                label={t('destinationLabel')}
                placeholder={t('destinationPlaceholder')}
                value={destination}
                onChangeText={setDestination}
              />
              <AppInput
                label={t('etaMinutes')}
                placeholder="15"
                keyboardType="number-pad"
                maxLength={3}
                value={eta}
                onChangeText={v => {
                  setEta(v.replace(/[^0-9]/g, ''));
                  setEtaError('');
                }}
                error={etaError || undefined}
              />

              <AppButton title={t('startTrip')} accent={PURPLE} onPress={startTrip} style={styles.startBtn} />
            </>
          ) : (
            <>
              {/* Live map */}
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
                    <Text style={styles.mapPlaceholderText}>{t('locating')}</Text>
                  </View>
                )}
                <View style={styles.trackingPill}>
                  <View style={[styles.trackingDot, overdue && {backgroundColor: Colors.danger}]} />
                  <Text style={styles.trackingText}>{overdue ? t('overdueSafe') : t('tripActive')}</Text>
                </View>
              </View>

              {/* Trip info + countdown */}
              <View style={[styles.tripCard, overdue && styles.tripCardOverdue]}>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripVehicle} numberOfLines={1}>{trip.vehicle || t('rideTracker')}</Text>
                  {!!trip.destination && (
                    <Text style={styles.tripDest} numberOfLines={1}>{trip.destination}</Text>
                  )}
                </View>
                <View style={styles.tripClockWrap}>
                  <Text style={[styles.tripClock, overdue && {color: Colors.danger}]}>{clock}</Text>
                  <Text style={styles.tripClockLabel}>{t('timeRemaining')}</Text>
                </View>
              </View>

              {/* Share live location with family */}
              <View style={styles.shareCard}>
                <View style={styles.shareInfo}>
                  <Text style={styles.shareTitle}>{t('shareLiveLocation')}</Text>
                  <Text style={styles.shareSub}>{t('toYourTrustedContacts')}</Text>
                </View>
                <Switch
                  value={shareLocation}
                  onValueChange={onToggleShare}
                  trackColor={{false: Colors.border, true: PURPLE}}
                  thumbColor={Colors.surface}
                />
              </View>

              {overdue && (
                <AppButton title={t('emergencySos')} variant="danger" onPress={() => setSosVisible(true)} style={styles.sosBtn} />
              )}

              <AppButton title={t('reachedSafely')} accent={PURPLE} onPress={() => endTrip(true)} style={styles.reachedBtn} />
              <TouchableOpacity onPress={() => endTrip(false)} style={styles.endRow}>
                <Text style={styles.endText}>{t('endTrip')}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <SosEmergencyModal visible={sosVisible} onClose={() => setSosVisible(false)} autoSend />
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
  startBtn: {marginTop: Spacing[2]},
  mapWrap: {
    height: 240,
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
  trackingPill: {
    position: 'absolute',
    top: Spacing[3],
    left: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  trackingDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A'},
  trackingText: {fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: Colors.text},
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing[4],
    marginBottom: Spacing[3],
  },
  tripCardOverdue: {borderColor: Colors.danger, backgroundColor: Colors.dangerLight},
  tripInfo: {flex: 1, paddingRight: Spacing[3]},
  tripVehicle: {fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text},
  tripDest: {fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2},
  tripClockWrap: {alignItems: 'flex-end'},
  tripClock: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text},
  tripClockLabel: {fontSize: 10, color: Colors.textSecondary},
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing[4],
    marginBottom: Spacing[4],
  },
  shareInfo: {flex: 1},
  shareTitle: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  shareSub: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  sosBtn: {marginBottom: Spacing[4]},
  reachedBtn: {marginTop: Spacing[2]},
  endRow: {alignItems: 'center', padding: Spacing[3], marginTop: Spacing[1]},
  endText: {fontSize: FontSize.base, color: Colors.danger, fontWeight: FontWeight.medium},
} as const);
